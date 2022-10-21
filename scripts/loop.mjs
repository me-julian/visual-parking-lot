'use strict'

import {config} from './config.mjs'
import {pathObject} from './path-object.mjs'
import {SpaceInitializer} from './space-initializer.mjs'
import {RoutePlotter} from './routing/route-plotter.mjs'
import {CollisionBoxHandler} from './collision-box-handler.mjs'
import {Overlay} from './overlay.mjs'
import {ParkingLot} from './parking-lot.mjs'
import * as animation from './animation/index.mjs'

//
//      Known Bugs:
// Cars update collisionBox dynamically during anims, but
// the inaccuracy of the box can also block nearby cars checking if
// they can leave their space.

// Car's roadArea and destinationArea boxes are slightly off near
// front of car. Doesn't affect performance.

//
//      Potential Improvements:
// Let user initialize lot with normal vs test sets of spaces in GUI.

// Display stat of interval time for each iteration a car is stuck
// while attempting to leave space to quantify efficiency.

// Slight randomization on assignedSpaces by 1-2 ranks to space out cars

// Variable car speed/functional stopping distance.

// Improve reenteredRoadClear

function initializeSimulation(config, loop) {
    let spaceInitializer = new SpaceInitializer(pathObject)
    let unrankedSpaceList = spaceInitializer.initParkingSpaces()
    let rankedSpaceList = spaceInitializer.rankSpaces(unrankedSpaceList)
    // Test limited space sets.
    // let testUnrankedSpaceList = spaceInitializer.returnTestExceptionSpacesSets()
    // let rankedSpaceList = spaceInitializer.rankSpaces(testUnrankedSpaceList)
    //
    spaceInitializer.setHandicapSpaces(rankedSpaceList)

    let routePlotter = new RoutePlotter(pathObject)

    let animationHandler = new animation.AnimationHandler(
        animation.animationTypes
    )

    let overlay = new Overlay()
    overlay.createSpaceOverlay(rankedSpaceList)
    overlay.createPathsOverlay(pathObject)
    overlay.addGuiListeners()

    let parkingLot = new ParkingLot(
        config,
        loop,
        pathObject,
        routePlotter,
        overlay,
        animationHandler,
        rankedSpaceList
    )
    parkingLot.collisionBoxHandler = new CollisionBoxHandler(parkingLot)
    parkingLot.initializeSelf()

    return parkingLot
}

let loop = {
    LOOP_SPEED: config.LOOP_SPEED,
    running: false,

    startLoop: function (parkingLot) {
        if (loop.running === false) {
            console.log('Loop starting.')
            loop.running = true
            setInterval(function () {
                loop.iterate(parkingLot)
            }, loop.LOOP_SPEED)
        } else {
            console.log('Loop already running.')
        }
    },

    stopLoop: function () {
        console.log('Loop stopping.')
        this.running === false
        console.log('Loop stopped.')
    },

    iterate: function (parkingLot) {
        parkingLot.simulate()
    },
}

let parkingLot = initializeSimulation(config, loop)
loop.startLoop(parkingLot)
