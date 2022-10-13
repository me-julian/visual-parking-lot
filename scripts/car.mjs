'use strict'

/**
 * @class
 * @typedef {Object} Car
 * @param {number} id
 * @param {ParkingLot} parkingLot
 * @property {string} img
 * @property {Object} coords
 * @property {number} coords.x
 * @property {number} coords.y
 * @property {string} direction
 * @property {number} orientation - Angle of page element's rotation.
 *
 * @property {string} status
 * @property {space} assignedSpace
 * @property {Object} route
 * @property {Number} parkingDuration - Time car will park for in ms.
 *
 * @property {Number} speed - Speed the car is currently moving in by pixels
 * @property {Number} maxSpeed
 * @property {Number} minStoppingDistance
 */
function Car(id, parkingLot) {
    this.id = id
    this.parkingLot = parkingLot

    this.img = undefined
    this.orientation = undefined
    this.pageWrapper = undefined
    this.pageEl = undefined
    this.userFocus = undefined
    this.overlay = {}
    this.overlay.stoppingDistance = undefined
    this.overlay.betweenDestination = undefined
    this.overlay.road = undefined

    this.finishedParking = undefined
    this.status = undefined
    this.coords = {x: undefined, y: undefined}
    this.currentSection = undefined
    this.assignedSpace = undefined
    this.route = undefined
    this.nextIntersection = undefined
    this.blockingIntersections = {}

    this.baseWidth = undefined
    this.baseLength = undefined
    this.collisionBoxes = {
        car: {
            x: undefined,
            y: undefined,
            h: undefined,
            w: undefined,
        },
    }
    this.direction = undefined
    this.leadingEdge = undefined
    this.symbol = undefined
    this.oppSymbol = undefined
    this.axis = undefined
    this.negation = undefined

    this.parkingDuration = undefined

    this.speed = undefined
    this.maxSpeed = undefined
    this.minStoppingDistance = undefined
    this.turningRunup = undefined
}

Car.prototype.images = [
    'img/car/car-aqua.png',
    'img/car/car-blue.png',
    'img/car/car-dragon.png',
    'img/car/car-green.png',
    'img/car/car-grey.png',
    'img/car/car-hot-pink.png',
    'img/car/car-lime-green.png',
    'img/car/car-orange.png',
    'img/car/car-pink.png',
    'img/car/car-purple.png',
    'img/car/car-red-stripes.png',
    'img/car/car-red.png',
    'img/car/car-white.png',
    'img/car/car-yellow.png',
]

Car.prototype.getRandomImage = function () {
    let rand = Math.floor(Math.random() * this.images.length)
    let img = this.images[rand]
    return img
}

Car.prototype.createPageElements = function () {
    let carFullPageWrapper = document.createElement('div')
    carFullPageWrapper.id = 'car' + this.id
    carFullPageWrapper.classList.add('car-wrapper')

    let imgWrapper = document.createElement('div')
    imgWrapper.classList.add('car')
    imgWrapper.style.left = this.coords.x + 'px'
    imgWrapper.style.top = this.coords.y + 'px'
    imgWrapper.style.transform = 'rotate(' + this.orientation + 'deg)'

    let imgEl = document.createElement('img')
    imgEl.src = this.img

    let overlayWrapper = document.createElement('div')
    overlayWrapper.classList.add('overlay-wrapper')

    document.getElementById('parking-lot').append(carFullPageWrapper)
    carFullPageWrapper.append(imgWrapper)
    imgWrapper.append(imgEl)
    carFullPageWrapper.append(overlayWrapper)

    return carFullPageWrapper
}
Car.prototype.removePageElements = function () {
    if (this.userFocus) {
        // Currently overkill, could just null overlay.focusedCar
        this.parkingLot.overlay.toggleCarFocus(this)
    }
    this.pageWrapper.remove()
}

