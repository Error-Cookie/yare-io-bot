# yare-io-bot

This is my code for yare.io!  
My goal is to develop a fully autonomous bot to fight without any user interaction.

## Requirements

- Node.js / npm
- yarn (`npm install yarn -g`)

## Setup

- Clone this repository and run `yarn install --production=false`
- To build the code run `yarn build` or to automatically upload it to yare.io run `yarn upload`

## Features

-   [X] Spirit class with additional methods and properties
-   [ ] Squads
    -   [X] Charge Squads
        -   [X] Anti star overharvest
        -   [X] Rebuild squad after death
    -   [ ] Attack Squads
    -   [ ] Defend Squads
-   [X] Charge chain for fast and consistent energy supply
-   [X] Live statistics in console

## Details

#### Spirit class
The Spirit class provides extra methods and properties on spirits to make controlling them easier.
- `spirit.set_mark()` can be achieved by assigning a value to `spirit.mark` eg. `spirit.mark = 'cookie';`
- Some methods and properties now have shortform names: `spirit.pos`, `spirit.encap` and `spirit.say()`
- Additional properties: `spirit.isFull`, `spirit.isDead`, `spirit.danger`, `spirit.starNearby` and `spirit.baseNearby`
- Additional methods: `spirit.charge()` and `spirit.findSquad()`


#### Squads
Squads are groups of spirits with their own job, completely independant of other squads.
- Charge Squads are squads of 4 spirits creating a chain between the star and the base to consistently supply the base with energy. 2 Spirits harvest the star alternately and send the energy to the other two spirits which send the energy to the base.

The Squad class is an universal wrapper for all types of squads.
- `squad.work()` makes the squad do their actions, no matter what type the squad is

#### Util functions
The bot has some useful utility functions
- `calcDist()` to calculate the distance between two given coordinates
- `posOnLine()` to calculate a position on a line between two positions with a given offset
- `isSamePos()` to evaluate if two positions are the same
- `calcTime()` to calculate min:sec format for given milliseconds

#### Console statistics
The bot counts the game statistics every tick and provides you with real time stats in the console. The console will look like this: `0:00 | Tick: 0 | ChargeChain: 0/52 | Player: 0/0 | Enemy: 0/0`.
- The global variable `log` allows you to toggle the console output
