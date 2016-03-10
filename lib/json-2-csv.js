'use strict';

var _ = require('underscore'),
    constants = require('./constants.json'),
    path = require('doc-path'),
    promise = require('bluebird');

var options = {}; // Initialize the options - this will be populated when the json2csv function is called.

/**
 * Retrieve the headings for all documents and return it.
 * This checks that all documents have the same schema.
 * @param data
 * @returns {promise}
 */
var generateHeading = function(data) {
    if (options.KEYS) { return promise.resolve(options.KEYS); }

    var keys = _.map(data, function (document, indx) { // for each key
        if (_.isObject(document)) {
            // if the data at the key is a document, then we retrieve the subHeading starting with an empty string heading and the doc
            return generateDocumentHeading('', document);
        }
    });
    
    var uniqueKeys = [];

    // If the user wants to check for the same schema:
    if (options.CHECK_SCHEMA_DIFFERENCES) {
        // Check for a consistent schema that does not require the same order:
        // if we only have one document - then there is no possibility of multiple schemas
        if (keys && keys.length <= 1) {
            return promise.resolve(_.flatten(keys) || []);
        }
        // else - multiple documents - ensure only one schema (regardless of field ordering)
        var firstDocSchema = _.flatten(keys[0]),
            schemaDifferences = 0;

        _.each(keys, function (keyList) {
            // If there is a difference between the schemas, increment the counter of schema inconsistencies
            var diff = _.difference(firstDocSchema, _.flatten(keyList));
            if (!_.isEqual(diff, [])) {
                schemaDifferences++;
            }
        });

        // If there are schema inconsistencies, throw a schema not the same error
        if (schemaDifferences) {
            return promise.reject(new Error(constants.Errors.json2csv.notSameSchema));
        }


        uniqueKeys = _.flatten(keys[0]);
    } else {
        // Otherwise, we do not care if the schemas are different, so we should merge them via union:
        _.each(keys, function (keyList) {
            uniqueKeys = _.union(uniqueKeys, _.flatten(keyList));
        });
    }
    
    if (options.SORT_HEADER) {
        uniqueKeys.sort();
    }

    return promise.resolve(uniqueKeys);
};

/**
 * Takes the parent heading and this doc's data and creates the subdocument headings (string)
 * @param heading
 * @param data
 * @returns {Array}
 */
var generateDocumentHeading = function(heading, data) {
    var keyName = ''; // temporary variable to aid in determining the heading - used to generate the 'nested' headings

    var documentKeys = _.map(_.keys(data), function (currentKey) {
        // If the given heading is empty, then we set the heading to be the subKey, otherwise set it as a nested heading w/ a dot
        keyName = heading ? heading + '.' + currentKey : currentKey;

        // If we have another nested document, recur on the sub-document to retrieve the full key name
        if (_.isObject(data[currentKey]) && !_.isNull(data[currentKey]) && !_.isArray(data[currentKey]) && _.keys(data[currentKey]).length) {
            return generateDocumentHeading(keyName, data[currentKey]);
        }
        // Otherwise return this key name since we don't have a sub document
        return keyName;
    });
    
    return documentKeys; // Return the headings in an array
};

/**
 * Convert the given data with the given keys
 * @param data
 * @param keys
 * @returns {Array}
 */
var 
convertData = function (data, keys) {
    // Reduce each key in the data to its CSV value
    return _.reduce(keys, function (output, key) {
        // Retrieve the appropriate field data
        var fieldData = path.evaluatePath(data, key);
        if (_.isUndefined(fieldData)) { fieldData = options.EMPTY_FIELD_VALUE; }
        // Add the CSV representation of the data at the key in the document to the output array
        return output.concat(convertField(fieldData));
    }, []);
};

/**
 * Convert the given value to the CSV representation of the value
 * @param value
 * @param output
 */