Car.prototype.initialize = function (assignedSpace) {
    this.status = 'entering'
    this.finishedParking = false
    this.coords = {
        x: this.parkingLot.pathObject.entrance.x - 90 / 2,
        y:
            this.parkingLot.pathObject.entrance.y +
            this.parkingLot.pathObject.entrance.len,
    }
    this.assignedSpace = assignedSpace

    this.baseWidth = 90
    this.baseLength = 182
    this.collisionBoxes.car = {
        x: this.coords.x + 90 / 2,
        y: this.coords.y,
        w: 90,
        h: 182,
    }
    this.direction = 'north'
    this.setPositionalVars()
    this.updateCollisionBox()

    this.img = this.getRandomImage()
    this.orientation = 270
    this.pageWrapper = this.createPageElements()
    this.pageEl = this.pageWrapper.getElementsByClassName('car')[0]
    this.overlayWrapper =
        this.pageWrapper.getElementsByClassName('overlay-wrapper')[0]
    this.userFocus = false
    this.pageEl.firstElementChild.addEventListener('click', () => {
        this.parkingLot.overlay.toggleCarFocus(this)
    })
    //
    this.currentSection = this.parkingLot.pathObject.entrance
    //
    this.route = this.parkingLot.requestRouteToSpace(this)
    // Should restructure this.
    this.currentSection = this.route[0]
    //
    this.nextIntersection = this.getNextIntersection()
    this.parkingDuration = 10000

    this.speed = 5
    this.maxSpeed = 15
    this.minStoppingDistance = 0
    this.turningRunup = 30

    this.nextDestination = this.getNextDestination(this.route[0], this.route[1])
}

Car.prototype.determineAction = function () {
    switch (this.status) {
        case 'entering':
        case 'leaving':
            this.followRoute()
            break
        case 'turning':
            this.turn()
            break
        case 'parking':
        case 'leaving-space':
            break
        case 'parked':
            this.attemptToLeaveSpace()
            break
        case 'leaving-scene':
            this.exitScene()
            break
    }
}

Car.prototype.followRoute = function () {
    this.updateCollisionBox()
    this.setPositionalVars()

    // Could be combined
    let nextPathDestination = this.getNextDestination(
        this.currentSection,
        this.route[1]
    )
    if (!this.nextDestination) {
        this.nextDestination = nextPathDestination
    }
    //

    this.minStoppingDistance = this.calcStoppingDistance()

    // Need to re-add proper detection ahead of stopping distance.
    // Cars entering on left column will respect mid cars that need
    // to get to bottom horizontal, but mid cars won't
    // pull out if the cross road is occupied.

    // Cars leaving spaces currently are still in ParkingLot's
    // parked category meaning their maneuver area hitboxes don't
    // get checked. Necessary for checking road ahead. - Fixed?

    // Probably need to continue reworking intersection behaviour.
    // Cars over 2 intersections at once, cross intersection vs forward,
    // z turns blocking a long time, etc.

    let distanceToNextDestination =
        this.parkingLot.trafficHandler.returnDistanceBetween(
            this.leadingEdge,
            this.nextDestination
        )

    let stoppingDistanceArea =
        this.parkingLot.trafficHandler.getAreaInStoppingDistance(this)
    let carsInMinStoppingDistance =
        this.checkStoppingDistanceArea(stoppingDistanceArea)

    let destinationArea =
        this.parkingLot.trafficHandler.getAreaBetweenDestination(this)
    // let carsBetweenNextDestination = this.checkDestinationArea(destinationArea)

    let roadArea = this.parkingLot.trafficHandler.getRoadAreaAhead(this)
    let roadAheadStatus = this.checkRoadAheadArea(roadArea)

    let carsBetweenNextDestination = false
    let clearAhead = true
    if (carsInMinStoppingDistance.collision) {
        clearAhead = false
        carsBetweenNextDestination = true
    }
    // if (carsBetweenNextDestination.collision) {
    //     clearAhead = false
    // }
    if (roadAheadStatus.collision) {
        clearAhead = false
    }

    if (this.nextIntersection) {
        let intersection = this.checkAtIntersection()
        if (intersection !== null) {
            if (this.hasFollowingDestination()) {
                let followingDestination = this.route[1].coord
                let nextSection = this.route[1]
                if (
                    this.mustManeuverTowardsFollowingDestination(
                        followingDestination,
                        nextSection
                    )
                ) {
                    this.park(true)
                    return
                } else {
                    this.adjustToFollowingDestination(
                        followingDestination,
                        nextSection
                    )
                }
            }

            if (!this.isIntersectionBlocked(intersection)) {
                this.parkingLot.trafficHandler.blockIntersection(
                    this,
                    intersection
                )
            } else {
                clearAhead = false
            }
        }
    }

    if (distanceToNextDestination <= this.minStoppingDistance) {
        if (this.route.length === 1) {
            if (this.status === 'leaving') {
                this.exitScene(distanceToNextDestination)
                return
            } else if (
                this.status === 'entering' &&
                !carsBetweenNextDestination.presence
            ) {
                this.park(false)
                return
            }
        }
        if (this.route[1].turn && !carsBetweenNextDestination.presence) {
            this.turn(distanceToNextDestination)
            return
        }
    }

    if (clearAhead) {
        this.moveForward(distanceToNextDestination)
    } else {
        this.wait()
    }
}

