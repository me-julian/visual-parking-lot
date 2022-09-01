'use strict'

import {Car} from './car.mjs'

/**
 *
 * @class
 * @param {pathObject} pathObject
 * @param {RoutePlotter} routePlotter
 * @param {Overlay} overlay
 * @param {Object} rankedSpaceList
 * @property {number} carCount - Number of cars so far. Used for car IDs.
 * @property {Object} cars
 * @property {Object} cars.parking - Cars which haven't parked yet.
 * @property {Object} cars.parked - Cars which are currently parked.
 * @property {Object} cars.leaving - Cars which are leaving the lot.
 * @property {Object} cars.left - Cars which have left the lot and scene.
 */
function ParkingLot(
    pathObject,
    routePlotter,
    trafficHandler,
    overlay,
    rankedSpaceList
) {
    this.pathObject = pathObject
    this.routePlotter = routePlotter
    this.trafficHandler = trafficHandler
    this.overlay = overlay
    this.spaces = rankedSpaceList

    this.carCount = 0
    this.cars = {
        parking: {},
        parked: {},
        leaving: {},
        left: {},
    }
}

ParkingLot.prototype.simulate = function () {
    if (this.trafficHandler.isEntranceClear()) {
        this.spawnCar(this.carCount)
    }

    for (let car in this.cars.leaving) {
        this.cars.leaving[car].determineAction(this)
    }
    for (let car in this.cars.parking) {
        this.cars.parking[car].determineAction(this)
    }
    for (let car in this.cars.parked) {
        this.cars.parked[car].determineAction(this)
    }
}

ParkingLot.prototype.spawnCar = function () {
    let id = this.carCount
    this.carCount += 1

    let newCar = new Car(id)
    // ISSUE: Need to handle no spaces available.
    let assignedSpace = this.getHighestRankedSpace()
    let entrance = this.pathObject.entrance
    newCar.initialize(entrance, assignedSpace)

    this.cars.parking.id = newCar
}

ParkingLot.prototype.requestRoute = function (car) {
    let start = {
        section: car.currentSection,
        direction: car.direction,
    }

    if (start.section.horizontal) {
        start.coord = car.coords.x
    } else {
        start.coord = car.coords.y
    }

    let destination
    if (car.parked) {
        destination = this.pathObject.exit
    } else {
        destination = car.assignedSpace
    }

    let route = this.routePlotter.createRoute(start, destination)

    return route
}

ParkingLot.prototype.getHighestRankedSpace = function () {
    for (let space of this.spaces) {
        if (!space.occupied) {
            return space
        }
    }
}

export {ParkingLot}
