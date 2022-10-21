'use strict'

import * as td from './type-defs.mjs'

/**
 * @class
 * @type {td.Overlay}
 */
function Overlay() {
    this.wrapper = document.getElementById('lot-overlay')
    this.timers = {}
}

/** Create div containing all usable parking spaces in lot.
 * @method
 * @param {Object} rankedSpaceList
 * @property {td.Car} focusedCar
 */
Overlay.prototype.createSpaceOverlay = function (rankedSpaceList) {
    let spacesEl = document.getElementById('spaces')
    for (let space of rankedSpaceList) {
        let spaceEl = document.createElement('div')
        spaceEl.classList.add('space', 'overlay-el')
        spaceEl.id = 'space' + space.rank

        spaceEl.style.left = space.x + 'px'
        spaceEl.style.top = space.y + 'px'
        spaceEl.style.height = space.height + 'px'
        spaceEl.style.width = space.width + 'px'

        spacesEl.append(spaceEl)

        space.pageEl = spaceEl
    }
}

/** Create div containing all intersection areas.
 * @method
 * @param {Object} intersections
 */
Overlay.prototype.createIntersectionOverlay = function (intersections) {
    let allIntersectionsWrapper = document.getElementById('intersections')

    for (let intersection in intersections) {
        let intersectionObject = intersections[intersection]

        let intersectionEl = this.createBox(
            allIntersectionsWrapper,
            ['intersection', 'overlay-el', 'area-box'],
            intersection
        )

        this.drawBox(intersectionEl, intersectionObject.area, {
            backgroundColor: 'green',
        })
    }

    this.wrapper.append(allIntersectionsWrapper)
}

Overlay.prototype.addGuiListeners = function () {
    let spacesWrapper = document.getElementById('spaces')
    let spacesFunct = () => {
        this.toggleShowOverlayWrapperChildren(spacesWrapper)
    }
    document
        .getElementById('show-spaces-button')
        .addEventListener('click', spacesFunct)

    let intersectionsWrapper = document.getElementById('intersections')
    let intersectionsFunct = () => {
        this.toggleShowOverlayWrapperChildren(intersectionsWrapper)
    }
    document
        .getElementById('show-intersections-button')
        .addEventListener('click', intersectionsFunct)
}

/** Create lines to show top-left coordinate points cars move across.
 * @method
 * @param {td.pathObject} pathObject
 */
Overlay.prototype.drawPaths = function (pathObject) {
    let paths = document.createElement('div')
    paths.id = 'path-lines'

    // Get vertical and horizontal sections.
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
    this.wrapper.append(paths)
}

/** Create a rectangular page element and append into DOM. Must call
 * Overlay.drawBox() separately to set dimensions.
 * @param {HTMLElement} parent
 * @param {Array} [classes] Array of class name strings
 * @param {string} [id]
 * @returns {HTMLElement}
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
/** Set dimensions of an existent page element.
 * @method
 * @param {HTMLElement} box - Page element
 * @param {td.collisionbox} dimensions - Top, left, height, width vals (Nums)
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
 * @param {HTMLElement} wrapper - Element directly or indirectly above .overlay-el elements to be shown.
 */
Overlay.prototype.toggleShowOverlayWrapperChildren = function (wrapper) {
    wrapper.classList.toggle('show-overlay-children')
}

/** Show relevent areas being checked by a Car. Removes previously
 * focused car when necessary.
 * @method
 * @param {td.Car} car
 */
Overlay.prototype.toggleCarFocus = function (car) {
    if (this.focusedCar === car) {
        // Only toggling off the current car.
        this.removeFocusedCar()
        this.focusedCar = null
    } else {
        // Remove focus from a different focused car if set.
        if (this.focusedCar) {
            this.removeFocusedCar()
        }
        // Set focus on the desired car.
        car.userFocus = true
        this.focusedCar = car
        this.focusedCar.pageWrapper.classList.add('focused')

        this.updateSpaceColor(
            this.focusedCar.assignedSpace.pageEl,
            this.focusedCar
        )
        this.updateCarsBlockedIntersections(car)
        this.toggleElement(this.focusedCar.assignedSpace.pageEl)
    }
}
Overlay.prototype.removeFocusedCar = function (car) {
    this.focusedCar.userFocus = false
    this.focusedCar.pageWrapper.classList.remove('focused')
    this.toggleElement(this.focusedCar.assignedSpace.pageEl)

    this.updateCarsBlockedIntersections(this.focusedCar)
}
/**
 * @method
 * @param {td.Car} car
 */
