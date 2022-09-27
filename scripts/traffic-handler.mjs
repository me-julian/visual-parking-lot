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
TrafficHandler.prototype.getTurnArea = function (car, endVals) {
    let turnArea = {}

    turnArea.x = endVals.x
    turnArea.y = endVals.y
    turnArea.w = car.baseLength
    turnArea.h = car.baseLength

    // let testDiv = document.createElement('div')
    // testDiv.style.position = 'absolute'
    // testDiv.style.left = turnArea.x + 'px'
    // testDiv.style.top = turnArea.y + 'px'
    // testDiv.style.width = turnArea.w + 'px'
    // testDiv.style.height = turnArea.h + 'px'

    // testDiv.style.backgroundColor = 'orange'
    // testDiv.style.opacity = '40%'
    // car.pageWrapper.append(testDiv)

    return turnArea
}

TrafficHandler.prototype.getAreaAlongColOrRow = function (car) {
    let roadArea
    let axis = car.axis,
        oppositeAxis,
        vertOrHor
    if (axis === 'top') {
        axis = 'col'
        oppositeAxis = 'row'
        vertOrHor = 'vertical'
    } else {
        axis = 'row'
        oppositeAxis = 'col'
        vertOrHor = 'horizontal'
    }
    // Could be improved
    let farthestSection
    let allSections = this.parkingLot.pathObject.sections[vertOrHor]
    let relevantSections = []
    for (let section in allSections) {
        if (allSections[section][axis] === car.currentSection[axis]) {
            relevantSections.push(allSections[section])
        }
    }
    relevantSections.sort((a, b) => {
        return a[axis] - b[axis]
    })

    let axisLength
    if (car.negation === 1) {
        farthestSection = relevantSections[relevantSections.length - 1]
        axisLength = Math.abs(
            farthestSection[car.symbol] +
                farthestSection.len -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        )
    } else {
        farthestSection = relevantSections[0]
        axisLength = Math.abs(
            farthestSection[car.symbol] -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        )
    }

    let x, y, w, h
    if (axis === 'row') {
        x = farthestSection.x
        y = farthestSection.y - car.baseWidth / 2
        w = axisLength
        h = car.baseWidth
    } else {
        x = farthestSection.x - car.baseWidth / 2
        y = farthestSection.y
        w = car.baseWidth
        h = axisLength
    }
    // Could be improved

    roadArea = {
        x: x,
        y: y,
        w: w,
        h: h,
    }

    // Possibly not needed?
    // roadArea[car.symbol] -= car.speed

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

    stoppingDistanceArea[car.symbol] -= car.speed

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
TrafficHandler.prototype.getParkingArea = function (car, animationType) {
    let turnAreaForward = {
        x: car.coords.x,
        y: car.coords.y,
        w: car.collisionBoxes.car.w,
        h: car.collisionBoxes.car.h,
    }
    let turnAreaCross = {
        x: 1,
        y: 2,
        w: 3,
        h: 4,
    }

    // this.parkingLot.overlay.drawBox(el, stoppingDistanceArea, {backgroundColor: 'red',})

    return turnArea
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
        if (this.checkCollision(referenceArea, area)) {
            return true
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
 * Checks if any active cars are within one car's length of the entrance.
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

TrafficHandler.prototype.turnAreaClear = function (turnArea) {
    // if (checkIntersection()) {
    // return false
    // }

    let cars = this.returnActiveCarsInArea(turnArea)
    if (cars.length > 0) {
        return false
    }
    return true
}

TrafficHandler.prototype.blockIntersection = function (car, intersection) {
    intersection.occupied = true
    // Currently blocking both areas of the intersection (x and y areas)
    // but could eventually granularize to check each individually
    // and set whether cross vs forward is free, but may be unnecessary.
    this.parkingLot.overlay.updateIntersectionColor(intersection)

    let isStillOccupied = () => {
        if (
            !this.checkCollision(
                car.collisionBoxes.car,
                intersection.areas[car.symbol + 'Area']
            ) ||
            car.status === 'parked'
        ) {
            intersection.occupied = false
            this.parkingLot.overlay.updateIntersectionColor(intersection)
            clearInterval(checkOccupationInterval)
        }
    }
    let checkOccupationInterval = setInterval(isStillOccupied, 50)
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
