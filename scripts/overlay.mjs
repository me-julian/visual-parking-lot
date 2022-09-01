'use strict'

/**
 * @class
 */
function Overlay() {}

/**
 * @method
 * @param {Object} rankedSpaceList
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

export {Overlay}
