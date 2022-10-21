'use strict'

import {RoutePlotter} from './routing/route-plotter.mjs'

/**
 * Object representing a section of the pathObject.
 * @typedef {Object} section
 * @property {number} row
 * @property {number} column
 * @property {Boolean} [horizontal]
 * @property {number} len - length of section in pixels (coordinates/points).
 * @property {number} x - x coordinate on page.
 * @property {number} y - y coordinate on page.
 * @property {Array} points - Array of x, y coordinates.
 */

/**
 * @typedef {Object} intersection
 * @property {collisionBox} area
 * @property {string} name
 * @property {Boolean} occupied
 */

/** Object containing all sections of the path (road) which can be traversed.
 * @typedef {Object} pathObject
 * @property {Object} pathCoords - Measurements for section initialization.
 * @property {Object} sections - Path sections divided by orientation.
 * @property {Object} sections.horizontal
 * @property {section} sections.horizontal.rowxcoly
 * @property {Object} sections.vertical
 * @property {section} sections.vertical.rowxcoly
 * @property {section} entrance - Ref to section which is an entrance.
 * @property {section} exit - Ref to section which is an exit.
 */

/** Recursively determines possible routes through parking lot pathObject.
 * @typedef {Object} RoutePlotter
 * @property {pathObject} pathObject
 */

/** Gets branching paths from one section of a pathObject towards another.
 * @typedef {Object} BranchHandler
 * @property {pathObject} pathObject
 * @property {number} rowDiff
 * @property {number} colDiff
 */

/** Object representing one of the opposite ends of a route.
 * @typedef {Object} routeEnd
 * @property {section} section
 * @property {number} coord - Exact start or destination point along section.
 * @property {string} [direction] - Cardinal direction.
 */

/** Part of a full route through the lot with navigational metadata.
 * @typedef {Object} routeSection
 * @property {section} section
 * @property {number} coord - Endpoint for that routeSection
 * @property {string} direction - Cardinal direction.
 * @property {(string|Boolean)} turn - String for turn car will make to get onto this routeSection or false if no turn.
 */

/**
 * @typedef {Object} collisionbox
 * @property {Number} x
 * @property {Number} y
 * @property {Number} w
 * @property {Number} h
 */

/**
 * @typedef {Object} CollisionBoxHandler
 * @property {ParkingLot} parkingLot
 * @property {collisionbox} entranceArea
 * @property {number} LOOP_SPEED
 */

/**
 * @typedef {Object} ParkingLot
 * @property {Object} config
 * @property {Object} loop
 * @property {PathObject} pathObject
 * @property {RoutePlotter} routePlotter
 * @property {Overlay} overlay
 * @property {Array} spaces - Array of all active space objects.
 * @property {AnimationHandler} animationHandler
 * @property {CollisionBoxHandler} collisionBoxHandler
 * @property {Number} carCount - Number of cars so far. Used for car IDs.
 * @property {Object} cars
 * @property {Object} cars.entering - Cars which haven't parked yet.
 * @property {Object} cars.parked - Cars which are currently parked.
 * @property {Object} cars.leaving - Cars which are leaving the lot.
 * @property {Object} cars.left - Cars which have left the lot and scene.
 * @property {Object} intersections
 */

/**
 * @typedef {Object} space
 * @property {string} facing - Cardinal direction cars parked in the space will face (reversing into space not supported.)
 * @property {Number} height
 * @property {Number} width
 * @property {Number} x
 * @property {Number} y
 * @property {Number} rank
 * @property {Number} score
 * @property {Boolean} reserved
 * @property {section} section
 * @property {HTMLElement} pageEl
 */

/**
 * @typedef {Object} AnimationHandler
 * @property {CSSStyleSheet} stylesheet
 * @property {Object} animationTypes
 * @property {Object} animations
 * @property {animation} animations.name
 */

/**
 * @typedef {Object} animation
 * @property {string} name
 * @property {string} type
 * @property {Array} [maneuverArea] - collisionBoxes which need to be clear for animation.
 * @property {Object} endVals
 * @property {number} endVals.orientation
 * @property {number} endVals.orientationMod
 * @property {number} endVals.direction
 * @property {number} endVals.x
 * @property {number} endVals.y
 * @property {string} [endVals.turnDirection]
 * @property {number} [endVals.crossNegation]
 * @property {number} [endVals.crossDistance]
 * @property {number} [endVals.forwardDistance]
 * @property {number} [endVals.backwardDistance]
 * @property {number} [endVals.spaceEntrance]
 */

/**
 * @typedef {Object} Car
 * @property {ParkingLot} parkingLot
 * @property {CollisionBoxHandler} collisionBoxHandler
 *
 * @property {number} id
 * @property {Boolean} handicap
 *
 * @property {animation} [animation]
 *
 * @property {number} orientation - Angle of page element's rotation.
 * @property {Object} coords
 * @property {number} coords.x
 * @property {number} coords.y
 * @property {string} direction - Cardinal direction
 * @property {number} leadingEdge - Coordinate of front of car based on direction heading.
 * @property {string} symbol - x or y depending on which direction car is heading.
 * @property {string} oppSymbol - x or y depending on which direction car is NOT heading
 * @property {string} axis - left or top depending on which direction car is heading. Used to increment element position when moving forward.
 * @property {string} negation - 1 or (-1) to increment car across page correctly using left/top.
 *
 * @property {number} baseWidth - Width of car image
 * @property {number} baseLength - Length of car image
 * @property {Object} collisionBoxes
 * @property {collisionbox} collisionBoxes.car - Collision box for car image
 * @property {Array} [collisionBoxes.maneuver] - Array of collisionBox objects for maneuver.
 *
 * @property {string} img - Path to car image in files.
 * @property {HTMLElement} pageWrapper - Square wrapper for car img.
 * @property {HTMLElement} pageEl - Rectangular car img.
 *
 * @property {Boolean} userFocus - Determines whether overlay els are shown.
 * @property {Object} overlay - Object containing overlay HTML elements.
 * @property {HTMLElement} overlayWrapper - Wrapper div for overlay HTML elements.
 * @property {HTMLElement} overlay.stoppingDistance
 * @property {HTMLElement} overlay.betweenDestination
 * @property {HTMLElement} overlay.road
 *
 * @property {string} status
 * @property {Boolean} finishedParking
 * @property {number} parkingDuration - Time car will park for in ms.
 *
 * @property {space} assignedSpace
 * @property {Object} route
 * @property {routeSection} currentSection
 * @property {intersection} [nextIntersection]
 * @property {number} [nextSectionDestination] - Coordinate car wants to reach on current routeSection.
 * @property {Object} blockingIntersections
 * @property {intersection} [blockingIntersections.intersection]
 *
 * @property {number} speed - Speed the car is currently moving in by pixels
 * @property {number} minStoppingDistance - Minimum space car wants between itself and collision boxes.
 * @property {number} turningRunup - Space car wants from destination to make a turn.
 */

/** Creates and manages page elements for visual monitoring of
 * parking lot and cars.
 * @typedef {Object} Overlay
 * @property {HTMLElement} wrapper
 * @property {Object} timers - Object to store persistent timers which need checking/refreshing.
 */
export * from './type-defs.mjs'
