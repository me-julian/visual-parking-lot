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

    this.hasParked = undefined
    this.status = undefined
    this.coords = {x: undefined, y: undefined}
    this.currentSection = undefined
    this.assignedSpace = undefined
    this.route = undefined
    this.nextIntersection = undefined
    this.atIntersection = undefined

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
    this.hasParked = false
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
    this.setPositionalVars()
    this.updateCollisionBox()

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

    let distanceToNextDestination =
        this.parkingLot.trafficHandler.returnDistanceBetween(
            this.leadingEdge,
            this.nextDestination
        )

    let stoppingDistanceArea =
        this.parkingLot.trafficHandler.getAreaInStoppingDistance(this)
    let carsInMinStoppingDistance =
        this.checkStoppingDistanceArea(stoppingDistanceArea)

    // Do we use this to check for ability to turn/make other maneuvers
    // or do we do that in the turn/park etc. function itself?
    // let destinationArea =
    //     this.parkingLot.trafficHandler.getAreaBetweenDestination(this)
    // let carsBetweenNextDestination = this.checkDestinationArea(destinationArea)

    // let roadArea = this.parkingLot.trafficHandler.getAreaAlongColOrRow(this)
    // let carsAheadOnRoad = this.checkRoadAheadArea(roadArea)

    let carsBetweenNextDestination = false
    let clearAhead = true
    if (carsInMinStoppingDistance.collision) {
        clearAhead = false
        carsBetweenNextDestination = true
    }
    // if (carsBetweenNextDestination.collision) {
    //     clearAhead = false
    // }
    // if (carsAheadOnRoad.presence) {
    //     clearAhead = false
    // }

    if (
        distanceToNextDestination <
        this.turningRunup + this.minStoppingDistance
    ) {
        this.checkFollowingDestination()
    }

    if (this.nextIntersection) {
        this.checkIntersection()
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

    this.coords[this.symbol] =
        this.coords[this.symbol] + this.speed * this.negation
    this.pageEl.style[this.axis] = this.coords[this.symbol] + 'px'
}

