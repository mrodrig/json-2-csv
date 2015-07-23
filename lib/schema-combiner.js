'use-strict';

var _ = require('underscore');
var constants = require('./constants');

/**
 * Build a 'schema' document with all field names that are available in a list with documents. Runs recursive.
 * Every field name will also contain a valueCount, so that you can deduce how many times a certain property has been used in the set of documents.
 * @param documents The array with 1..n documents that is to be processed.
 * @returns A document with all properties that where found in the given set of documents.
 */
var buildCombinedDocumentSchema = function(documents, mergeStats) {
    var result = {isNested: true, fields: {}, isValue: false, valueCount: 0, valueAlwaysNull: null};
    _.each(documents, function(document) {
        if (_.isObject(document)) {
            collectAndCountObjectFields(document, result, mergeStats);
        }
    });

    return result;
};

/**
 * Does a value contain other properties? At this moment we only allow this for objects. Not for functions and arrays.
 * @param value Reference to the value that you want to check.
 * @returns {boolean} that is true when properties may exist.
 */
var isPropertyParent = function(value) {
    return (_.isObject(value) && !_.isArray(value)) && !_.isFunction(value);
}

/**
 * Collects and counts the fields inside an object. Runs recursively.
 * @param inputObject The object that you want to examine.
 * @param result The result document that the properties are written to, if a field already is available then it's counter is increased.
 */
var collectAndCountObjectFields = function(inputObject, result, mergeStats) {
    _.each(_.keys(inputObject), function(key) {
        if (isPropertyParent(inputObject[key])) {
            // Check if it's not a value already.
            var createNewNested = false;
            if (!_.has(result.fields, key)) {
                result.fields[key] = {isNested: true, fields: {}, isValue: false, valueCount: 0, valueAlwaysNull: null};
            }

            result.fields[key].isNested = true;
            collectAndCountObjectFields(inputObject[key], result.fields[key], mergeStats);
        }
        else {
            // Check if we already have the key in our result, otherwise add it with a value of 1.
            if (_.has(result.fields, key)) {
                result.fields[key].isValue = true;
                result.fields[key].valueCount++;
                mergeStats.totalFieldCount++;

                // Replace the value with the current state when this is the first value, or when the value is true.
                if (result.fields[key].valueAlwaysNull == null || result.fields[key].valueAlwaysNull == true) {
                    result.fields[key].valueAlwaysNull = _.isNull(inputObject[key]);
                }
            }
            else {
                result.fields[key] = {isNested: false, fields: {}, isValue: true, valueCount: 1, valueAlwaysNull: _.isNull(inputObject[key])};
                mergeStats.uniqueFieldCount++;
                mergeStats.totalFieldCount++;
            }
        }
    });
}

module.exports.buildCombinedDocumentSchema = buildCombinedDocumentSchema;
