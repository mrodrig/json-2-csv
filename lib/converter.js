'use strict';

var json2Csv = require('./json-2-csv'), // Require our json-2-csv code
    csv2Json = require('./csv-2-json'), // Require our csv-2-json code
    _ = require('underscore'); // Require underscore

// Default options; By using a function this is essentially a 'static' variable
var defaultOptions = {
    DELIMITER         : {
        FIELD  :  ',',
        ARRAY  :  ';',
        WRAP   :  ''
    },
    EOL               : '\n',
    PARSE_CSV_NUMBERS : false
};

// Build the options to be passed to the appropriate function
// If a user does not provide custom options, then we use our default
// If options are provided, then we set each valid key that was passed
var buildOptions = function (opts, cb) {
    opts = opts ? opts : {}; // If undefined, set to an empty doc
    var out = _.defaults(opts, defaultOptions);
    // If the delimiter fields are the same, report an error to the caller
    if (out.DELIMITER.FIELD === out.DELIMITER.ARRAY) { return cb(new Error('The field and array delimiters must differ.')); }
    // Otherwise, send the options back
    else { return cb(null, out); }
};

// Export the following functions that will be client accessible
module.exports = {

    // Client accessible json2csv function
    // Takes an array of JSON documents to be converted,
    // a callback that will be called with (err, csv) after
    // processing is completed, and optional options
    json2csv: function (array, callback, opts) {
        buildOptions(opts, function (err, options) { // Build the options
            if (err) {
                return callback(err);
            } else {
                json2Csv.json2csv(options, array, callback); // Call our internal json2csv function
            }
        });
    },

    
    // Client accessible csv2json function
    // Takes a string of CSV to be converted to a JSON document array,
    // a callback that will be called with (err, csv) after
    // processing is completed, and optional options
    csv2json: function (csv, callback, opts) {
        buildOptions(opts, function (err, options) { // Build the options
            if (err) {
                return callback(err);
            } else {
                csv2Json.csv2json(options, csv, callback); // Call our internal csv2json function
            }
        });
    }
};
