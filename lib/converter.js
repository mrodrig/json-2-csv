'use strict';

var json2Csv = require('./json-2-csv'), // Require our json-2-csv code
    csv2Json = require('./csv-2-json'), // Require our csv-2-json code
    constants = require('./constants.json'), // Require in constants
    docPath = require('doc-path'),
    _ = require('underscore'); // Require underscore

/**
 * Default options
 */
var defaultOptions = constants.DefaultOptions;

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
var buildOptions = function (opts, cb) {
    // PREVIOUS VERSION SUPPORT (so that future versions are backwards compatible)
    // Issue #26: opts.EOL should be opts.DELIMITER.EOL -- this will move the option & provide backwards compatibility
    if (docPath.evaluatePath(opts, 'EOL')) { docPath.setPath(opts, 'DELIMITER.EOL', opts.EOL); }
    
    // #62: Allow for lower case option names
    if (opts) {
        if (!_.isUndefined(opts.prependHeader)) { docPath.setPath(opts, 'PREPEND_HEADER', opts.prependHeader); }
        if (!_.isUndefined(opts.trimHeaderFields)) { docPath.setPath(opts, 'TRIM_HEADER_FIELDS', opts.trimHeaderFields); }
        if (!_.isUndefined(opts.trimFieldValues)) { docPath.setPath(opts, 'TRIM_FIELD_VALUES', opts.trimFieldValues); }
        if (!_.isUndefined(opts.sortHeader)) { docPath.setPath(opts, 'SORT_HEADER', opts.sortHeader); }
        if (!_.isUndefined(opts.parseCsvNumbers)) { docPath.setPath(opts, 'PARSE_CSV_NUMBERS', opts.parseCsvNumbers); }
        if (!_.isUndefined(opts.keys)) { docPath.setPath(opts, 'KEYS', opts.keys); }
        if (!_.isUndefined(opts.checkSchemaDifferences)) { docPath.setPath(opts, 'CHECK_SCHEMA_DIFFERENCES', opts.checkSchemaDifferences); }
        if (!_.isUndefined(opts.emptyFieldValue)) { docPath.setPath(opts, 'EMPTY_FIELD_VALUE', opts.emptyFieldValue); }
        if (!_.isUndefined(opts.locale)) { docPath.setPath(opts, 'LOCALE', opts.locale); }
        if (!_.isUndefined(opts.delimiter)) { 
            if (!_.isUndefined(opts.delimiter.field)) { docPath.setPath(opts, 'DELIMITER.FIELD', opts.delimiter.field); }
            if (!_.isUndefined(opts.delimiter.array)) { docPath.setPath(opts, 'DELIMITER.ARRAY', opts.delimiter.array); }
            if (!_.isUndefined(opts.delimiter.wrap)) { docPath.setPath(opts, 'DELIMITER.WRAP', opts.delimiter.wrap); }
            if (!_.isUndefined(opts.delimiter.eol)) { docPath.setPath(opts, 'DELIMITER.EOL', opts.delimiter.eol); }
        }
    }

    opts = _.defaults(opts || {}, defaultOptions);

    // Note: _.defaults does a shallow default, we need to deep copy the DELIMITER object
    opts.DELIMITER = _.defaults(opts.DELIMITER || {}, defaultOptions.DELIMITER);

    // If the delimiter fields are the same, report an error to the caller
    if (opts.DELIMITER.FIELD === opts.DELIMITER.ARRAY) { return cb(new Error(constants.Errors.delimitersMustDiffer)); }
    
    // Otherwise, send the options back
    return cb(null, opts);
};

// Export the following functions that will be client accessible
module.exports = {

    /**
     * Client accessible json2csv function
     * Takes an array of JSON documents to be converted, a callback that will be called with (err, csv)
     * after processing is complete, and optional options
     * @param array Object[] data to be converted
     * @param callback Function callback
     * @param opts Object options object
     */
    json2csv: function (array, callback, opts) {
        // If this was promisified (callback and opts are swapped) then fix the argument order.
        if (_.isObject(callback) && !_.isFunction(callback)) {
            var func = opts;
            opts = callback;
            callback = func;
        }

        buildOptions(opts, function (err, options) { // Build the options
            if (err) {
                return callback(err);
            } else {
                json2Csv.json2csv(options, array, callback); // Call our internal json2csv function
            }
        });
    },

    
    /**
     * Client accessible csv2json function
     * Takes a string of CSV to be converted to a JSON document array, a callback that will be called
     * with (err, json) after processing is complete, and optional options
     * @param csv
     * @param callback
     * @param opts
     */
    csv2json: function (csv, callback, opts) {
        // If this was promisified (callback and opts are swapped) then fix the argument order.
        if (_.isObject(callback) && !_.isFunction(callback)) {
            var func = opts;
            opts = callback;
            callback = func;
        }

        buildOptions(opts, function (err, options) { // Build the options
            if (err) {
                return callback(err);
            } else {
                csv2Json.csv2json(options, csv, callback); // Call our internal csv2json function
            }
        });
    }
};
