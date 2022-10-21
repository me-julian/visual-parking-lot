'use strict'

import * as td from './type-defs.mjs'

/**
 * @class
 * @type {td.CollisionBoxHandler}
 * @param {td.ParkingLot} parkingLot
 */
function CollisionBoxHandler(parkingLot) {
    this.parkingLot = parkingLot
    this.LOOP_SPEED = this.parkingLot.config.LOOP_SPEED
    // ISSUE: Should this be moved to parkingLot?
    this.entranceArea = {
        x: parkingLot.pathObject.entrance.x,
        y: parkingLot.pathObject.entrance.y,
        h:
            parkingLot.pathObject.entrance.y +
            parkingLot.pathObject.entrance.len -
            182,
        w: 90 / 2,
    }
}

CollisionBoxHandler.prototype.returnDistanceBetween = function (
    point1,
    point2
) {
    return Math.abs(point1 - point2)
}

CollisionBoxHandler.prototype.getIntersections = function (horizontalSections) {
    let intersections = {}
    for (let section in horizontalSections) {
        section = horizontalSections[section]
        let leftIntersection = {},
            rightIntersection = {}

        let leftName = section.leftIntersection
        leftIntersection.name = leftName
        leftIntersection.area = this.getIntersectionArea(section.x, section.y)

        let rightName = section.rightIntersection
        rightIntersection.name = rightName
        rightIntersection.area = this.getIntersectionArea(
            section.x + section.len,
            section.y
        )

        intersections[leftName] = leftIntersection
        intersections[rightName] = rightIntersection
    }
    return intersections
}
CollisionBoxHandler.prototype.getIntersectionArea = function (x, y) {
    let area = {
        x: x - 45,
        y: y - 40,
        w: 182,
        h: 150,
    }
    return area
}

/** Returns an array of collisionBox objects which cover the area of the
 *  road a car needs to make its maneuver.
 * @method
 * @param {td.Car} car
 * @returns {Array}
 */
