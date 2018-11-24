'use strict';

let constants = require('./constants.json'),
    utilities = require('./utils'),
    _ = require('underscore'),
    path = require('doc-path'),
    deeks = require('deeks'),
    Promise = require('bluebird');

const Json2Csv = function (options) {

    /*** HEADER FIELD FUNCTIONS **/

    /**
     * Returns the list of data field names of all documents in the provided list
     * @param data {Array<Object>} Data to be converted
     * @returns {Promise.<Array[String]>}
     */
    function getFieldNameList(data) {
        // If keys weren't specified,
        return Promise.resolve(deeks.deepKeysFromList(data));
    }

    /**
     * Processes the schemas by checking for schema differences, if so desired.
     * If schema differences are not to be checked, then it resolves the unique
     * list of field names.
     * @param documentSchemas
     * @returns {Promise.<Array[String]>}
     */
    function processSchemas(documentSchemas) {
        // If the user wants to check for the same schema (regardless of schema ordering)
        if (options.checkSchemaDifferences) {
            return checkSchemaDifferences(documentSchemas);
        } else {
            // Otherwise, we do not care if the schemas are different, so we should get the unique list of keys
            let uniqueFieldNames = _.uniq(_.flatten(documentSchemas));
            return Promise.resolve(uniqueFieldNames);
        }
    }

    /**
     * This function performs the schema difference check, if the user specifies that it should be checked.
     * If there are no field names, then there are no differences.
     * Otherwise, we get the first schema and the remaining list of schemas
     * @param documentSchemas
     * @returns {*}
     */
    function checkSchemaDifferences(documentSchemas) {
        // if we have no documents - then there is no possibility of multiple schemas
        if (documentSchemas && documentSchemas.length === 0) {
            return Promise.resolve([]);
        }
        // else - multiple documents - ensure only one schema (regardless of field ordering)
        let firstDocSchema = documentSchemas[0],
            restOfDocumentSchemas = documentSchemas.slice(1),
            schemaDifferences = computeNumberOfSchemaDifferences(firstDocSchema, restOfDocumentSchemas);

        // If there are schema inconsistencies, throw a schema not the same error
        if (schemaDifferences) {
            return Promise.reject(new Error(constants.errors.json2csv.notSameSchema));
        }

        return Promise.resolve(firstDocSchema);
    }

    /**
     * Computes the number of schema differences
     * @param firstDocSchema
     * @param restOfDocumentSchemas
     * @returns {*}
     */
    function computeNumberOfSchemaDifferences(firstDocSchema, restOfDocumentSchemas) {
        return restOfDocumentSchemas.reduce((schemaDifferences, documentSchema) => {
            // If there is a difference between the schemas, increment the counter of schema inconsistencies
            let numberOfDifferences = _.difference(firstDocSchema, documentSchema).length;
            return (numberOfDifferences > 0) ? schemaDifferences + 1 : schemaDifferences;
        }, 0);
    }

    /**
     * If so specified, this sorts the header field names alphabetically
     * @param fieldNames {Array<String>}
     * @returns {Array<String>} sorted field names, or unsorted if sorting not specified
     */
    function sortHeaderFields(fieldNames) {
        if (options.sortHeader) {
            return fieldNames.sort();
        }
        return fieldNames;
    }

    /**
     * Trims the header fields, if the user desires them to be trimmed.
     * @param params
     * @returns {*}
     */
    function trimHeaderFields(params) {
        if (options.trimHeaderFields) {
            params.headerFields = params.headerFields.map((field) => { return field.trim(); });
        }
        return params;
    }

    /**
     * Wrap the headings, if desired by the user.
     * @param params
     * @returns {*}
     */
    function wrapHeaderFields(params) {
        // If the fields are supposed to be wrapped... (only perform this if we are actually prepending the header)
        if (options.delimiter.wrap && options.prependHeader) {
            params.headerFields = params.headerFields.map(function(headingKey) {
                return options.delimiter.wrap + headingKey + options.delimiter.wrap;
            });
        }
        return params;
    }

    /**
     * Retrieve the headings for all documents and return it.
     * This checks that all documents have the same schema.
     * @param data
     * @returns {Promise}
     */
    function retrieveHeaderFields(data) {
        if (options.keys) {
            return Promise.resolve(options.keys)
                .then(sortHeaderFields);
        }

        return getFieldNameList(data)
            .then(processSchemas)
            .then(sortHeaderFields);
    }

    /**
     * Convert the given data with the given keys
     * @param data
     * @param keys
     * @returns {Array}
     */
    function convertData(data, keys) {
        // Reduce each key in the data to its CSV value
        return keys.reduce((output, key) => {
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
            return options.delimiter.wrap + convertData(value, Object.keys(value), options) + options.delimiter.wrap; // Push the recursively generated CSV
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
     * @param rows
     * @param headerFields
     * @returns {String} records in csv format
     */
    function transformRecords(rows, headerFields) {
        // Reduce each JSON document in data to a CSV string and append it to the CSV accumulator
        return rows.reduce(function(csv, recordData) {
            let recordFields = convertData(recordData, headerFields, options);

            return csv += recordFields.join(options.delimiter.field) + options.delimiter.eol;
        }, '');
    }

    /**
     * Internally exported json2csv function
     * Takes data as either a document or array of documents and a callback that will be used to report the results
     * @param data {Object|Array<Object>} documents to be converted to csv
     * @param callback {Function} callback function
     */
    function convert(data, callback) {
        // Single document, not an array
        if (_.isObject(data) && !data.length) {
            data = [data]; // Convert to an array of the given document
        }

        // Retrieve the heading and then generate the CSV with the keys that are identified
        retrieveHeaderFields(data)
            .then((headerFields) => {
                return {
                    headerFields,
                    records: transformRecords(data, headerFields)
                };
            })
            .then(wrapHeaderFields)
            .then(trimHeaderFields)
            .then((params) => {
                let header = params.headerFields.join(options.delimiter.field),
                    records = params.records,

                    // If we are prepending the header, then add an EOL, otherwise just return the records
                    csv = (options.excelBOM ? '\ufeff' : '') +
                          (options.prependHeader ? header + options.delimiter.eol : '') +
                          records;

                return callback(null, csv);
            })
            .catch(callback);
    }

    return {
        convert,
        validationFn: _.isObject,
        validationMessages: constants.errors.json2csv
    };
};

module.exports = { Json2Csv };
