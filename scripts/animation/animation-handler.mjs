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

function AnimationHandler(animationTypes) {
    this.styleSheet = (() => {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i]
            if (sheet.title == 'anims') {
                return sheet
            }
        }
    })()

    this.animationTypes = animationTypes

    this.animations = {}
}

// Leaving Space Animations
// Basic Normal:
// Left column pull out S to flow with traffic
// Horizontal pull out W, no reason to do otherwise
// Right column pull out N, no reason to do otherwise
// --- This shouldn't work with how routes are currently calculated

// Special:
// Top Left 2
// Pull out South until able to turn right to head East
// Bottom Left 2
// Pull out North until able to turn left to head East
// Top Right 2
// Pull out South, turn into top horizontal, right turn to head South

AnimationHandler.prototype.determineExceptionalAnimationType = function (car) {
    let type
    let startDirection = car.direction
    let endDirection = car.assignedSpace.facing

    if (
        (startDirection === 'north' && endDirection === 'south') ||
        (startDirection === 'south' && endDirection === 'north')
    ) {
        type = 'u-park'
    } else {
        type = 'z-park'
    }

    return type
}
AnimationHandler.prototype.getAnimation = function (car, type) {
    let animName = this.getAnimationName(car, type)
    // Return pre-existing animation if previously initialized.
    if (this.animations[animName]) {
        return this.animations[animName]
    } else {
        let animation
        switch (type) {
            case 'right-angle-turn':
                animation = new this.animationTypes.RightAngleTurn(
                    this,
                    animName
                )
                break
            case 'right-angle-park':
                animation = new this.animationTypes.RightAnglePark(
                    this,
                    animName
                )
                break
            case 'z-park':
                animation = new this.animationTypes.ZPark(this, animName)
                break
            case 'u-park':
                animation = new this.animationTypes.UPark(this, animName)
                break
            case 'right-angle-reverse':
                animation = new this.animationTypes.RightAngleReverse(
                    this,
                    animName
                )
                break
            case 'right-angle-far-reverse':
                break
            case 'right-angle-three-point-reverse':
                break
        }

        animation.buildSelf(car)

        animation.type = type
        this.animations[animName] = animation
        return animation
    }
}

AnimationHandler.prototype.getAnimationName = function (car, type) {
    let animName
    switch (type) {
        case 'right-angle-park':
        case 'u-park':
        case 'z-park':
            animName = 'space-' + car.assignedSpace.rank + '-parking'
            break
        // Add reversing out of space when implemented
        // animName = 'space-' + car.assignedSpace.rank + '-leaving-space'
        case 'right-angle-turn':
            animName =
                'row' +
                car.route[0].section.row +
                'col' +
                car.route[0].section.col +
                '-' +
                car.route[1].turn
            break
        case 'right-angle-reverse':
            animName = 'space-' + car.assignedSpace.rank + '-leaving-space'
            break
        case 'right-angle-far-reverse':
            //
            break
        case 'right-angle-three-point-reverse':
            //
            break
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

AnimationHandler.prototype.getLeftOrRight = function (
    startDirection,
    endDirection,
    reverse
) {
    let turnDirection
    switch (startDirection) {
        case 'north':
            if (endDirection === 'east') {
                turnDirection = 'left'
            } else {
                turnDirection = 'right'
            }
            break
        case 'south':
            if (endDirection === 'east') {
                turnDirection = 'right'
            } else {
                turnDirection = 'left'
            }
            break
        case 'east':
            if (endDirection === 'north') {
                turnDirection = 'right'
            } else {
                turnDirection = 'left'
            }
            break
        case 'west':
            if (endDirection === 'north') {
                turnDirection = 'left'
            } else {
                turnDirection = 'right'
            }
            break
    }

    if (reverse) {
        if (turnDirection === 'left') {
            turnDirection === 'right'
        } else {
            turnDirection === 'left'
        }
    }

    return turnDirection
}

export {AnimationHandler}