CollisionBoxHandler.prototype.getManeuverArea = function (car) {
    let maneuverArea

    switch (car.animation.type) {
        case 'right-angle-turn':
            maneuverArea = this.getTurnArea(car)
            break
        case 'right-angle-park':
            maneuverArea = this.getRightAngleParkArea(car)
            break
        case 'z-park':
            maneuverArea = this.getZParkArea(car)
            break
        case 'u-park':
            maneuverArea = this.getUParkArea(car)
            break
        case 'right-angle-reverse':
            maneuverArea = this.getRightAngleReverseArea(car)
            break
        case 'z-reverse':
            maneuverArea = this.getZReverseArea(car)
            break
    }

    return maneuverArea
}
CollisionBoxHandler.prototype.getTurnArea = function (car) {
    let area = {}

    area.x = car.animation.endVals.x
    area.y = car.animation.endVals.y
    area.w = car.baseLength
    area.h = car.baseLength

    return [area]
}
// Only handle cases present in assignment lot.
CollisionBoxHandler.prototype.getRightAngleParkArea = function (car) {
    let area = {}

    area = this.setRightAngleParkXAxis(area, car)
    area = this.setRightAngleParkYAxis(area, car)

    return [area]
}
CollisionBoxHandler.prototype.getZParkArea = function (car) {
    let area = {}

    area = this.setZParkXAxis(area, car)
    area = this.setZParkYAxis(area, car)

    return [area]
}
CollisionBoxHandler.prototype.getUParkArea = function (car) {
    let area = {}

    area = this.setUParkXAxis(area, car)
    area = this.setUParkYAxis(area, car)

    return [area]
}
CollisionBoxHandler.prototype.getRightAngleReverseArea = function (car) {
    let area = {}

    area = this.setRightAngleReverseXAxis(area, car)
    area = this.setRightAngleReverseYAxis(area, car)

    return [area]
}
CollisionBoxHandler.prototype.getZReverseArea = function (car) {
    let spaceArea = {},
        farArea = {}

    // Area needed to back out of the space
    spaceArea = this.setZReverseSpaceXAxis(spaceArea, car)
    spaceArea = this.setZReverseSpaceYAxis(spaceArea, car)

    // Area of further section to stop and start normal movement at.
    farArea = this.setZReverseFarXAxis(farArea, car)
    farArea = this.setZReverseFarYAxis(farArea, car)

    // Rest is covered by intersection blocking.

    return [spaceArea, farArea]
}
CollisionBoxHandler.prototype.setRightAngleParkXAxis = function (area, car) {
    switch (car.direction) {
        case 'north':
            area.x = car.assignedSpace.x + car.assignedSpace.width
            area.w =
                car.coords.x +
                car.baseWidth +
                (car.baseLength - car.baseWidth) / 2 -
                area.x
            break
        case 'east':
            area.x = car.leadingEdge
            area.w = car.assignedSpace.x + car.assignedSpace.width - area.x
            break
        case 'south':
            area.x = car.coords.x
            area.w = car.assignedSpace.x - area.x
            break
    }

    return area
}
CollisionBoxHandler.prototype.setRightAngleParkYAxis = function (area, car) {
    switch (car.direction) {
        case 'north':
            area.y = car.assignedSpace.y
            area.h = car.coords.y - car.assignedSpace.y
            break
        case 'east':
            if (car.assignedSpace.y < car.coords.y) {
                area.y = car.assignedSpace.y + car.assignedSpace.height
                area.h =
                    area.y -
                    car.coords.y +
                    car.baseWidth +
                    (car.baseLength - car.baseWidth) / 2
            } else {
                area.y = car.coords.y + (car.baseLength - car.baseWidth) / 2
                area.h = car.assignedSpace.y - area.y
            }
            break
        case 'south':
            area.y = car.leadingEdge
            area.h =
                car.assignedSpace.y + car.assignedSpace.height - car.leadingEdge
            break
    }

    return area
}
CollisionBoxHandler.prototype.setZParkXAxis = function (area, car) {
    switch (car.direction) {
        case 'north':
            area.x = car.coords.x + (car.baseLength - car.baseWidth) / 2
            area.w = car.assignedSpace.x + car.assignedSpace.width - area.x
            break
        case 'east':
            area.x = car.leadingEdge
            area.w = car.animation.endVals.forwardDistance
            break
    }

    return area
}
CollisionBoxHandler.prototype.setZParkYAxis = function (area, car) {
    switch (car.direction) {
        case 'north':
            area.y = car.assignedSpace.y + car.assignedSpace.height
            area.h = car.animation.endVals.forwardDistance
            break
        case 'east':
            if (car.assignedSpace.y < car.coords.y + car.baseLength / 2) {
                area.y = car.assignedSpace.y
                area.h = car.animation.endVals.crossDistance
            } else {
                area.y = car.coords.y + (car.baseLength - car.baseWidth) / 2
                area.h = car.assignedSpace.y + car.assignedSpace.height - area.y
            }
            break
    }

    return area
}
CollisionBoxHandler.prototype.setUParkXAxis = function (area, car) {
    area.x = car.coords.x
    area.w = car.assignedSpace.x - car.coords.x + car.assignedSpace.width

    return area
}
CollisionBoxHandler.prototype.setUParkYAxis = function (area, car) {
    area.y = car.assignedSpace.section.y
    area.h = car.baseWidth

    return area
}
CollisionBoxHandler.prototype.setRightAngleReverseXAxis = function (area, car) {
    switch (car.animation.endVals.direction) {
        case 'north':
            area.x = car.assignedSpace.section.x
            area.w = car.baseWidth
            break
        case 'east':
            area.x = car.animation.endVals.x
            area.w = car.assignedSpace.x + car.assignedSpace.width + 10 - area.x
            break
        case 'south':
            area.x = car.assignedSpace.section.x
            area.w = car.baseWidth
            break
    }

    return area
}
CollisionBoxHandler.prototype.setRightAngleReverseYAxis = function (area, car) {
    switch (car.animation.endVals.direction) {
        case 'north':
            area.y = car.assignedSpace.y - 10
            area.h = car.animation.endVals.y - area.y + car.baseLength
            break
        case 'east':
            area.y = car.assignedSpace.section.y
            area.h = car.baseWidth
            break
        case 'south':
            area.y = car.animation.endVals.y
            area.h =
                car.assignedSpace.y + car.assignedSpace.height + 10 - area.y
            break
    }

    return area
}
CollisionBoxHandler.prototype.setZReverseSpaceXAxis = function (area, car) {
    switch (car.direction) {
        case 'east':
            area.x = car.assignedSpace.section.x
            area.w = car.baseWidth
            break
    }

    return area
}
CollisionBoxHandler.prototype.setZReverseSpaceYAxis = function (area, car) {
    switch (car.direction) {
        case 'east':
            area.y = car.assignedSpace.y - 10
            area.h = Math.abs(
                area.y -
                    (car.animation.endVals.y +
                        (car.baseLength - car.baseWidth) / 2)
            )
            break
    }

    return area
}
CollisionBoxHandler.prototype.setZReverseFarXAxis = function (area, car) {
    switch (car.direction) {
        case 'east':
            area.x = car.animation.endVals.x
            area.w = car.baseLength
            break
    }

    return area
}
CollisionBoxHandler.prototype.setZReverseFarYAxis = function (area, car) {
    switch (car.direction) {
        case 'east':
            area.y = car.route[0].section.y
            area.h = car.baseWidth
            break
    }

    return area
}

