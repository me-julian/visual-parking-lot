'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function RightAngleReverse(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

RightAngleReverse.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

RightAngleReverse.prototype.buildRuleString = function (car, name, endVals) {
    let zero, forty, hundred
    let declaration = '@keyframes '
    zero = this.buildZeroKeyframe(car)
    forty = this.buildFortyKeyframe(car, endVals)
    hundred = this.buildHundredKeyframe(endVals)

    return declaration + name + zero + forty + hundred
}

RightAngleReverse.prototype.buildZeroKeyframe = function (car) {
    let zero =
        '{0% {left: ' +
        car.coords.x +
        'px;top: ' +
        car.coords.y +
        'px;transform: rotate(' +
        car.orientation +
        'deg);}'
    return zero
}

RightAngleReverse.prototype.buildFortyKeyframe = function (car, endVals) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            // Not present
            break
        case 'east':
            if (car.direction === 'north') {
                leftVal =
                    car.coords.x + (car.assignedSpace.width - car.baseWidth) / 2
                topVal = car.coords.y + car.baseLength / 1.65
            } else if (car.direction === 'south') {
                leftVal =
                    car.coords.x + (car.assignedSpace.width - car.baseWidth) / 2
                topVal = car.coords.y - car.baseLength / 1.65
            }

            orientationVal = car.orientation + endVals.orientationMod / 6
            break
        case 'north':
            if (car.direction === 'east') {
                leftVal = car.coords.x - car.baseLength / 1.65
                topVal =
                    car.coords.y -
                    (car.assignedSpace.height - car.baseWidth) / 2
            } else if (car.direction === 'west') {
                leftVal = car.coords.x + car.baseLength / 1.65
                topVal =
                    car.coords.y -
                    (car.assignedSpace.height - car.baseWidth) / 2
            }

            orientationVal = car.orientation + endVals.orientationMod / 6
            break
        case 'south':
            if (car.direction === 'east') {
                leftVal = car.coords.x - car.baseLength / 1.65
                topVal =
                    car.coords.y +
                    (car.assignedSpace.height - car.baseWidth) / 2
            } else if (car.direction === 'west') {
                leftVal = car.coords.x + car.baseLength / 1.65
                topVal =
                    car.coords.y +
                    (car.assignedSpace.height - car.baseWidth) / 2
            }

            orientationVal = car.orientation + endVals.orientationMod / 6
            break
    }

    let forty =
        '40% {left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return forty
}
RightAngleReverse.prototype.buildHundredKeyframe = function (endVals) {
    let hundred =
        '100% {left: ' +
        endVals.x +
        'px;top: ' +
        endVals.y +
        'px;transform: rotate(' +
        endVals.orientation +
        'deg);}}'
    return hundred
}

RightAngleReverse.prototype.getEndVals = function (car) {
    let endVals = {}

    let relationalValues = this.getRelationalValues(car)
    endVals.orientationMod = relationalValues.orientationMod
    endVals.endOrientation = relationalValues.endOrientation
    endVals.direction = relationalValues.direction
    endVals.turnDirection = relationalValues.turnDirection

    endVals[car.symbol] = car.assignedSpace.section[car.symbol]
    endVals[car.oppSymbol] = car.assignedSpace[car.oppSymbol]

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
RightAngleReverse.prototype.getRelationalValues = function (car) {
    let endOrientation
    let endDirection = car.route[0].direction

    switch (endDirection) {
        case 'west':
            endOrientation = 180
            break
        case 'east':
            endOrientation = 0
            break
        case 'north':
            endOrientation = 270
            break
        case 'south':
            endOrientation = 90
            break
    }

    let turnDirection = this.animationHandler.getLeftOrRight(
        car.direction,
        endDirection
    )

    let orientationMod
    if (turnDirection === 'left') {
        orientationMod = 90
    } else {
        orientationMod = -90
    }

    return {
        orientationMod: orientationMod,
        endOrientation: endOrientation,
        direction: endDirection,
        turnDirection: turnDirection,
    }
}
RightAngleReverse.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            // Not present
            console.error('Car turning in unexpected/unhandled direction.')
            break
        case 'east':
            endVals.x -= car.baseLength
            endVals.x += car.assignedSpace.width / 3

            endVals.y -= (car.baseLength - car.baseWidth) / 2

            endVals.orientation = car.orientation + endVals.orientationMod
            break
        case 'north':
            endVals.x -= (car.baseLength - car.baseWidth) / 2

            endVals.y -=
                car.assignedSpace.height -
                (car.assignedSpace.height - car.baseWidth)
            endVals.y += car.baseLength
            endVals.y -= car.assignedSpace.height / 3

            endVals.orientation = car.orientation + endVals.orientationMod
            break
        case 'south':
            endVals.x -= (car.baseLength - car.baseWidth) / 2

            endVals.y -= car.baseLength
            endVals.y += car.assignedSpace.height / 3

            endVals.orientation = car.orientation + endVals.orientationMod
            break
    }

    return endVals
}

export {RightAngleReverse}
