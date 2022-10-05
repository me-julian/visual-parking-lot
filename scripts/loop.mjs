'use strict'

import {pathObject} from './path-object.mjs'
import {SpaceInitializer} from './space-initializer.mjs'
import {RoutePlotter} from './routing/route-plotter.mjs'
import {TrafficHandler} from './traffic-handler.mjs'
import * as animation from './animation/index.mjs'
import {Overlay} from './overlay.mjs'
import {ParkingLot} from './parking-lot.mjs'

function initializeSimulation() {
    let spaceInitializer = new SpaceInitializer(pathObject)
    // let unrankedSpaceList = spaceInitializer.initParkingSpaces()

    // TEST limited space sets.
    let testUnrankedSpaceList = spaceInitializer.testExceptionSpaces(pathObject)
    let rankedSpaceList = spaceInitializer.rankSpaces(testUnrankedSpaceList)
    //

    // let rankedSpaceList = spaceInitializer.rankSpaces(unrankedSpaceList)

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
    parkingLot.initializeIntersections()

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
