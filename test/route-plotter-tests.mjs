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

    describe('getRouteDist tests', function () {
        describe('Full length of one single section.', function () {
            it('Returns a distance of 367', function () {
                let route = [[pathObject.sections.vertical.row2col0]]
                let startRouteEnd = {
                    section: pathObject.sections.vertical.row2col0,
                    refPoint: 367,
                    direction: 'north',
                }
                let destinationRouteEnd = {
                    section: pathObject.sections.vertical.row2col0,
                    refPoint: 0,
                    direction: 'north',
                }
                let expected = 367
                let distance = routePlotter.getRouteDist(
                    route,
                    startRouteEnd,
                    destinationRouteEnd
                )
                assert.equal(distance, expected, 'Distance miscalculated')
            })
        })
        describe('Partway from the middle of one section.', function () {
            it('Returns a distance of 10', function () {
                let route = [[pathObject.sections.vertical.row2col0]]
                let startRouteEnd = {
                    section: pathObject.sections.vertical.row2col0,
                    refPoint: 300,
                    direction: 'north',
                }
                let destinationRouteEnd = {
                    section: pathObject.sections.vertical.row2col0,
                    refPoint: 290,
                    direction: 'north',
                }
                let expected = 10
                let distance = routePlotter.getRouteDist(
                    route,
                    startRouteEnd,
                    destinationRouteEnd
                )
                assert.equal(distance, expected, 'Distance miscalculated')
            })
        })
        describe('Entrance to exit.', function () {
            it('Returns a distance of 1470', function () {
                let route = [
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.horizontal.row1col1,
                    pathObject.sections.vertical.row2col2,
                ]
                let startRouteEnd = {
                    section: pathObject.sections.vertical.row2col0,
                    refPoint: 367,
                    direction: 'north',
                }
                let destinationRouteEnd = {
                    section: pathObject.sections.vertical.row2col2,
                    refPoint: 367,
                    direction: 'south',
                }
                let expected = 1470
                let distance = routePlotter.getRouteDist(
                    route,
                    startRouteEnd,
                    destinationRouteEnd
                )
                assert.equal(distance, expected, 'Distance miscalculated')
            })
        })
        describe('Entrance to top-right (to point 200/265).', function () {
            it('Returns a distance of 1553', function () {
                let route = [
                    pathObject.sections.vertical.row2col0,
                    pathObject.sections.vertical.row1col0,
                    pathObject.sections.horizontal.row0col1,
                    pathObject.sections.vertical.row0col2,
                ]
                let startRouteEnd = {
                    section: pathObject.sections.vertical.row2col0,
                    refPoint: 367,
                    direction: 'north',
                }
                let destinationRouteEnd = {
                    section: pathObject.sections.vertical.row0col2,
                    refPoint: 200,
                    direction: 'north',
                }
                let expected = 1553
                let distance = routePlotter.getRouteDist(
                    route,
                    startRouteEnd,
                    destinationRouteEnd
                )
                assert.equal(distance, expected, 'Distance miscalculated')
            })
        })
        describe('Partway (500/736) top-middle to exit.', function () {
            it('Returns a distance of 988', function () {
                let route = [
                    pathObject.sections.horizontal.row0col1,
                    pathObject.sections.vertical.row1col2,
                    pathObject.sections.vertical.row2col2,
                ]
                let startRouteEnd = {
                    section: pathObject.sections.horizontal.row0col1,
                    refPoint: 500,
                    direction: 'east',
                }
                let destinationRouteEnd = {
                    section: pathObject.sections.vertical.row0col2,
                    refPoint: 367,
                    direction: 'south',
                }
                let expected = 988
                let distance = routePlotter.getRouteDist(
                    route,
                    startRouteEnd,
                    destinationRouteEnd
                )
                assert.equal(distance, expected, 'Distance miscalculated')
            })
        })
    })
})
