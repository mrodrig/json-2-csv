'use strict';

let _ = require('underscore'),
    constants = require('./constants.json'),
    path = require('doc-path'),
    key = require('deeks'),
    promise = require('bluebird');

const Json2Csv = function (options) {

    /**
     * Retrieve the headings for all documents and return it.
     * This checks that all documents have the same schema.
     * @param data
     * @returns {promise}
     */
    function generateHeading(data) {
        if (options.keys) { return promise.resolve(options.keys); }

        let keys = key.deepKeysFromList(data);

        let uniqueKeys = [];

        // If the user wants to check for the same schema:
        if (options.checkSchemaDifferences) {
            // Check for a consistent schema that does not require the same order:
            // if we only have one document - then there is no possibility of multiple schemas
            if (keys && keys.length <= 1) {
                return promise.resolve(_.flatten(keys) || []);
            }
            // else - multiple documents - ensure only one schema (regardless of field ordering)
            let firstDocSchema = keys[0],
                schemaDifferences = 0;

            _.each(keys, function (keys) {
                // If there is a difference between the schemas, increment the counter of schema inconsistencies
                let diff = _.difference(firstDocSchema, _.flatten(keys));
                if (!_.isEqual(diff, [])) {
                    schemaDifferences++;
                }
            });

            // If there are schema inconsistencies, throw a schema not the same error
            if (schemaDifferences) {
                return promise.reject(new Error(constants.errors.json2csv.notSameSchema));
            }


            uniqueKeys = keys[0];
        } else {
            // Otherwise, we do not care if the schemas are different, so we should merge them via union:
            _.each(keys, function (keys) {
                uniqueKeys = _.union(uniqueKeys, _.flatten(keys));
            });
        }

        if (options.sortHeader) {
            uniqueKeys.sort();
        }

        return promise.resolve(uniqueKeys);
    }

    /**
     * Convert the given data with the given keys
     * @param data
     * @param keys
     * @returns {Array}
     */
    function convertData(data, keys) {
        // Reduce each key in the data to its CSV value
        return _.reduce(keys, function (output, key) {
            // Retrieve the appropriate field data
            let fieldData = path.evaluatePath(data, key);
            if (_.isUndefined(fieldData)) { fieldData = options.emptyFieldValue; }
            // Add the CSV representation of the data at the key in the document to the output array
            return output.concat(convertField(fieldData, options));
        }, []);
    }

    /**
     * Convert the given value to the CSV representation of the value
     * @param value
     */
    function convertField(value) {
        if (_.isArray(value)) { // We have an array of values
            let result = [];
            value.forEach(function(item) {
                if (_.isObject(item)) {
                    // use JSON stringify to convert objects in arrays, otherwise toString() will just return [object Object]
                    result.push(JSON.stringify(item));
                } else {
                    result.push(convertValue(item, options));
                }
            });
            return options.delimiter.wrap + '[' + result.join(options.delimiter.array) + ']' + options.delimiter.wrap;
        } else if (_.isDate(value)) { // If we have a date
            return options.delimiter.wrap + convertValue(value, options) + options.delimiter.wrap;
        } else if (_.isObject(value)) { // If we have an object
            return options.delimiter.wrap + convertData(value, _.keys(value), options) + options.delimiter.wrap; // Push the recursively generated CSV
        } else if (_.isNumber(value)) { // If we have a number (avoids 0 being converted to '')
            return options.delimiter.wrap + convertValue(value, options) + options.delimiter.wrap;
        } else if (_.isBoolean(value)) { // If we have a boolean (avoids false being converted to '')
            return options.delimiter.wrap + convertValue(value, options) + options.delimiter.wrap;
        }
        value = options.delimiter.wrap && value ? value.replace(new RegExp(options.delimiter.wrap, 'g'), options.delimiter.wrap + options.delimiter.wrap) : value;
        return options.delimiter.wrap + convertValue(value, options) + options.delimiter.wrap; // Otherwise push the current value
    }

    function convertValue(val) {
        // Convert to string
        val = _.isNull(val) || _.isUndefined(val) ? '' : val.toString();

        // Trim, if necessary, and return the correct value
        return options.trimFieldValues ? val.trim() : val;
    }

    /**
     * Generate the CSV representing the given data.
     * @param data
     * @param headingKeys
     * @returns {*}
     */
    function generateCsv(data, headingKeys) {
        let reducer = function(csv, doc) {
            return csv += convertData(doc, headingKeys, options).join(options.delimiter.field) + options.delimiter.eol;
        };

        // Reduce each JSON document in data to a CSV string and append it to the CSV accumulator
        return [headingKeys].concat(data.reduce(reducer.bind({options: options}), ''));
    }

    /**
     * Internally exported json2csv function
     * Takes data as a JSON document array and a callback that will be used to report the results
     * @param data String csv string
     * @param callback Function callback function
     */
    function convert(data, callback) {
        // If a callback wasn't provided, throw an error
        if (!callback) { throw new Error(constants.errors.callbackRequired); }

        // Shouldn't happen, but just in case
        if (!options) { return callback(new Error(constants.errors.optionsRequired)); }

        // If we don't receive data, report an error
        if (!data) { return callback(new Error(constants.errors.json2csv.cannotCallJson2CsvOn + data + '.')); }

        // If the data was not a single document or an array of documents
        if (!_.isObject(data)) {
            return callback(new Error(constants.errors.json2csv.dataNotArrayOfDocuments));  // Report the error back to the caller
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
                if (options.delimiter.wrap && options.prependHeader) {
                    csvHeading = _.map(csvHeading, function(headingKey) {
                        return options.delimiter.wrap + headingKey + options.delimiter.wrap;
                    });
                }

                if (options.trimHeaderFields) {
                    csvHeading = _.map(csvHeading, function (headingKey) {
                        return headingKey.trim();
                    });
                }

                // If we are prepending the header, then join the csvHeading fields
                if (options.prependHeader) {
                    csvHeading = csvHeading.join(options.delimiter.field);
                }

                // If we are prepending the header, then join the header and data by EOL, otherwise just return the data
                return callback(null, options.prependHeader ? csvHeading + options.delimiter.eol + csvData : csvData);
            })
            .catch(function (err) {
                return callback(err);
            });
    }

    return { convert };
};

module.exports = { Json2Csv };
