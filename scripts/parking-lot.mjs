'use strict'

import {Car} from './car.mjs'

/**
 *
 * @class
 * @param {pathObject} pathObject
 * @param {RoutePlotter} routePlotter
 * @param {Overlay} overlay
 * @param {Object} rankedSpaceList
 * @property {TrafficHandler} trafficHandler
 * @property {number} carCount - Number of cars so far. Used for car IDs.
 * @property {Object} cars
 * @property {Object} cars.entering - Cars which haven't parked yet.
 * @property {Object} cars.parked - Cars which are currently parked.
 * @property {Object} cars.leaving - Cars which are leaving the lot.
 * @property {Object} cars.left - Cars which have left the lot and scene.
 */
function ParkingLot(pathObject, routePlotter, overlay, rankedSpaceList) {
    this.pathObject = pathObject
    this.routePlotter = routePlotter
    this.overlay = overlay
    this.spaces = rankedSpaceList

    this.carCount = 0
    this.cars = {
        entering: {},
        parked: {},
        leaving: {},
        left: {},
    }

    this.spawnCarCooldown = false
}

ParkingLot.prototype.simulate = function () {
    if (!this.spawnCarCooldown && this.trafficHandler.isEntranceClear(this)) {
        this.spawnCar(this.carCount)
        this.spawnCarCooldown = true
        setTimeout(() => {
            this.spawnCarCooldown = false
        }, 10000)
    }

    for (let car in this.cars.leaving) {
        this.cars.leaving[car].determineAction(this)
    }
    for (let car in this.cars.entering) {
        this.cars.entering[car].determineAction(this)
    }
    for (let car in this.cars.parked) {
        this.cars.parked[car].determineAction(this)
    }
}

ParkingLot.prototype.spawnCar = function () {
    let id = this.carCount
    this.carCount += 1

    let newCar = new Car(id, this.trafficHandler)
    // ISSUE: Need to handle no spaces available.
    let assignedSpace = this.getHighestRankedSpace()
    newCar.initialize(this, assignedSpace)

    this.cars.entering[id] = newCar
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

    let destination = {}
    if (car.parked) {
        destination.section = this.pathObject.exit
        destination.coord = destination.section.exit.y
        if (destination.section.exit === 'south') {
            destination.coord += destination.section.len
        }
    } else {
        destination.section = car.assignedSpace.section
        if (destination.section.horizontal) {
            destination.coord = destination.assignedSpace.left
        } else {
            destination.coord = car.assignedSpace.top
        }
    }

    let route = this.routePlotter.createRoute(
        this.routePlotter,
        start,
        destination
    )

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