Overlay.prototype.updateCarsBlockedIntersections = function (car) {
    for (let intersection in car.blockingIntersections) {
        this.updateIntersectionColor(
            car.blockingIntersections[intersection],
            car
        )
    }
}

/** Briefly show intersection element being checked regardless of
 * intersection overlay being visible.
 * @method
 * @param {td.Intersection} intersection
 */
Overlay.prototype.showIntersectionCheck = function (intersection) {
    document.getElementById(intersection.name).style.display = 'initial'

    setTimeout(() => {
        document.getElementById(intersection.name).style.display = ''
    }, 1500)
}
/** Create elements for areas of maneuver being checked and show until
 * way is clear and has made it partway through its animation.
 * @method
 * @param {td.Car} car
 * @param {td.collisionbox} areas
 * @param {string} state 'blocked' or 'clear'
 */
Overlay.prototype.showManeuverCheck = function (car, areas, state) {
    let maneuverId = car.id + '-maneuver'
    // Only create elements if they haven't already been created and a
    // timer set to remove them to avoid creating new els every iteration.
    if (!this.timers[maneuverId]) {
        let maneuverWrapper = document.createElement('div')
        maneuverWrapper.id = maneuverId
        car.pageWrapper.append(maneuverWrapper)

        for (let area of areas) {
            let areaEl = this.createBox(maneuverWrapper, [
                'overlay-el',
                'maneuver-box',
            ])

            let color
            if (state === 'blocked') {
                color = 'red'
            } else {
                color = 'green'
            }
            this.drawBox(areaEl, area, {backgroundColor: color})
        }

        this.timers[maneuverId] = setTimeout(() => {
            maneuverWrapper.remove()
            delete this.timers[maneuverId]
        }, 1500)
    } else {
        // Refresh timer since car is still continuing to check and
        // hasn't started its animation.
        clearTimeout(this.timers[maneuverId])

        let maneuverWrapper = document.getElementById(maneuverId)
        this.updateManeuverColor(maneuverWrapper, state)

        this.timers[maneuverId] = setTimeout(() => {
            maneuverWrapper.remove()
            delete this.timers[maneuverId]
        }, 1500)
    }
}

/**
 * @method
 * @param {HTMLElement} wrapper
 * @param {string} state - 'blocked' or 'clear'
 */
Overlay.prototype.updateManeuverColor = function (wrapper, state) {
    let color
    if (state === 'blocked') {
        color = 'red'
    } else {
        color = 'green'
    }
    for (let box of wrapper.children) {
        box.style.backgroundColor = color
    }
}
/**
 * @method
 * @param {td.Space} space
 * @param {td.Car} car
 */
Overlay.prototype.updateSpaceColor = function (space, car) {
    let spaceColor
    if (!car.finishedParking && car.status !== 'parked') {
        spaceColor = 'yellow'
    } else if (car.status === 'parked' && !car.finishedParking) {
        spaceColor = 'red'
    } else if (car.status === 'parked' || car.status === 'leaving-space') {
        spaceColor = 'blueviolet'
    } else {
        spaceColor = 'gray'
    }
    space.style['background-color'] = spaceColor
}
/**
 * @method
 * @param {td.intersection} intersection
 * @param {td.Car} car
 */
Overlay.prototype.updateIntersectionColor = function (intersection, car) {
    let intersectionBox = document.getElementById(intersection.name)
    // If the car which is blocking the intersection is userFocus,
    // keep the intersection green to show it's clear to them.
    if (car) {
        if (car.userFocus) {
            intersectionBox.style.backgroundColor = 'green'
            return
        }
    }

    if (intersection.occupied) {
        intersectionBox.style.backgroundColor = 'red'
    } else {
        intersectionBox.style.backgroundColor = 'green'
    }
}

Overlay.prototype.clearCollisionBoxes = function (wrapper) {
    let boxes = wrapper.getElementsByClassName('area-box')
    for (let box of boxes) {
        this.clearCollisionBox(box)
    }
}
Overlay.prototype.clearCollisionBox = function (element) {
    element.style['background-color'] = 'initial'
}

Overlay.prototype.toggleElement = function (element) {
    element.classList.toggle('visible')
}

export {Overlay}