Car.prototype.wait = function () {
    switch (this.status) {
        case 'parked':
            break
    }
}
Car.prototype.moveForward = function (distanceToNextDestination) {
    this.advance(distanceToNextDestination, this.speed)
}

Car.prototype.advance = function (distanceToNextDestination, newSpeed) {
    this.speed = newSpeed

    // Potentially move this when doing proper intersection/following dest checking.
    if (this.speed >= distanceToNextDestination) {
        this.setToNextSection()
    }

    this.coords[this.symbol] += this.speed * this.negation
    this.pageEl.style[this.axis] = this.coords[this.symbol] + 'px'
    this.leadingEdge += this.speed * this.negation

    this.updateCollisionBox()
}

Car.prototype.turn = function () {
    if (!this.animation) {
        this.animation = this.parkingLot.animationHandler.getAnimation(
            this,
            'right-angle-turn'
        )
    }

    // Temporarily have it recreate it every time.
    // Could set this as prop on animation and retrieve if initialized.
    if (!this.animation.maneuverArea) {
        this.animation.maneuverArea =
            this.parkingLot.trafficHandler.getManeuverArea(this, this.animation)
    }

    if (this.animation.blockIntersections === undefined) {
        this.animation.blockIntersections =
            this.parkingLot.trafficHandler.getAnimationIntersections(this)
    }

    if (
        this.status !== 'turning' &&
        this.parkingLot.trafficHandler.maneuverAreaClear(
            this,
            this.animation.maneuverArea
        )
    ) {
        this.status = 'turning'

        this.parkingLot.trafficHandler.blockManeuverArea(this)

        this.pageEl.style.animationDuration = '3s'
        this.pageEl.style.animationIterationCount = '1'
        this.pageEl.style.animationTimingFunction = 'initial'

        this.pageEl.style.animationName = this.animation.ruleObject.name

        let endAnimEventFunct = () => {
            this.endTurn(this.animation.endVals)
            this.pageEl.removeEventListener('animationend', endAnimEventFunct)
        }
        this.pageEl.addEventListener('animationend', endAnimEventFunct)
    } else {
        this.wait()
    }
}
Car.prototype.park = function (exceptional) {
    if (!this.animation) {
        let animationType
        if (exceptional) {
            animationType =
                this.parkingLot.animationHandler.determineExceptionalAnimationType(
                    this
                )
        } else {
            animationType = 'right-angle-park'
        }

        this.animation = this.parkingLot.animationHandler.getAnimation(
            this,
            animationType
        )
    }

    if (!this.animation.maneuverArea) {
        this.animation.maneuverArea =
            this.parkingLot.trafficHandler.getManeuverArea(this, this.animation)
    }

    if (this.animation.blockIntersections === undefined) {
        this.animation.blockIntersections =
            this.parkingLot.trafficHandler.getAnimationIntersections(this)
    }

    if (
        this.status !== 'parking' &&
        this.parkingLot.trafficHandler.maneuverAreaClear(
            this,
            this.animation.maneuverArea
        )
    ) {
        this.status = 'parking'

        this.parkingLot.trafficHandler.blockManeuverArea(this)

        if ((this.animation.type = 'right-angle-park')) {
            this.pageEl.style.animationDuration = '4s'
            this.pageEl.style.animationIterationCount = '1'
            this.pageEl.style.animationTimingFunction =
                'cubic-bezier(0.31, 0.26, 0.87, 0.76)'
        } else {
            this.pageEl.style.animationDuration = '5s'
            this.pageEl.style.animationIterationCount = '1'
            this.pageEl.style.animationTimingFunction =
                'cubic-bezier(0.45, 0.05, 0.55, 0.95)'
        }

        this.pageEl.style.animationName = this.animation.ruleObject.name

        let endAnimEventFunct = () => {
            this.endParking(this.animation.endVals)
            this.pageEl.removeEventListener('animationend', endAnimEventFunct)
        }
        this.pageEl.addEventListener('animationend', endAnimEventFunct)
    } else {
        this.wait()
    }
}
Car.prototype.attemptToLeaveSpace = function () {
    if (this.route === undefined) {
        this.status === 'unhandled'
        delete this.parkingLot.cars.parked[this.id]
        return
    }
    if (this.finishedParking) {
        if (!this.animation) {
            // Create/retrieve an animation.
            this.animation = this.parkingLot.animationHandler.getAnimation(
                this,
                'right-angle-reverse'
            )
        }

        if (!this.animation.maneuverArea) {
            this.animation.maneuverArea =
                this.parkingLot.trafficHandler.getManeuverArea(
                    this,
                    this.animation
                )
        }

        if (this.animation.blockIntersections === undefined) {
            this.animation.blockIntersections =
                this.parkingLot.trafficHandler.getAnimationIntersections(this)
        }

        if (
            this.parkingLot.trafficHandler.maneuverAreaClear(
                this,
                this.animation.maneuverArea
            ) &&
            this.reenteredRoadClear()
        ) {
            this.leaveSpace()
        } else {
            this.wait()
        }
    }
}
Car.prototype.leaveSpace = function () {
    this.status = 'leaving-space'

    this.parkingLot.trafficHandler.blockManeuverArea(this)

    this.parkingLot.cars.leaving[this.id] = this
    delete this.parkingLot.cars.parked[this.id]

    this.pageEl.style.animationDuration = '4s'
    this.pageEl.style.animationIterationCount = '1'
    this.pageEl.style.animationTimingFunction =
        'cubic-bezier(0.31, 0.26, 0.87, 0.76)'
    this.pageEl.style.animationName = this.animation.ruleObject.name

    let endAnimEventFunct = () => {
        this.endLeavingSpace(this.animation.endVals)
        this.pageEl.removeEventListener('animationend', endAnimEventFunct)
    }
    this.pageEl.addEventListener('animationend', endAnimEventFunct)
}