var convertField = function (value) {
    if (_.isArray(value)) { // We have an array of values
        var result = [];
        value.forEach(function(item) {
            if (_.isObject(item)) {
                // use JSON stringify to convert objects in arrays, otherwise toString() will just return [object Object]
                result.push(JSON.stringify(item));
            } else {
                result.push(convertValue(item));
            }
        });
        return options.DELIMITER.WRAP + '[' + result.join(options.DELIMITER.ARRAY) + ']' + options.DELIMITER.WRAP;
    } else if (_.isDate(value)) { // If we have a date
        return options.DELIMITER.WRAP + convertValue(value) + options.DELIMITER.WRAP;
    } else if (_.isObject(value)) { // If we have an object
        return options.DELIMITER.WRAP + convertData(value, _.keys(value)) + options.DELIMITER.WRAP; // Push the recursively generated CSV
    } else if (_.isNumber(value)) { // If we have a number (avoids 0 being converted to '')
        return options.DELIMITER.WRAP + convertValue(value) + options.DELIMITER.WRAP;
    } else if (_.isBoolean(value)) { // If we have a boolean (avoids false being converted to '')
        return options.DELIMITER.WRAP + convertValue(value) + options.DELIMITER.WRAP;
    }
    return options.DELIMITER.WRAP + convertValue(value) + options.DELIMITER.WRAP; // Otherwise push the current value
};

var convertValue = function (val) {
    // Convert to string
    val = _.isNull(val) || _.isUndefined(val) ? '' : val.toString();
    
    // Trim, if necessary, and return the correct value
    return options.TRIM_FIELD_VALUES ? val.trim() : val;
};

/**
 * Generate the CSV representing the given data.
 * @param data
 * @param headingKeys
 * @returns {*}
 */
var generateCsv = function (data, headingKeys) {
    // Reduce each JSON document in data to a CSV string and append it to the CSV accumulator
    return [headingKeys].concat(_.reduce(data, function (csv, doc) {
        return csv += convertData(doc, headingKeys).join(options.DELIMITER.FIELD) + options.DELIMITER.EOL;
    }, ''));
};

module.exports = {

    /**
     * Internally exported json2csv function
     * Takes options as a document, data as a JSON document array, and a callback that will be used to report the results
     * @param opts Object options object
     * @param data String csv string
     * @param callback Function callback function
     */
    json2csv: function (opts, data, callback) {
        // If a callback wasn't provided, throw an error
        if (!callback) { throw new Error(constants.Errors.callbackRequired); }

        // Shouldn't happen, but just in case
        if (!opts) { return callback(new Error(constants.Errors.optionsRequired)); }
        options = opts; // Options were passed, set the global options value

        // If we don't receive data, report an error
        if (!data) { return callback(new Error(constants.Errors.json2csv.cannotCallJson2CsvOn + data + '.')); }

        // If the data was not a single document or an array of documents
        if (!_.isObject(data)) {
            return callback(new Error(constants.Errors.json2csv.dataNotArrayOfDocuments));  // Report the error back to the caller
        }
        // Single document, not an array
        else if (_.isObject(data) && !data.length) {
            data = [data]; // Convert to an array of the given document
        }

        // Retrieve the heading and then generate the CSV with the keys that are identified
        generateHeading(data)
            .then(_.partial(generateCsv, data))
            .spread(function (csvHeading, csvData) {
                // If the fields are supposed to be wrapped... (only perform this if we are actually prepending the header)
                if (options.DELIMITER.WRAP && options.PREPEND_HEADER) {
                    csvHeading = _.map(csvHeading, function(headingKey) {
                        return options.DELIMITER.WRAP + headingKey + options.DELIMITER.WRAP;
                    });
                }
                
                if (options.TRIM_HEADER_FIELDS) {
                    csvHeading = _.map(csvHeading, function (headingKey) {
                        return headingKey.trim();
                    });
                }
                
                // If we are prepending the header, then join the csvHeading fields
                if (options.PREPEND_HEADER) {
                    csvHeading = csvHeading.join(options.DELIMITER.FIELD);
                }

                // If we are prepending the header, then join the header and data by EOL, otherwise just return the data
                return callback(null, options.PREPEND_HEADER ? csvHeading + options.DELIMITER.EOL + csvData : csvData);
            })
            .catch(function (err) {
                return callback(err);
            });
    }

};
