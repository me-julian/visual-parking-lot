'use strict'

// Use events to spawn transp divs to show bounding boxes of reserved
// space, cars about to intersect until they're finished with the
// action?

/**
 * @typedef {Object} Rectangle
 * @property {Number} x
 * @property {Number} y
 * @property {Number} w
 * @property {Number} h
 */

/**
 * @class
 * @param {ParkingLot} parkingLot
 * @property {Rectangle} entranceArea
 */
function TrafficHandler(parkingLot) {
    this.parkingLot = parkingLot
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

TrafficHandler.prototype.returnDistanceBetween = function (point1, point2) {
    return Math.abs(point1 - point2)
}

TrafficHandler.prototype.getIntersections = function (horizontalSections) {
    let intersections = {}
    for (let section in horizontalSections) {
        section = horizontalSections[section]
        let leftIntersection = {},
            rightIntersection = {}

        let leftName = section.leftIntersection
        let rightName = section.rightIntersection
        leftIntersection.name = leftName
        rightIntersection.name = rightName

        leftIntersection.areas = this.getIntersectionArea(section.x, section.y)
        rightIntersection.areas = this.getIntersectionArea(
            section.x + section.len,
            section.y
        )

        intersections[leftName] = leftIntersection
        intersections[rightName] = rightIntersection
    }
    return intersections
}
TrafficHandler.prototype.getIntersectionArea = function (x, y) {
    // Intersection areas are comprised of two boxes which extend
    // further into the connecting roads of their respective axis.
    let xArea, yArea

    xArea = {
        x: x - 45,
        y: y - 40,
        w: 182,
        h: 150,
    }
    // Car turningSpace (30px) + 10px buffer in both directions
    xArea.x -= 40
    xArea.w += 80

    yArea = {
        x: x - 45,
        y: y - 40,
        w: 182,
        h: 150,
    }
    // Car turningSpace (30px) + 10px buffer in both directions
    yArea.y -= 40
    yArea.h += 80

    return {xArea: xArea, yArea: yArea}
}

TrafficHandler.prototype.getManeuverArea = function (car) {
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
    }

    return maneuverArea
}
TrafficHandler.prototype.getTurnArea = function (car) {
    let area = {}

    area.x = car.animation.endVals.x
    area.y = car.animation.endVals.y
    area.w = car.baseLength
    area.h = car.baseLength

    let intersection = car.getNextIntersection()

    let areas = [area]
    // Technically will always be an intersection in this case.
    if (intersection) {
        areas.push(intersection.areas.xArea, intersection.areas.yArea)
    } else {
        console.error("Right angle turn didn't find an intersection to check.")
    }
    return areas
}
// Only handle cases present in assignment lot.
TrafficHandler.prototype.getRightAngleParkArea = function (car) {
    let area = {}

    area = this.setRightAngleParkXAxis(area, car)
    area = this.setRightAngleParkYAxis(area, car)

    return [area]
}
TrafficHandler.prototype.getZParkArea = function (car) {
    let area = {}

    area = this.setZParkXAxis(area, car)
    area = this.setZParkYAxis(area, car)

    let intersection = car.getNextIntersection()

    let areas = [area]
    // Technically will always be an intersection in this case.
    // ISSUE: Currently duplicating these areas since these same
    // areas are added in car.mjs.
    if (intersection) {
        areas.push(intersection.areas.xArea, intersection.areas.yArea)
    } else {
        console.error("Z Park turn didn't find an intersection to check.")
    }
    return areas
}
TrafficHandler.prototype.getUParkArea = function (car) {
    let area = {}

    area = this.setUParkXAxis(area, car)
    area = this.setUParkYAxis(area, car)

    let intersection = car.getNextIntersection()

    let areas = [area]
    // Technically will always be an intersection in this case.
    if (intersection) {
        areas.push(intersection.areas.xArea, intersection.areas.yArea)
    } else {
        console.error("U Park turn didn't find an intersection to check.")
    }
    return areas
}
TrafficHandler.prototype.setRightAngleParkXAxis = function (area, car) {
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
TrafficHandler.prototype.setRightAngleParkYAxis = function (area, car) {
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
TrafficHandler.prototype.setZParkXAxis = function (area, car) {
    switch (car.direction) {
        case 'north':
            area.x = car.coords.x + (car.baseLength - car.baseWidth) / 2
            area.w = car.assignedSpace.x + car.assignedSpace.width - area.x
            break
        case 'east':
            // Good
            area.x = car.leadingEdge
            area.w = car.animation.endVals.forwardDistance
            break
    }

    return area
}
TrafficHandler.prototype.setZParkYAxis = function (area, car) {
    switch (car.direction) {
        case 'north':
            // Good
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
TrafficHandler.prototype.setUParkXAxis = function (area, car) {
    area.x = car.coords.x
    area.w = car.assignedSpace.x - car.coords.x + car.assignedSpace.width

    return area
}
TrafficHandler.prototype.setUParkYAxis = function (area, car) {
    area.y = car.assignedSpace.y - car.baseLength
    area.h = car.baseLength

    return area
}
TrafficHandler.prototype.getRightAngleReverseArea = function (car) {
    let area = {}

    area = this.setRightAngleReverseXAxis(area, car)
    area = this.setRightAngleReverseYAxis(area, car)

    return [area]
}
TrafficHandler.prototype.setRightAngleReverseXAxis = function (area, car) {
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
TrafficHandler.prototype.setRightAngleReverseYAxis = function (area, car) {
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
TrafficHandler.prototype.getOverlappingIntersections = function (areas) {
    let intersections = this.parkingLot.intersections
    let overlappingIntersections = []
    for (let area of areas) {
        for (let intersection in intersections) {
            intersection = intersections[intersection]
            if (!overlappingIntersections.includes(intersection)) {
                if (
                    this.checkCollision(area, intersection.areas.xArea) ||
                    this.checkCollision(area, intersection.areas.yArea)
                ) {
                    overlappingIntersections.push(intersection)
                }
            }
        }
    }
    return overlappingIntersections
}

TrafficHandler.prototype.getRoadArea = function (section) {
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

TrafficHandler.prototype.getRoadAreaAhead = function (car) {
    let roadAxis, oppositeRoadAxis, lineDirection
    if (car.axis === 'top') {
        roadAxis = 'col'
        oppositeRoadAxis = 'row'
        lineDirection = 'vertical'
    } else {
        roadAxis = 'row'
        oppositeRoadAxis = 'col'
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

TrafficHandler.prototype.getAllSectionsInLine = function (
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

TrafficHandler.prototype.getAreaBetweenDestination = function (car) {
    let destinationArea = {
        x: car.coords.x,
        y: car.coords.y,
        w: car.baseWidth,
        h: car.baseWidth,
    }

    // x coord will either be the destination or the start of the car.
    if (car.negation === -1) {
        destinationArea[car.symbol] = car.nextDestination
    } else {
        destinationArea[car.symbol] = car.leadingEdge + car.minStoppingDistance
    }

    // Length and width of area need to correspond to the correct axes.
    if (car.symbol === 'x') {
        destinationArea.w = Math.abs(
            car.nextDestination -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        )
    } else {
        destinationArea.h = Math.abs(
            car.nextDestination -
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
TrafficHandler.prototype.getAreaInStoppingDistance = function (car) {
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

/**
 * @method
 * @param {Rectangle} referenceArea
 * @param {Array} [exceptedCars]
 * @returns {Array}
 */
TrafficHandler.prototype.returnActiveCarsInArea = function (
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

TrafficHandler.prototype.checkCarCollisionBoxes = function (
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
/**
 * @method
 * @param {Rectangle} obj1
 * @param {Rectangle} obj2
 * @returns {Boolean}
 */
TrafficHandler.prototype.checkCollision = function (obj1, obj2) {
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
 * @param {Array} cars
 * @returns {Boolean}
 */
TrafficHandler.prototype.checkIfCarsTurning = function (cars) {
    for (let car of cars) {
        if (
            car.status === 'turning' ||
            car.status === 'leaving-space' ||
            car.status === 'parking'
        ) {
            return true
        }
    }
    return false
}

/**
 * Checks if any active cars are within the entrance.
 * @method
 * @param {ParkingLot} parkingLot
 * @returns {Boolean}
 */
// Possibly redundant with returnActiveCarsInArea
// (this returns as soon as one car is found, though.)
TrafficHandler.prototype.isEntranceClear = function (parkingLot) {
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

TrafficHandler.prototype.maneuverAreaClear = function (car, areas) {
    for (let box of areas) {
        if (this.returnActiveCarsInArea(box, [car]).length > 0) {
            if (car.userFocus) {
                this.parkingLot.overlay.showManeuverCheck(car, areas, 'blocked')
            }
            return false
        }
    }

    if (car.userFocus) {
        this.parkingLot.overlay.showManeuverCheck(car, areas, 'clear')
    }

    return true
}

TrafficHandler.prototype.blockIntersection = function (car, intersection) {
    intersection.occupied = true
    // Currently blocking both areas of the intersection (x and y areas)
    // but could eventually granularize to check each individually
    // and set whether cross vs forward is free, but may be unnecessary.
    this.parkingLot.overlay.updateIntersectionColor(intersection, car)

    // Cars may block an intersection within their minStoppingDistance
    // then start a turn before actually entering the intersection.
    // Parking/Parked checks ensure hasEntered won't block.

    car.nextIntersection = null
    car.atIntersection = intersection

    // Probably still need to work on intersectionBlocking.
    let isStillOccupiedInterval, hasEnteredInterval
    let hasEntered = () => {
        if (
            this.checkCollision(
                car.collisionBoxes.car,
                intersection.areas[car.symbol + 'Area']
            ) ||
            car.status === 'parking'
        ) {
            clearInterval(hasEnteredInterval)
            isStillOccupiedInterval = setInterval(isStillOccupied, 75)
        }
    }

    let isStillOccupied = () => {
        if (car.status === 'parking' || car.status === 'parked') {
            if (car.status === 'parked') {
                if (intersection.name == car.atIntersection) {
                    car.atIntersection = null
                }
                intersection.occupied = false
                this.parkingLot.overlay.updateIntersectionColor(intersection)
                clearInterval(isStillOccupiedInterval)
            }
        } else if (
            !this.checkCollision(
                car.collisionBoxes.car,
                intersection.areas[car.symbol + 'Area']
            )
        ) {
            if (intersection.name == car.atIntersection) {
                car.atIntersection = null
            }
            intersection.occupied = false
            this.parkingLot.overlay.updateIntersectionColor(intersection)
            clearInterval(isStillOccupiedInterval)
            // Clear car.atIntersection?
        }
    }

    // Skip straight to checking if parked when parking, as the car's
    // collisionBox may never actually enter the intersection.
    if (car.status === 'parking') {
        isStillOccupiedInterval = setInterval(isStillOccupied, 75)
    } else {
        // Having this interval faster than loop speed seems to
        // cause hasEntered to fire too soon and isStillOccupied
        // to fire immediately after.
        hasEnteredInterval = setInterval(hasEntered, 75)
    }
}

// Current route plotter will send cars to mid-right parking spaces
// up from the bottom horizontal section instead of top.
// Will need to check no one is coming down that way to turn up and
// get into spot.

// Cars parked on very bottom left & top right spots will need to pull out
// opposite to normal traffic.

//         Collision Detection Model
// Cars have a defined set of areas they can check when relevant.
// Varying distances forward, intersections, full roads they're entering
//     Predetermined vs generated collision boxes to check areas.
// Cars could have hitbox properties. When backing out of a space or
// entering an intersection they will extend their hitbox to be detected
// by other cars checking the space they need.
//
// Hitboxes are checked car-by-car so can easily grab the detected
// car, see if it's oncoming, its speed, etc.

//         Reservation Model

//     Each tick cars request reservations of their own space +
// the space they want to move into +
// a margin (min stopping distance)
// OR extra space for a more elaborate move like a turn/parking
// (block intersection, all the space they need to back out into, etc.)
//     If the request is denied they will decelerate until the path
// is clear or they full stop and wait.
//
// Reservations saved as object properties. Each property is named as
// the reserving car so it can be grabbed that way.
//
// Still have to determine extra info like direction, speed etc. of
// cars ahead.
// Have to edit/swap every reservation every tick.

// Mock function
TrafficHandler.prototype.UNUSED_requestReservation = function (
    car,
    reservationRequest
) {
    // Mocked values
    reservationRequest = {section1: {low: 5, high: 40}}

    let reservations = {car2: {section1: {low: 10, high: 50}}} // this.reservations
    // Mocked values

    for (let car in reservations) {
        let existingReservation = reservations[car]
        for (let section in existingReservation) {
            if (reservationRequest.hasOwnProperty(section)) {
                if (
                    reservationRequest[section].low <=
                        existingReservation[section].high &&
                    existingReservation[section].low <=
                        reservationRequest[section].high
                ) {
                    return false
                }
            }
        }
    }

    reservations[car] = reservationRequest
    return true
}

export {TrafficHandler}