CollisionBoxHandler.prototype.getAnimationIntersections = function (car) {
    let intersections = this.getAreaOverlappingIntersections(
        car.animation.maneuverArea
    )
    if (intersections.length === 0) {
        return false
    } else {
        return intersections
    }
}
CollisionBoxHandler.prototype.getAreaOverlappingIntersections = function (
    areas
) {
    let intersections = this.parkingLot.intersections
    let overlappingIntersections = {}
    for (let area of areas) {
        for (let intersection in intersections) {
            intersection = intersections[intersection]
            if (!overlappingIntersections.intersection) {
                if (this.checkCollision(area, intersection.area)) {
                    overlappingIntersections[intersection.name] = intersection
                }
            }
        }
    }
    return overlappingIntersections
}

/** Returns an area along the full length of a given pathObject column or row.
 * @method
 * @param {td.section} section
 * @returns {td.collisionbox}
 */
CollisionBoxHandler.prototype.getRoadArea = function (section) {
    let roadArea = {}

    let lineDirection, roadAxis, lengthAxis
    if (section.horizontal) {
        lineDirection = 'horizontal'
        roadAxis = 'row'
        // Car.baseWidth
        roadArea.h = 90

        lengthAxis = 'w'
    } else {
        lineDirection = 'vertical'
        roadAxis = 'col'
        roadArea.w = 90

        lengthAxis = 'h'
    }
    let roadSections = this.getAllSectionsInLine(
        section,
        lineDirection,
        roadAxis
    )

    let length = (() => {
        let len = 0
        for (let section of roadSections) {
            len += section.len
        }
        return len
    })()

    roadArea.x = roadSections[0].x
    roadArea.y = roadSections[0].y
    roadArea[lengthAxis] = length

    return roadArea
}

/** Returns an area along the column or row ahead of the car, minus stoppingDistance.
 * @method
 * @param {td.Car} car
 * @returns {td.collisionbox}
 */
