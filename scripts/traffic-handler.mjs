'use strict'

/**
 * @class
 * @param {pathObject} pathObject
 */
function TrafficHandler(pathObject) {
    this.pathObject = pathObject
}

TrafficHandler.prototype.isEntranceClear = function () {
    return true
}

export {TrafficHandler}
