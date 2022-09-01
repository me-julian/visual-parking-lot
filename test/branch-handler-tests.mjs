'use strict'
import {assert} from 'chai'

import {BranchHandler} from '../scripts/routing/branch-handler.mjs'

describe('BranchHandler tests', function () {
    let testPathObject = {
        sections: {
            vertical: {
                row0col0: {row: 0, col: 0},
                row1col0: {row: 1, col: 0},
                row2col0: {row: 2, col: 0},
                row0col2: {row: 0, col: 2},
                row1col2: {row: 1, col: 2},
                row2col2: {row: 2, col: 2},
            },
            horizontal: {
                row0col1: {horizontal: true, row: 0, col: 1},
                row1col1: {horizontal: true, row: 1, col: 1},
                row0col3: {horizontal: true, row: 0, col: 3},
                row1col3: {horizontal: true, row: 1, col: 3},
            },
        },
    }
    let testHorizontalSection = testPathObject.sections.horizontal.row0col1
    let testVerticalSection = testPathObject.sections.vertical.row1col2
    describe('getBranchFromHorizontal tests', function () {
        describe('turn west to north', function () {
            let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
            it('given object is equal', function () {
                testBranchHandler.rowDiff = 0
                testBranchHandler.colDiff = -1
                assert.equal(
                    testBranchHandler.getBranchFromHorizontal(
                        testHorizontalSection
                    ),
                    testPathObject.sections.vertical.row0col0,
                    'equal'
                )
            })
        })
        describe('turn west to south', function () {
            let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
            it('given object is equal', function () {
                testBranchHandler.rowDiff = 1
                testBranchHandler.colDiff = -1
                assert.equal(
                    testBranchHandler.getBranchFromHorizontal(
                        testHorizontalSection
                    ),
                    testPathObject.sections.vertical.row1col0,
                    'equal'
                )
            })
        })
        describe('turn east to north', function () {
            let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
            it('given object is equal', function () {
                testBranchHandler.rowDiff = 0
                testBranchHandler.colDiff = 1
                assert.equal(
                    testBranchHandler.getBranchFromHorizontal(
                        testHorizontalSection
                    ),
                    testPathObject.sections.vertical.row0col2,
                    'equal'
                )
            })
        })
        describe('turn east to south', function () {
            let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
            it('given object is equal', function () {
                testBranchHandler.rowDiff = 1
                testBranchHandler.colDiff = 1
                assert.equal(
                    testBranchHandler.getBranchFromHorizontal(
                        testHorizontalSection
                    ),
                    testPathObject.sections.vertical.row1col2,
                    'equal'
                )
            })
        })
    })

    describe('getBranchFromVertical tests', function () {
        describe('head north', function () {
            it('given object is equal', function () {
                let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
                testBranchHandler.rowDiff = -1
                testBranchHandler.colDiff = 0
                assert.deepEqual(
                    testBranchHandler.getBranchFromVertical(
                        testVerticalSection
                    ),
                    [testPathObject.sections.vertical.row0col2],
                    'equal'
                )
            })
        })
        describe('head south', function () {
            it('given object is equal', function () {
                let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
                testBranchHandler.rowDiff = 1
                testBranchHandler.colDiff = 0
                assert.deepEqual(
                    testBranchHandler.getBranchFromVertical(
                        testVerticalSection
                    ),
                    [testPathObject.sections.vertical.row2col2],
                    'equal'
                )
            })
        })
        describe('turn west heading north', function () {
            it('given object is equal', function () {
                let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
                testBranchHandler.rowDiff = -1
                testBranchHandler.colDiff = -1
                assert.deepEqual(
                    testBranchHandler.getBranchFromVertical(
                        testVerticalSection
                    ),
                    [
                        testPathObject.sections.horizontal.row0col1,
                        testPathObject.sections.vertical.row0col2,
                    ],
                    'equal'
                )
            })
        })
        describe('turn east heading north', function () {
            it('given object is equal', function () {
                let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
                testBranchHandler.rowDiff = -1
                testBranchHandler.colDiff = 1
                assert.deepEqual(
                    testBranchHandler.getBranchFromVertical(
                        testVerticalSection
                    ),
                    [
                        testPathObject.sections.horizontal.row0col3,
                        testPathObject.sections.vertical.row0col2,
                    ],
                    'equal'
                )
            })
        })
        describe('turn west heading south', function () {
            it('given object is equal', function () {
                let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
                testBranchHandler.rowDiff = 0
                testBranchHandler.colDiff = -1
                assert.deepEqual(
                    testBranchHandler.getBranchFromVertical(
                        testVerticalSection
                    ),
                    [
                        testPathObject.sections.horizontal.row1col1,
                        testPathObject.sections.vertical.row2col2,
                    ],
                    'equal'
                )
            })
        })
        describe('turn east heading south', function () {
            it('given object is equal', function () {
                let testBranchHandler = new BranchHandler(testPathObject, 0, 0)
                testBranchHandler.rowDiff = 0
                testBranchHandler.colDiff = 1
                assert.deepEqual(
                    testBranchHandler.getBranchFromVertical(
                        testVerticalSection
                    ),
                    [
                        testPathObject.sections.horizontal.row1col3,
                        testPathObject.sections.vertical.row2col2,
                    ],
                    'equal'
                )
            })
        })
    })
})
