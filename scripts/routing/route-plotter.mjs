'use strict'

import {BranchHandler} from './branch-handler.mjs'

/** Object representing one of the opposite ends of a route.
 * @typedef {Object} routeEnd
 * @property {section} section
 * @property {number} coord - Exact start or destination point along section.
 * @property {string} [direction] - Cardinal direction.
 */

/**
 *
 * @class
 * @param {pathObject} pathObject
 */
function RoutePlotter(pathObject) {
    this.pathObject = pathObject
}

/**
 * @method
 * @param {pathObject} pathObject
 * @param {routeEnd} start - Starting section and end coordinate with direction.
 * @param {routeEnd} destination - Destination section and end coordinate with direction.
 * @returns {object}
 */
RoutePlotter.prototype.createRoute = function (start, destination) {
    let routeSections = this.returnRouteBySections(start, destination)

    let finishedRoute = this.initializeRouteMetaInfo(
        routeSections,
        start,
        destination
    )

    return finishedRoute
}

/**
 * @method
 * @param {section} startSection
 * @param {section} destinationSection
 * @returns
 */
RoutePlotter.prototype.returnRouteBySections = function (
    startSection,
    destinationSection
) {
    let routes = []
    routes = this.findValidRoutesbySections(
        startSection,
        destinationSection,
        routes
    )

    if (routes.length > 1) {
        routeSections = this.handleMultipleValidRoutes(routes)
    } else {
        routeSections = routes[0]
    }

    return routeSections
}

/**
 * @method
 * @param {pathObject} pathObject
 * @param {section} start
 * @param {section} end
 * @param {Array} routes
 * @param {Array} route
 * @returns
 */
RoutePlotter.prototype.findValidRoutesBySections = function (
    start,
    end,
    routes,
    route
) {
    let rowDiff = end.row - start.row
    let colDiff = end.col - start.col

    if (!route) {
        var route = []
    } else {
        route = Array.from(route)
    }

    while (start !== end) {
        route.push(start)

        let currBranch = new BranchHandler(this.pathObject, rowDiff, colDiff)
        let branches = currBranch.getBranches(start)

        if (branches.length === 0) {
            route.pop()
            return routes
        }
        if (branches.length === 2) {
            if (Math.abs(rowDiff) < 2) {
                branches.pop()
            }
        }
        for (let section of branches) {
            routes = this.findValidRoutesBySections(section, end, routes, route)
        }

        return routes
    }
    route.push(start)
    routes.push(route)
    return routes
}

RoutePlotter.prototype.handleMultipleValidRoutes = function (routes) {
    routes = this.cullBadRoutes(routes)
    // for (let potentialRouteSections of routes) {
    //     potentialRouteSections = this.getRouteDist(
    //         potentialRouteSections,
    //         start.coord,
    //         end.coord
    //     )
    // }
    let routeSections = chooseRoute(routes)
    return routeSections
}

/**
 * @method
 * @param {Array} routes
 * @returns {Array}
 */
RoutePlotter.prototype.cullBadRoutes = function (routes) {
    let shortest = routes[0].length
    do {
        for (let i = 1; i < routes.length; ) {
            if (routes[i].length > shortest) {
                routes.splice(i, 1)
                i += 1
                continue
            } else if (routes[i].length < shortest) {
                shortest = routes[i].length
                i = 0
                continue
            }
            i += 1
            continue
        }
    } while (
        routes.every((route) => {
            route.length <= shortest
        })
    )
    return routes
}

/**
 * @method
 * @param {Array} routes
 * @returns {Array}
 */
RoutePlotter.prototype.chooseRoute = function (routes) {
    return route
}

RoutePlotter.prototype.initializeRouteMetaInfo = function (
    routeSections,
    start,
    destination
) {
    let finishedRoute = this.determineSectionDirections(
        routeSections,
        start,
        destination
    )

    finishedRoute = this.determineSectionTurns(finishedRoute)

    return finishedRoute
}

