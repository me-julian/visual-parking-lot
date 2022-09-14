'use strict'

let SpaceInitializer = function (pathObject) {
    this.pathObject = pathObject
}

/**
 * @method
 * @returns {Object} unrankedSpaceList
 */
SpaceInitializer.prototype.initParkingSpaces = function () {
    let unrankedSpaceList = {}
    let refPoint
    // col0 vertical section's spaces
    refPoint = {
        x: 20,
        y: 18,
    }
    unrankedSpaceList.row0col0 = this.createSpacesColumn(
        refPoint,
        [100, 97, 100],
        208,
        this.pathObject.sections.vertical.row0col0,
        'right'
    )
    unrankedSpaceList.row1col0 = this.createSpacesColumn(
        refPoint,
        [98, 100, 100],
        208,
        this.pathObject.sections.vertical.row1col0,
        'right'
    )
    unrankedSpaceList.row2col0 = this.createSpacesColumn(
        refPoint,
        [100, 98, 100],
        208,
        this.pathObject.sections.vertical.row2col0,
        'right'
    )
    // col2 vertical section's spaces
    refPoint = {
        x: 1140,
        y: 18,
    }
    unrankedSpaceList.row0col2 = this.createSpacesColumn(
        refPoint,
        [100, 97, 100],
        212,
        this.pathObject.sections.vertical.row0col2,
        'left'
    )
    unrankedSpaceList.row1col2 = this.createSpacesColumn(
        refPoint,
        [98, 100, 100],
        212,
        this.pathObject.sections.vertical.row1col2,
        'left'
    )
    unrankedSpaceList.row2col2 = this.createSpacesColumn(
        refPoint,
        [100, 98, 100],
        212,
        this.pathObject.sections.vertical.row2col2,
        'left'
    )
    // row0 horizontal section's top spaces
    refPoint = {
        x: 423,
        y: 28,
    }
    unrankedSpaceList.row0col1 = this.createSpacesRow(
        refPoint,
        [100, 100, 100, 100, 98],
        212,
        this.pathObject.sections.horizontal.row0col1,
        'bottom'
    )
    // row0 horizontal section's bottom spaces
    refPoint = {
        x: 423,
        y: 395,
    }
    let row0col1BottomSpaces = this.createSpacesRow(
        refPoint,
        [100, 100, 100, 100, 98],
        210,
        this.pathObject.sections.horizontal.row0col1,
        'top'
    )
    for (let space of row0col1BottomSpaces) {
        unrankedSpaceList.row0col1.push(space)
    }
    // row1 horizontal section's bottom spaces
    refPoint = {
        x: 422,
        y: 786,
    }
    unrankedSpaceList.row1col1 = this.createSpacesRow(
        refPoint,
        [100, 100, 100, 100, 98],
        210,
        this.pathObject.sections.horizontal.row1col1,
        'bottom'
    )

    return unrankedSpaceList
}

SpaceInitializer.prototype.createSpacesColumn = function (
    refPoint,
    spaces,
    length,
    section,
    entranceSide
) {
    let column = []
    for (let i = 0; i < spaces.length; i++) {
        let space = {}
        space.x = refPoint.x
        space.y = refPoint.y
        space.width = length
        space.height = spaces[i]
        space.entranceSide = entranceSide
        space.section = section

        column.push(space)

        refPoint.y += space.height + 10
    }
    return column
}
SpaceInitializer.prototype.createSpacesRow = function (
    refPoint,
    spaces,
    length,
    section,
    entranceSide
) {
    let row = []
    for (let i = 0; i < spaces.length; i++) {
        let space = {}
        space.x = refPoint.x
        space.y = refPoint.y
        space.height = length
        space.width = spaces[i]
        space.entranceSide = entranceSide
        space.section = section

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
SpaceInitializer.prototype.rankSpaces = function (unrankedSpaceList) {
    let rankedSpaceList = []

    for (let line in unrankedSpaceList) {
        for (let space of unrankedSpaceList[line]) {
            space.score = space.x + space.y
            rankedSpaceList.push(space)
        }
    }

    rankedSpaceList.sort((a, b) => a.score - b.score)
    for (let i = 0; i < rankedSpaceList.length; i++) {
        rankedSpaceList[i].rank = i
    }

    return rankedSpaceList
}

export {SpaceInitializer}