Car.prototype.endTurn = function (endVals) {
    if (this.finishedParking) {
        this.status = 'leaving'
    } else {
        this.status = 'entering'
    }

    this.setToNextSection()
    this.adjustPositionalVarsAfterAnim(endVals)
    this.updateCollisionBox()
    this.adjustCollisionBoxesFromAnim()
    this.updateElementPosition()

    this.pageEl.style.animationName = 'none'
    this.animation = undefined
}
Car.prototype.endParking = function (endVals) {
    this.adjustPositionalVarsAfterAnim(endVals)
    this.setPositionalVars()
    this.updateCollisionBox()
    this.adjustCollisionBoxesFromAnim()
    this.updateElementPosition()

    // Is this hiding collisionBoxes that need to be rotated?
    this.parkingLot.overlay.clearCollisionBoxes(this.pageWrapper)

    this.pageEl.style.animationName = 'none'
    this.animation = undefined

    this.parkingLot.cars.parked[this.id] = this
    delete this.parkingLot.cars.entering[this.id]
    this.status = 'parked'

    this.currentSection = this.route[this.route.length - 1]

    this.parkingLot.overlay.updateSpaceColor(this.assignedSpace.pageEl, this)

    setTimeout(() => {
        this.route = this.parkingLot.requestRouteFromSpace(this)

        console.log(this.id + ' is ready to leave their space.')
        this.finishedParking = true
    }, this.parkingDuration)
}
Car.prototype.endLeavingSpace = function (endVals) {
    this.pageEl.style.animationName = 'none'
    this.animation = undefined

    this.status = 'leaving'

    this.setToNextSection(true)
    this.adjustPositionalVarsAfterAnim(endVals)
    this.setPositionalVars()
    this.updateCollisionBox()
    this.adjustCollisionBoxesFromAnim()
    this.updateElementPosition()
    this.parkingLot.overlay.updateSpaceColor(this.assignedSpace.pageEl, this)

    this.determineIfExitRouteIsBlocked()
}

Car.prototype.exitScene = function () {
    // Shouldn't be anything blocking the exit at this point, go forward
    // at current speed until outside of scene.
    this.status = 'leaving-scene'
    if (this.coords.y > this.nextDestination) {
        this.parkingLot.cars.left[this.id] = this
        delete this.parkingLot.cars.leaving[this.id]
        this.status = 'left'

        this.removePageElements()
    } else {
        // Get and draw collision box properly
        this.parkingLot.trafficHandler.getAreaInStoppingDistance(this)
        this.advance(9999, this.speed)
        this.updateCollisionBox()
    }
}

