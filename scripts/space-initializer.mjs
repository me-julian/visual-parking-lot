'use strict'

let spaceInitializer = {}

/**
 * @method
 * @returns {Object} unrankedSpaceList
 */
spaceInitializer.initParkingSpaces = function () {
    let unrankedSpaceList = {}
    let refPoint
    // left column
    refPoint = {
        x: 20,
        y: 18,
    }
    unrankedSpaceList.leftCol = this.createSpacesColumn(refPoint, 208)
    // right column
    refPoint = {
        x: 1140,
        y: 18,
    }
    unrankedSpaceList.rightCol = this.createSpacesColumn(refPoint, 212)
    // top-mid row
    refPoint = {
        x: 423,
        y: 28,
    }
    unrankedSpaceList.topRow = this.createSpacesRow(refPoint, 212)
    // mid-mid row
    refPoint = {
        x: 423,
        y: 395,
    }
    unrankedSpaceList.midRow = this.createSpacesRow(refPoint, 210)
    // bot-mid row
    refPoint = {
        x: 422,
        y: 786,
    }
    unrankedSpaceList.bottRow = this.createSpacesRow(refPoint, 210)

    return unrankedSpaceList
}

spaceInitializer.createSpacesColumn = function (refPoint, length) {
    let column = []
    for (let i = 0; i < 9; i++) {
        let space = {}
        space.left = refPoint.x
        space.top = refPoint.y
        space.width = length

        switch (i) {
            case 1:
                space.height = 97
                break
            case 3:
            case 7:
                space.height = 98
                break
            default:
                space.height = 100
                break
        }
        column.push(space)

        refPoint.y += space.height + 10
    }
    return column
}
spaceInitializer.createSpacesRow = function (refPoint, length) {
    let row = []
    for (let i = 0; i < 5; i++) {
        let space = {}
        space.left = refPoint.x
        space.top = refPoint.y
        space.height = length

        switch (i) {
            case 4:
                space.width = 98
                break
            default:
                space.width = 100
                break
        }
        row.push(space)

        refPoint.x += space.width + 10
    }
    return row
}

/**
 * @method
 * @param {Object} unrankedSpaceList
 * @returns
 */
spaceInitializer.rankSpaces = function (unrankedSpaceList) {
    let rankedSpaceList = []

    for (let line in unrankedSpaceList) {
        for (let space of unrankedSpaceList[line]) {
            space.score = space.left + space.top
            rankedSpaceList.push(space)
        }
    }

    rankedSpaceList.sort((a, b) => a.score - b.score)
    for (let i = 0; i < rankedSpaceList.length; i++) {
        rankedSpaceList[i].rank = i
    }

    return rankedSpaceList
}

export {spaceInitializer}
