'use strict'

let config = {
    // ms
    LOOP_SPEED: 50,
    // secs
    carSpawnRate: {
        min: 5,
        max: 20,
    },
    // 1 / handicapChance
    handicapChance: 15,
    // ms
    spawnCarCooldownTime: 2000,
    // secs
    carParkingDurationRange: {
        min: 60,
        max: 540,
    },
}

export {config}
