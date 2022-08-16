'use strict'

function PathObject(pathCoords, sections, entrance, exit) {
    this.pathCoords = pathCoords
    this.sections = sections

    this.entrance = entrance
    this.exit = exit
}

PathObject.prototype.getSectionPoints = (len, axis) => {
    let points = []
    for (let i = 0; i < len; i++) {
        points.push(axis + i)
    }
    return points
}

let pathCoords = {
    col0: 228 + (184 - 90) / 2,
    col1: 971 + (170 - 90) / 2,
    row0: 18,
    row1: 18 + 232 + (155 - 90) / 2,
    row2: 18 + 232 + 379 + (167 - 90) / 2,
}

let parkingLotSections = {
    vertical: {
        row0col0: (function () {
            let row = 0
            let col = 0
            let len = 265
            let x = pathCoords.col0
            let y = pathCoords.row0

            let points = PathObject.prototype.getSectionPoints(len, y)
            return {row, col, len, x, y, points}
        })(),
        row0col2: (function () {
            let row = 0
            let col = 2
            let len = 265
            let x = pathCoords.col1
            let y = pathCoords.row0

            let points = PathObject.prototype.getSectionPoints(len, y)
            return {row, col, len, x, y, points}
        })(),
        row1col0: (function () {
            let row = 1
            let col = 0
            let len = 385
            let x = pathCoords.col0
            let y = pathCoords.row1

            let points = PathObject.prototype.getSectionPoints(len, y)
            return {row, col, len, x, y, points}
        })(),
        row1col2: (function () {
            let row = 1
            let col = 2
            let len = 385
            let x = pathCoords.col1
            let y = pathCoords.row1

            let points = PathObject.prototype.getSectionPoints(len, y)
            return {row, col, len, x, y, points}
        })(),
        row2col0: (function () {
            let row = 2
            let col = 0
            let len = 367
            let x = pathCoords.col0
            let y = pathCoords.row2
            let entrance = 'south'

            let points = PathObject.prototype.getSectionPoints(len, y)
            return {row, col, len, x, y, points, entrance}
        })(),
        row2col2: (function () {
            let row = 2
            let col = 2
            let len = 367
            let x = pathCoords.col1
            let y = pathCoords.row2
            let exit = 'south'

            let points = PathObject.prototype.getSectionPoints(len, y)
            return {row, col, len, x, y, points, exit}
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

            let points = PathObject.prototype.getSectionPoints(len, x)
            return {horizontal, row, col, len, x, y, points}
        })(),
        row1col1: (function () {
            let row = 1
            let col = 1
            let horizontal = true
            let len = 736
            let x = pathCoords.col0
            let y = pathCoords.row2

            let points = PathObject.prototype.getSectionPoints(len, x)
            return {horizontal, row, col, len, x, y, points}
        })(),
    },
}

let pathObject = new PathObject(
    pathCoords,
    parkingLotSections,
    parkingLotSections.vertical.row2col0,
    parkingLotSections.vertical.row2col2
)

function plotCourse(pathObject, start, end) {
    let courses = []

    courses = findCoursesBySection(pathObject, start, end, courses)
    cullBadCourses(courses)

    return courses
}

function findCoursesBySection(pathObject, start, end, courses, course) {
    let rowDiff = end.row - start.row
    let colDiff = end.col - start.col

    if (!course) {
        var course = []
    } else {
        course = Array.from(course)
    }

    while (start !== end) {
        course.push(start)

        let currBranch = new BranchHandler(pathObject, rowDiff, colDiff)
        let branches = currBranch.getBranches(start)

        if (branches.length === 0) {
            course.pop()
            return courses
        }
        if (branches.length === 2) {
            if (Math.abs(rowDiff) < 2) {
                branches.pop()
            }
        }
        for (let section of branches) {
            courses = findCoursesBySection(
                pathObject,
                section,
                end,
                courses,
                course
            )
        }

        return courses
    }
    course.push(start)
    courses.push(course)
    return courses
}

function BranchHandler(pathObject, rowDiff, colDiff) {
    this.pathObject = pathObject
    this.rowDiff = rowDiff
    this.colDiff = colDiff

    this.branches = []
    this.rowMod = 0
    this.colMod = 0
    this.rowSign = 1
    this.colSign = 1
    this.nextVertiSect = undefined
    this.nextHoriSect = undefined
}

BranchHandler.prototype.getBranches = function (section) {
    if (section.horizontal) {
        this.nextVertiSect = this.getBranchFromHorizontal(section)
    } else {
        let nextSects = this.getBranchFromVertical(section)
        for (let sect of nextSects) {
            if (sect.horizontal) {
                this.nextHoriSect = sect
            } else {
                this.nextVertiSect = sect
            }
        }
    }

    if (this.nextHoriSect) {
        this.branches.push(this.nextHoriSect)
    }
    if (this.nextVertiSect) {
        this.branches.push(this.nextVertiSect)
    }
    return this.branches
}

BranchHandler.prototype.getBranchFromHorizontal = function (section) {
    // If turning west, else turning east
    if (this.colDiff < 0) {
        this.colSign = -1
    }
    this.colMod = 1 * this.colSign

    // if turning at south end, else turning at north end (same row)
    if (this.rowDiff > 0) {
        this.rowMod = 1
    }

    return this.getNextSection(section)
}

BranchHandler.prototype.getBranchFromVertical = function (section) {
    let branchAlternatives = []
    // Determine heading.
    //  If heading north, else heading south
    if (this.rowDiff < 0) {
        this.rowSign = -1
    }
    // if car will turn at north end, assuming it turns
    // else a turn would be at south end
    if (this.rowDiff < 0) {
        this.rowMod = 1
    }
    this.rowMod *= this.rowSign

    // if a turn will be required at any point from current section
    if (this.colDiff !== 0) {
        // if turning west, else turning east
        if (this.colDiff < 0) {
            this.colSign = -1
        }
        this.colMod = 1 * this.colSign

        let lateralBranch = this.getNextSection(section)
        // If only moving laterally and no southern horizontal section, try
        // northern horizontal section.
        if (!lateralBranch && this.rowDiff === 0) {
            this.rowMod = -1
            lateralBranch = this.getNextSection(section)
        }
        if (lateralBranch) {
            branchAlternatives.push(lateralBranch)
        }
    }

    // get next vertical section according to heading
    this.colMod = 0
    this.rowMod = 1 * this.rowSign
    let longitudinalBranch = this.getNextSection(section)
    if (longitudinalBranch) {
        branchAlternatives.push(longitudinalBranch)
    }
    return branchAlternatives
}

BranchHandler.prototype.getNextSection = function (section) {
    let type = 'vertical'
    if (section.horizontal === undefined && this.colMod !== 0) {
        type = 'horizontal'
    }

    let sectionName =
        'row' +
        Number(section.row + this.rowMod) +
        'col' +
        Number(section.col + this.colMod)
    return this.pathObject.sections[type][sectionName]
}

function cullBadCourses(courses) {
    let shortest = courses[0].length
    do {
        for (let i = 1; i < courses.length; ) {
            if (courses[i].length > shortest) {
                courses.splice(i, 1)
                i += 1
                continue
            } else if (courses[i].length < shortest) {
                shortest = courses[i].length
                i = 0
                continue
            }
            i += 1
            continue
        }
    } while (
        courses.every((course) => {
            course.length <= shortest
        })
    )
    return courses
}

function getCourseDist(course, start, end) {}

export {
    pathObject,
    plotCourse,
    findCoursesBySection,
    BranchHandler,
    cullBadCourses,
}
