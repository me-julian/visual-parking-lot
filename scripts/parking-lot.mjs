'use strict'

import {Car} from './car.mjs'

/**
 *
 * @class
 * @param {pathObject} pathObject
 * @param {RoutePlotter} routePlotter
 * @param {Overlay} overlay
 * @param {Object} rankedSpaceList
 * @param {AnimationHandler} animationHandler
 * @property {TrafficHandler} trafficHandler
 * @property {number} carCount - Number of cars so far. Used for car IDs.
 * @property {Object} cars
 * @property {Object} cars.entering - Cars which haven't parked yet.
 * @property {Object} cars.parked - Cars which are currently parked.
 * @property {Object} cars.leaving - Cars which are leaving the lot.
 * @property {Object} cars.left - Cars which have left the lot and scene.
 * @property {Object} intersections
 */
function ParkingLot(
    pathObject,
    routePlotter,
    overlay,
    animationHandler,
    rankedSpaceList
) {
    this.pathObject = pathObject
    this.routePlotter = routePlotter
    this.overlay = overlay
    this.spaces = rankedSpaceList
    this.animationHandler = animationHandler

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
        this.cars.leaving[car].determineAction()
    }
    for (let car in this.cars.entering) {
        this.cars.entering[car].determineAction()
    }
    for (let car in this.cars.parked) {
        this.cars.parked[car].determineAction()
    }
}

ParkingLot.prototype.initializeIntersections = function () {
    // Intersections are currently defined manually.
    // It's assumed all intersections are on the ends of horizontal
    // sections.
    let horizontalSections = this.pathObject.sections.horizontal

    this.intersections =
        this.trafficHandler.getIntersections(horizontalSections)

    this.overlay.createIntersectionOverlay(this.intersections)
}

ParkingLot.prototype.spawnCar = function () {
    let assignedSpace = this.getHighestRankedSpace()
    if (assignedSpace) {
        let id = this.carCount
        this.carCount += 1

        let newCar = new Car(id, this)

        assignedSpace.reserved = true
        this.overlay.updateSpaceColor(
            document.getElementById(assignedSpace.rank),
            newCar
        )
        newCar.initialize(assignedSpace)

        this.cars.entering[id] = newCar
    } else {
        console.log('No spaces available.')
        this.spawnCarCooldown = true
        setTimeout(() => {
            this.spawnCarCooldown = false
        }, 5000)
    }
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
    if (car.hasParked) {
        start.coord = car.assignedSpace[car.symbol]

        destination.section = this.pathObject.exit
        destination.coord = destination.section.exit.y
        if (destination.section.exit === 'south') {
            destination.coord += destination.section.len
        }
    } else {
        destination.section = car.assignedSpace.section
        if (destination.section.horizontal) {
            destination.coord = car.assignedSpace.x
            // All horizontal spaces are approached from the left
            destination.coord += car.assignedSpace.width
        } else {
            destination.coord = car.assignedSpace.y
        }
    }

    let route = this.routePlotter.createRoute(
        this.routePlotter,
        start,
        destination
    )

    // Should be handled elsewhere
    destination = route[route.length - 1]
    if (destination.direction === 'south') {
        destination.coord += car.assignedSpace.height
    } else if (destination.direction === 'west') {
        destination.coord += car.assignedSpace.width
    }

    return route
}

ParkingLot.prototype.getHighestRankedSpace = function () {
    for (let space of this.spaces) {
        if (!space.reserved) {
            return space
        }
    }
}

export {ParkingLot}
