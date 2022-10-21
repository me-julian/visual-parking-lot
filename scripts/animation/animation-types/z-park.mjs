'use strict'

import * as td from '../../type-defs.mjs'

/**
 * @class
 * @param {td.AnimationHandler} animationHandler
 * @param {String} animName
 */
function ZPark(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

/**
 * @method
 * @param {td.Car} car
 */
ZPark.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

ZPark.prototype.buildRuleString = function (car, name, endVals) {
    let first, second, third, fourth, last
    first = this.buildFirstKeyframe(car)
    second = this.buildSecondKeyframe(car, endVals, 30)
    third = this.buildThirdKeyframe(car, endVals, 45)
    fourth = this.buildFourthKeyframe(car, endVals, 80)
    last = this.buildLastKeyframe(endVals)

    return '@keyframes ' + name + first + second + third + fourth + last
}

ZPark.prototype.buildFirstKeyframe = function (car) {
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
ZPark.prototype.buildSecondKeyframe = function (car, endVals, keyframe) {
    let leftVal, topVal, orientationVal, orientationChange
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            leftVal =
                endVals.spaceEntrance -
                car.baseLength -
                (car.baseWidth / 2) * car.negation

            topVal =
                car.coords.y +
                (endVals.crossDistance / 4) * endVals.crossNegation
            break
        case 'north':
            leftVal =
                car.coords.x +
                (endVals.crossDistance / 4) * endVals.crossNegation

            topVal = endVals.spaceEntrance - (car.baseWidth / 2) * car.negation
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    if (endVals.crossDistance > car.baseWidth) {
        // Stop cars from over-rotating
        orientationChange = 30
    } else {
        orientationChange = endVals.crossDistance / 4
    }
    orientationVal = car.orientation + orientationChange * endVals.crossNegation

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
ZPark.prototype.buildThirdKeyframe = function (car, endVals, keyframe) {
    let leftVal, topVal, orientationVal, orientationChange
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            leftVal = endVals.spaceEntrance - car.baseLength

            topVal =
                car.coords.y +
                endVals.crossDistance * 0.6 * endVals.crossNegation
            break
        case 'north':
            leftVal =
                car.coords.x +
                endVals.crossDistance * 0.6 * endVals.crossNegation

            topVal = endVals.spaceEntrance
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    orientationChange = endVals.crossDistance / 2
    if (endVals.crossDistance > car.baseWidth) {
        // Stop cars from over-rotating
        orientationChange = 50
    }
    orientationVal = car.orientation + orientationChange * endVals.crossNegation

    let third =
        keyframe +
        '% {left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return third
}
ZPark.prototype.buildFourthKeyframe = function (car, endVals, keyframe) {
    let leftVal, topVal, orientationVal, orientationChange
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            leftVal =
                endVals.spaceEntrance -
                car.baseLength +
                (car.baseWidth / 2) * car.negation

            topVal = endVals.y
            break
        case 'north':
            leftVal = endVals.x

            topVal = endVals.spaceEntrance + (car.baseWidth / 2) * car.negation
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    orientationChange = endVals.crossDistance / 6
    if (endVals.crossDistance > car.baseWidth) {
        // Stop cars from over-rotating
        orientationChange = 15
    }
    orientationVal = car.orientation + orientationChange * endVals.crossNegation

    let fourth =
        keyframe +
        '% {left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return fourth
}
ZPark.prototype.buildLastKeyframe = function (endVals) {
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

ZPark.prototype.getEndVals = function (car) {
    let endVals = {}

    let relationalValues = this.getRelationalValues(car)
    endVals.orientation = relationalValues.orientation
    endVals.direction = relationalValues.direction
    endVals.crossNegation = relationalValues.crossNegation
    endVals.crossDistance = relationalValues.crossDistance
    endVals.forwardDistance = relationalValues.forwardDistance
    endVals.spaceEntrance = relationalValues.spaceEntrance

    endVals.y = car.assignedSpace.y
    endVals.x = car.assignedSpace.x

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
ZPark.prototype.getRelationalValues = function (car) {
    let orientation = car.orientation
    let endDirection = car.assignedSpace.facing

    // Only handling cases present in current parking lot.

    let crossNegation, closestEdge
    // Check against true mid point of the car (license plate)
    if (
        car.route[1].coord >
        car.coords[car.oppSymbol] +
            (car.baseLength - car.baseWidth) / 2 +
            car.baseWidth / 2
    ) {
        crossNegation = 1
        // Opposite side of wrapper
        closestEdge =
            car.coords[car.oppSymbol] +
            car.baseLength -
            (car.baseLength - car.baseWidth) / 2
    } else {
        crossNegation = -1
        // Normal side of wrapper
        closestEdge =
            car.coords[car.oppSymbol] + (car.baseLength - car.baseWidth) / 2
    }
    let crossDistance = Math.abs(car.route[1].coord - closestEdge)

    let spaceEntrance = car.assignedSpace[car.symbol]
    if (car.assignedSpace.facing === 'north') {
        spaceEntrance += car.assignedSpace.height
    } else if (car.assignedSpace.facing === 'west') {
        spaceEntrance += car.assignedSpace.width
    }

    let forwardDistance = Math.abs(car.leadingEdge - spaceEntrance)

    return {
        orientation: orientation,
        direction: endDirection,
        crossNegation: crossNegation,
        crossDistance: crossDistance,
        forwardDistance: forwardDistance,
        spaceEntrance: spaceEntrance,
    }
}
ZPark.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            endVals.x = endVals.x + (car.assignedSpace.width - car.baseLength)

            endVals.y -=
                car.baseWidth / 2 -
                (car.assignedSpace.height - car.baseWidth) / 2

            endVals.orientation = car.orientation

            endVals.x -= 10
            break
        case 'north':
            endVals.x -=
                car.baseWidth / 2 -
                (car.assignedSpace.width - car.baseWidth) / 2

            endVals.y = endVals.y

            endVals.orientation = car.orientation

            endVals.y += 10
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    return endVals
}

export {ZPark}
