'use strict'

import {config} from './config.mjs'
import {pathObject} from './path-object.mjs'
import {SpaceInitializer} from './space-initializer.mjs'
import {RoutePlotter} from './routing/route-plotter.mjs'
import {CollisionBoxHandler} from './collision-box-handler.mjs'
import * as animation from './animation/index.mjs'
import {Overlay} from './overlay.mjs'
import {ParkingLot} from './parking-lot.mjs'
//
//      Bugs:
// Cars now update their collisionBox dynamically during anims, but
// the inaccuracy of the box can also block nearby leaving space cars.
//      --Reconsider fixing later.

//
//      After satisfied with general procedure:
// Reorganize objects/functions, renaming, better defined
// object responsibilities.

// Code commenting/JSDoc Cleanup

// Style GUI/move lot position on page.

// GUI button for pathObject paths.

// Show ability to focus cars.

//
//      Nice-to-haves:
// Stats (cars entering/parked/leaving/left, parking time, stuck time)
// Start/Stop/Pause simulation/loop.
// Let user initialize lot with normal vs test sets of spaces in GUI.
// Slight randomization on assignedSpaces by 1-2 ranks to space out cars
// Variable car speed/functional stopping distance.
// Improve reenteredRoadClear
//      General ability for cars to understand when blocked
// intersections and other anims are not going to affect them
// seems needed for real increased flow/naturalness of movement.

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
