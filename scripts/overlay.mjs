'use strict'

/**
 * @class
 */
function Overlay() {}

/**
 * @method
 * @param {Object} rankedSpaceList
 * @property {Car} focusedCar
 */
Overlay.prototype.createSpaceOverlay = function (rankedSpaceList) {
    let spacesEl = document.getElementById('spaces')
    for (let space of rankedSpaceList) {
        let spaceEl = document.createElement('div')
        spaceEl.classList.add('space')
        spaceEl.id = space.rank

        spaceEl.style.left = space.left + 'px'
        spaceEl.style.top = space.top + 'px'
        spaceEl.style.height = space.height + 'px'
        spaceEl.style.width = space.width + 'px'

        spacesEl.append(spaceEl)
    }
}

/**
 * @method
 * @param {pathObject} pathObject
 */
Overlay.prototype.drawPaths = function (pathObject) {
    let paths = document.createElement('div')
    paths.id = 'path-lines'

    for (let orientation in pathObject.sections) {
        for (let sect in pathObject.sections[orientation]) {
            let sectionEl = document.createElement('div')
            sectionEl.id = sect
            sectionEl.classList.add('path-line')

            let sectObj = pathObject.sections[orientation][sect]
            if (orientation === 'horizontal') {
                sectionEl.style.height = '2px'
                sectionEl.style.width = sectObj.len + 'px'
                sectionEl.style.left = sectObj.x + 'px'
            } else {
                sectionEl.style.height = sectObj.len + 'px'
                sectionEl.style.width = '2px'
                sectionEl.style.left = sectObj.x + 'px'
            }
            sectionEl.style.top = sectObj.y + 'px'

            paths.append(sectionEl)
        }
    }

    document.getElementById('lot-overlay').append(paths)
}

/**
 * @method
 * @param {Object} box
 * @param {Object} dimensions - Top, left, height, width vals (nums)
 * @property {String} dimensions.x
 * @param {Object} [styles] - Key = style name (str), val = value string w/ suffix
 */
Overlay.prototype.drawBox = function (box, dimensions, styles) {
    box.style.top = dimensions.y + 'px'
    box.style.left = dimensions.x + 'px'
    box.style.height = dimensions.h + 'px'
    box.style.width = dimensions.w + 'px'

    for (let style in styles) {
        box.style[style] = styles[style]
    }
}

/**
 *
 * @param {Object} parent - HTML element
 * @param {Array} [classes]
 * @param {String} [id]
 */
Overlay.prototype.createBox = function (parent, classes, id) {
    let newBox = document.createElement('div')
    if (id) {
        newBox.id = id
    }
    if (classes) {
        newBox.classList.add(...classes)
    }

    parent.append(newBox)
    return newBox
}

Overlay.prototype.toggleCarFocus = function (car) {
    if (this.focusedCar === car) {
        this.focusedCar.userFocus = false
        this.focusedCar.pageWrapper.classList.remove('focused')
        let space = document.getElementById(this.focusedCar.assignedSpace.rank)
        space.style.background = 'none'
        this.focusedCar = undefined
    } else {
        if (this.focusedCar) {
            this.focusedCar.userFocus = false
            this.focusedCar.pageWrapper.classList.remove('focused')
            let space = document.getElementById(
                this.focusedCar.assignedSpace.rank
            )
            space.style.background = 'none'
        }

        car.userFocus = true
        this.focusedCar = car
        this.focusedCar.pageWrapper.classList.add('focused')
        let space = document.getElementById(this.focusedCar.assignedSpace.rank)
        let spaceColor
        if (this.focusedCar.hasParked) {
            spaceColor = 'gray'
        } else if (this.focusedCar.status === 'parked') {
            spaceColor = 'red'
        } else {
            spaceColor = 'yellow'
        }
        space.style.background = spaceColor
    }
}

Overlay.prototype.showElement = function (element) {
    element.style.display = 'initial'
}
Overlay.prototype.hideElement = function (element) {
    element.style.display = 'none'
}

export {Overlay}
