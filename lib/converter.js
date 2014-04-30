'use strict';

var json2Csv = require('./json-2-csv'), // Require our json-2-csv code
    csv2Json = require('./csv-2-json'), // Require our csv-2-json code
    _ = require('underscore'); // Require underscore

// Default options; By using a function this is essentially a 'static' variable
var OPTIONS = function () {
    return {
        DELIMITER         : ',',
        EOL               : '\n',
        PARSE_CSV_NUMBERS : false
    };
}

// Build the options to be passed to the appropriate function
// If a user does not provide custom options, then we use our default
// If options are provided, then we set each valid key that was passed
var buildOptions = function (opts) {
    var out = _.extend(OPTIONS(), {});
    if (!opts) { return out; } // If undefined or null, return defaults
    _.each(_.keys(opts), function (key) {
        if (out[key]) { // If key is valid, set it
            out[key] = opts[key];
        } // Else ignore its value
    });
    return out; // Return customized version
};

// Export the following functions that will be client accessible
module.exports = {

    // Client accessible json2csv function
    // Takes an array of JSON documents to be converted,
    // a callback that will be called with (err, csv) after
    // processing is completed, and optional options
    json2csv: function (array, callback, opts) {
        opts = buildOptions(opts); // Build the options
        json2Csv.json2csv(opts, array, callback); // Call our internal json2csv function
    },

    
    // Client accessible csv2json function
    // Takes a string of CSV to be converted to a JSON document array,
    // a callback that will be called with (err, csv) after
    // processing is completed, and optional options
    csv2json: function (csv, callback, opts) {
        opts = buildOptions(opts);
        csv2Json.csv2json(opts, csv, callback);
    }

};
