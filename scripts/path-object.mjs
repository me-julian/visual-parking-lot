'use strict'

import * as td from './type-defs.mjs'

//  Measurements for section initialization.
let pathCoords = {
    col0: 228 + (184 - 90) / 2,
    col1: 971 + (170 - 90) / 2,
    row0: 18,
    row1: 18 + 232 + (155 - 90) / 2,
    row2: 18 + 232 + 379 + (167 - 90) / 2,
}

function getSectionPoints(len, axis) {
    // ISSUE: Points never used?
    let points = []
    for (let i = 0; i < len; i++) {
        points.push(axis + i)
    }
    return points
}

// Initialization of all sections in lot.
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
 * @type {td.pathObject}
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
