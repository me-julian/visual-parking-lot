'use strict'

import {assert} from 'chai'

import {pathObject} from '../scripts/path-object.mjs'
import {RoutePlotter} from '../scripts/routing/route-plotter.mjs'

describe('RoutePlotter tests', function () {
    let routePlotter = new RoutePlotter(pathObject)

    describe('findValidRoutesBySections algorithm tests.', function () {
        describe('entrance to parking-space-adjacent section', function () {
            describe('bottom-left to bottom-left (self)', function () {
                it('one valid route (only start section)', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.vertical.row2col0,
                        []
                    )
                    let expected = [[pathObject.sections.vertical.row2col0]]
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-left to middle-left', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-left to top-left', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-left to bottom-middle', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            // NOTE: This is result is inordinary!
            describe('OUTLIER: bottom-left to top-middle', function () {
                it('one good route, one to be culled', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.horizontal.row0col1,
                        []
                    )
                    let expected = [
                        [
                            pathObject.sections.vertical.row2col0,
                            pathObject.sections.horizontal.row1col1,
                            pathObject.sections.vertical.row1col2,
                            pathObject.sections.horizontal.row0col1,
                        ],
                        [
                            pathObject.sections.vertical.row2col0,
                            pathObject.sections.vertical.row1col0,
                            pathObject.sections.horizontal.row0col1,
                        ],
                    ]
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-left to bottom-right', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-left to middle-right', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-left to top-right', function () {
                it('two valid routes', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
        })

        describe('parking-space-adjacent section to exit', function () {
            describe('bottom-left to bottom-right.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('middle-left to bottom-right.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('top-left to bottom-right.', function () {
                it('two valid routes', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-middle to bottom-right.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('top-middle to bottom-right.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('bottom-right to bottom-right (self)', function () {
                it('one valid route (only start section)', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
                        pathObject.sections.vertical.row2col2,
                        pathObject.sections.vertical.row2col2,
                        []
                    )
                    let expected = [[pathObject.sections.vertical.row2col2]]
                    assert.deepEqual(routes, expected)
                })
            })
            describe('middle-right to bottom-right.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('top-right to bottom-right.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
        })

        describe('superfluous routes', function () {
            describe('Top-right to top-left.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('OUTLIER: Bottom-right to top-middle.', function () {
                it('one good route, one must be culled', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
                        pathObject.sections.vertical.row2col2,
                        pathObject.sections.horizontal.row0col1,
                        []
                    )
                    let expected = [
                        [
                            pathObject.sections.vertical.row2col2,
                            pathObject.sections.horizontal.row1col1,
                            pathObject.sections.vertical.row1col2,
                            pathObject.sections.horizontal.row0col1,
                        ],
                        [
                            pathObject.sections.vertical.row2col2,
                            pathObject.sections.vertical.row1col2,
                            pathObject.sections.horizontal.row0col1,
                        ],
                    ]
                    assert.deepEqual(routes, expected)
                })
            })
            describe('Bottom-right to top-left.', function () {
                it('two valid routes', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('Bottom-right to bottom-left.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('Middle-right to middle-left.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            describe('Top-middle to bottom-left.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
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
                    assert.deepEqual(routes, expected)
                })
            })
            // NOTE: Only tries going east.
            describe('Top-middle to bottom-middle.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
                        pathObject.sections.horizontal.row0col1,
                        pathObject.sections.horizontal.row1col1,
                        []
                    )
                    let expected = [
                        [
                            pathObject.sections.horizontal.row0col1,
                            pathObject.sections.vertical.row1col2,
                            pathObject.sections.horizontal.row1col1,
                        ],
                    ]
                    assert.deepEqual(routes, expected)
                })
            })
            describe('Bottom-middle to top-middle.', function () {
                it('one valid route', function () {
                    let routes = routePlotter.findValidRoutesBySections(
                        routePlotter,
                        pathObject.sections.horizontal.row1col1,
                        pathObject.sections.horizontal.row0col1,
                        []
                    )
                    let expected = [
                        [
                            pathObject.sections.horizontal.row1col1,
                            pathObject.sections.vertical.row1col2,
                            pathObject.sections.horizontal.row0col1,
                        ],
                    ]
                    assert.deepEqual(routes, expected)
                })
            })
        })
    })

    describe('cullBadRoutes tests', function () {
        describe('normal top-left to bottom-right result with two routes', function () {
            let testRoutes = [
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
            it('should leave both routes unaltered', function () {
                let expected = testRoutes
                let routes = routePlotter.cullBadRoutes(testRoutes)
                assert.deepEqual(routes, expected)
            })
        })
        describe('bottom-left to top-middle findValidRoutesBySections result', function () {
            let testRoutes = [
                [
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.horizontal.row1col1,
                    pathObject.sections.vertical.row1col2,
                    pathObject.sections.horizontal.row0col1,
                ],
                [
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row1col0,
                    pathObject.sections.horizontal.row0col1,
                ],
            ]
            it('should return a single 3 item (nested) array', function () {
                let expected = [
                    [
                        pathObject.sections.vertical.row2col0,
                        pathObject.sections.vertical.row1col0,
                        pathObject.sections.horizontal.row0col1,
                    ],
                ]
                let routes = routePlotter.cullBadRoutes(testRoutes)
                assert.deepEqual(routes, expected)
            })
        })
        describe('bottom-right to top-middle findValidRoutesBySections result', function () {
            let testRoutes = [
                [
                    pathObject.sections.vertical.row2col2,
                    pathObject.sections.horizontal.row1col1,
                    pathObject.sections.vertical.row1col2,
                    pathObject.sections.horizontal.row0col1,
                ],
                [
                    pathObject.sections.vertical.row2col2,
                    pathObject.sections.vertical.row1col2,
                    pathObject.sections.horizontal.row0col1,
                ],
            ]
            it('should return a single 3 item (nested) array', function () {
                let expected = [
                    [
                        pathObject.sections.vertical.row2col2,
                        pathObject.sections.vertical.row1col2,
                        pathObject.sections.horizontal.row0col1,
                    ],
                ]
                let routes = routePlotter.cullBadRoutes(testRoutes)
                assert.deepEqual(routes, expected)
            })
        })
    })
})
