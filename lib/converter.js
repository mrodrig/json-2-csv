'use strict';

var json2Csv = require('./json-2-csv'),
    csv2Json = require('./csv-2-json'),
    _ = require('underscore');

var OPTIONS = function () { // Ensures fields don't change from our defaults
    return {
        DELIMITER         : ',',
        EOL               : '\n',
        PARSE_CSV_NUMBERS : false
    };
}

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

module.exports = {

    json2csv: function (array, callback, opts) {
        opts = buildOptions(opts);
        json2Csv.json2csv(opts, array, callback);
    },

    csv2json: function (csv, callback, opts) {
        opts = buildOptions(opts);
        csv2Json.csv2json(opts, csv, callback);
    }

};
