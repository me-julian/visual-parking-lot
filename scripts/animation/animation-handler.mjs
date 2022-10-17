'use strict'
// animationHandler dynamically creates CSS Animations
// (writes them to a stylesheet during runtime).
// Each anim is saved by its location/destination in the lot and
// reused after being created once.

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

AnimationHandler.prototype.determineExceptionalAnimationType = function (car) {
    let type
    let startDirection = car.direction

    if (!car.finishedParking) {
        let endDirection = car.assignedSpace.facing
        if (
            (startDirection === 'north' && endDirection === 'south') ||
            (startDirection === 'south' && endDirection === 'north')
        ) {
            type = 'u-park'
        } else {
            type = 'z-park'
        }
    } else {
        let endDirection = car.route[0].direction
        if (startDirection === endDirection) {
            type = 'z-reverse'
        } else {
            type = 'right-angle-reverse'
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
            case 'right-angle-reverse':
                animation = new this.animationTypes.RightAngleReverse(
                    this,
                    animName
                )
                break
            case 'z-reverse':
                animation = new this.animationTypes.ZReverse(this, animName)
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
        case 'z-reverse':
            animName = 'space-' + car.assignedSpace.rank + '-leaving-space'
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
