'use strict';

var _ = require('underscore'),
    constants = require('./constants'),
    schemaCombiner = require('./schema-combiner'),
    path = require('doc-path'),
    Promise = require('bluebird');

var options = {}; // Initialize the options - this will be populated when the json2csv function is called.

/**
 * Retrieve the headings for all documents and return it.
 * The headings are placed on order of appearance.
 * Nested schemas are placed together, also when using documents with a different schema.
 * This also checks that all documents have the same schema if required.
 * @param data
 * @returns {Promise}
 */
var generateHeading = function(data) {
    if (options.KEYS) { return Promise.resolve(options.KEYS); }

    var mergedDocumentsSchema = schemaCombiner.buildCombinedDocumentSchema(data);
    var documentHeading = generateDocumentHeading('', mergedDocumentsSchema);
    var flatDocumentHeading = _.flatten(documentHeading);

    // Check the counters to see if we have schema differences.
    var schemaCount = _.where(data, function(document) { return _.isObject(data) }).length;
    var schemaDifferences = Math.abs(mergedDocumentsSchema.totals.fieldCount - (mergedDocumentsSchema.totals.uniqueFieldCount * schemaCount));

    if (schemaDifferences > 0 && !options.ALLOW_DIFFERENT_SCHEMAS) {
        return Promise.reject(new Error(constants.Errors.json2csv.notSameSchema));
    }

    return Promise.resolve(flatDocumentHeading);
};

/**
 * Takes the parent heading and this doc's data and creates the subdocument headings (string)
 * @param heading
 * @param data
 * @returns {Array}
 */
var generateDocumentHeading = function(heading, data) {
    var keyName = ''; // temporary variable to aid in determining the heading - used to generate the 'nested' headings

    var documentKeys = _.map(_.keys(data.fields), function (currentKey) {
        // If the given heading is empty, then we set the heading to be the subKey, otherwise set it as a nested heading w/ a dot
        keyName = heading ? heading + '.' + currentKey : currentKey;

        // If we have another nested document, recur on the sub-document to retrieve the full key name
        if (data.fields[currentKey].objects.count > 0) {
            if (data.fields[currentKey].primitives.filledCount > 0) {
                return [
                    keyName,
                    generateDocumentHeading(keyName, data.fields[currentKey].objects)
                ];
            }
            else {
                return generateDocumentHeading(keyName, data.fields[currentKey].objects);
            }

        }
        // Otherwise return this key name since we don't have a sub document
        return keyName;
    });

    return documentKeys; // Return the headings joined by our field delimiter
};

/**
 * Convert the given data with the given keys
 * @param data
 * @param keys
 * @returns {Array}
 */
var convertData = function (data, keys) {
    // Reduce each key in the data to its CSV value
    return _.reduce(keys, function (output, key) {
        // Add the CSV representation of the data at the key in the document to the output array
        return output.concat(convertField(path.evaluatePath(data, key)));
    }, []);
};

/**
 * Convert the given value to the CSV representation of the value
 * @param value
 * @param output
 */
var convertField = function (value) {
    var stringValue = '';

    if (_.isArray(value)) {
        stringValue = '[' + value.join(options.DELIMITER.ARRAY) + ']'; // Should we also walk through internal values then?
    }
    else if (_.isDate(value)) {
        stringValue = value.toString();
        //stringifiedValue = value.toISOString();   // Could be an intresting setting as well. Let's keep it to wat it was for now.
    }
    else if (_.isObject(value)) {
        // Don't do a thing, strictly follow the list with fields that we already got!
    }
    else if (!_.isUndefined(value) && !_.isNull(value))
    {
        stringValue = value.toString();
    }

    // We might want to leave out the delimiters in case of null, interesting read on this: http://www.garretwilson.com/blog/2009/04/23/csvnull.xhtml
    return options.DELIMITER.WRAP + stringValue + options.DELIMITER.WRAP; // Otherwise push the current value
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
        return csv += convertData(doc, headingKeys).join(options.DELIMITER.FIELD) + options.EOL;
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
                // If we are prepending the header, then join the csvHeading fields
                if (options.PREPEND_HEADER) {
                    csvHeading = csvHeading.join(options.DELIMITER.FIELD);
                }

                // If we are prepending the header, then join the header and data by EOL, otherwise just return the data
                return callback(null, options.PREPEND_HEADER ? csvHeading + options.EOL + csvData : csvData);
            })
            .catch(function (err) {
                return callback(err);
            });
    }

};