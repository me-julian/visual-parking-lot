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
 * @property {Object} nextRoutePartition - Unused.
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

    this.baseWidth = undefined
    this.baseLength = undefined
    this.collisionBox = {
        width: undefined,
        height: undefined,
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
    carFullPageWrapper.id = this.id
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

Car.prototype.getDirectionVars = function () {
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
    this.collisionBox = {
        width: 90,
        height: 182,
    }
    this.direction = 'north'
    this.getDirectionVars()

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
    this.route = this.parkingLot.requestRoute(this)
    // Should restructure this.
    this.currentSection = this.route[0]
    //
    this.parkingDuration = 15000

    this.speed = 5
    this.maxSpeed = 15
    this.minStoppingDistance = 0
    this.turningRunup = 30

    this.nextDestination = this.getNextDestination(this.route[0], this.route[1])
}

Car.prototype.determineAction = function () {
    switch (this.status) {
        case 'entering':
            // case 'leaving':
            this.followRoute()
            break
        case 'turning':
        case 'parking':
        case 'leavingSpace':
            break
        case 'parked':
            this.wait()
            break
    }
}

Car.prototype.followRoute = function () {
    this.getDirectionVars()

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
    let carsInMinStoppingDistance = this.checkAhead(stoppingDistanceArea)

    let destinationArea =
        this.parkingLot.trafficHandler.getAreaBetweenDestination(this)
    let carsBetweenNextDestination = this.checkAhead(destinationArea)

    // let roadArea = this.parkingLot.trafficHandler.getAreaAlongColOrRow(this)
    // let carsAheadOnRoad = this.checkAhead(roadArea)

    let clearAhead = true
    if (carsInMinStoppingDistance.collision) {
        clearAhead = false
    }
    if (carsBetweenNextDestination.collision) {
        clearAhead = false
    }
    // if (carsAheadOnRoad.presence) {
    //     clearAhead = false
    // }

    if (
        distanceToNextDestination <
        this.turningRunup + this.minStoppingDistance
    ) {
        this.checkFollowingDestination()
    }

    if (distanceToNextDestination <= this.minStoppingDistance) {
        if (this.checkIntersection()) {
            clearAhead = false
        }
        if (this.route.length === 1) {
            if (this.status === 'leaving') {
                this.exitScene(distanceToNextDestination)
                return
            } else if (
                this.status === 'entering' &&
                !carsBetweenNextDestination.presence
            ) {
                this.park(distanceToNextDestination)
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
    if (this.status === 'parked') {
        if (this.hasParked) {
            // Check if clear
            // this.reverseOutOfSpace()
            // this.parkingLot.cars.leaving[this.id] = this
            // delete this.parkingLot.cars.parked[this.id]
        }
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
    if (this.status !== 'turning') {
        this.status = 'turning'

        let animation = this.parkingLot.animationHandler.getAnimation(
            this,
            'normalTurn'
        )
        this.pageEl.style.animationDuration = '3s'
        this.pageEl.style.animationIterationCount = '1'
        this.pageEl.style.animationTimingFunction = 'initial'

        this.pageEl.style.animationName = animation.ruleObject.name

        // Could/should this be set indefinitely? Generic event funct
        // that checks status for endTurn/setParked?
        let endAnimEventFunct = () => {
            this.endTurn(animation.endVals)
            this.pageEl.removeEventListener('animationend', endAnimEventFunct)
        }
        this.pageEl.addEventListener('animationend', endAnimEventFunct)
    }
}
Car.prototype.park = function () {
    if (this.status !== 'parking') {
        this.status = 'parking'

        let animation = this.parkingLot.animationHandler.getAnimation(
            this,
            'normalPark'
        )

        this.pageEl.style.animationDuration = '4s'
        this.pageEl.style.animationIterationCount = '1'
        this.pageEl.style.animationTimingFunction =
            'cubic-bezier(0.31, 0.26, 0.87, 0.76)'

        this.pageEl.style.animationName = animation.ruleObject.name

        this.pageEl.addEventListener('animationend', () => {
            this.setParked(animation.endVals)
        })

        let endAnimEventFunct = () => {
            this.setParked(animation.endVals)
            this.pageEl.removeEventListener('animationend', endAnimEventFunct)
        }
        this.pageEl.addEventListener('animationend', endAnimEventFunct)
    }
}
Car.prototype.parkFromTurn = function () {
    if (this.status !== 'parking') {
        this.status = 'parking'
    }

    let animationType =
        this.parkingLot.animationHandler.determineSpecialAnimationType(this)

    let animation = this.parkingLot.animationHandler.getAnimation(
        this,
        animationType
    )
    this.pageEl.style.animationDuration = '5s'
    this.pageEl.style.animationIterationCount = '1'
    this.pageEl.style.animationTimingFunction = 'initial'

    this.pageEl.style.animationName = animation.ruleObject.name

    let endAnimEventFunct = () => {
        this.setParked(animation.endVals)
        this.pageEl.removeEventListener('animationend', endAnimEventFunct)
    }
    this.pageEl.addEventListener('animationend', endAnimEventFunct)
}
Car.prototype.endTurn = function (endVals) {
    if (this.hasParked) {
        this.status = 'leaving'
    } else {
        this.status = 'entering'
    }

    this.setToNextSection()
    this.updateCollisionBox()
    this.updatePositionalValues(endVals)

    this.pageEl.style.animationName = 'none'
}
Car.prototype.setParked = function (endVals) {
    this.updatePositionalValues(endVals)

    this.parkingLot.overlay.updateSpaceColor(
        document.getElementById(this.assignedSpace.rank),
        this
    )
    this.parkingLot.overlay.clearCollisionBoxes(this.pageWrapper)

    this.pageEl.style.animationName = 'none'

    this.parkingLot.cars.parked[this.id] = this
    delete this.parkingLot.cars.entering[this.id]
    this.status = 'parked'

    // setTimeout(() => {
    //     // Requesting route from parking space doesn't work.
    //     // Need to initialize direction (can be different in unususal
    //     // spaces), probably fix other things.
    //     this.parkingLot.requestRoute(this)

    //     console.log(this.id + ' is ready to leave their space.')
    //     this.hasParked = true
    // }, this.parkingDuration)
}

Car.prototype.reverseOutOfSpace = function () {}
Car.prototype.exitScene = function () {}

Car.prototype.setToNextSection = function () {
    this.route.splice(0, 1)
    this.nextDestination = null
    this.currentSection = this.route[0]
    this.direction = this.currentSection.direction
}
Car.prototype.updatePositionalValues = function (newVals) {
    this.coords.x = newVals.x
    this.coords.y = newVals.y
    this.orientation = newVals.orientation

    this.pageEl.style.left = this.coords.x + 'px'
    this.pageEl.style.top = this.coords.y + 'px'
    this.pageEl.style.transform = 'rotate(' + this.orientation + 'deg)'
}

Car.prototype.updateCollisionBox = function () {
    //   Need to handle intersections
    switch (this.status) {
        case 'turning':
            break
        case 'parking':
            break
        case 'leavingSpace':
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
            this.collisionBox.height = this.baseLength
            this.collisionBox.width = this.baseWidth
            break
        case 'west':
        case 'east':
            this.collisionBox.height = this.baseWidth
            this.collisionBox.width = this.baseLength
            break
    }
}

Car.prototype.checkAhead = function (areaAhead) {
    let presence = false,
        collision = false,
        distance = 5000

    let carsAhead = this.parkingLot.trafficHandler.returnCarsInArea(areaAhead, [
        this,
    ])

    if (carsAhead.length != 0) {
        presence = true
    }

    // break to separate function
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
        let immediateCollision = this.willCollideAtCurrentSpeed(car)
        if (immediateCollision.collision) {
            collision = true
            if (immediateCollision.distance < distance) {
                distance = immediateCollision.distance
            }
        }
        // let blockingDestination = this.isBlockingDestination(car)
        // if (blockingDestination.collision) {
        //     presence = true
        //     if (blockingDestination.distance < distance) {
        //         distance = blockingDestination.distance
        //     }
        // }
    }
    // break to separate function

    return {presence: presence, collision: collision, distance: distance}
}

Car.prototype.willCollideAtCurrentSpeed = function (car) {
    let opposingEdge
    if (this.negation === -1) {
        opposingEdge = car.coords[this.symbol] + car.baseLength
    } else {
        opposingEdge = car.coords[this.symbol]
    }
    let distance = this.parkingLot.trafficHandler.returnDistanceBetween(
        this.leadingEdge,
        opposingEdge
    )

    let collision = false
    if (this.negation === '1') {
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
// Car.prototype.isBlockingDestination(car) {
//     let opposingEdge
//     if (this.negation === -1) {
//         opposingEdge = car.coords[this.symbol] + car.baseLength
//     } else {
//         opposingEdge = car.coords[this.symbol]
//     }

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
    if (this.route.length === 1 && this.hasParked === false) {
        nextPathDestination =
            currentSection.coord - this.turningRunup * this.negation
    } else if (nextSection.turn) {
        nextPathDestination =
            currentSection.coord - this.turningRunup * this.negation
    } else {
        nextPathDestination = currentSection.coord
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
                    console.log('exceptional turn')
                }
                break
            case 'south':
                if (
                    followingDestination - this.turningRunup <
                    this.coords[this.oppSymbol] +
                        this.baseLength / 2 +
                        this.baseLength
                ) {
                    console.log('exceptional turn')
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
                        this.parkFromTurn()
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
                    console.log('exceptional turn')
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
Car.prototype.checkIntersection = function () {
    // Good point to add an overlay element.
    let intersectionPoint = this.route[0].coord
    let intersectionArea
    if (this.direction === 'north' || this.direction === 'south') {
        intersectionArea = {
            x: this.coords.x - 182 / 2,
            y: intersectionPoint + 90 / 2,
            w: 90,
            h: 90 + 182 * 2,
        }
    } else {
        intersectionArea = {
            x: intersectionPoint + 90 / 2,
            y: this.coords.y - 182 / 2,
            w: 90 + 182 * 2,
            h: 90,
        }
    }
    let carsNearIntersection = this.parkingLot.trafficHandler.returnCarsInArea(
        intersectionArea,
        [this]
    )

    return this.parkingLot.trafficHandler.checkIfCarsTurning(
        carsNearIntersection
    )
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