RoutePlotter.prototype.determineSectionDirections = function (
    routeSections,
    start,
    destination
) {
    let finishedRoute = []

    finishedRoute.push({
        section: routeSections[0],
        coord: start.coord,
        direction: start.direction,
    })

    if (routeSections.length > 0) {
        for (let i = 1; i < routeSections.length; i++) {
            let currentSection = routeSections[i - 1]
            let nextSection = routeSections[i]
            let direction = this.getDirectionAlongSection(
                currentSection,
                nextSection
            )
            finishedRoute.push({
                section: nextSection,
                direction: direction,
            })
            if (nextSection === routeSections[routeSections.length - 1]) {
                finishedRoute[finishedRoute.length - 1].coord =
                    destination.coord
            }
        }
    }

    return finishedRoute
}

RoutePlotter.prototype.getDirectionAlongSection = function (next, current) {
    let direction

    if (next.horizontal) {
        if (next.col > current.col) {
            direction = 'east'
        } else {
            direction = 'west'
        }
    } else {
        if (next.row <= current.row) {
            direction = 'north'
        } else {
            direction = 'south'
        }
    }

    return direction
}

RoutePlotter.prototype.determineSectionTurns = function (finishedRoute) {
    for (let i = 1; i < finishedRoute.length; i++) {
        let current = finishedRoute[i - 1]
        let next = finishedRoute[i]

        let currentAxis
        switch (current.direction) {
            case 'north':
            case 'south':
                currentAxis = longitudinal
            case 'west':
            case 'east':
                currentAxis = lateral
        }

        let nextAxis
        switch (next.direction) {
            case 'north':
            case 'south':
                nextAxis = longitudinal
            case 'west':
            case 'east':
                nextAxis = lateral
        }

        if (currentAxis === nextAxis) {
            finishedRoute[i].turn = false
            continue
        }

        switch (current.direction) {
            case 'north':
                if (nextAxis === 'west') {
                    finishedRoute[i].turn = 'left'
                } else {
                    finishedRoute[i].turn = 'right'
                }
            case 'south':
                if (nextAxis === 'west') {
                    finishedRoute[i].turn = 'right'
                } else {
                    finishedRoute[i].turn = 'left'
                }
            case 'east':
                if (nextAxis === 'north') {
                    finishedRoute[i].turn = 'left'
                } else {
                    finishedRoute[i].turn = 'right'
                }
            case 'west':
                if (nextAxis === 'north') {
                    finishedRoute[i].turn = 'right'
                } else {
                    finishedRoute[i].turn = 'left'
                }
        }
    }

    return finishedRoute
}

/**
 * @method
 * @param {Array} route
 * @param {routeEnd} start
 * @param {routeEnd} end
 * @returns {number} distance in points/pixels
 */
RoutePlotter.prototype.getRouteDist = function (route, start, end) {
    let currSectionRemainder = 0,
        endSectionRemainder = 0,
        intermediateSections = 0

    if (start.section === end.section) {
        currSectionRemainder = this.getPartialSectionDistance(
            start.coord,
            end.coord
        )
        route.splice(route[0], 1)
    } else {
        let startDestination, endSectionStart
        if (start.direction === 'north' || start.direction === 'west') {
            startDestination = 0
        } else {
            startDestination = start.section.len
        }
        if (end.direction === 'north' || end.direction === 'west') {
            endSectionStart = end.section.len
        } else {
            endSectionStart = 0
        }
        currSectionRemainder = this.getPartialSectionDistance(
            start.coord,
            startDestination
        )
        endSectionRemainder = this.getPartialSectionDistance(
            endSectionStart,
            end.coord
        )
        route.splice(route.length - 1, 1)
        route.splice(route[0], 1)
    }

    for (let section of route) {
        intermediateSections += section.len
    }

    route.distance =
        currSectionRemainder + endSectionRemainder + intermediateSections

    return route
}

/**
 * @method
 * @param {number} startCoordinate
 * @param {number} endCoordinate
 * @returns
 */
RoutePlotter.prototype.getPartialSectionDistance = function (
    startCoordinate,
    endCoordinate
) {
    let remainingDistance = Math.abs(endCoordinate - startCoordinate)
    return remainingDistance
}

export {RoutePlotter}
