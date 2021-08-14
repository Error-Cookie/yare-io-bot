{
    // --- GLOBAL --- //
    log = true;
    reinstance_spirits = false;

    charge_squads = 13;
    charge_chain = [195, 350, 520];

    stats = {
        my_spirits: 0,
        enemy_spirits: 0,
        my_alive_spirits: 0,
        enemy_alive_spirits: 0,
        charge_chain: 0
    }

    let living = my_spirits.filter(s => s.hp > 0);

    if (!memory['star']) memory['star'] = calcDist(base.position, star_a1c.position) > calcDist(base.position, star_zxq.position) ? star_zxq : star_a1c;
    if (!memory['squads']) memory['squads'] = [];

    class Spirit {
        constructor(spirit) {
            this.spirit = spirit;
            this.type = decideType(spirit);
            this.squad = null;
            this.range = 197;
        }

        get id() { return this.spirit.id; }
        get pos() { return this.spirit.position; }
        get size() { return this.spirit.size; }
        get encap() { return this.spirit.energy_capacity; }
        get energy() { return this.spirit.energy; }
        get hp() { return this.spirit.hp; }
        get mark() { return this.spirit.mark; }
        set mark(val) { return this.spirit.set_mark(val); }
        get sight() { return this.spirit.sight; }
        get isFull() { return (this.energy == this.encap); }
        get isDead() { return (this.hp <= 0); }
        get danger() { return (this.sight.enemies > 0); }
        get starNearby() { return (calcDist(memory['star'].position, this.pos) <= this.range); }
        get baseNearby() { return (calcDist(base.position, this.pos) <= this.range); }

        energize(target) { return this.spirit.energize(target); }
        move(position) { return this.spirit.move(position); }
        merge(target) { return this.spirit.merge(target); }
        divide() { return this.spirit.divide(); }
        say(msg) { return this.spirit.shout(msg); }
        charge() { return this.energize(this.spirit); }

        findSquad(type) {
            let potentialSquads = memory['squads'].filter(s => !s.isFull && s.type == type);

            if (potentialSquads.length > 0) {
                potentialSquads[0].squad.push(this); 
                this.squad = potentialSquads[0];
            } else {
                let squad = new Squad([this], type);
                memory['squads'].push(squad);
                this.squad = squad;
            }
        }
    }

    class Squad {
        constructor(squad, type) {
            this.squad = squad;
            this.type = type;
        }

        get isFull() { if (this.type == 'charge_squad') return (this.squad.length == 4); }

        work() {
            if (this.type == 'charge_squad') return this.chargeSquad();
        }

        chargeSquad() {
            if (!this.isFull) {
                return 'no_work';
            }
            for (let i = 0; i < this.squad.length; i++) {
                let spirit = this.squad[i];
                if (spirit.hp <= 0) { this.squad.splice(i, 1); return 'no_work'; }

                let posID = (i % 4 == 3) ? 0 : i % 4;
                let pos = posOnLine(memory['star'].position, base.position, charge_chain[posID]);
                if (isSamePos(pos, spirit.pos)) {
                    if (spirit.baseNearby) spirit.energize(base);
                    else if (spirit.starNearby) {
                        if (i % 4 == 3) (this.squad[0].mark == 'charge') ? spirit.mark = 'transfer' : spirit.mark = 'charge';
                        else if (spirit.isFull) spirit.mark = 'transfer';
                        else if (spirit.energy == 0) spirit.mark = 'charge';
                        if (spirit.mark == 'charge') spirit.charge();
                        else spirit.energize(this.squad[1]);
                    } else spirit.energize(this.squad[i+1]);
                } else spirit.move(pos);
            }
            return;
        }
    }

    Object.values(spirits).forEach(spirit => {
        if (!memory[spirit.id] || reinstance_spirits) memory[spirit.id] = new Spirit(spirit);

        if (spirit.player_id == base.player_id) stats.my_spirits++;
        else stats.enemy_spirits++;
        if (spirit.hp > 0) {
            if (memory[spirit.id].type == 'charge_chain') stats.charge_chain++;
            if (spirit.player_id == base.player_id) stats.my_alive_spirits++;
            else stats.enemy_alive_spirits++;
        }
    });

    if (log) console.log(`
        ${calcTime(tick * 600)} |
        Tick: ${tick} |
        ChargeChain: ${stats.charge_chain}/${charge_squads * 4} |
        Player: ${stats.my_alive_spirits}/${stats.my_spirits} |
        Enemy: ${stats.enemy_alive_spirits}/${stats.enemy_spirits}
    `);

    // --- LOGIC --- //
    for (let i = 0; i < living.length; i++) {
        let spirit = memory[living[i].id];

        if (spirit.type == 'charge_chain') {
            if (!spirit.squad) {
                spirit.findSquad('charge_squad');
            }
        } else {
            spirit.move(base.position);
        }
    }

    memory['squads'].forEach(s => s.work());

    // --- FUNCTIONS --- //
    function decideType(spirit) {
        if (spirit.player_id != base.player_id) return 'enemy';

        if (stats.charge_chain < 4 * charge_squads) {
            if (memory['squads'].filter(s => s.type == 'charge_squad' && s.squad.length >= 3).length < starProd()) return 'charge_chain';
            else if (stats.charge_chain == 4 * charge_squads - 1) return 'charge_chain';
        }
        else return 'drone';
    }

    function starProd() { return Math.round(memory['star'].energy / 100) + 3; }

    // --- UTIL --- //
    function calcDist(from, to) {
        let distX = Math.pow(from[0] - to[0], 2);
        let distY = Math.pow(from[1] - to[1], 2);
        return Math.sqrt(distX + distY);
    }

    function posOnLine(from, to, off) {
        let factor = -off / calcDist(from, to);
        return [from[0] + ((from[0] - to[0]) * factor), from[1] + ((from[1] - to[1]) * factor)];
    }

    function isSamePos(pos1, pos2) {
        return (Math.round(pos1[0]) == Math.round(pos2[0]) && Math.round(pos1[1]) == Math.round(pos2[1]));
    }

    function calcTime(ms) {
        var min = Math.floor(ms / 60000);
        var sec = ((ms % 60000) / 1000).toFixed(0);
        return (sec == 60 ? (min + 1) + ':00' : min + ':' + (sec < 10 ? "0" : "") + sec);
    }
}