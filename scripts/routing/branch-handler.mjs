'use strict'

import * as td from '../type-defs.mjs'

/**
 * @class
 * @type {td.BranchHandler}
 * @param {td.pathObject} pathObject
 * @param {number} rowDiff
 * @param {number} colDiff
 */
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

/**
 * @method
 * @param {td.section} section
 * @returns {Array}
 */
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

/**
 * @method
 * @param {td.section} section
 * @returns {td.section}
 */
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

/**
 * @method
 * @param {td.section} section
 * @returns {Array}
 */
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

/**
 * @method
 * @param {td.section} section
 * @returns {td.section}
 */
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

export {BranchHandler}