Car.prototype.turn = function () {
    if (!this.animation) {
        this.animation = this.parkingLot.animationHandler.getAnimation(
            this,
            'right-angle-turn'
        )
    }

    // ISSUE: maneuver areas with intersections unnecessary?
    // If we do keep it, add the intersections in
    // TrafficHandler.getManeuverArea() and need to account for it
    // in Overlay.showTurnCheck()
    this.collisionBoxes.maneuver =
        this.parkingLot.trafficHandler.getManeuverArea(this, this.animation)
    if (
        this.status !== 'turning' &&
        this.parkingLot.trafficHandler.maneuverAreaClear(
            this,
            this.collisionBoxes.maneuver
        )
    ) {
        this.status = 'turning'

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

    this.collisionBoxes.maneuver =
        this.parkingLot.trafficHandler.getManeuverArea(this)

    let blockIntersection = false
    let overlappingIntersections =
        this.parkingLot.trafficHandler.getOverlappingIntersections(
            this.collisionBoxes.maneuver
        )
    if (overlappingIntersections.length > 0) {
        let intersectionAreas = []
        for (let intersection of overlappingIntersections) {
            intersectionAreas.push(intersection.areas.xArea)
            intersectionAreas.push(intersection.areas.yArea)
        }
        this.collisionBoxes.maneuver =
            this.collisionBoxes.maneuver.concat(intersectionAreas)
        blockIntersection = true
    }

    if (
        this.status !== 'parking' &&
        this.parkingLot.trafficHandler.maneuverAreaClear(
            this,
            this.collisionBoxes.maneuver
        )
    ) {
        this.status = 'parking'

        if (blockIntersection) {
            for (let intersection of overlappingIntersections) {
                if (!intersection.occupied) {
                    this.parkingLot.trafficHandler.blockIntersection(
                        this,
                        intersection
                    )
                }
            }
        }

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
    }
}
Car.prototype.attemptToLeaveSpace = function () {
    if (this.hasParked) {
        if (!this.animation) {
            // Create/retrieve an animation.
            this.animation = this.parkingLot.animationHandler.getAnimation(
                this,
                'right-angle-reverse'
            )
        }

        if (!this.collisionBoxes.maneuver) {
            this.collisionBoxes.maneuver =
                this.parkingLot.trafficHandler.getManeuverArea(this)
        }

        let blockIntersection = false
        let overlappingIntersections =
            this.parkingLot.trafficHandler.getOverlappingIntersections(
                this.collisionBoxes.maneuver
            )
        if (overlappingIntersections.length > 0) {
            let intersectionAreas = []
            for (let intersection of overlappingIntersections) {
                intersectionAreas.push(intersection.areas.xArea)
                intersectionAreas.push(intersection.areas.yArea)
            }
            this.collisionBoxes.maneuver =
                this.collisionBoxes.maneuver.concat(intersectionAreas)
            blockIntersection = true
        }

        if (
            this.parkingLot.trafficHandler.maneuverAreaClear(
                this,
                this.collisionBoxes.maneuver
            )
        ) {
            if (blockIntersection) {
                for (let intersection of overlappingIntersections) {
                    if (!intersection.occupied) {
                        this.parkingLot.trafficHandler.blockIntersection(
                            this,
                            intersection
                        )
                    }
                }
            }
            this.leaveSpace()
        } else {
            this.wait()
        }
    }
}
Car.prototype.leaveSpace = function () {
    if (this.status === 'parked') {
        this.status = 'leavingSpace'

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
}

Car.prototype.endTurn = function (endVals) {
    if (this.hasParked) {
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
        this.hasParked = true
    }, this.parkingDuration)
}
Car.prototype.endLeavingSpace = function (endVals) {
    this.pageEl.style.animationName = 'none'
    this.animation = undefined

    this.parkingLot.cars.leaving[this.id] = this
    delete this.parkingLot.cars.parked[this.id]
    this.status = 'leaving'

    this.setToNextSection(true)
    this.adjustPositionalVarsAfterAnim(endVals)
    this.setPositionalVars()
    this.updateCollisionBox()
    this.adjustCollisionBoxesFromAnim()
    this.updateElementPosition()
    this.parkingLot.overlay.updateSpaceColor(this.assignedSpace.pageEl, this)
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
    this.nextIntersection = this.getNextIntersection()
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
    this.collisionBoxes.car[this.oppSymbol] += 90 / 2
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

    for (let car of carsAhead) {
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
    }

    return {presence: presence, collision: collision, distance: distance}
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
        (this.route.length === 1 && this.hasParked === false) ||
        turnOntoSection
    ) {
        nextPathDestination -= this.turningRunup * this.negation
    }

    return nextPathDestination
}

// If just going forward, is following destination 'less' than next destination
// If turning, is following destination 'less' than next destination + car length
Car.prototype.checkFollowingDestination = function () {
    let followingDestination
    if (this.route.length === 1) {
        return
    }

    followingDestination = this.route[1].coord
    let nextSection = this.route[1]

    // Turning case
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
                        this.park(true)
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
                        this.park(true)
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
                        this.park(true)
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
                        this.park(true)
                    }
                }
                break
        }
    }
    // Straight (parking/section) case
    else {
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
        case 'south:':
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
Car.prototype.checkIntersection = function () {
    let intersection = this.nextIntersection
    let carArea = this.collisionBoxes.car
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
        if (this.userFocus) {
            this.parkingLot.overlay.showIntersectionCheck(this)
        }

        if (intersection.occupied) {
            this.wait()
        } else {
            this.atIntersection = this.nextIntersection
            this.nextIntersection = null
            this.parkingLot.trafficHandler.blockIntersection(this, intersection)
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
