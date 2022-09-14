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
        spaceEl.classList.add('space', 'overlay-el')
        spaceEl.id = space.rank

        spaceEl.style.left = space.x + 'px'
        spaceEl.style.top = space.y + 'px'
        spaceEl.style.height = space.height + 'px'
        spaceEl.style.width = space.width + 'px'

        spacesEl.append(spaceEl)
    }
}

Overlay.prototype.addGuiListeners = function () {
    document
        .getElementById('show-spaces-button')
        .addEventListener('click', this.toggleShowSpacesStatus)
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

Overlay.prototype.toggleShowSpacesStatus = function () {
    document.getElementById('spaces').classList.toggle('show-overlay-children')
}

Overlay.prototype.toggleCarFocus = function (car) {
    if (this.focusedCar === car) {
        this.focusedCar.userFocus = false
        this.focusedCar.pageWrapper.classList.remove('focused')
        let space = document.getElementById(this.focusedCar.assignedSpace.rank)
        this.toggleElement(space)
        this.focusedCar = undefined
    } else {
        if (this.focusedCar) {
            this.focusedCar.userFocus = false
            this.focusedCar.pageWrapper.classList.remove('focused')
            let space = document.getElementById(
                this.focusedCar.assignedSpace.rank
            )
            this.toggleElement(space)
        }

        car.userFocus = true
        this.focusedCar = car
        this.focusedCar.pageWrapper.classList.add('focused')

        let space = document.getElementById(this.focusedCar.assignedSpace.rank)
        this.updateSpaceColor(space, this.focusedCar)
        this.toggleElement(space)
    }
}

Overlay.prototype.updateSpaceColor = function (space, car) {
    let spaceColor
    if (car.hasParked) {
        spaceColor = 'gray'
    } else if (car.status === 'parked') {
        spaceColor = 'red'
    } else {
        spaceColor = 'yellow'
    }
    space.style['background-color'] = spaceColor
}

Overlay.prototype.clearCollisionBoxes = function (wrapper) {
    let boxes = wrapper.getElementsByClassName('area-box')
    for (let box of boxes) {
        this.clearCollisionBox(box)
    }
}
Overlay.prototype.clearCollisionBox = function (box) {
    box.style['background-color'] = 'initial'
}

Overlay.prototype.toggleElement = function (element) {
    element.classList.toggle('visible')
}
Overlay.prototype.showElement = function (element) {
    if (element.classList.includes('hidden')) {
        element.classList.remove('hidden')
    }
    element.classList.add('visible')
}
Overlay.prototype.hideElement = function (element) {
    if (element.classList.includes('visible')) {
        element.classList.remove('visible')
    }
    element.classList.add('hidden')
}

export {Overlay}
