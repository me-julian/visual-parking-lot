'use strict'

import * as td from '../type-defs.mjs'
import {BranchHandler} from './branch-handler.mjs'

/**
 * @class
 * @type {td.RoutePlotter}
 * @param {td.pathObject} pathObject
 */
function RoutePlotter(pathObject) {
    this.pathObject = pathObject

    /**
     * @method
     * @param {pathObject} pathObject
     * @param {td.routeEnd} start - Starting section and end coordinate with direction.
     * @param {td.routeEnd} destination - Destination section and end coordinate with direction.
     * @returns {Object}
     */
    this.createRoute = function (routePlotter, start, destination) {
        let routeSections = routePlotter.returnRouteBySections(
            routePlotter,
            start.section,
            destination.section
        )

        let finishedRoute = routePlotter.initializeRouteMetaInfo(
            routePlotter,
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
    this.returnRouteBySections = function (
        routePlotter,
        startSection,
        destinationSection
    ) {
        let routes = []
        let routeSections
        routes = routePlotter.findValidRoutesBySections(
            routePlotter,
            startSection,
            destinationSection,
            routes
        )

        if (routes.length > 1) {
            routeSections = routePlotter.handleMultipleValidRoutes(
                routePlotter,
                routes
            )
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
    this.findValidRoutesBySections = function (
        routePlotter,
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

            let currBranch = new BranchHandler(
                routePlotter.pathObject,
                rowDiff,
                colDiff
            )
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
                routes = routePlotter.findValidRoutesBySections(
                    routePlotter,
                    section,
                    end,
                    routes,
                    route
                )
            }

            return routes
        }
        route.push(start)
        routes.push(route)
        return routes
    }

    this.handleMultipleValidRoutes = function (routePlotter, routes) {
        routes = routePlotter.cullBadRoutes(routes)
        let routeSections = this.chooseRoute(routePlotter, routes)
        return routeSections
    }

    /**
     * @method
     * @param {Array} routes
     * @returns {Array}
     */
    this.cullBadRoutes = function (routes) {
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
    this.chooseRoute = function (routePlotter, routes) {
        if (routes.length > 1) {
            return routes[1]
        } else {
            return routes[0]
        }
    }

    /** Takes raw list of sections and determines directions and turns for each.
     * @param {td.RoutePlotter} routePlotter
     * @param {Array} routeSections
     * @param {td.routeEnd} start
     * @param {td.routeEnd} destination
     * @returns {Array}
     */
    this.initializeRouteMetaInfo = function (
        routePlotter,
        routeSections,
        start,
        destination
    ) {
        let finishedRoute = routePlotter.determineSectionDirections(
            routePlotter,
            routeSections,
            start,
            destination
        )

        finishedRoute = routePlotter.determineSectionTurns(finishedRoute)

        return finishedRoute
    }

    this.determineSectionDirections = function (
        routePlotter,
        routeSections,
        start,
        destination
    ) {
        let finishedRoute = []

        let startSectionEnd
        switch (start.direction) {
            case 'north':
                startSectionEnd = start.section.y
                break
            case 'south':
                startSectionEnd = start.section.y + start.section.len
                break
            case 'east':
                startSectionEnd = start.section.x + start.section.len
                break
            case 'west':
                startSectionEnd = start.section.x
                break
        }
        finishedRoute.push({
            section: routeSections[0],
            coord: startSectionEnd,
            direction: start.direction,
        })

        if (routeSections.length > 0) {
            for (let i = 1; i < routeSections.length; i++) {
                let currentSection = routeSections[i - 1]
                let nextSection = routeSections[i]
                let directionalInfo = routePlotter.getDirectionalInfo(
                    currentSection,
                    nextSection
                )
                finishedRoute.push({
                    section: nextSection,
                    direction: directionalInfo.direction,
                    coord: directionalInfo.oppositeEndPoint,
                })
            }
        }
        // Overwrite last section's end point coord with destination's.
        finishedRoute[finishedRoute.length - 1].coord = destination.coord

        return finishedRoute
    }

    this.getDirectionalInfo = function (current, next) {
        let direction, oppositeEndPoint

        if (next.horizontal) {
            if (next.col > current.col) {
                direction = 'east'
                oppositeEndPoint = next.x + next.len
            } else {
                direction = 'west'
                oppositeEndPoint = next.x
            }
        } else {
            if (next.row > current.row) {
                direction = 'south'
                oppositeEndPoint = next.y + next.len
            } else {
                direction = 'north'
                oppositeEndPoint = next.y
            }
        }

        return {direction: direction, oppositeEndPoint: oppositeEndPoint}
    }

    this.determineSectionTurns = function (finishedRoute) {
        for (let i = 1; i < finishedRoute.length; i++) {
            let current = finishedRoute[i - 1]
            let next = finishedRoute[i]

            let currentAxis
            switch (current.direction) {
                case 'north':
                case 'south':
                    currentAxis = 'longitudinal'
                    break
                case 'west':
                case 'east':
                    currentAxis = 'lateral'
                    break
            }

            let nextAxis
            switch (next.direction) {
                case 'north':
                case 'south':
                    nextAxis = 'longitudinal'
                    break
                case 'west':
                case 'east':
                    nextAxis = 'lateral'
                    break
            }

            if (currentAxis === nextAxis) {
                finishedRoute[i].turn = false
                continue
            } else {
                finishedRoute[i].turn =
                    current.direction + 'to' + next.direction
            }
        }

        return finishedRoute
    }
}
export {RoutePlotter}
