'use strict';

var _ = require('underscore'),
    async = require('async');

var options = {}; // Initialize the options - this will be populated when the csv2json function is called.

// Takes the parent heading and this doc's data and creates the subdocument headings (string)
var retrieveSubHeading = function (heading, data) {
    var subKeys = _.keys(data), // retrieve the keys from the current document
        newKey; // temporary variable to aid in determining the heading - used to generate the 'nested' headings
    _.each(subKeys, function (subKey, indx) {
        // If the given heading is empty, then we set the heading to be the subKey, otherwise set it as a nested heading w/ a dot
        newKey = heading === '' ? subKey : heading + '.' + subKey;
        if (typeof data[subKey] === 'object' && data[subKey] !== null && typeof data[subKey].length === 'undefined' && _.keys(data[subKey]).length > 0) { // If we have another nested document
            subKeys[indx] = retrieveSubHeading(newKey, data[subKey]); // Recur on the subdocument to retrieve the full key name
        } else {
            subKeys[indx] = (options.DELIMITER.WRAP || '') + (newKey || '') + (options.DELIMITER.WRAP || ''); // Set the key name since we don't have a sub document
        }
    });
    return subKeys.join(options.DELIMITER.FIELD); // Return the headings joined by our field delimiter
};

// Retrieve the headings for all documents and return it.  This checks that all documents have the same schema.
var retrieveHeading = function (data) {
    return function (cb) { // Returns a function that takes a callback - the function is passed to async.parallel
        var keys = _.keys(data); // Retrieve the current data keys
        _.each(keys, function (key, indx) { // for each key
            if (typeof data[key] === 'object') {
                // if the data at the key is a document, then we retrieve the subHeading starting with an empty string heading and the doc
                keys[indx] = retrieveSubHeading('', data[key]);
            }
        });
        // Retrieve the unique array of headings (keys)
        keys = _.uniq(keys);
        // If we have more than 1 unique list, then not all docs have the same schema - report an error
        if (keys.length > 1) { throw new Error('Not all documents have the same schema.', keys); }
        return cb(null, _.flatten(keys).join(options.DELIMITER.FIELD)); // Return headings back
    };
};

// Convert the given data with the given keys
var convertData = function (data, keys) {
    var output = [], // Array of CSV representing converted docs
        value; // Temporary variable to store the current data
    _.each(keys, function (key, indx) { // For each key
        value = data[key]; // Set the current data that we are looking at
        if (keys.indexOf(key) > -1) { // If the keys contain the current key, then process the data
            if (typeof value === 'object' && value !== null && typeof value.length === 'undefined') { // If we have an object
                output.push(convertData(value, _.keys(value))); // Push the recursively generated CSV
            } else if (typeof value === 'object' && value !== null && typeof value.length === 'number') { // We have an array of values
                output.push((options.DELIMITER.WRAP || '') + '[' + value.join(options.DELIMITER.ARRAY) + ']' + (options.DELIMITER.WRAP || ''));
            } else {
                value = value == null ? '' : value;
                output.push((options.DELIMITER.WRAP || '') + value + (options.DELIMITER.WRAP || '')); // Otherwise push the current value
            }
        }
    });
    return output.join(options.DELIMITER.FIELD); // Return the data joined by our field delimiter
};

// Generate the CSV representing the given data.
var generateCsv = function (data) {
    return function (cb) { // Returns a function that takes a callback - the function is passed to async.parallel
        // Reduce each JSON document in data to a CSV string and append it to the CSV accumulator
        return cb(null, _.reduce(data, function (csv, doc) { return csv += convertData(doc, _.keys(doc)) + options.EOL; }, ''));
    };
};

module.exports = {

    // Function to export internally
    // Takes options as a document, data as a JSON document array, and a callback that will be used to report the results
    json2csv: function (opts, data, callback) {
        if (!callback) { throw new Error('A callback is required!'); } // If a callback wasn't provided, throw an error
        if (!opts) { callback(new Error('Options were not passed and are required.')); return null; } // Shouldn't happen, but just in case
        else { options = opts; } // Options were passed, set the global options value
        if (!data) { callback(new Error('Cannot call json2csv on ' + data + '.')); return null; } // If we don't receive data, report an error
        if (typeof data !== 'object') { // If the data was not a single document or an array of documents
            return cb(new Error('Data provided was not an array of documents.'));  // Report the error back to the caller
        } else if (typeof data === 'object' && !data.length) { // Single document, not an array
            data = [data]; // Convert to an array of the given document
        }
        // Retrieve the heading and the CSV asynchronously in parallel
        async.parallel([retrieveHeading(data), generateCsv(data)], function (err, res) {
            if (!err) {
                // Data received with no errors, join the two responses with an end of line delimiter to setup heading and CSV body
                return callback(null, res.join(options.EOL));
            } else {
                return callback(err, null); // Report received error back to caller
            }
        });
    }

};
