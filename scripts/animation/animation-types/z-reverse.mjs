'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function ZReverse(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

ZReverse.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

ZReverse.prototype.buildRuleString = function (car, name, endVals) {
    let first, second, third, fourth, last
    first = this.buildFirstKeyframe(car)
    second = this.buildSecondKeyframe(car, endVals, 25)
    third = this.buildThirdKeyframe(car, endVals, 50)
    fourth = this.buildFourthKeyframe(car, endVals, 85)
    last = this.buildLastKeyframe(endVals)

    return '@keyframes ' + name + first + second + third + fourth + last
}

ZReverse.prototype.buildFirstKeyframe = function (car) {
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
ZReverse.prototype.buildSecondKeyframe = function (car, endVals, keyframe) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'east':
            leftVal = car.coords.x - car.baseLength / 1.65

            topVal =
                car.coords.y - (car.assignedSpace.height - car.baseWidth) / 2

            orientationVal = car.orientation + endVals.orientationMod / 6
            break
        case 'north':
        case 'south':
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
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
ZReverse.prototype.buildThirdKeyframe = function (car, endVals, keyframe) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'east':
            leftVal = car.coords.x - endVals.backwardDistance

            topVal = car.coords.y + car.crossDistance

            orientationVal = car.orientation + endVals.orientationMod * 0.85

            break
        case 'north':
        case 'south':
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    let third =
        keyframe +
        '% {' +
        'left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return third
}
ZReverse.prototype.buildFourthKeyframe = function (car, endVals, keyframe) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'east':
            leftVal = car.coords.x - endVals.backwardDistance * 1.5

            topVal = endVals.y

            orientationVal = car.orientation + endVals.orientationMod * 0.3
            break
        case 'north':
        case 'south':
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    let fourth =
        keyframe +
        '% {' +
        'left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return fourth
}
ZReverse.prototype.buildLastKeyframe = function (endVals) {
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

ZReverse.prototype.getEndVals = function (car) {
    let endVals = {}

    let relationalValues = this.getRelationalValues(car)
    endVals.orientationMod = relationalValues.orientationMod
    endVals.endOrientation = relationalValues.endOrientation
    endVals.direction = relationalValues.direction
    endVals.crossNegation = relationalValues.crossNegation
    endVals.crossDistance = relationalValues.crossDistance
    endVals.backwardDistance = relationalValues.backwardDistance

    endVals[car.symbol] = car.route[0].coord
    endVals[car.oppSymbol] = car.route[0].section[car.oppSymbol]

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
ZReverse.prototype.getRelationalValues = function (car) {
    let endDirection = car.route[0].direction

    // Only handling case present in current parking lot.

    // endOrientation vs orientation needs to be cleared up.
    let endOrientation = 0
    let orientationMod = -90

    let crossNegation = 1

    let closestEdge =
        car.coords[car.oppSymbol] +
        car.baseLength -
        (car.baseLength - car.baseWidth) / 2

    let crossDistance = Math.abs(car.route[0].section.y - closestEdge)

    let backwardDistance = Math.abs(
        car.coords[car.symbol] - (car.route[0].coord - car.turningRunup)
    )

    return {
        orientationMod: orientationMod,
        endOrientation: endOrientation,
        direction: endDirection,
        crossNegation: crossNegation,
        crossDistance: crossDistance,
        backwardDistance: backwardDistance,
    }
}
ZReverse.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            // Not present
            console.error('Car turning in unexpected/unhandled direction.')
            break
        case 'east':
            endVals.x -= car.baseLength
            endVals.x -= car.turningRunup

            endVals.y -= (car.baseLength - car.baseWidth) / 2

            // endOrientation vs orientation needs to be cleared up.
            endVals.orientation = car.orientation
            break
        case 'north':
            // Not present
            console.error('Car turning in unexpected/unhandled direction.')
            break
        case 'south':
            // Not present
            console.error('Car turning in unexpected/unhandled direction.')
            break
    }

    return endVals
}

export {ZReverse}
