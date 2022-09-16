'use strict'
// animationHandler dynamically creates CSS Animations
// (writes them to a stylesheet). By checking the directions
// (e.g. a turn from N-W, or a parking turn from N-E) and the
// difference between start/end location it can avoid creating identical
// animations.
// NOTE: That may not work. It'll have to update the top/left coords
// for the keyframes and multiple cars may be using the animation
// at the same time. Do they continually grab the anim rules or does it
// just go until asked to recheck?
//
// If so: Worst case scenario there are 33 spaces * 2 (reversing out)
//  + intersections of keyframe rules to be created during runtime.
//
// Alternately: reimplement JS animation like in drive-around-the-block.
// May be able to generalize bezier curves for general turns/parking
// but unusual parking situations will have to be manually set on
// a case-by-case basis or just be wonky. (CSS animations will be wonky
// but won't require the same bezier point initialization.)

function AnimationHandler() {
    this.styleSheet = (() => {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i]
            if (sheet.title == 'anims') {
                return sheet
            }
        }
    })()
    this.animations = {}
}

AnimationHandler.prototype.createAnimation = function (car) {
    // Make sure no duplicate animNames are created.
    let ruleObject

    let animName = this.getAnimationName(car)
    // Check if animation already exists.
    if (this.animations[animName]) {
        return this.animations[animName]
    } else {
        let endVals = this.getEndVals(car)

        let keyframes = this.buildRuleString(car, animName, endVals)
        this.styleSheet.insertRule(keyframes, this.styleSheet.cssRules.length)

        console.log(this.styleSheet)
        // set properties on object like start/end points for checking?
        ruleObject = this.getAnimationRule(animName)

        this.animations[animName] = {ruleObject: ruleObject, endVals: endVals}

        return this.animations[animName]
    }
}
AnimationHandler.prototype.getAnimationName = function (car) {
    let animName
    if (car.status === 'parking') {
        animName = 'space-' + car.assignedSpace.rank + '-parking'
    } else if (car.status === 'leavingSpace') {
        animName = 'space-' + car.assignedSpace.rank + '-leavingSpace'
    } else if (car.status === 'turning') {
        animName =
            'row' +
            car.route[0].section.row +
            'col' +
            car.route[0].section.col +
            '-' +
            car.route[1].turn
    }
    return animName
}
AnimationHandler.prototype.getAnimationRule = function (animName) {
    let ruleList = this.styleSheet.cssRules
    for (let i = 0; i < ruleList.length; i++) {
        if (ruleList[i].name === animName) {
            return ruleList[i]
        }
    }
}
AnimationHandler.prototype.buildRuleString = function (car, animName, endVals) {
    // Eventually a check will be made for parking vs reg. turning
    let zero,
        twenty = '',
        sixty = '',
        hundred
    let declaration = '@keyframes '
    zero = this.buildZeroKeyframe(car)
    if (car.status === 'parking') {
        twenty = this.buildTwentyKeyframe(car, endVals)
        sixty = this.buildSixtyKeyframe(car, endVals)
    }

    hundred = this.buildHundredKeyframe(endVals)

    return declaration + animName + zero + twenty + sixty + hundred
}
AnimationHandler.prototype.buildZeroKeyframe = function (car) {
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
AnimationHandler.prototype.buildTwentyKeyframe = function (car, endVals) {
    let leftVal, topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
        case 'north':
            leftVal = car.coords.x + car.baseWidth / 5

            topVal = car.coords.y - car.baseLength / 7

            orientationVal = car.orientation - endVals.orientationMod / 15
            break
        case 'east':
        case 'south':
            leftVal = car.coords.x - car.baseWidth / 5

            topVal = car.coords.y + car.baseLength / 7

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
AnimationHandler.prototype.buildSixtyKeyframe = function (car, endVals) {
    let topVal, orientationVal
    switch (endVals.direction) {
        case 'west':
        case 'north':
            topVal = endVals.y + car.baseWidth / 2 - car.baseLength / 5

            orientationVal = car.orientation + endVals.orientationMod / 1.65
            break
        case 'east':
        case 'south':
            topVal = endVals.y - car.baseWidth / 2 + car.baseLength / 5

            orientationVal = car.orientation - endVals.orientationMod / 1.65
            break
    }

    let sixty =
        '60% {top: ' +
        topVal +
        'px;transform: rotate(' +
        orientationVal +
        'deg);}'
    return sixty
}
AnimationHandler.prototype.buildHundredKeyframe = function (endVals) {
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
AnimationHandler.prototype.getEndVals = function (car) {
    let endVals = {}

    let orientationAndDirection = this.getEndOrientationAndDirection(car)
    endVals.orientationMod = orientationAndDirection.orientationMod
    endVals.endOrientation = orientationAndDirection.endOrientation
    endVals.direction = orientationAndDirection.direction

    if (car.status === 'parking') {
        endVals.y = car.assignedSpace.y
        endVals.x = car.assignedSpace.x
    } else if (car.status === 'turning') {
        endVals[car.oppSymbol] = car.route[1].section[car.oppSymbol]
        endVals[car.symbol] = car.route[1].section[car.symbol]
    }

    endVals = this.getAdjustedEndCoords(car, endVals)

    return endVals
}
AnimationHandler.prototype.getEndOrientationAndDirection = function (car) {
    let endOrientation

    let endDirection
    if (car.status === 'turning') {
        endDirection = car.route[1].direction
    } else if (car.status === 'parking') {
        endDirection = car.assignedSpace.facing
    }

    switch (endDirection) {
        case 'east':
            endOrientation = 0
            break
        case 'west':
            endOrientation = 180
            break
        case 'south':
            endOrientation = 90
            break
        case 'north':
            endOrientation = 270
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
AnimationHandler.prototype.getAdjustedEndCoords = function (car, endVals) {
    // Probably just need to do separate cases for each direction.
    if (car.status === 'parking') {
        switch (endVals.direction) {
            case 'west':
            case 'north':
                endVals.x = endVals.x
                endVals.y -=
                    car.baseWidth / 2 -
                    (car.assignedSpace.height - car.baseWidth) / 2

                endVals.orientation = car.orientation + endVals.orientationMod
                break
            case 'east':
            case 'south':
                endVals.x += endVals.x
                endVals.y +=
                    car.baseWidth / 2 -
                    (car.assignedSpace.height - car.baseWidth) / 2

                endVals.orientation = car.orientation - endVals.orientationMod
                break
        }
    } else if (car.status === 'turning') {
        switch (endVals.direction) {
            case 'west':
                endVals.x = endVals.x - car.baseLength / 2

                endVals.y = endVals.y + (car.baseWidth / 2) * car.negation

                endVals.orientation = car.orientation + endVals.orientationMod
                break
            case 'north':
                break
            case 'east':
                endVals.x = endVals.x + car.baseLength / 2

                endVals.y = endVals.y + (car.baseWidth / 2) * car.negation

                endVals.orientation = car.orientation - endVals.orientationMod
                break
            case 'south':
                break
        }
    }

    return endVals
}

export {AnimationHandler}
