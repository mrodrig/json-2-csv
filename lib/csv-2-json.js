'use strict';

var _ = require('underscore'),
    async = require('async');

var options = {}; // Initialize the options - this will be populated when the csv2json function is called.

// Generate the JSON heading from the CSV
var retrieveHeading = function (lines, callback) {
    if (!lines.length) { // If there are no lines passed in, then throw an error
        return callback(new Error("No data provided to retrieve heading.")); // Pass an error back to the user
    }
    var heading = lines[0]; // Grab the top line (header line)
    return heading.split(options.DELIMITER.FIELD); // Return the heading split by the field delimiter
};

// Add a nested key and its value in the given document
var addNestedKey = function (key, value, doc) {
    var subDocumentRoot = doc, // This is the document that we will be using to add the nested keys to.
        trackerDocument = subDocumentRoot, // This is the document that will use to iterate through the subDocument, starting at the root
        nestedKeys = key.split('.'), // Array of all keys and sub keys for the document
        finalKey = nestedKeys.pop(); // Retrieve the last sub key.
    _.each(nestedKeys, function (nestedKey) {
        if (keyExists(nestedKey, trackerDocument)) { // This nestedKey already exists, use an existing doc
            trackerDocument = trackerDocument[nestedKey]; // Update the trackerDocument to use the existing document
        } else {
            trackerDocument[nestedKey] = {}; // Add document at the current subKey
            trackerDocument = trackerDocument[nestedKey]; // Update trackerDocument to be the added doc for the subKey
        }
    });
    trackerDocument[finalKey] = value; // Set the final layer key to the value
    return subDocumentRoot; // Return the document with the nested document structure setup
};

// Helper function to check if the given key already exists in the given document
var keyExists = function (key, doc) {
    return (typeof doc[key] !== 'undefined'); // If the key doesn't exist, then the type is 'undefined'
};

var isArrayRepresentation = function (value) {
    return (value && value.indexOf('[') === 0 && value.lastIndexOf(']') === value.length-1);
};

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

// Create a JSON document with the given keys (designated by the CSV header) and the values (from the given line)
var createDoc = function (keys, line, callback) {
    var doc = {}, // JSON document to start with and manipulate
        val,      // Temporary variable to set the current key's value to
        line = line.trim().split(options.DELIMITER.FIELD); // Split the line using the given field delimiter after trimming whitespace
    if (line == '') { return false; } // If we have an empty line, then return false so we can remove all blank lines (falsy values)
    if (keys.length !== line.length) { // If the number of keys is different than the number of values in the current line
        return callback(new Error("Not every line has a correct number of values.")); // Pass the error back to the client
    }
    _.each(keys, function (key, indx) {
        val = line[indx] === '' ? null : line[indx];
        if (isArrayRepresentation(val)) {
            val = convertArrayRepresentation(val);
        }
        if (key.indexOf('.')) { // If key has '.' representing nested document
            doc = addNestedKey(key, val, doc); // Update the document to add the nested key structure
        } else { // Else we just have a straight key:value mapping
            doc[key] = val; // Set the value at the current key
        }
    });
    return doc; // Return the created document
};

// Main wrapper function to convert the CSV to the JSON document array
var convertCSV = function (lines, callback) {
    var headers = retrieveHeading(lines, callback), // Retrieve the headings from the CSV
        jsonDocs = []; // Create an array that we can add the generated documents to
    lines = lines.splice(1); // Grab all lines except for the header
    _.each(lines, function (line) { // For each line, create the document and add it to the array of documents
        jsonDocs.push(createDoc(headers, line));
    });
    return _.filter(jsonDocs, function (doc) { return doc !== false; });; // Return all non 'falsey' values to filter blank lines
};

module.exports = {
    
    // Function to export internally
    // Takes options as a document, data as a CSV string, and a callback that will be used to report the results
    csv2json: function (opts, data, callback) {
        if (!callback) { throw new Error('A callback is required!'); } // If a callback wasn't provided, throw an error
        if (!opts) { callback(new Error('Options were not passed and are required.')); return null; } // Shouldn't happen, but just in case
        else { options = opts; } // Options were passed, set the global options value
        if (!data) { callback(new Error('Cannot call csv2json on ' + data + '.')); return null; } // If we don't receive data, report an error
        if (typeof data !== 'string') { // The data is not a string
            callback(new Error("CSV is not a string.")); // Report an error back to the caller
        }
        var lines = data.split(options.EOL); // Split the CSV into lines using the specified EOL option
        var json = convertCSV(lines, callback); // Retrieve the JSON document array
        callback(null, json); // Send the data back to the caller
    }

};
