'use strict'

import * as td from './type-defs.mjs'
import {Car} from './car.mjs'

/**
 * @type {td.ParkingLot}
 * @param {Object} config
 * @param {Object} loop
 * @param {td.pathObject} pathObject
 * @param {td.RoutePlotter} routePlotter
 * @param {td.Overlay} overlay
 * @param {td.AnimationHandler} animationHandler
 * @param {Array} rankedSpaceList
 */
function ParkingLot(
    config,
    loop,
    pathObject,
    routePlotter,
    overlay,
    animationHandler,
    rankedSpaceList
) {
    this.config = config
    this.loop = loop
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

ParkingLot.prototype.initializeSelf = function () {
    this.initializeIntersections()
    this.initializeWrapperPositionVals()
}

ParkingLot.prototype.initializeIntersections = function () {
    // Intersections are currently defined manually.
    // It's assumed all intersections are on the ends of horizontal
    // sections.
    let horizontalSections = this.pathObject.sections.horizontal

    this.intersections =
        this.collisionBoxHandler.getIntersections(horizontalSections)

    this.overlay.createIntersectionOverlay(this.intersections)
}
ParkingLot.prototype.initializeWrapperPositionVals = function () {
    // If the lot is ever centered, responsive, etc, then this will
    // have to be made more dynamic.
    this.lotWrapperPositionalValues = document
        .getElementById('wrapper')
        .getBoundingClientRect()

    // If the page is reloaded while scrolled it'll store the values
    // accordingly, this neutralizes that.
    this.lotWrapperPositionalValues.x += window.scrollX
    this.lotWrapperPositionalValues.y += window.scrollY
}

ParkingLot.prototype.simulate = function () {
    if (
        !this.spawnCarCooldown &&
        this.collisionBoxHandler.isEntranceClear(this)
    ) {
        this.spawnCar(this.carCount)
        this.spawnCarCooldown = true
        setTimeout(() => {
            this.spawnCarCooldown = false
        }, this.getTimeToNextCarArrival())
    }

    // Iterate through all cars to make their actions.
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

ParkingLot.prototype.spawnCar = function () {
    let handicap = this.setHandicapByChance()
    let assignedSpace = this.getHighestRankedSpace(handicap)
    // Lot will only spawn a car if spaces are available.
    // Cars entering and waiting for a space to become available is
    // not supported.
    if (assignedSpace) {
        let id = this.carCount
        this.carCount += 1

        let newCar = new Car(this, id)

        // Block space from being assigned to next spawning car.
        assignedSpace.reserved = true
        this.overlay.updateSpaceColor(assignedSpace.pageEl, newCar)
        newCar.initialize(assignedSpace, handicap)

        this.cars.entering[id] = newCar
    } else {
        console.log('No spaces available.')
        // Wait to try again.
        this.spawnCarCooldown = true
        setTimeout(() => {
            this.spawnCarCooldown = false
        }, this.config.spawnCarCooldownTime)
    }
}

ParkingLot.prototype.setHandicapByChance = function () {
    // 1 out of handicapChance cars can park in handicap spaces.
    let chance = Math.floor(Math.random() * (this.config.handicapChance + 1))
    if (chance === this.config.handicapChance) {
        return true
    } else {
        return false
    }
}
ParkingLot.prototype.getTimeToNextCarArrival = function () {
    let min = this.config.carSpawnRate.min
    let max = this.config.carSpawnRate.max
    let time = Math.floor(Math.random() * (max - min + 1) + min)
    return time * 1000
}

ParkingLot.prototype.requestRouteToSpace = function (car) {
    // Construct a routeEnd for start and end to pass to routePlotter.
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
    destination.section = car.assignedSpace.section
    if (destination.section.horizontal) {
        destination.coord = car.assignedSpace.x
    } else {
        destination.coord = car.assignedSpace.y
    }

    let route = this.routePlotter.createRoute(
        this.routePlotter,
        start,
        destination
    )

    // Adjust to always make destination.coord the far side of a space.
    destination = route[route.length - 1]
    if (destination.direction === 'south') {
        destination.coord += car.assignedSpace.height
    } else if (destination.direction === 'east') {
        destination.coord += car.assignedSpace.width
    }

    return route
}
ParkingLot.prototype.requestRouteFromSpace = function (car) {
    let start = {
        section: car.assignedSpace.section,
    }

    start = this.determineSpaceExitLocation(car, start)

    let destinationSection = this.pathObject.exit
    let destination = {
        section: destinationSection,
        direction: 'south',
        coord: destinationSection.y + destinationSection.len,
    }

    let route = this.routePlotter.createRoute(
        this.routePlotter,
        start,
        destination
    )

    // Some spaces don't have space to turn out and head in the right
    // direction towards the exit. They use special animations to pull
    // out and need their routes adjusted manually.
    if (car.assignedSpace.section !== route[0].section) {
        let actualStart
        switch (route[0].section) {
            case this.pathObject.sections.horizontal.row0col1:
                if (car.direction === 'west') {
                    // Top left two spaces
                    // Construct and add routeSection to beginning of route.
                    actualStart = this.pathObject.sections.vertical.row1col0
                    route.unshift({
                        direction: 'north',
                        section: actualStart,
                        coord: actualStart.y,
                    })
                    // Add turn to what is now the second routeSection.
                    route[1].turn = 'northtoeast'
                } else if (car.direction === 'east') {
                    // Top right two spaces don't need adjustment.
                } else {
                    console.error(
                        'Unexpected car attempting to adjust for exceptional reverse animation.'
                    )
                }
                break
            // Bottom left two spaces
            case this.pathObject.sections.horizontal.row1col1:
                actualStart = this.pathObject.sections.vertical.row1col0
                route.unshift({
                    direction: 'south',
                    section: actualStart,
                    coord: actualStart.y + actualStart.len,
                })
                route[1].turn = 'southtoeast'
                break
        }
    }

    return route
}
ParkingLot.prototype.determineSpaceExitLocation = function (car, start) {
    switch (car.direction) {
        // Check if cars are close enough to the edge to need to make
        // a special maneuver.
        case 'west':
            if (car.route[car.route.length - 1].coord <= 228) {
                // Pull out south then turn east
                // Change direction and section itself
                console.log('Top 2 Left')
                start.section = this.pathObject.sections.horizontal.row0col1
                start.direction = 'east'
                return start
            } else if (car.route[car.route.length - 1].coord >= 783) {
                // Pull out north then turn east
                // Change direction and section itself
                console.log('Bottom 2 Left')
                start.section = this.pathObject.sections.horizontal.row1col1
                start.direction = 'east'
                return start
            }
            break
        case 'east':
            if (car.route[car.route.length - 1].coord <= 228) {
                // Pull out south then west then turn south
                // Change coord and section itself
                console.log('Top 2 Right')
                start.section = this.pathObject.sections.horizontal.row0col1
                start.direction = 'east'
                return start
            }
            break
    }

    switch (car.direction) {
        // All horizontal cars pull out west to head east.
        case 'north':
        case 'south':
            start.direction = 'east'
            break
        // all right column cars pull out north
        case 'east':
            start.direction = 'south'
            break
        // Left column - Give normal coord (maybe adjust for turn?)
        // and check what the nextSection is, N/S (horizontal)

        // middle section cars will pull out north (onto its own section)
        // top section will pull out north (onto its own section)
        // bottom section will pull out south (onto its own section)
        case 'west':
            // Only the top of the three bottom section spaces
            // will pull out North.
            if (car.assignedSpace.section.row === 2) {
                start.direction = 'north'
            } else {
                start.direction = 'south'
            }
            break
    }

    return start
}

ParkingLot.prototype.getHighestRankedSpace = function (handicap) {
    for (let space of this.spaces) {
        if (!space.reserved) {
            if (this.checkSpaceHandicap(space, handicap)) {
                return space
            } else {
                continue
            }
        }
    }
}
ParkingLot.prototype.checkSpaceHandicap = function (space, carHandicapStatus) {
    if ((space.handicap && carHandicapStatus) || !space.handicap) {
        return true
    } else {
        return false
    }
}

export {ParkingLot}