CollisionBoxHandler.prototype.getRoadAreaAhead = function (car) {
    let roadAxis, lineDirection
    if (car.axis === 'top') {
        roadAxis = 'col'
        lineDirection = 'vertical'
    } else {
        roadAxis = 'row'
        lineDirection = 'horizontal'
    }
    // Could be improved
    let roadSections = this.getAllSectionsInLine(
        car.currentSection.section,
        lineDirection,
        roadAxis
    )

    let farthestSection, axisLength
    if (car.negation === 1) {
        farthestSection = roadSections[roadSections.length - 1]
        axisLength = Math.abs(
            farthestSection[car.symbol] +
                farthestSection.len -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        )
    } else {
        farthestSection = roadSections[0]
        axisLength = Math.abs(
            farthestSection[car.symbol] -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        )
    }

    let x, y, w, h
    if (roadAxis === 'row') {
        if (car.negation === 1) {
            x = car.leadingEdge + car.minStoppingDistance * car.negation
        } else {
            x = farthestSection.x
        }
        y = farthestSection.y - car.baseWidth / 2
        w = axisLength
        h = car.baseWidth
    } else {
        x = farthestSection.x - car.baseWidth / 2
        if (car.negation === 1) {
            y = car.leadingEdge + car.minStoppingDistance * car.negation
        } else {
            y = farthestSection.y
        }
        w = car.baseWidth
        h = axisLength
    }
    // Could be improved

    let roadArea = {
        x: x,
        y: y,
        w: w,
        h: h,
    }

    roadArea[car.oppSymbol] += car.baseWidth / 2

    if (!car.overlay.road) {
        car.overlay.road = this.parkingLot.overlay.createBox(
            car.overlayWrapper,
            ['overlay-el', 'area-box']
        )
    }
    this.parkingLot.overlay.drawBox(car.overlay.road, roadArea, {
        backgroundColor: 'pink',
    })

    return roadArea
}
/** Returns all sections along column or row.
 * @method
 * @param {td.section} referenceSection
 * @param {string} lineDirection - vertical or horizontal
 * @param {string} roadAxis - col or row
 * @returns {Array}
 */
CollisionBoxHandler.prototype.getAllSectionsInLine = function (
    referenceSection,
    lineDirection,
    roadAxis
) {
    let allSectionsOfSameDirection =
        this.parkingLot.pathObject.sections[lineDirection]
    let roadSections = []
    for (let section in allSectionsOfSameDirection) {
        if (
            allSectionsOfSameDirection[section][roadAxis] ===
            referenceSection[roadAxis]
        ) {
            roadSections.push(allSectionsOfSameDirection[section])
        }
    }
    roadSections.sort((a, b) => {
        return a[roadAxis] - b[roadAxis]
    })

    return roadSections
}
/** Gets area between car and its next sectionDestination minus stoppingDistance.
 * @method
 * @param {td.Car} car
 * @returns {td.collisionbox}
 */
CollisionBoxHandler.prototype.getAreaBetweenDestination = function (car) {
    let destinationArea = {
        x: car.coords.x,
        y: car.coords.y,
        w: car.baseWidth,
        h: car.baseWidth,
    }

    // x coord will either be the destination or the start of the car.
    if (car.negation === -1) {
        destinationArea[car.symbol] = car.nextSectionDestination
    } else {
        destinationArea[car.symbol] = car.leadingEdge + car.minStoppingDistance
    }

    // Length and width of area need to correspond to the correct axes.
    if (car.symbol === 'x') {
        destinationArea.w = Math.abs(
            car.nextSectionDestination -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        )
    } else {
        destinationArea.h = Math.abs(
            car.nextSectionDestination -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        )
    }

    // Car moves at the same time the box is drawn causing them
    // to not match. Or something like that.
    destinationArea[car.symbol] -= car.speed

    // Account for wrapper box vs image size discrepancy.
    destinationArea[car.oppSymbol] += car.baseWidth / 2

    if (!car.overlay.betweenDestination) {
        car.overlay.betweenDestination = this.parkingLot.overlay.createBox(
            car.overlayWrapper,
            ['overlay-el', 'area-box']
        )
    }
    this.parkingLot.overlay.drawBox(
        car.overlay.betweenDestination,
        destinationArea,
        {
            backgroundColor: 'purple',
        }
    )

    return destinationArea
}
/** Returns an area covering the car and stoppingDistance in front of it.
 * @method
 * @param {td.Car} car
 * @returns {td.collisionbox}
 */
