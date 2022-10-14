'use strict'

/**
 * @class
 */
function Overlay() {
    this.wrapper = document.getElementById('lot-overlay')
    this.timers = {}
}

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
        spaceEl.id = 'space' + space.rank

        spaceEl.style.left = space.x + 'px'
        spaceEl.style.top = space.y + 'px'
        spaceEl.style.height = space.height + 'px'
        spaceEl.style.width = space.width + 'px'

        spacesEl.append(spaceEl)

        space.pageEl = spaceEl
    }
}

Overlay.prototype.createIntersectionOverlay = function (intersections) {
    let allIntersectionsWrapper = document.getElementById('intersections')

    for (let intersection in intersections) {
        let intersectionObject = intersections[intersection]

        let intersectionWrapper = this.createBox(
            allIntersectionsWrapper,
            ['intersection', 'overlay-el'],
            intersection
        )
        let xBox = this.createBox(intersectionWrapper)
        let yBox = this.createBox(intersectionWrapper)
        intersectionWrapper.append(xBox, yBox)

        this.drawBox(xBox, intersectionObject.areas.xArea, {
            backgroundColor: 'green',
        })
        this.drawBox(yBox, intersectionObject.areas.yArea, {
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

    this.wrapper.append(paths)
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

Overlay.prototype.toggleShowOverlayWrapperChildren = function (wrapper) {
    wrapper.classList.toggle('show-overlay-children')
}

Overlay.prototype.toggleCarFocus = function (car) {
    if (this.focusedCar === car) {
        this.focusedCar.userFocus = false
        this.focusedCar.pageWrapper.classList.remove('focused')
        this.toggleElement(this.focusedCar.assignedSpace.pageEl)
        this.focusedCar = null
    } else {
        if (this.focusedCar) {
            this.focusedCar.userFocus = false
            this.focusedCar.pageWrapper.classList.remove('focused')
            this.toggleElement(this.focusedCar.assignedSpace.pageEl)
        }

        car.userFocus = true
        this.focusedCar = car
        this.focusedCar.pageWrapper.classList.add('focused')

        this.updateSpaceColor(
            this.focusedCar.assignedSpace.pageEl,
            this.focusedCar
        )
        this.toggleElement(this.focusedCar.assignedSpace.pageEl)
    }
}

Overlay.prototype.showIntersectionCheck = function (intersection) {
    document.getElementById(intersection.name).style.display = 'initial'

    setTimeout(() => {
        document.getElementById(intersection.name).style.display = ''
    }, 1500)
}

Overlay.prototype.showManeuverCheck = function (car, areas, state) {
    let maneuverId = car.id + '-maneuver'
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
        clearTimeout(this.timers[maneuverId])

        let maneuverWrapper = document.getElementById(maneuverId)
        this.updateManeuverColor(maneuverWrapper, state)

        this.timers[maneuverId] = setTimeout(() => {
            maneuverWrapper.remove()
            delete this.timers[maneuverId]
        }, 1500)
    }
}
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

Overlay.prototype.updateSpaceColor = function (space, car) {
    let spaceColor
    if (car.status === 'parked' || car.status === 'leaving-space') {
        spaceColor = 'red'
    } else if (car.finishedParking) {
        spaceColor = 'gray'
    } else {
        spaceColor = 'yellow'
    }
    space.style['background-color'] = spaceColor
}
Overlay.prototype.updateIntersectionColor = function (intersection, car) {
    let intersectionBoxes = document.getElementById(intersection.name).children
    // If the car which is blocking the intersection is userFocus,
    // keep the intersection green to show it's clear to them.
    if (car) {
        if (car.userFocus) {
            return
        }
    }

    if (intersection.occupied) {
        for (let box of intersectionBoxes) {
            box.style.backgroundColor = 'red'
        }
    } else {
        for (let box of intersectionBoxes) {
            box.style.backgroundColor = 'green'
        }
    }
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