Car.prototype.setToNextSection = function (newRoute) {
    if (!newRoute) {
        this.route.splice(0, 1)
    }
    this.nextDestination = null
    this.currentSection = this.route[0]
    this.direction = this.currentSection.direction
    let intersection = this.getNextIntersection()
    if (intersection) {
        if (intersection !== this.blockingIntersections[intersection.name]) {
            this.nextIntersection = this.getNextIntersection()
        }
    }
}

Car.prototype.setPositionalVars = function () {
    let symbol, oppSymbol, axis
    let negation = 1
    if (this.direction === 'north' || this.direction === 'south') {
        symbol = 'y'
        oppSymbol = 'x'
        axis = 'top'
        if (this.direction === 'north') {
            negation = -1
        }
    } else {
        symbol = 'x'
        oppSymbol = 'y'
        axis = 'left'
        if (this.direction === 'west') {
            negation = -1
        }
    }

    let leadingEdge = this.coords[symbol]
    // Get point opposite to top/left.
    if (negation === 1) {
        leadingEdge += this.baseLength
    }

    this.leadingEdge = leadingEdge
    this.symbol = symbol
    this.oppSymbol = oppSymbol
    this.axis = axis
    this.negation = negation
}
Car.prototype.adjustPositionalVarsAfterAnim = function (newVals) {
    this.coords.x = newVals.x
    this.coords.y = newVals.y
    this.orientation = newVals.orientation
    this.direction = newVals.direction
}
Car.prototype.updateElementPosition = function () {
    this.pageEl.style.left = this.coords.x + 'px'
    this.pageEl.style.top = this.coords.y + 'px'
    this.pageEl.style.transform = 'rotate(' + this.orientation + 'deg)'
}

Car.prototype.updateCollisionBox = function () {
    this.collisionBoxes.car.x = this.coords.x
    this.collisionBoxes.car.y = this.coords.y
    this.collisionBoxes.car[this.oppSymbol] += this.baseWidth / 2
}
Car.prototype.adjustCollisionBoxesFromAnim = function () {
    //   Need to handle intersections

    delete this.collisionBoxes.maneuver
    switch (this.status) {
        case 'turning':
            break
        case 'parking':
            break
        case 'leaving-space':
            break
        case 'entering':
        case 'leaving':
            this.flipCollisionBox()
    }
}
Car.prototype.flipCollisionBox = function () {
    switch (this.direction) {
        case 'north':
        case 'south':
            this.collisionBoxes.car.h = this.baseLength
            this.collisionBoxes.car.w = this.baseWidth
            break
        case 'west':
        case 'east':
            this.collisionBoxes.car.h = this.baseWidth
            this.collisionBoxes.car.w = this.baseLength
            break
    }
}