CollisionBoxHandler.prototype.getAreaInStoppingDistance = function (car) {
    let stoppingDistanceArea = {
        x: car.coords.x,
        y: car.coords.y,
        w: car.collisionBoxes.car.w,
        h: car.collisionBoxes.car.h,
    }

    if (car.negation === -1) {
        stoppingDistanceArea[car.symbol] =
            car.coords[car.symbol] + car.minStoppingDistance * car.negation
    }

    if (car.symbol === 'x') {
        stoppingDistanceArea.w += car.minStoppingDistance
    } else {
        stoppingDistanceArea.h += car.minStoppingDistance
    }

    stoppingDistanceArea[car.symbol] += car.speed * car.negation

    stoppingDistanceArea[car.oppSymbol] += car.baseWidth / 2

    if (!car.overlay.stoppingDistance) {
        car.overlay.stoppingDistance = this.parkingLot.overlay.createBox(
            car.overlayWrapper,
            ['overlay-el', 'area-box']
        )
    }
    this.parkingLot.overlay.drawBox(
        car.overlay.stoppingDistance,
        stoppingDistanceArea,
        {
            backgroundColor: 'red',
        }
    )

    return stoppingDistanceArea
}

/** Returns an array of Cars if any of their collisionBoxes intersect
 * with given area.
 * @method
 * @param {td.collisionbox} referenceArea
 * @param {Array} [exceptedCars]
 * @returns {Array}
 */
CollisionBoxHandler.prototype.returnActiveCarsInArea = function (
    referenceArea,
    exceptedCars
) {
    let cars = []
    for (let car in this.parkingLot.cars.leaving) {
        car = this.parkingLot.cars.leaving[car]
        if (this.checkCarCollisionBoxes(referenceArea, car)) {
            cars.push(car)
        }
    }
    for (let car in this.parkingLot.cars.entering) {
        car = this.parkingLot.cars.entering[car]
        if (this.checkCarCollisionBoxes(referenceArea, car)) {
            cars.push(car)
        }
    }

    if (exceptedCars) {
        cars = cars.filter((car) => !exceptedCars.includes(car))
    }
    return cars
}
/** Checks whether Car's collisionBoxes intersect with given area.
 * @param {td.collisionbox} referenceArea
 * @param {td.Car} car
 * @returns {Boolean}
 */
CollisionBoxHandler.prototype.checkCarCollisionBoxes = function (
    referenceArea,
    car
) {
    for (let area in car.collisionBoxes) {
        area = car.collisionBoxes[area]

        if (Array.isArray(area)) {
            for (let subArea of area) {
                if (this.checkCollision(referenceArea, subArea)) {
                    return true
                }
            }
        } else {
            if (this.checkCollision(referenceArea, area)) {
                return true
            }
        }
    }
}
/** Checks for intersection of two collisionBoxes.
 * @method
 * @param {td.collisionbox} obj1
 * @param {td.collisionbox} obj2
 * @returns {Boolean}
 */
CollisionBoxHandler.prototype.checkCollision = function (obj1, obj2) {
    if (
        obj1.x < obj2.x + obj2.w &&
        obj1.x + obj1.w > obj2.x &&
        obj1.y < obj2.y + obj2.h &&
        obj1.h + obj1.y > obj2.y
    ) {
        return true
    } else {
        return false
    }
}

/**
 * @method
 * @param {td.Car} car
 * @param {Array} areas - Array of animation's collisionBoxes.
 * @returns {Boolean}
 */
CollisionBoxHandler.prototype.maneuverAreaClear = function (car, areas) {
    // Check if any cars are blocking the maneuverArea.
    for (let box of areas) {
        if (this.returnActiveCarsInArea(box, [car]).length > 0) {
            if (car.userFocus) {
                this.parkingLot.overlay.showManeuverCheck(car, areas, 'blocked')
            }
            return false
        }
    }

    // Block intersections in maneuverArea if not already blocked by this car.
    if (car.animation.blockIntersections) {
        for (let intersection in car.animation.blockIntersections)
            if (
                car.isIntersectionBlocked(
                    car.animation.blockIntersections[intersection]
                )
            ) {
                return false
            }
    }

    // Visually show areas checked if car is focused.
    if (car.userFocus) {
        this.parkingLot.overlay.showManeuverCheck(car, areas, 'clear')
    }

    return true
}

/**
 * @method
 * @param {td.Car} car
 */
