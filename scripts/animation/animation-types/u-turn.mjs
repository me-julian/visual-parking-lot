'use strict'

/**
 * @class
 * @param {AnimationHandler} animationHandler
 * @param {String} animName
 */
function UTurn(animationHandler, animName) {
    this.animationHandler = animationHandler
    this.name = animName

    this.ruleObject = undefined
    this.endVals = undefined
}

UTurn.prototype.buildSelf = function (car) {
    this.endVals = this.getEndVals(car)

    let ruleString = this.buildRuleString(car, this.name, this.endVals)

    this.animationHandler.styleSheet.insertRule(
        ruleString,
        this.animationHandler.styleSheet.cssRules.length
    )
    this.ruleObject = this.animationHandler.getAnimationRule(this.name)
}

UTurn.prototype.buildRuleString = function (car, name, endVals) {
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

UTurn.prototype.buildZeroKeyframe = function (car) {
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
UTurn.prototype.buildTwentyKeyframe = function (car, endVals) {
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
            leftVal = 0

            topVal = 0

            orientationVal = 0
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
UTurn.prototype.buildSixtyKeyframe = function (car, endVals) {
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
            leftVal = 0

            topVal = 0

            orientationVal = car.orientation - endVals.orientationMod / 1.65
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
UTurn.prototype.buildHundredKeyframe = function (endVals) {
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

UTurn.prototype.getEndVals = function (car) {
    let endVals = {}

    let metaValues = this.turnMetaValues(car)
    endVals.orientationMod = metaValues.orientationMod
    endVals.endOrientation = metaValues.endOrientation
    endVals.direction = metaValues.direction
    endVals.crossNegation = metaValues.crossNegation
    endVals.crossDistance = metaValues.crossDistance

    endVals.y = car.assignedSpace.y
    endVals.x = car.assignedSpace.x

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
UTurn.prototype.turnMetaValues = function (car) {
    let endOrientation
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
            endOrientation = 90
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
            if (endDirection === 'south') {
                orientationMod = 180
            }
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
        endOrientation: endOrientation,
        direction: endDirection,
        crossNegation: crossNegation,
        crossDistance: crossDistance,
    }
}
UTurn.prototype.getAdjustedEndCoords = function (car, endVals) {
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
            console.err('Unexpected State/Unhandled Case!')
            //     endVals.x = endVals.x + (car.assignedSpace.width - car.baseLength)

            //     endVals.y -=
            //         car.baseWidth / 2 -
            //         (car.assignedSpace.height - car.baseWidth) / 2

            //     // East facing spots are the only in the lot which may
            //     // be approached from two different directions.
            //     // Orientation change direction may not yet be correct.
            //     endVals.orientation =
            //         car.orientation + endVals.orientationMod * car.negation

            //     endVals.x -= 10
            break
        case 'north':
            console.err('Unexpected State/Unhandled Case!')
            //     endVals.x -=
            //         car.baseWidth / 2 -
            //         (car.assignedSpace.width - car.baseWidth) / 2

            //     endVals.y = endVals.y

            //     endVals.orientation = car.orientation + endVals.orientationMod

            //     endVals.y += 10
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

export {UTurn}