Car.prototype.checkStoppingDistanceArea = function (areaAhead) {
    let collision = false

    let carsAhead = this.parkingLot.trafficHandler.returnActiveCarsInArea(
        areaAhead,
        [this]
    )

    // Currently counting any car entering stopping distance as immediate
    // cause to come to a full stop.
    if (carsAhead.length != 0) {
        collision = true
    }

    return {collision: collision}
}
Car.prototype.checkDestinationArea = function (areaAhead) {
    let presence = false,
        collision = false,
        distance = 9999

    let carsAhead = this.parkingLot.trafficHandler.returnActiveCarsInArea(
        areaAhead,
        [this]
    )

    if (carsAhead.length != 0) {
        presence = true
    }

    if (presence) {
        let immediateCollision = this.checkForImmediateCollision(
            carsAhead,
            collision,
            distance
        )
        collision = immediateCollision.collision
        distance = immediateCollision.distance
        // let blockingDestination = this.isBlockingDestination(car)
        // if (blockingDestination.collision) {
        //     presence = true
        //     if (blockingDestination.distance < distance) {
        //         distance = blockingDestination.distance
        //     }
        // }
    }

    return {presence: presence, collision: collision, distance: distance}
}
// Car.prototype.isBlockingDestination(car) {
//     let opposingEdge
//     if (this.negation === -1) {
//         opposingEdge = car.coords[this.symbol] + car.baseLength
//     } else {
//         opposingEdge = car.coords[this.symbol]
//     }
Car.prototype.checkRoadAheadArea = function (areaAhead) {
    let presence = false,
        collision = false,
        distance = 9999

    let carsAhead = this.parkingLot.trafficHandler.returnActiveCarsInArea(
        areaAhead,
        [this]
    )

    if (carsAhead.length != 0) {
        presence = true
    }

    carsAhead = this.splitCarsByDirection(this.direction, carsAhead)

    collision = this.checkOncomingCars(carsAhead.oncoming)
    // for (let car of carsAhead) {
    // Check direction for head-on collisions
    // Possibly check for turning cars
    // Check whether they're going slower than this car.
    // if (
    //     (this.direction === 'south' && car.direction === 'north') ||
    //     (this.direction === 'north' && car.direction === 'south') ||
    //     (this.direction === 'west' && car.direction === 'east') ||
    //     (this.direction === 'east' && car.direction === 'west')
    // ) {
    //     // oncomingCar = UNKNOWN(car)
    //     if (oncomingCar.concernable) {
    //         presence = true
    //         if (oncomingCar.distance < distance)
    //             distance = oncomingCar.distance
    //     }
    //     continue
    // }
    // let blockingDestination = this.isBlockingDestination(car)
    // if (blockingDestination.collision) {
    //     presence = true
    //     if (blockingDestination.distance < distance) {
    //         distance = blockingDestination.distance
    //     }
    // }
    // }

    return {presence: presence, collision: collision, distance: distance}
}
Car.prototype.reenteredRoadClear = function () {
    let clear = true

    let roadArea = this.parkingLot.trafficHandler.getRoadArea(
        this.route[0].section
    )

    let carsOnRoad = this.parkingLot.trafficHandler.returnActiveCarsInArea(
        roadArea,
        [this]
    )

    carsOnRoad = this.splitCarsByDirection(
        this.animation.endVals.direction,
        carsOnRoad
    )

    // Remove cars that have/are about to pass where the car needs to go
    for (let car of carsOnRoad.oncoming) {
        // Not yet accounting for negative vs positive movement.
        if (
            car.coords[car.symbol] < this.coords[car.symbol] ||
            car.status === 'turning' ||
            car.status === 'parking'
        ) {
            let i = carsOnRoad.oncoming.indexOf(car)
            carsOnRoad.oncoming.splice(i, 1)
        }
    }

    if (carsOnRoad.oncoming.length !== 0) {
        clear = false
    }

    return clear
}

Car.prototype.splitCarsByDirection = function (referenceDir, cars) {
    let oncoming = [],
        sameDir = [],
        cross = []
    for (let car of cars) {
        if (referenceDir === car.direction) {
            sameDir.push(car)
            continue
        }

        if (referenceDir === 'north' || referenceDir === 'south') {
            if (car.direction === 'west' || car.direction === 'east') {
                cross.push(car)
            } else {
                oncoming.push(car)
            }
        }
        if (referenceDir === 'west' || referenceDir === 'east') {
            if (car.direction === 'south' || car.direction === 'north') {
                cross.push(car)
            } else {
                oncoming.push(car)
            }
        }
    }

    return {oncoming: oncoming, sameDir: sameDir, cross: cross}
}
Car.prototype.checkOncomingCars = function (cars) {
    let collision = false
    for (let car of cars) {
        // Not checking for car.status === 'leaving-space'
        if (car.status === 'turning' || car.status === 'parking') {
            continue
        }

        for (let routeSection of this.route) {
            if (routeSection.section === car.currentSection.section) {
                // if (car.blockingIntersections === car.nextIntersection) {
                //     continue
                // } else {
                //     collision = true
                // }
                collision = true
            }
        }
        // Make actual checks here
    }

    return collision
}
Car.prototype.checkForImmediateCollision = function (
    cars,
    collision,
    distance
) {
    for (let car of cars) {
        let collisionCheck = this.willCollideAtCurrentSpeed(car)
        if (collisionCheck.collision) {
            collision = true
            if (collisionCheck.distance < distance) {
                distance = collisionCheck.distance
            }
        }
    }

    return {collision, distance}
}
Car.prototype.willCollideAtCurrentSpeed = function (car) {
    let opposingEdge, opposingCarLength

    if ((this.axis = 'x')) {
        opposingCarLength = 'width'
    } else {
        opposingCarLength = 'height'
    }

    // As it is this function is pointless/only useful for
    // minStoppingDistanceArea checks?

    // Going to need to check all collision boxes when implemented?
    if (this.negation === -1) {
        opposingEdge =
            car.coords[this.symbol] + car.collisionBoxes.car[opposingCarLength]
    } else {
        opposingEdge = car.coords[this.symbol]
    }
    let distance = this.parkingLot.trafficHandler.returnDistanceBetween(
        this.leadingEdge,
        opposingEdge
    )

    // Change this to a check against an area and the opposing car's
    // collision boxes?
    let collision = false
    if (this.negation === 1) {
        if (
            this.leadingEdge + this.minStoppingDistance * this.negation >=
            opposingEdge
        ) {
            collision = true
        }
    } else {
        if (
            this.leadingEdge + this.minStoppingDistance * this.negation <=
            opposingEdge
        ) {
            collision = true
        }
    }

    return {collision: collision, distance: distance}
}

