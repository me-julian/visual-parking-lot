'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function NormalPark(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

NormalPark.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

NormalPark.prototype.buildRuleString = function (car, name, endVals) {
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

NormalPark.prototype.buildZeroKeyframe = function (car) {
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
NormalPark.prototype.buildTwentyKeyframe = function (car, endVals) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
            leftVal = car.coords.x + car.baseWidth / 5

            topVal = car.coords.y - car.baseLength / 7

            orientationVal = car.orientation - endVals.orientationMod / 15
            break
        case 'east':
            leftVal = car.coords.x - car.baseWidth / 5

            topVal = car.coords.y + (car.baseLength / 7) * car.negation

            orientationVal =
                car.orientation - (endVals.orientationMod / 15) * car.negation
            break
        case 'north':
            leftVal = car.coords.x + car.baseLength / 7

            topVal = car.coords.y + car.baseWidth / 5

            orientationVal = car.orientation - endVals.orientationMod / 15
            break
        case 'south':
            leftVal = car.coords.x + car.baseWidth / 5

            topVal = car.coords.y - car.baseLength / 7

            orientationVal = car.orientation + endVals.orientationMod / 15
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
NormalPark.prototype.buildSixtyKeyframe = function (car, endVals) {
    let forwardAxis, val, orientationVal
    switch (endVals.direction) {
        case 'west':
            val = endVals.y + car.baseWidth / 2 - car.baseLength / 5
            forwardAxis = 'top: ' + val

            orientationVal = car.orientation + endVals.orientationMod / 1.65
            break
        case 'east':
            val =
                endVals.y +
                car.baseWidth / 2 -
                (car.baseLength / 5) * (car.negation * -1)
            forwardAxis = 'top: ' + val

            orientationVal =
                car.orientation + (endVals.orientationMod / 1.65) * car.negation
            break
        case 'north':
            val = endVals.x - car.baseWidth / 2 + car.baseLength / 5
            forwardAxis = 'left: ' + val

            orientationVal = car.orientation + endVals.orientationMod / 1.65
            break
        case 'south':
            val = endVals.x - car.baseWidth / 2 + car.baseLength / 5
            forwardAxis = 'left: ' + val

            orientationVal = car.orientation - endVals.orientationMod / 1.65
            break
    }

    let sixty =
        '60% {' +
        forwardAxis +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return sixty
}
NormalPark.prototype.buildHundredKeyframe = function (endVals) {
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

NormalPark.prototype.getEndVals = function (car) {
    let endVals = {}

    let orientationAndDirection = this.getEndOrientationAndDirection(car)
    endVals.orientationMod = orientationAndDirection.orientationMod
    endVals.endOrientation = orientationAndDirection.endOrientation
    endVals.direction = orientationAndDirection.direction

    endVals.y = car.assignedSpace.y
    endVals.x = car.assignedSpace.x

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
NormalPark.prototype.getEndOrientationAndDirection = function (car) {
    let endOrientation
    let endDirection = car.assignedSpace.facing

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

    let orientationMod
    if (
        endDirection < car.orientation ||
        car.orientation - endDirection >= 270
    ) {
        orientationMod = 90
    } else {
        orientationMod = -90
    }

    return {
        orientationMod: orientationMod,
        endOrientation: endOrientation,
        direction: endDirection,
    }
}
NormalPark.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            endVals.x = endVals.x
            endVals.y -=
                car.baseWidth / 2 -
                (car.assignedSpace.height - car.baseWidth) / 2

            endVals.orientation = car.orientation + endVals.orientationMod

            endVals.x += 10
            break
        case 'east':
            endVals.x = endVals.x + (car.assignedSpace.width - car.baseLength)

            endVals.y -=
                car.baseWidth / 2 -
                (car.assignedSpace.height - car.baseWidth) / 2

            // East facing spots are the only in the lot which may
            // be approached from two different directions.
            // Orientation change direction may not yet be correct.
            endVals.orientation =
                car.orientation + endVals.orientationMod * car.negation

            endVals.x -= 10
            break
        case 'north':
            endVals.x -=
                car.baseWidth / 2 -
                (car.assignedSpace.width - car.baseWidth) / 2

            endVals.y = endVals.y

            endVals.orientation = car.orientation + endVals.orientationMod

            endVals.y += 10
            break
        case 'south':
            endVals.x -=
                car.baseWidth / 2 -
                (car.assignedSpace.width - car.baseWidth) / 2

            endVals.y = endVals.y + (car.assignedSpace.height - car.baseLength)

            endVals.orientation = car.orientation - endVals.orientationMod

            endVals.y -= 10
            break
    }

    return endVals
}

export {NormalPark}