CollisionBoxHandler.prototype.blockManeuverArea = function (car) {
    car.collisionBoxes.maneuver = car.animation.maneuverArea

    if (car.animation.blockIntersections) {
        for (let intersection in car.animation.blockIntersections) {
            // Block intersection if it's not already blocked.
            if (!car.blockingIntersections[intersection]) {
                this.blockIntersection(
                    car,
                    car.animation.blockIntersections[intersection]
                )
            }
        }
    }
}

/**
 * @method
 * @param {td.Car} car
 * @param {td.intersection} intersection
 */
CollisionBoxHandler.prototype.blockIntersection = function (car, intersection) {
    intersection.occupied = true
    this.parkingLot.overlay.updateIntersectionColor(intersection, car)

    // Car doesn't need to check this intersection when following Route.
    car.nextIntersection = null
    car.blockingIntersections[intersection.name] = intersection

    if (car.status === 'parking') {
        this.blockIntersectionUntilParked(car, intersection)
    } else {
        this.blockIntersectionUntilPassed(car, intersection)
    }
}
CollisionBoxHandler.prototype.blockIntersectionUntilParked = function (
    car,
    intersection
) {
    // Parking cars' collisionBox may not actually enter the intersection
    // so just wait until it's finished parking.
    let hasParkedInterval
    let hasParked = () => {
        if (car.status === 'parked') {
            intersection.occupied = false
            delete car.blockingIntersections[intersection.name]
            this.parkingLot.overlay.updateIntersectionColor(intersection)
            clearInterval(hasParkedInterval)
        }
    }

    hasParkedInterval = setInterval(hasParked, this.LOOP_SPEED)
}
CollisionBoxHandler.prototype.blockIntersectionUntilPassed = function (
    car,
    intersection
) {
    let isStillOccupiedInterval, hasEnteredInterval
    // Wait for car to enter the intersection if it hasn't yet.
    let hasEntered = () => {
        if (this.checkCollision(car.collisionBoxes.car, intersection.area)) {
            clearInterval(hasEnteredInterval)
            isStillOccupiedInterval = setInterval(
                isStillOccupied,
                this.LOOP_SPEED
            )
        } else if (car.status === 'parking' || car.status === 'parked') {
            // In some cases cars start parking at this point and
            // the occupation checks won't work.
            this.blockIntersectionUntilParked(car, intersection)
            clearInterval(hasEnteredInterval)
        }
    }
    // Unblock the intersection once the cars collisionBox has left it.
    let isStillOccupied = () => {
        if (car.status === 'parking' || car.status === 'parked') {
            this.blockIntersectionUntilParked(car, intersection)
            clearInterval(isStillOccupiedInterval)
        } else if (
            !this.checkCollision(car.collisionBoxes.car, intersection.area)
        ) {
            if (car.blockingIntersections[intersection.name]) {
                delete car.blockingIntersections[intersection.name]
            }
            intersection.occupied = false
            this.parkingLot.overlay.updateIntersectionColor(intersection)
            clearInterval(isStillOccupiedInterval)
        }
    }

    if (this.checkCollision(car.collisionBoxes.car, intersection.area)) {
        isStillOccupiedInterval = setInterval(isStillOccupied, this.LOOP_SPEED)
    } else {
        hasEnteredInterval = setInterval(hasEntered, this.LOOP_SPEED)
    }
}

/**
 * Checks if any active cars are within the entrance. Lot won't spawn
 * any cars if the entrance is occupied.
 * @method
 * @param {td.ParkingLot} parkingLot
 * @returns {Boolean}
 */
CollisionBoxHandler.prototype.isEntranceClear = function (parkingLot) {
    for (let car in parkingLot.cars.leaving) {
        car = parkingLot.cars.leaving[car]
        let carHitbox = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.baseWidth,
            h: car.baseLength,
        }
        if (this.checkCollision(this.entranceArea, carHitbox)) {
            return false
        }
    }
    for (let car in parkingLot.cars.entering) {
        car = parkingLot.cars.entering[car]
        let carHitbox = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.baseWidth,
            h: car.baseLength,
        }
        if (this.checkCollision(this.entranceArea, carHitbox)) {
            return false
        }
    }

    return true
}

export {CollisionBoxHandler}
