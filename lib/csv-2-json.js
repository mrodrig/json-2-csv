'use strict';

var _ = require('underscore'),
    async = require('async');

var options = {};

var retrieveHeading = function (lines, callback) {
    if (!lines.length) {
        callback(new Error("No data provided to retrieve heading.")); // Error - no data
    }
    var heading = lines[0]; // Grab the top line (header line)
    return heading.split(options.DELIMITER); // Return the heading split by the field options.DELIMITER
};

var addNestedKey = function (key, value, doc) {
    var subDocumentRoot = doc, // This is the document that we will be using to add the nested keys to.
        trackerDocument = subDocumentRoot, // This is the document that will recur through the subDocument, starting at the Root
        nestedKeys = key.split('.'),
        finalKey = nestedKeys.pop();
    _.each(nestedKeys, function (nestedKey) {
        if (doesKeyExist(nestedKey, trackerDocument)) { // this nestedKey already exists, use existing doc
            trackerDocument = trackerDocument[nestedKey];
        } else {
            trackerDocument[nestedKey] = {}; // Add document at key
            trackerDocument = trackerDocument[nestedKey]; // Updated subDoc to be the added doc for the nestedKey
        }
    });
    trackerDocument[finalKey] = value;
    return subDocumentRoot;
};

var doesKeyExist = function (key, doc) {
    return (typeof doc[key] !== 'undefined');
}

var createDoc = function (keys, line, callback) {
    var doc = {},
        val,
        line = line.trim().split(options.DELIMITER);
    if (line == '') { return false; }
    if (keys.length !== line.length) {
        callback(new Error("Not every line has a correct number of values.")); // This line doesn't have the same # vals as the header
    }
    _.each(keys, function (key, indx) {
        val = line[indx] === '' ? null : line[indx];
        if (key.indexOf('.')) { // Key has '.' representing nested document
            doc = addNestedKey(key, val, doc); // Update the doc
        } else {
            doc[key] = val;
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

    csv2json: function (opts, data, callback) {
        if (!callback) { throw new Error('A callback is required!'); }
        if (!opts) { callback(new Error('Options were not passed and are required.')); return null; } // Shouldn't happen, but just in case
        else { options = opts; }
        if (!data) { callback(new Error('Cannot call csv2json on ' + data)); return null; }
        if (typeof data !== 'string') { // CSV is not a string
            callback(new Error("CSV is not a string"));
        }
        var lines = data.split(options.EOL);
        var json = convertCSV(lines, callback);
        callback(null, json);
    }

};
