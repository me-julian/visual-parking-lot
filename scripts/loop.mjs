'use strict'

import {pathObject} from './path-object.mjs'
import {SpaceInitializer} from './space-initializer.mjs'
import {RoutePlotter} from './routing/route-plotter.mjs'
import {TrafficHandler} from './traffic-handler.mjs'
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
// ParkingLot.spaces[assignedSpace].reserved = false

// Tweak iteration speed/car spawning/random parking length.

// Reorganize objects/functions, renaming, better defined
// object responsibilities.

// Improve animation quality (Z-turns, right angle turns, z-reverse)

// Code commenting/JSDoc Cleanup

// Style GUI/move lot position on page.

// GUI button for pathObject paths.

//
//      Nice-to-haves:
// Variable car speed/functional stopping distance.
// Start/Stop/Pause simulation/loop.
// Stats (cars entering/parked/leaving/left, parking time, stuck time)
// Let user initialize lot with normal vs test sets of spaces in GUI.
// Slight randomization on assignedSpaces by 1-2 ranks to space out cars
// Improve reenteredRoadClear
//      General ability for cars to understand when blocked
// intersections and other anims are not going to affect them
// seems needed for real increased flow/naturalness of movement.

function initializeSimulation() {
    let spaceInitializer = new SpaceInitializer(pathObject)
    let unrankedSpaceList = spaceInitializer.initParkingSpaces()
    let rankedSpaceList = spaceInitializer.rankSpaces(unrankedSpaceList)
    // TEST limited space sets.
    // let testUnrankedSpaceList = spaceInitializer.testExceptionSpaces(pathObject)
    // let rankedSpaceList = spaceInitializer.rankSpaces(testUnrankedSpaceList)
    //
    spaceInitializer.setHandicapSpaces(rankedSpaceList)

    let routePlotter = new RoutePlotter(pathObject)

    let animationHandler = new animation.AnimationHandler(
        animation.animationTypes
    )

    let overlay = new Overlay()
    overlay.createSpaceOverlay(rankedSpaceList)
    overlay.drawPaths(pathObject)
    overlay.addGuiListeners()

    let parkingLot = new ParkingLot(
        pathObject,
        routePlotter,
        overlay,
        animationHandler,
        rankedSpaceList
    )
    parkingLot.trafficHandler = new TrafficHandler(parkingLot)
    parkingLot.initialize()

    return parkingLot
}

let loop = {
    LOOP_SPEED: 75,
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

let parkingLot = initializeSimulation()
loop.startLoop(parkingLot)
