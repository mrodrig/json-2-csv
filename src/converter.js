'use strict';

let {Json2Csv} = require('./json-2-csv'), // Require our json-2-csv code
    {Csv2Json} = require('./csv-2-json'), // Require our csv-2-json code
    constants = require('./constants.json'), // Require in constants
    docPath = require('doc-path'),
    promise = require('bluebird'),
    _ = require('underscore');

module.exports = {
    json2csv : json2csv,
    csv2json : csv2json,
    json2csvPromisified :  promise.promisify(json2csv),
    csv2jsonPromisified : promise.promisify(csv2json)
};

/**
 * Default options
 */
let defaultOptions = constants.DefaultOptions;

function isDefined(val) {
    return !_.isUndefined(val);
}

function copyOption(options, lowercasePath, uppercasePath) {
    let lowerCaseValue = docPath.evaluatePath(options, lowercasePath);
    if (isDefined(lowerCaseValue)) {
        docPath.setPath(options, uppercasePath, lowerCaseValue);
    }
}

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
function buildOptions(opts, cb) {
    opts = _.defaults(opts || {}, defaultOptions);

    // Note: _.defaults does a shallow default, we need to deep copy the DELIMITER object
    opts.delimiter = _.defaults(opts.delimiter || {}, defaultOptions.delimiter);

    // If the delimiter fields are the same, report an error to the caller
    if (opts.delimiter.field === opts.delimiter.array) { return cb(new Error(constants.Errors.delimitersMustDiffer)); }

    // Otherwise, send the options back
    return cb(null, opts);
}

/**
 * Client accessible json2csv function
 * Takes an array of JSON documents to be converted, a callback that will be called with (err, csv)
 * after processing is complete, and optional options
 * @param array Object[] data to be converted
 * @param callback Function callback
 * @param opts Object options object
 */
function json2csv(array, callback, opts) {
    // If this was promisified (callback and opts are swapped) then fix the argument order.
    if (_.isObject(callback) && !_.isFunction(callback)) {
        let func = opts;
        opts = callback;
        callback = func;
    }

    buildOptions(opts, function (err, options) { // Build the options
        if (err) {
            return callback(err);
        } else {
            let converter = new Json2Csv(options);
            converter.convert(array, callback); // Call our internal json2csv function
        }
    });
}


/**
 * Client accessible csv2json function
 * Takes a string of CSV to be converted to a JSON document array, a callback that will be called
 * with (err, json) after processing is complete, and optional options
 * @param csv
 * @param callback
 * @param opts
 */
function csv2json(csv, callback, opts) {
    // If this was promisified (callback and opts are swapped) then fix the argument order.
    if (_.isObject(callback) && !_.isFunction(callback)) {
        let func = opts;
        opts = callback;
        callback = func;
    }

    buildOptions(opts, function (err, options) { // Build the options
        if (err) {
            return callback(err);
        } else {
            let converter = new Csv2Json(options);
            converter.convert(csv, callback); // Call our internal json2csv function
        }
    });
}
