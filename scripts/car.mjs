'use strict'

/**
 * @class
 * @typedef {Object} Car
 * @param {number} id
 * @property {string} img
 * @property {Object} coords
 * @property {number} coords.x
 * @property {number} coords.y
 * @property {string} direction
 * @property {number} orientation - Angle of page element's rotation.
 * @property {Boolean} parked
 */
function Car(id) {
    this.id = id

    this.img = undefined
    this.pageEl = undefined
    this.coords = {x: undefined, y: undefined}
    this.currentSection = undefined
    this.direction = undefined
    this.orientation = undefined

    this.assignedSpace = undefined
    this.status = undefined
}

Car.prototype.getRandomImage = function () {
    let img = undefined
    return img
}

Car.prototype.createPageElement = function () {
    let pageEl = undefined
    return pageEl
}

Car.prototype.initialize = function (entrance, assignedSpace) {
    this.img = this.getRandomImage()
    this.pageEl = this.createPageElement()
    this.coords = {x: 275, y: 1035}
    this.currentSection = entrance
    this.direction = 'north'
    this.orientation = 270
    this.assignedSpace = assignedSpace
    this.parked = false
}

Car.prototype.determineAction = function (parkingLot) {
    switch (this.status) {
        case 'parking':
        case 'leaving':
            this.moveAlongRoute()
        case 'parked':
    }

    // Car needs to give destination, when to initialize. How to
    // order checks for what it should do.

    if (this.enroute) {
        this.moveAlongRoute()
    } else {
        console.log('Car requesting route')
        parkingLot.requestRoute(this)
    }
}

Car.prototype.moveAlongRoute = function () {}
Car.prototype.wait = function () {}
Car.prototype.moveForward = function () {}
Car.prototype.turn = function () {}
Car.prototype.reverseOutOfSpace = function () {}
Car.prototype.park = function () {}
Car.prototype.exitScene = function () {}

export {Car}
