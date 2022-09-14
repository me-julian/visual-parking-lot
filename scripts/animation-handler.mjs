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

AnimationHandler.prototype.createAnimationRule = function (car) {
    // Make sure no duplicate animNames are created.
    let animName = 'test-park'
    let keyframes = this.buildRuleString(car, animName)
    this.styleSheet.insertRule(keyframes, this.styleSheet.cssRules.length)

    console.log(this.styleSheet)
    // set properties on object like start/end points for checking?
    let ruleObject = this.getAnimationRule(animName)

    this.animations[animName] = ruleObject
    // temporary return
    return ruleObject
}
AnimationHandler.prototype.getAnimationRule = function (animName) {
    let ruleList = this.styleSheet.cssRules
    for (let i = 0; i < ruleList.length; i++) {
        if (ruleList[i].name === animName) {
            return ruleList[i]
        }
    }
}
AnimationHandler.prototype.buildRuleString = function (car, animName) {
    // Eventually a check will be made for parking vs reg. turning
    let endOrientation = this.getSpaceEndOrientation(car)

    let declaration = '@keyframes '
    let zero =
        '{0% {left: ' +
        car.coords.x +
        'px;top: ' +
        car.coords.y +
        'px;transform: rotate(' +
        car.orientation +
        'deg);}'

    let twenty =
        '20% {left: ' +
        (car.coords.x + car.baseWidth / 5) +
        'px;top: ' +
        (car.assignedSpace.y + car.baseLength / 20) +
        'px;transform: rotate(' +
        275 +
        'deg);}'

    let sixty =
        '60% {top: ' +
        (car.assignedSpace.y - 30) +
        'px;transform: rotate(' +
        215 +
        'deg);}'

    let hundred =
        '100% {left: ' +
        car.assignedSpace.x +
        'px;top: ' +
        (car.assignedSpace.y -
            car.baseWidth / 2 +
            (car.assignedSpace.height - car.baseWidth) / 2) +
        'px;transform: rotate(' +
        endOrientation +
        'deg);}}'

    return declaration + animName + zero + twenty + sixty + hundred
}
AnimationHandler.prototype.getSpaceEndOrientation = function (car) {
    let endOrientation
    switch (car.assignedSpace.entranceSide) {
        case 'left':
            endOrientation = 0
            break
        case 'right':
            endOrientation = 180
            break
        case 'top':
            endOrientation = 90
            break
        case 'bottom':
            endOrientation = 270
            break
    }
    return endOrientation
}

export {AnimationHandler}
