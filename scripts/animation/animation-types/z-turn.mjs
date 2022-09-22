'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function ZTurn(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

ZTurn.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

ZTurn.prototype.buildRuleString = function (car, name, endVals) {
    let zero, second, third, fourth, hundred
    let declaration = '@keyframes '
    zero = this.buildZeroKeyframe(car)
    second = this.buildSecondKeyframe(car, endVals)
    third = this.buildThirdKeyframe(car, endVals)
    fourth = this.buildFourthKeyframe(car, endVals)
    hundred = this.buildHundredKeyframe(endVals)

    return declaration + name + zero + second + third + fourth + hundred
}

ZTurn.prototype.buildZeroKeyframe = function (car) {
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
ZTurn.prototype.buildSecondKeyframe = function (car, endVals) {
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
        '25% {left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return second
}
ZTurn.prototype.buildThirdKeyframe = function (car, endVals) {
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
            // car.orientation + (90 / 1.65) * endVals.crossNegation
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
        '40% {' +
        'left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return third
}
ZTurn.prototype.buildFourthKeyframe = function (car, endVals) {
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
        '80% {' +
        'left: ' +
        leftVal +
        'px;top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return fourth
}
ZTurn.prototype.buildHundredKeyframe = function (endVals) {
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

ZTurn.prototype.getEndVals = function (car) {
    let endVals = {}

    let metaValues = this.turnMetaValues(car)
    endVals.orientationMod = metaValues.orientationMod
    endVals.endOrientation = metaValues.endOrientation
    endVals.direction = metaValues.direction
    endVals.crossNegation = metaValues.crossNegation
    endVals.crossDistance = metaValues.crossDistance
    endVals.forwardDistance = metaValues.forwardDistance

    endVals.y = car.assignedSpace.y
    endVals.x = car.assignedSpace.x

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
ZTurn.prototype.turnMetaValues = function (car) {
    let endOrientation
    let endDirection = car.assignedSpace.facing

    // Only handling cases present in current parking lot.

    switch (endDirection) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            endOrientation = 0
            break
        case 'north':
            endOrientation = 270
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    let orientationMod
    switch (car.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            break
        case 'east':
            if (endDirection === 'east') {
                orientationMod = 0
            }
            break
        case 'north':
            if (endDirection === 'north') {
                orientationMod = 0
            }
            break
        case 'south':
            console.err('Unexpected State/Unhandled Case!')
            break
    }

    let crossNegation, closestEdge
    if (
        car.route[1].coord >
        car.coords[car.oppSymbol] + (car.baseLength - car.baseWidth / 2)
    ) {
        crossNegation = 1
        closestEdge =
            car.coords[car.oppSymbol] +
            car.baseWidth +
            (car.baseLength - car.baseWidth / 2)
    } else {
        crossNegation = -1
        closestEdge =
            car.coords[car.oppSymbol] + (car.baseLength - car.baseWidth / 2)
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
        orientationMod: orientationMod,
        endOrientation: endOrientation,
        direction: endDirection,
        crossNegation: crossNegation,
        crossDistance: crossDistance,
        forwardDistance: forwardDistance,
    }
}
ZTurn.prototype.getAdjustedEndCoords = function (car, endVals) {
    switch (endVals.direction) {
        case 'west':
            console.err('Unexpected State/Unhandled Case!')
            //     endVals.x = endVals.x
            //     endVals.y -=
            //         car.baseWidth / 2 -
            //         (car.assignedSpace.height - car.baseWidth) / 2

            //     endVals.orientation = car.orientation + endVals.orientationMod

            //     endVals.x += 10
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
                car.orientation + endVals.orientationMod * endVals.crossNegation

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
            console.err('Unexpected State/Unhandled Case!')
            //     endVals.x -=
            //         car.baseWidth / 2 -
            //         (car.assignedSpace.width - car.baseWidth) / 2

            //     endVals.y = endVals.y + (car.assignedSpace.height - car.baseLength)

            //     endVals.orientation = car.orientation + endVals.orientationMod

            //     endVals.y -= 10
            break
    }

    return endVals
}

export {ZTurn}
