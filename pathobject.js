'use strict'

// [vr0c0] [] [vr0c1]
//  |- [hr0c0] -|
// [vr1c0] [] [vr1c1]
//  |- [hr0c1] -|
// [vr2c0] [] [vr2c1]
let pathCoords = {
    col0: 228 + (184 - 90) / 2,
    col1: 971 + (170 - 90) / 2,
    row0: 18,
    row1: 18 + 232 + (155 - 90) / 2,
    row2: 18 + 232 + 379 + (167 - 90) / 2,
}

let pathObject = {
    section: {
        vr0c0: (function () {
            let len = 265
            let x = pathCoords.col0
            let y = pathCoords.row0

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(y + i)
            }
            return {len, x, y, points}
        })(),
        vr0c1: (function () {
            let len = 265
            let x = pathCoords.col1
            let y = pathCoords.row0

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(y + i)
            }
            return {len, x, y, points}
        })(),
        hr0c0: (function () {
            let horizontal = true
            let len = 736
            let x = pathCoords.col0
            let y = pathCoords.row1

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(x + i)
            }
            return {horizontal, len, x, y, points}
        })(),
        vr1c0: (function () {
            let len = 385
            let x = pathCoords.col0
            let y = pathCoords.row1

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(y + i)
            }
            return {len, x, y, points}
        })(),
        vr1c1: (function () {
            let len = 385
            let x = pathCoords.col1
            let y = pathCoords.row1

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(y + i)
            }
            return {len, x, y, points}
        })(),
        hr0c1: (function () {
            let horizontal = true
            let len = 736
            let x = pathCoords.col0
            let y = pathCoords.row2

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(y + i)
            }
            return {horizontal, len, x, y, points}
        })(),
        vr2c0: (function () {
            let len = 367
            let x = pathCoords.col0
            let y = pathCoords.row2

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(y + i)
            }
            return {len, x, y, points}
        })(),
        vr2c1: (function () {
            let len = 367
            let x = pathCoords.col1
            let y = pathCoords.row2

            let points = []
            for (let i = 0; i < len; i++) {
                points.push(y + i)
            }
            return {len, x, y, points}
        })(),
    },
}

pathObject.entrance = pathObject.section.vr2c0
pathObject.exit = pathObject.section.vr2c1
