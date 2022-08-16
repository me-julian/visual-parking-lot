'use strict'
import {assert} from 'chai'

import {pathObject, plotCourse, BranchHandler} from '../path-object.mjs'

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

describe('Course plotting algorithm tests.', function () {
    describe('entrance to parking-space-adjacent section', function () {
        describe('bottom-left to bottom-left (self)', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row2col0,
                    []
                )
                let expected = [[pathObject.sections.vertical.row2col0]]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-left to middle-left', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row1col0,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.vertical.row1col0,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-left to top-left', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row0col0,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.vertical.row0col0,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-left to bottom-middle', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.horizontal.row1col1,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.horizontal.row1col1,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        // NOTE/ISSUE: This is result is inordinary!
        describe('bottom-left to top-middle', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.horizontal.row0col1,
                    []
                )
                let expected = [
                    // [
                    //     pathObject.sections.vertical.row2col0,
                    //     pathObject.sections.horizontal.row1col1,
                    //     pathObject.sections.vertical.row1col2,
                    //     pathObject.sections.horizontal.row0col1,
                    // ],
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.horizontal.row0col1,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-left to bottom-right', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-left to middle-right', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row1col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row1col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-left to top-right', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row0col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.vertical.row0col2,
                    ],
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.horizontal.row0col1,
                        pathObject.sections.vertical.row0col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
    })

    describe('parking-space-adjacent section to exit', function () {
        describe('bottom-left to bottom-right.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('middle-left to bottom-right.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row1col0,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('top-left to bottom-right.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row0col0,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row0col0,
                        pathObject.sections.horizontal.row0col1,
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.vertical.row2col2,
                    ],
                    [
                        pathObject.sections.vertical.row0col0,
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-middle to bottom-right.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.horizontal.row1col1,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('top-middle to bottom-right.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.horizontal.row0col1,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.horizontal.row0col1,
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('bottom-right to bottom-right (self)', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col2,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [[pathObject.sections.vertical.row2col2]]
                assert.deepEqual(courses, expected)
            })
        })
        describe('middle-right to bottom-right.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row1col2,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('top-right to bottom-right.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row0col2,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row0col2,
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
    })
    describe('superfluous routes', function () {
        describe('Top-right to top-left.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row0col2,
                    pathObject.sections.vertical.row0col0,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row0col2,
                        pathObject.sections.horizontal.row0col1,
                        pathObject.sections.vertical.row0col0,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('Bottom-right to top-left.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col2,
                    pathObject.sections.vertical.row0col0,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col2,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.vertical.row0col0,
                    ],
                    [
                        pathObject.sections.vertical.row2col2,
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.horizontal.row0col1,
                        pathObject.sections.vertical.row0col0,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('Bottom-right to bottom-left.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('Middle-right to middle-left.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.vertical.row1col0,
                    pathObject.sections.vertical.row1col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.vertical.row1col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
        describe('Top-center to bottom-left.', function () {
            it('given object is equal', function () {
                let courses = plotCourse(
                    pathObject,
                    pathObject.sections.horizontal.row0col1,
                    pathObject.sections.vertical.row2col2,
                    []
                )
                let expected = [
                    [
                        pathObject.sections.horizontal.row0col1,
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.vertical.row2col2,
                    ],
                ]
                assert.deepEqual(courses, expected)
            })
        })
    })
})