Car.prototype.distanceFromClosestCarAhead = function (carsAhead) {
    let closestCar
    // Intial number is greater than the size of the scene.
    let closestDist = 2000
    for (let car of carsAhead) {
        let opposingEdge
        if (this.direction === 'north' || this.direction === 'west') {
            opposingEdge = car[this.symbol] + car.height
        } else {
            opposingEdge = car[this.symbol]
        }

        let distance = this.parkingLot.trafficHandler.returnDistanceBetween(
            this.leadingEdge,
            opposingEdge
        )

        if (distance < closestDist) {
            closestDist = distance
            closestCar = car
        }
    }

    return {car: closestCar, distance: closestDist}
}

Car.prototype.getNextDestination = function (currentSection, nextSection) {
    let nextPathDestination
    // Either going to end of section heading straight (could be exit)
    // or turning onto another section/into a parking space.
    nextPathDestination = currentSection.coord
    let turnOntoSection = false
    if (nextSection) {
        turnOntoSection = nextSection.turn
    }
    if (
        (this.route.length === 1 && this.finishedParking === false) ||
        turnOntoSection
    ) {
        nextPathDestination -= this.turningRunup * this.negation
    }

    return nextPathDestination
}

// If just going forward, is following destination 'less' than next destination
// If turning, is following destination 'less' than next destination + car length
Car.prototype.hasFollowingDestination = function () {
    if (this.route.length === 1) {
        return false
    } else {
        return true
    }
}
Car.prototype.mustManeuverTowardsFollowingDestination = function (
    followingDestination,
    nextSection
) {
    if (nextSection.turn) {
        switch (nextSection.direction) {
            case 'north':
                if (
                    followingDestination + this.turningRunup >
                    this.coords[this.oppSymbol] -
                        this.baseLength / 2 -
                        this.baseLength
                ) {
                    if (!this.route[2]) {
                        return true
                    }
                }
                break
            case 'south':
                if (
                    followingDestination - this.turningRunup <
                    this.coords[this.oppSymbol] +
                        this.baseLength / 2 +
                        this.baseLength
                ) {
                    if (!this.route[2]) {
                        return true
                    }
                }
                break
            case 'east':
                if (
                    followingDestination - this.turningRunup <
                    this.coords[this.oppSymbol] +
                        this.baseLength / 2 +
                        this.baseLength
                ) {
                    if (!this.route[2]) {
                        return true
                    }
                }
                break
            case 'west':
                if (
                    followingDestination + this.turningRunup >
                    this.coords[this.oppSymbol] -
                        this.baseLength / 2 -
                        this.baseLength
                ) {
                    if (!this.route[2]) {
                        return true
                    }
                }
                break
        }
    }

    return false
}
Car.prototype.adjustToFollowingDestination = function (
    followingDestination,
    nextSection
) {
    if (!nextSection.turn) {
        switch (this.direction) {
            case 'north':
                if (followingDestination > this.nextDestination) {
                    this.nextDestination = followingDestination
                }
                break
            case 'south':
                if (followingDestination < this.nextDestination) {
                    this.nextDestination = followingDestination
                }
                break
            case 'east':
                if (followingDestination < this.nextDestination) {
                    this.nextDestination = followingDestination
                }
                break
            case 'west':
                if (followingDestination > this.nextDestination) {
                    this.nextDestination = followingDestination
                }
                break
        }
    }
}
// UNUSED
Car.prototype.checkZTurnSection = function (section) {
    // Cars doing Z-Turns from the bottom horizontal to mid-left column
    // may need to wait for a car already in the section to pass to
    // the exit, otherwise a deadlock occurs as the z-turn car has
    // already blocked the intersection at this point.
    let cars = this.parkingLot.trafficHandler.returnActiveCarsInArea(
        this.collisionBoxes.maneuver,
        [this]
    )

    cars = this.parkingLot.trafficHandler.splitCarsByDirection(cars)

    if (cars.oncoming.length === 0) {
        return true
    } else {
        return false
    }
}

