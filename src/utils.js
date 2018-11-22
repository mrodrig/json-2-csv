'use strict';

let constants = require('./constants.json'),
    _ = require('underscore');

module.exports = {
    buildOptions,
    parseArguments
};

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 * @param opts {Object} options object
 * @param callback {Function}
 */
function buildOptions(opts, callback) {
    opts = _.defaults(opts || {}, constants.defaultOptions);

    // Note: _.defaults does a shallow default, we need to deep copy the DELIMITER object
    opts.delimiter = _.defaults(opts.delimiter || {}, constants.defaultOptions.delimiter);

    // If the delimiter fields are the same, report an error to the caller
    if (opts.delimiter.field === opts.delimiter.array) {
        return callback(new Error(constants.errors.delimitersMustDiffer));
    }
    // Otherwise, send the options back
    return callback(null, opts);
}

/**
 * When promisified, the callback and options argument ordering is swapped, so
 * this function is intended to determine which argument is which and return
 * them in the correct order
 * @param arg1 {Object|Function} options or callback
 * @param arg2 {Object|Function} options or callback
 */
function parseArguments(arg1, arg2) {
    // If this was promisified (callback and opts are swapped) then fix the argument order.
    if (_.isObject(arg1) && !_.isFunction(arg1)) {
        return {
            options: arg1,
            callback: arg2
        };
    }
    // Regular ordering where the callback is provided before the options object
    return {
        options: arg2,
        callback: arg1
    };
}
