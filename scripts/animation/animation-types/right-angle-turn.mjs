'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function RightAngleTurn(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

RightAngleTurn.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

RightAngleTurn.prototype.buildRuleString = function (car, name, endVals) {
    let first, second, last
    let declaration = '@keyframes '
    first = this.buildFirstKeyframe(car)
    second = this.buildSecondKeyframe(car, endVals, 30)
    last = this.buildLastKeyframe(endVals)

    return declaration + name + first + second + last
}

RightAngleTurn.prototype.buildFirstKeyframe = function (car) {
    let first =
        '{0% {left: ' +
        car.coords.x +
        'px;top: ' +
        car.coords.y +
        'px;transform: rotate(' +
        car.orientation +
        'deg);}'
    return first
}
RightAngleTurn.prototype.buildSecondKeyframe = function (
    car,
    endVals,
    keyframe
) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            leftVal = car.coords.x

            topVal = car.coords.y + (car.baseLength / 5) * car.negation

            orientationVal = car.orientation
            break
        case 'east':
            leftVal = car.coords.x

            topVal = car.coords.y + (car.baseLength / 5) * car.negation
            // Car makes its turn based on where the section ends,
            // but sections are based on left/top vals rather than
            // physical center of intersection. Make adjustment
            // if necessary.
            if (car.direction === 'south') {
                topVal += car.turningRunup * car.negation
            }

            orientationVal = car.orientation
            break
        case 'north':
            leftVal = car.coords.x + (car.baseLength / 5) * car.negation

            topVal = car.coords.y

            orientationVal = car.orientation
            break
        case 'south':
            leftVal = car.coords.x + (car.baseLength / 5) * car.negation
            if (car.direction === 'east') {
                leftVal += car.turningRunup * car.negation
            }

            topVal = car.coords.y

            orientationVal = car.orientation
            break
    }

    let second =
        keyframe +
        '% {left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return second
}
RightAngleTurn.prototype.buildLastKeyframe = function (endVals) {
    let last =
        '100% {left: ' +
        endVals.x +
        'px;top: ' +
        endVals.y +
        'px;transform: rotate(' +
        endVals.orientation +
        'deg);}}'
    return last
}

RightAngleTurn.prototype.getEndVals = function (car) {
    let endVals = {}

    let relationalValues = this.getRelationalValues(car)
    endVals.orientationMod = relationalValues.orientationMod
    endVals.endOrientation = relationalValues.endOrientation
    endVals.direction = relationalValues.direction
    endVals.turnDirection = relationalValues.turnDirection

    endVals[car.oppSymbol] = car.route[1].section[car.oppSymbol]
    endVals[car.symbol] = car.route[1].section[car.symbol]
    if (endVals.direction === 'north' || endVals.direction === 'west') {
        endVals[car.oppSymbol] += car.route[1].section.len
    }

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
RightAngleTurn.prototype.getRelationalValues = function (car) {
    let endOrientation
    let endDirection = car.route[1].direction

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
        endDirection,
        false
    )

    let orientationMod
    if (turnDirection === 'left') {
        orientationMod = -90
    } else {
        orientationMod = 90
    }

    return {
        orientationMod: orientationMod,
        endOrientation: endOrientation,
        direction: endDirection,
        turnDirection: turnDirection,
    }
}
RightAngleTurn.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            endVals.x = endVals.x - car.baseLength / 2

            endVals.y = endVals.y - car.baseWidth / 2

            endVals.orientation = car.orientation + endVals.orientationMod
            break
        case 'east':
            endVals.x = endVals.x + car.baseLength / 2

            endVals.y = endVals.y - car.baseWidth / 2

            endVals.orientation = car.orientation - endVals.orientationMod
            break
        case 'north':
            endVals.x = endVals.x - car.baseWidth / 2

            endVals.y = endVals.y - car.baseLength

            endVals.orientation = car.orientation + endVals.orientationMod
            break
        case 'south':
            endVals.x = endVals.x - car.baseWidth / 2

            endVals.y = endVals.y + car.baseWidth

            endVals.orientation = car.orientation - endVals.orientationMod
            break
    }

    return endVals
}

export {RightAngleTurn}