Car.prototype.getNextIntersection = function () {
    // Assuming this won't ever be called unless nextIntersection = null
    // so it remains null if there's no intersection ahead.
    let thisSection = this.route[0].section
    switch (this.direction) {
        case 'north':
            if (thisSection.topIntersection) {
                return this.parkingLot.intersections[
                    thisSection.topIntersection
                ]
            }
            break
        case 'east':
            if (thisSection.rightIntersection) {
                return this.parkingLot.intersections[
                    thisSection.rightIntersection
                ]
            }
            break
        case 'south':
            if (thisSection.bottomIntersection) {
                return this.parkingLot.intersections[
                    thisSection.bottomIntersection
                ]
            }
            break
        case 'west':
            if (thisSection.leftIntersection) {
                return this.parkingLot.intersections[
                    thisSection.bottomIntersection
                ]
            }
            break
    }

    return null
}

// Could check if there are any cars with the same intersection as
// nextIntersection and moving in the opposite direction to car's
// desired next direction for turns/parking maneuvers to ensure
// cars don't turn onto the same section opposing one another.
Car.prototype.checkAtIntersection = function () {
    // Should probably move to trafficHandler
    let intersection = this.nextIntersection
    let carArea = structuredClone(this.collisionBoxes.car)
    carArea[this.symbol] += this.minStoppingDistance * this.negation
    if (
        this.parkingLot.trafficHandler.checkCollision(
            carArea,
            intersection.areas.xArea
        ) ||
        this.parkingLot.trafficHandler.checkCollision(
            carArea,
            intersection.areas.yArea
        )
    ) {
        return intersection
    } else {
        return null
    }
}
Car.prototype.isIntersectionBlocked = function (intersection) {
    {
        if (this.userFocus) {
            this.parkingLot.overlay.showIntersectionCheck(intersection)
        }

        if (!this.blockingIntersections[intersection.name]) {
            if (intersection.occupied) {
                return true
            }
        }

        return false
    }
}

Car.prototype.determineIfExitRouteIsBlocked = function () {
    // Top 2 only need to check if the intersection + turn area
    // is clear to reserve.
    // Third will get a new route if any cars below
    // Middle spaces will just wait until there are 0 cars on the road below

    // Only cars on the left column, going against traffic,
    // need to make this check.
    if (this.currentSection.section.col === 0 && this.direction === 'south') {
        let roadArea = this.parkingLot.trafficHandler.getRoadAreaAhead(this)
        let cars = this.parkingLot.trafficHandler.returnActiveCarsInArea(
            roadArea,
            [this]
        )

        let makeAdjustment = false
        if (cars.length > 0) {
            for (let car of cars) {
                if (car.direction === 'north') {
                    makeAdjustment = true
                }
            }

            if (makeAdjustment) {
                if (this.currentSection.section.row === 0) {
                    // Manual adjustment for third parking space from top.
                    let secondSection =
                        this.parkingLot.pathObject.sections.horizontal.row0col1
                    let thirdSection =
                        this.parkingLot.pathObject.sections.vertical.row1col2
                    let secondRouteSection = {
                        direction: 'east',
                        turn: 'southtoeast',
                        coord: secondSection.x + secondSection.len,
                        section: secondSection,
                    }
                    let thirdRouteSection = {
                        direction: 'south',
                        turn: 'easttosouth',
                        coord: thirdSection.y + thirdSection.len,
                        section: thirdSection,
                    }
                    this.route.splice(
                        1,
                        2,
                        secondRouteSection,
                        thirdRouteSection
                    )
                    delete this.route[this.route.length - 1].turn
                    this.nextDestination = this.leadingEdge
                }
            }
        }
    }
}

Car.prototype.calcStoppingDistance = function () {
    return this.speed * 3
}
Car.prototype.calcAcceleration = function () {
    let acceleratedSpeed = this.speed + this.maxSpeed / 10
    if (acceleratedSpeed > this.maxSpeed) {
        acceleratedSpeed = this.maxSpeed
    }
    return acceleratedSpeed
}
Car.prototype.calcDeceleration = function (stoppingDistance) {
    let deceleratedSpeed = this.speed - this.maxSpeed / 3
    if (deceleratedSpeed < 0) {
        deceleratedSpeed = 0
    }

    return deceleratedSpeed
}
Car.prototype.adjustSpeedToDestination = function () {}

export {Car}
