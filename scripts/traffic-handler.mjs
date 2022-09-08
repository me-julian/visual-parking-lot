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
 * @param {ParkingLOt} parkingLot
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

TrafficHandler.prototype.returnCarsInArea = function (referenceArea) {
    let cars = []
    for (let car in this.parkingLot.cars.leaving) {
        car = this.parkingLot.cars[car]
        let carArea = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.width,
            h: car.height,
        }
        if (this.checkCollision(referenceArea, carArea)) {
            cars.push(car)
        }
    }
    for (let car in this.parkingLot.cars.parking) {
        car = this.parkingLot.cars[car]
        let carArea = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.width,
            h: car.height,
        }
        if (this.checkCollision(referenceArea, carArea)) {
            cars.push(car)
        }
    }

    return cars
}

/**
 * @method
 * @param {Rectangle} obj1
 * @param {Rectangle} obj2
 * @returns
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
 * Checks if any active cars are within one car's length of the entrance.
 * @method
 * @param {ParkingLot} parkingLot
 * @returns
 */
TrafficHandler.prototype.isEntranceClear = function (parkingLot) {
    for (let car in parkingLot.cars.leaving) {
        car = parkingLot.cars.leaving[car]
        let carHitbox = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.width,
            h: car.height,
        }
        if (this.checkCollision(this.entranceArea, carHitbox)) {
            return false
        }
    }
    for (let car in parkingLot.cars.parking) {
        car = parkingLot.cars.parking[car]
        let carHitbox = {
            x: car.coords.x,
            y: car.coords.y,
            w: car.width,
            h: car.height,
        }
        if (this.checkCollision(this.entranceArea, carHitbox)) {
            return false
        }
    }

    return true
}

export {TrafficHandler}
