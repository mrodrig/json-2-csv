'use strict';

var _ = require('underscore'),
    async = require('async');

var DELIMITER = ',',
    EOL = '\n';

var retrieveHeading = function (lines, callback) {
    if (!lines.length) {
        callback(new Error("No data provided to retrieve heading.")); // Error - no data
    }
    var heading = lines[0]; // Grab the top line (header line)
    return heading.split(DELIMITER); // Return the heading split by the field delimiter
};

var createDoc = function (keys, line, callback) {
    var doc = {},
        line = line.trim().split(DELIMITER);
    if (line == '') { return false; }
    if (keys.length !== line.length) {
        callback(new Error("Not every line has a correct number of values.")); // This line doesn't have the same # vals as the header
    }
    _.each(keys, function (key, indx) {
        if (key.indexOf('.')) { // Key has '.' representing nested document
            var subDoc = doc,
                nestedKeys = key.split('.'),
                finalKey = nestedKeys.pop();
            _.each(nestedKeys, function (nestedKey) {
                subDoc[nestedKey] = {}; // Add document at key
                subDoc = subDoc[nestedKey]; // Updated subDoc to be the added doc for the nestedKey
            });
            subDoc[finalKey] = line[indx];
            doc = subDoc; // Update the doc
        } else {
            doc[key] = line[indx];
        }
    });
    return doc;
};

var convertCSV = function (lines, callback) {
    var headers = retrieveHeading(lines, callback),
        jsonDocs = [];
    lines = lines.splice(1); // Grab all lines except for the header
    _.each(lines, function (line) {
        jsonDocs.push(createDoc(headers, line));
    });
    return _.filter(jsonDocs, function (doc) { return doc !== false; });;
};

module.exports = {

    csv2json: function (data, callback) {
        if (!callback) { callback(new Error('A callback is required!')); }
        if (!data) { callback(new Error('Cannot call csv2json on ' + data)); }
        if (typeof data !== 'string') { // CSV is not a string
            callback(new Error("CSV is not a string"));
        }
        var lines = data.split(EOL);
        console.log('json', convertCSV(lines, callback));
        callback(null, convertCSV(lines, callback));
    }

};
