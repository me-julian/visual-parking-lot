'use strict'

/**
 * PathObject section objects.
 * @typedef {Object} section
 * @property {number} row
 * @property {number} column
 * @property {Boolean} [horizontal]
 * @property {number} len - length of section in pixels (coordinates/points).
 * @property {number} x - x coordinate on page.
 * @property {number} y - y coordinate on page.
 * @property {Array} points - Array of x, y coordinates.
 */

//  Measurements for section initialization.
let pathCoords = {
    col0: 228 + (184 - 90) / 2,
    col1: 971 + (170 - 90) / 2,
    row0: 18,
    row1: 18 + 232 + (155 - 90) / 2,
    row2: 18 + 232 + 379 + (167 - 90) / 2,
}

function getSectionPoints(len, axis) {
    let points = []
    for (let i = 0; i < len; i++) {
        points.push(axis + i)
    }
    return points
}

let parkingLotSections = {
    vertical: {
        row0col0: (function () {
            let row = 0
            let col = 0
            let len = 265
            let x = pathCoords.col0
            let y = pathCoords.row0

            let topIntersection = null
            let bottomIntersection = 'row1col0Intersection'

            let points = getSectionPoints(len, y)
            return {
                row,
                col,
                len,
                x,
                y,
                topIntersection,
                bottomIntersection,
                points,
            }
        })(),
        row0col2: (function () {
            let row = 0
            let col = 2
            let len = 265
            let x = pathCoords.col1
            let y = pathCoords.row0

            let topIntersection = null
            let bottomIntersection = 'row1col2Intersection'

            let points = getSectionPoints(len, y)
            return {
                row,
                col,
                len,
                x,
                y,
                topIntersection,
                bottomIntersection,
                points,
            }
        })(),
        row1col0: (function () {
            let row = 1
            let col = 0
            let len = 385
            let x = pathCoords.col0
            let y = pathCoords.row1

            let topIntersection = 'row1col0Intersection'
            let bottomIntersection = 'row2col0Intersection'

            let points = getSectionPoints(len, y)
            return {
                row,
                col,
                len,
                x,
                y,
                topIntersection,
                bottomIntersection,
                points,
            }
        })(),
        row1col2: (function () {
            let row = 1
            let col = 2
            let len = 385
            let x = pathCoords.col1
            let y = pathCoords.row1

            let topIntersection = 'row1col2Intersection'
            let bottomIntersection = 'row2col2Intersection'

            let points = getSectionPoints(len, y)
            return {
                row,
                col,
                len,
                x,
                y,
                topIntersection,
                bottomIntersection,
                points,
            }
        })(),
        row2col0: (function () {
            let row = 2
            let col = 0
            let len = 367
            let x = pathCoords.col0
            let y = pathCoords.row2
            let entrance = 'south'

            let topIntersection = 'row2col0Intersection'
            let bottomIntersection = null

            let points = getSectionPoints(len, y)
            return {
                row,
                col,
                len,
                x,
                y,
                topIntersection,
                bottomIntersection,
                points,
                entrance,
            }
        })(),
        row2col2: (function () {
            let row = 2
            let col = 2
            let len = 367
            let x = pathCoords.col1
            let y = pathCoords.row2
            let exit = 'south'

            let topIntersection = 'row2col2Intersection'
            let bottomIntersection = null

            let points = getSectionPoints(len, y)
            return {
                row,
                col,
                len,
                x,
                y,
                topIntersection,
                bottomIntersection,
                points,
                exit,
            }
        })(),
    },
    horizontal: {
        row0col1: (function () {
            let row = 0
            let col = 1
            let horizontal = true
            let len = 736
            let x = pathCoords.col0
            let y = pathCoords.row1

            let leftIntersection = 'row1col0Intersection'
            let rightIntersection = 'row1col2Intersection'

            let points = getSectionPoints(len, x)
            return {
                horizontal,
                row,
                col,
                len,
                x,
                y,
                leftIntersection,
                rightIntersection,
                points,
            }
        })(),
        row1col1: (function () {
            let row = 1
            let col = 1
            let horizontal = true
            let len = 736
            let x = pathCoords.col0
            let y = pathCoords.row2

            let leftIntersection = 'row2col0Intersection'
            let rightIntersection = 'row2col2Intersection'

            let points = getSectionPoints(len, x)
            return {
                horizontal,
                row,
                col,
                len,
                x,
                y,
                leftIntersection,
                rightIntersection,
                points,
            }
        })(),
    },
}

/**
 * @property {Object} sections - Path sections divided by orientation.
 * @property {Object} sections.horizontal
 * @property {section} sections.horizontal.rowxcoly
 * @property {Object} sections.vertical
 * @property {section} sections.vertical.rowxcoly
 * @property {section} entrance - Ref to section which is an entrance.
 * @property {section} exit - Ref to section which is an exit.
 */
let pathObject = {
    sections: parkingLotSections,
    entrance: parkingLotSections.vertical.row2col0,
    exit: parkingLotSections.vertical.row2col2,
    intersections: [
        'row1col0Intersection',
        'row1col2Intersection',
        'row2col0Intersection',
        'row2col2Intersection',
    ],
}

export {pathObject}
