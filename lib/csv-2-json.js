'use strict';

var _ = require('underscore'),
    constants = require('./constants');

var options = {}; // Initialize the options - this will be populated when the csv2json function is called.

/**
 * Generate the JSON heading from the CSV
 * @param lines
 * @param callback
 * @returns {*}
 */
var retrieveHeading = function (lines, callback) {
    if (!lines.length) { // If there are no lines passed in, then throw an error
        return callback(new Error(constants.Errors.csv2json.noDataRetrieveHeading)); // Pass an error back to the user
    }

    var heading = _.map(lines[0].split(options.DELIMITER.FIELD),
        function (headerKey, index) {
            return {
                value: headerKey,
                index: index
            };
        });
    return heading;
};

/**
 * Add a nested key and its value in the given document
 * @param key String
 * @param value String
 * @param doc Object
 * @returns {*}
 */
var addNestedKey = function (key, value, doc) {
    var subDocumentRoot = doc, // This is the document that we will be using to add the nested keys to.
        trackerDocument = subDocumentRoot, // This is the document that will use to iterate through the subDocument, starting at the root
        nestedKeys = key.split('.'), // Array of all keys and sub keys for the document
        finalKey = nestedKeys.pop(); // Retrieve the last sub key.
    _.each(nestedKeys, function (nestedKey) {
        if (trackerDocument[nestedKey]) { // This nestedKey already exists, use an existing doc
            trackerDocument = trackerDocument[nestedKey]; // Update the trackerDocument to use the existing document
        } else {
            trackerDocument[nestedKey] = {}; // Add document at the current subKey
            trackerDocument = trackerDocument[nestedKey]; // Update trackerDocument to be the added doc for the subKey
        }
    });
    trackerDocument[finalKey] = value; // Set the final layer key to the value
    return subDocumentRoot; // Return the document with the nested document structure setup
};

/**
 * Does the given value represent an array?
 * @param value
 * @returns {boolean}
 */
var isArrayRepresentation = function (value) {
    return (value && value.indexOf('[') === 0 && value.lastIndexOf(']') === value.length-1);
};

/**
 * Converts the value from a CSV 'array'
 * @param val
 * @returns {Array}
 */
var convertArrayRepresentation = function (val) {
    val = _.filter(val.substring(1, val.length-1).split(options.DELIMITER.ARRAY), function (value) {
        return value;
    });
    _.each(val, function (value, indx) {
        if (isArrayRepresentation(value)) {
            val[indx] = convertArrayRepresentation(value);
        }
    });
    return val;
};

/**
 * Create a JSON document with the given keys (designated by the CSV header)
 *   and the values (from the given line)
 * @param keys String[]
 * @param line String
 * @returns {Object} created json document
 */
var createDoc = function (keys, line) {
    if (line == '') { return false; } // If we have an empty line, then return false so we can remove all blank lines (falsy values)
    var doc = {}, // JSON document to start with and manipulate
        val,      // Temporary variable to set the current key's value to
        line = line.trim().split(options.DELIMITER.FIELD); // Split the line using the given field delimiter after trimming whitespace
    _.each(keys, function (key, indx) {
        val = line[key.index] === '' ? null : line[key.index];
        if (isArrayRepresentation(val)) {
            val = convertArrayRepresentation(val);
        }
        if (key.value.indexOf('.')) { // If key has '.' representing nested document
            doc = addNestedKey(key.value, val, doc); // Update the document to add the nested key structure
        } else { // Else we just have a straight key:value mapping
            doc[key] = val; // Set the value at the current key
        }
    });
    return doc; // Return the created document
};

/**
 * Main helper function to convert the CSV to the JSON document array
 * @param lines String[]
 * @param callback Function callback function
 * @returns {Array}
 */
var convertCSV = function (lines, callback) {
    var generatedHeaders = retrieveHeading(lines, callback), // Retrieve the headings from the CSV, unless the user specified the keys
        jsonDocs = [], // Create an array that we can add the generated documents to
        headers = options.KEYS ? _.filter(generatedHeaders, function (headerKey) {
            return _.contains(options.KEYS, headerKey.value);
        }) : generatedHeaders;
    lines = lines.splice(1); // Grab all lines except for the header
    _.each(lines, function (line) { // For each line, create the document and add it to the array of documents
        jsonDocs.push(createDoc(headers, line));
    });
    return _.filter(jsonDocs, function (doc) { return doc !== false; }); // Return all non 'falsey' values to filter blank lines
};

module.exports = {

    /**
     * Internally exported csv2json function
     * Takes options as a document, data as a CSV string, and a callback that will be used to report the results
     * @param opts Object options object
     * @param data String csv string
     * @param callback Function callback function
     */
    csv2json: function (opts, data, callback) {
        // If a callback wasn't provided, throw an error
        if (!callback) { throw new Error(constants.Errors.callbackRequired); }

        // Shouldn't happen, but just in case
        if (!opts) { return callback(new Error(constants.Errors.optionsRequired)); return null; }
        options = opts; // Options were passed, set the global options value

        // If we don't receive data, report an error
        if (!data) { return callback(new Error(constants.Errors.csv2json.cannotCallCsv2JsonOn + data + '.')); return null; }

        // The data provided is not a string
        if (!_.isString(data)) {
            return callback(new Error(constants.Errors.csv2json.csvNotString)); // Report an error back to the caller
        }

        // Split the CSV into lines using the specified EOL option
        var lines = data.split(options.EOL),
            json = convertCSV(lines, callback); // Retrieve the JSON document array
        return callback(null, json); // Send the data back to the caller
    }

};