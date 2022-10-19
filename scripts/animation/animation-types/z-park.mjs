'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function ZPark(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

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
    second = this.buildSecondKeyframe(car, endVals, 25)
    third = this.buildThirdKeyframe(car, endVals, 40)
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
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            leftVal =
                car.coords.x + (endVals.forwardDistance / 1.5) * car.negation

            topVal =
                car.coords.y +
                (endVals.crossDistance / 4) * endVals.crossNegation

            orientationVal =
                car.orientation +
                5 +
                (endVals.crossDistance / 10) * endVals.crossNegation
            break
        case 'north':
            leftVal =
                car.coords.x +
                (endVals.crossDistance / 4) * endVals.crossNegation

            topVal =
                car.coords.y + (endVals.forwardDistance / 1.5) * car.negation

            orientationVal =
                car.orientation +
                5 +
                (endVals.crossDistance / 10) * endVals.crossNegation
            break
        case 'south':
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
ZPark.prototype.buildThirdKeyframe = function (car, endVals, keyframe) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            leftVal =
                car.coords.x + (endVals.forwardDistance / 1.15) * car.negation

            topVal =
                car.coords.y +
                endVals.crossDistance * 0.6 * endVals.crossNegation

            orientationVal =
                car.orientation +
                (endVals.crossDistance / car.baseWidth) *
                    8 *
                    endVals.crossNegation
            break
        case 'north':
            leftVal =
                car.coords.x +
                endVals.crossDistance * 0.6 * endVals.crossNegation

            topVal =
                car.coords.y + (endVals.forwardDistance / 1.15) * car.negation

            orientationVal =
                car.orientation +
                8 +
                (endVals.crossDistance / car.baseWidth) *
                    (endVals.crossDistance / car.baseWidth) *
                    endVals.crossNegation
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

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
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            leftVal = car.coords.x + endVals.forwardDistance * car.negation

            topVal = endVals.y

            orientationVal =
                car.orientation +
                (endVals.crossDistance / car.baseWidth) *
                    3 *
                    endVals.crossNegation
            break
        case 'north':
            leftVal = endVals.x

            topVal = car.coords.y + endVals.forwardDistance * car.negation

            orientationVal =
                car.orientation +
                (endVals.crossDistance / car.baseWidth) *
                    3 *
                    endVals.crossNegation
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

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
    endVals.endOrientation = relationalValues.endOrientation
    endVals.direction = relationalValues.direction
    endVals.crossNegation = relationalValues.crossNegation
    endVals.crossDistance = relationalValues.crossDistance
    endVals.forwardDistance = relationalValues.forwardDistance

    endVals.y = car.assignedSpace.y
    endVals.x = car.assignedSpace.x

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
ZPark.prototype.getRelationalValues = function (car) {
    let endOrientation = car.orientation
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
    if (car.negation === -1) {
        if (car.symbol === 'y') {
            spaceEntrance -= car.assignedSpace.height * car.negation
        } else {
            spaceEntrance -= car.assignedSpace.width * car.negation
        }
    }

    let forwardDistance = Math.abs(car.leadingEdge - spaceEntrance)

    return {
        endOrientation: endOrientation,
        direction: endDirection,
        crossNegation: crossNegation,
        crossDistance: crossDistance,
        forwardDistance: forwardDistance,
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
