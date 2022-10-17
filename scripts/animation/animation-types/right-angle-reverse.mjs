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

// Need to refactor to make far vs normal version. Change endVals,
// keyframes, etc.

RightAngleReverse.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString
    // Check if car is making an exceptional turn.
    if (car.route[0].section === car.assignedSpace.section) {
        ruleString = this.buildNormalRuleString(car, this.name, this.endVals)
    } else {
        ruleString = this.buildFarRuleString(car, this.name, this.endVals)
    }

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

RightAngleReverse.prototype.buildNormalRuleString = function (
    car,
    name,
    endVals
) {
    let initial, second, last
    initial = this.buildInitialKeyframe(car)

    second = this.buildSecondKeyframe(car, endVals, 40)
    last = this.buildLastKeyframe(endVals)

    return '@keyframes ' + name + initial + second + last
}

// For cars that need to reverse farther onto other sections.
RightAngleReverse.prototype.buildFarRuleString = function (car, name, endVals) {
    let initial, second, third, last

    initial = this.buildInitialKeyframe(car)
    second = this.buildSecondKeyframe(car, endVals, 20)
    // Car finishes the actual turning partway through the anim.
    third = this.buildThirdKeyframe(car, endVals, 70)
    // Continue car backwards along road.
    endVals[car.oppSymbol] =
        car.route[0].coord - car.turningRunup * endVals.crossNegation
    if (endVals.crossNegation === 1) {
        endVals[car.oppSymbol] -= car.baseLength
    }
    last = this.buildLastKeyframe(endVals)

    return '@keyframes ' + name + initial + second + third + last
}

RightAngleReverse.prototype.buildInitialKeyframe = function (car) {
    let initial =
        '{0% {left: ' +
        car.coords.x +
        'px;top: ' +
        car.coords.y +
        'px;transform: rotate(' +
        car.orientation +
        'deg);}'
    return initial
}

RightAngleReverse.prototype.buildSecondKeyframe = function (
    car,
    endVals,
    keyframe
) {
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
RightAngleReverse.prototype.buildThirdKeyframe = function (
    car,
    endVals,
    keyframe
) {
    let third =
        keyframe +
        '% {left: ' +
        endVals.x +
        'px;top: ' +
        endVals.y +
        'px;transform: rotate(' +
        endVals.orientation +
        'deg);}'
    return third
}
RightAngleReverse.prototype.buildLastKeyframe = function (endVals) {
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

RightAngleReverse.prototype.getEndVals = function (car) {
    let endVals = {}

    // Should just assign endVals here?
    let relationalValues = this.getRelationalValues(car)
    endVals.orientationMod = relationalValues.orientationMod
    endVals.endOrientation = relationalValues.endOrientation
    endVals.direction = relationalValues.direction
    endVals.turnDirection = relationalValues.turnDirection
    endVals.crossNegation = relationalValues.crossNegation

    endVals[car.symbol] = car.assignedSpace.section[car.symbol]
    endVals[car.oppSymbol] = car.assignedSpace[car.oppSymbol]

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
RightAngleReverse.prototype.getRelationalValues = function (car) {
    let endOrientation
    let endDirection = car.route[0].direction

    let crossNegation
    switch (endDirection) {
        case 'west':
            endOrientation = 180
            crossNegation = -1
            break
        case 'east':
            endOrientation = 0
            crossNegation = 1
            break
        case 'north':
            endOrientation = 270
            crossNegation = -1
            break
        case 'south':
            endOrientation = 90
            crossNegation = 1
            break
    }

    let turnDirection = this.animationHandler.getLeftOrRight(
        car.direction,
        endDirection,
        true
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
        crossNegation: crossNegation,
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
