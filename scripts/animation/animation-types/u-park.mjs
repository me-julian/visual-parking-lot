'use strict'

import * as td from '../../type-defs.mjs'

/**
 * @class
 * @param {td.AnimationHandler} animationHandler
 * @param {String} animName
 */
function UPark(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

/**
 * @method
 * @param {td.Car} car
 */
UPark.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

UPark.prototype.buildRuleString = function (car, name, endVals) {
    let zero,
        twenty = '',
        sixty = '',
        hundred
    let declaration = '@keyframes '
    zero = this.buildZeroKeyframe(car)
    twenty = this.buildTwentyKeyframe(car, endVals)
    sixty = this.buildSixtyKeyframe(car, endVals)
    hundred = this.buildHundredKeyframe(endVals)

    return declaration + name + zero + twenty + sixty + hundred
}

UPark.prototype.buildZeroKeyframe = function (car) {
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
UPark.prototype.buildTwentyKeyframe = function (car, endVals) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'north':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'south':
            leftVal = car.coords.x - car.baseWidth / 2

            topVal = endVals.y - car.baseLength / 2

            orientationVal = car.orientation - endVals.orientationMod / 8
            break
    }

    let twenty =
        '20% {left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return twenty
}
UPark.prototype.buildSixtyKeyframe = function (car, endVals) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'north':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'south':
            leftVal = car.coords.x + endVals.crossDistance / 1.75

            topVal = endVals.y - car.baseLength * 1.1

            orientationVal = car.orientation + endVals.orientationMod / 1.65
            break
    }

    let sixty =
        '60% {' +
        'left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return sixty
}
UPark.prototype.buildHundredKeyframe = function (endVals) {
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

UPark.prototype.getEndVals = function (car) {
    let endVals = {}

    let metaValues = this.turnMetaValues(car)
    endVals.orientationMod = metaValues.orientationMod
    endVals.orientation = metaValues.orientation
    endVals.direction = metaValues.direction
    endVals.crossNegation = metaValues.crossNegation
    endVals.crossDistance = metaValues.crossDistance

    endVals.y = car.assignedSpace.y
    endVals.x = car.assignedSpace.x

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
UPark.prototype.turnMetaValues = function (car) {
    let orientation
    let endDirection = car.assignedSpace.facing

    // Only handling cases present in current parking lot.

    switch (endDirection) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'north':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'south':
            orientation = 90
            break
    }

    let orientationMod
    switch (car.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'north':
            orientationMod = 180
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    let crossNegation, closestEdge
    if (car.route[1].coord > car.coords[car.oppSymbol]) {
        crossNegation = 1
        closestEdge = car.coords[car.oppSymbol] + car.baseWidth
    } else {
        crossNegation = -1
        closestEdge = car.coords[car.oppSymbol]
    }

    let crossDistance = Math.abs(car.route[1].coord - closestEdge)

    return {
        orientationMod: orientationMod,
        orientation: orientation,
        direction: endDirection,
        crossNegation: crossNegation,
        crossDistance: crossDistance,
    }
}
UPark.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'north':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'south':
            endVals.x -=
                car.baseWidth / 2 -
                (car.assignedSpace.width - car.baseWidth) / 2

            endVals.y = endVals.y + (car.assignedSpace.height - car.baseLength)

            endVals.orientation = car.orientation + endVals.orientationMod

            endVals.y -= 10
            break
    }

    return endVals
}

export {UPark}
