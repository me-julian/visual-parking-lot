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

    roadArea[car.oppSymbol] += car.baseWidth / 2

    if (!car.overlay.road) {
        car.overlay.road = this.parkingLot.overlay.createBox(
            car.overlayWrapper,
            ['overlay-el', 'area-box']
        )
    }
    this.parkingLot.overlay.drawBox(car.overlay.road, roadArea, {
        background: 'pink',
    })

    return roadArea
}
TrafficHandler.prototype.getAreaBetweenDestination = function (car) {
    let destinationArea = {
        x: car.coords.x,
        y: car.coords.y,
        w: car.baseWidth,
        h: Math.abs(
            car.route[0].coord -
                Math.abs(
                    car.leadingEdge + car.minStoppingDistance * car.negation
                )
        ),
    }
    destinationArea[car.symbol] = car.nextDestination
    destinationArea[car.oppSymbol] += car.baseWidth / 2

    if ((car.route.length === 1 && !car.hasParked) || car.route[1].turn) {
        if (car.symbol === 'y') {
            destinationArea.h += car.turningRunup * car.negation
        } else {
            destinationArea.w += car.turningRunup * car.negation
        }
    }

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
            background: 'purple',
        }
    )

    return destinationArea
}
TrafficHandler.prototype.getAreaInStoppingDistance = function (car) {
    let stoppingDistanceArea = {
        x: car.coords.x,
        y: car.coords.y,
        w: car.baseWidth,
        h: car.baseLength + car.minStoppingDistance,
    }
    stoppingDistanceArea[car.symbol] =
        car.coords[car.symbol] + car.minStoppingDistance * car.negation

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
            background: 'red',
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
TrafficHandler.prototype.returnCarsInArea = function (
    referenceArea,
    exceptedCars
) {
    let cars = []
    for (let car in this.parkingLot.cars.leaving) {
        car = this.parkingLot.cars.leaving[car]
        let carArea = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.collisionBox.width,
            h: car.collsionBox.height,
        }
        if (this.checkCollision(referenceArea, carArea)) {
            cars.push(car)
        }
    }
    for (let car in this.parkingLot.cars.entering) {
        car = this.parkingLot.cars.entering[car]
        let carArea = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.collisionBox.width,
            h: car.collisionBox.height,
        }
        if (this.checkCollision(referenceArea, carArea)) {
            cars.push(car)
        }
    }

    if (exceptedCars) {
        cars = cars.filter((car) => !exceptedCars.includes(car))
    }
    return cars
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
            car.status === 'leavingSpace' ||
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
// Possibly redundant with returnCarsInArea
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
