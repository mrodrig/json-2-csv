'use strict';

var _ = require('underscore'),
    async = require('async');

var options = {}; // Initialize the options - this will be populated when the json2csv function is called.

// Retrieve the headings for all documents and return it.  This checks that all documents have the same schema.
var generateHeading = function(data, cb) {
    var keys = _.map(_.keys(data), function (key, indx) { // for each key
        if (_.isObject(data[key])) {
            // if the data at the key is a document, then we retrieve the subHeading starting with an empty string heading and the doc
            return generateSubHeading('', data[key]);
        }
        return key;
    });

    // TODO: check for consistent schema

    keys = _.map(keys, function(keyList) {
        return _.flatten(keyList).join(options.DELIMITER.FIELD);
    });

    // Retrieve the unique array of headings (keys)
    keys = _.uniq(keys);

    // If we have more than 1 unique list, then not all docs have the same schema - report an error
    if (keys.length > 1) { throw new Error('Not all documents have the same schema.', keys); }

    return cb(null, keys);
};

// Takes the parent heading and this doc's data and creates the subdocument headings (string)
var generateSubHeading = function(heading, data) {
    var subKeys, // retrieve the keys from the current document
        newKey = ''; // temporary variable to aid in determining the heading - used to generate the 'nested' headings

    subKeys = _.map(_.keys(data), function (subKey) {
        // If the given heading is empty, then we set the heading to be the subKey, otherwise set it as a nested heading w/ a dot
        newKey = heading === '' ? subKey : heading + '.' + subKey;
        if (_.isObject(data[subKey]) && !_.isNull(data[subKey]) && _.isUndefined(data[subKey].length) && _.keys(data[subKey]).length > 0) { // If we have another nested document
            return generateSubHeading(newKey, data[subKey]); // Recur on the sub-document to retrieve the full key name
        } else {
            return options.DELIMITER.WRAP + newKey + options.DELIMITER.WRAP; // Set the key name since we don't have a sub document
        }
    });

    return subKeys; // Return the headings joined by our field delimiter
};

// Convert the given data with the given keys
var convertData = function (data, keys) {
    var output = [], // Array of CSV representing converted docs
        value; // Temporary variable to store the current data
    _.each(keys, function (key, indx) { // For each key
        value = data[key]; // Set the current data that we are looking at
        if (keys.indexOf(key) > -1) { // If the keys contain the current key, then process the data
            if (_.isArray(value)) { // We have an array of values
                output.push((options.DELIMITER.WRAP || '') + '[' + value.join(options.DELIMITER.ARRAY) + ']' + (options.DELIMITER.WRAP || ''));
            } else if (_.isDate(value)) { // If we have a date
                output.push(value.toString());
            } else if (_.isObject(value)) { // If we have an object
                output.push(convertData(value, _.keys(value))); // Push the recursively generated CSV
            } else {
                value = value == null ? '' : value.toString();
                output.push((options.DELIMITER.WRAP || '') + value + (options.DELIMITER.WRAP || '')); // Otherwise push the current value
            }
        }
    });
    return output.join(options.DELIMITER.FIELD); // Return the data joined by our field delimiter
};

// Generate the CSV representing the given data.
var generateCsv = function (data, cb) {
    // Reduce each JSON document in data to a CSV string and append it to the CSV accumulator
    return cb(null, _.reduce(data, function (csv, doc) { return csv += convertData(doc, _.keys(doc)) + options.EOL; }, ''));
};

module.exports = {

    // Function to export internally
    // Takes options as a document, data as a JSON document array, and a callback that will be used to report the results
    json2csv: function (opts, data, callback) {
        if (!callback) { throw new Error('A callback is required!'); } // If a callback wasn't provided, throw an error
        if (!opts) { return callback(new Error('Options were not passed and are required.')); } // Shouldn't happen, but just in case
        else { options = opts; } // Options were passed, set the global options value
        if (!data) { return callback(new Error('Cannot call json2csv on ' + data + '.')); } // If we don't receive data, report an error
        if (!_.isObject(data)) { // If the data was not a single document or an array of documents
            return callback(new Error('Data provided was not an array of documents.'));  // Report the error back to the caller
        } else if (_.isObject(data) && !data.length) { // Single document, not an array
            data = [data]; // Convert to an array of the given document
        }

        // Retrieve the heading and the CSV asynchronously in parallel
        async.parallel([_.partial(generateHeading, data), _.partial(generateCsv, data)], function (err, res) {
            if (!err) {
                // Data received with no errors, join the two responses with an end of line delimiter to setup heading and CSV body
                return callback(null, res.join(options.EOL));
            } else {
                return callback(err, null); // Report received error back to caller
            }
        });
    }

};
