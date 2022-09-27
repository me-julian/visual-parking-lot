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

AnimationHandler.prototype.determineSpecialAnimationType = function (car) {
    let type
    let startDirection = car.direction
    let endDirection = car.assignedSpace.facing

    if (car.status === 'parking') {
        if (
            (startDirection === 'north' && endDirection === 'south') ||
            (startDirection === 'south' && endDirection === 'north')
        ) {
            type = 'u-park'
        } else {
            type = 'z-park'
        }
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
        }

        animation.buildSelf(car)

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

export {AnimationHandler}
