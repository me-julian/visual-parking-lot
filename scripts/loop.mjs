'use strict'

import {pathObject} from './path-object.mjs'
import {spaceInitializer} from './space-initializer.mjs'
import {RoutePlotter} from './routing/route-plotter.mjs'
import {TrafficHandler} from './traffic-handler.mjs'
import {ParkingLot} from './parking-lot.mjs'
import {Overlay} from './overlay.mjs'

function initializeSimulation() {
    let unrankedSpaceList = spaceInitializer.initParkingSpaces()
    let rankedSpaceList = spaceInitializer.rankSpaces(unrankedSpaceList)
    let routePlotter = new RoutePlotter(pathObject)
    let trafficHandler = new TrafficHandler(pathObject)

    let overlay = new Overlay()
    overlay.createSpaceOverlay(rankedSpaceList)
    overlay.drawPaths(pathObject)

    let parkingLot = new ParkingLot(
        pathObject,
        routePlotter,
        trafficHandler,
        overlay,
        rankedSpaceList
    )

    return parkingLot
}

let loop = {
    LOOP_SPEED: 1000,
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
        console.log('Loop running.')
        parkingLot.simulate()
    },
}

let parkingLot = initializeSimulation()
loop.startLoop(parkingLot)
