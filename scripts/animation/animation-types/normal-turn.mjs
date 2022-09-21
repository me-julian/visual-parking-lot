'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function NormalTurn(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

NormalTurn.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

NormalTurn.prototype.buildRuleString = function (car, name, endVals) {
    let zero, hundred
    let declaration = '@keyframes '
    zero = this.buildZeroKeyframe(car)
    hundred = this.buildHundredKeyframe(endVals)

    return declaration + name + zero + hundred
}

NormalTurn.prototype.buildZeroKeyframe = function (car) {
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
NormalTurn.prototype.buildTwentyKeyframe = function (car, endVals) {
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
NormalTurn.prototype.buildSixtyKeyframe = function (car, endVals) {
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
NormalTurn.prototype.buildHundredKeyframe = function (endVals) {
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

NormalTurn.prototype.getEndVals = function (car) {
    let endVals = {}

    let orientationAndDirection = this.getEndOrientationAndDirection(car)
    endVals.orientationMod = orientationAndDirection.orientationMod
    endVals.endOrientation = orientationAndDirection.endOrientation
    endVals.direction = orientationAndDirection.direction

    endVals[car.oppSymbol] = car.route[1].section[car.oppSymbol]
    endVals[car.symbol] = car.route[1].section[car.symbol]
    if (endVals.direction === 'north' || endVals.direction === 'west') {
        endVals[car.oppSymbol] += car.route[1].section.len
    }

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
NormalTurn.prototype.getEndOrientationAndDirection = function (car) {
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
NormalTurn.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            endVals.x = endVals.x - car.baseLength / 2

            endVals.y = endVals.y + (car.baseWidth / 2) * car.negation

            endVals.orientation = car.orientation + endVals.orientationMod
            break
        case 'east':
            endVals.x = endVals.x + car.baseLength / 2

            endVals.y = endVals.y + (car.baseWidth / 2) * car.negation

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

export {NormalTurn}
