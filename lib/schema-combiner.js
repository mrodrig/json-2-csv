'use-strict';

var _ = require('underscore');

/**
 * Build a 'schema' document with all field names that are avaialble in a list with documents. Runs recursive.
 * Every field name will also contain a count, so that you can deduce how many times a certain property has been used in the set of documents.
 * @param documents The array with 1..n documents that is to be processed.
 * @returns A document with all properties that where found in the given set of documents.
 */
var buildCombinedDocumentSchema = function(documents, mergeStats) {
    var result = {isNested: true, fields: {}};
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
 * @param result The result document that the properties are written to, if a field already is avaialble then it's counter is increased.
 */
var collectAndCountObjectFields = function(inputObject, result, mergeStats) {
    _.each(_.keys(inputObject), function(key) {
        if (isPropertyParent(inputObject[key])) {
            // Check if it's not a value already.
            var createNewNested = false;
            if (_.has(result.fields, key)) {
                if (result.fields[key].isNested) {
                    collectAndCountObjectFields(inputObject[key], result.fields[key], mergeStats);
                }
                else {
                    if (result.fields[key].alwaysNull) {
                        // We can upgrade the value to a leaf, previous documents just didn't had the object filled in.
                        mergeStats.uniqueFieldCount--;
                        mergeStats.totalFieldCount -= result.fields[key].count;
                        createNewNested = true;
                    }
                    else {
                        // Don't use different types for the same field in your array with documents.
                        throw new Error(constants.Errors.json2csv.propertyLeafExpected);
                    }
                }
            }
            else {
                createNewNested = true;
            }

            if (createNewNested) {
                result.fields[key] = {isNested: true, fields: {}};
                collectAndCountObjectFields(inputObject[key], result.fields[key], mergeStats);
            }
        }
        else {
            // Check if we already have the key in our result, otherwise add it with a value of 1.
            if (_.has(result.fields, key)) {
                if (result.fields[key].isNested) {
                    if (!_.isNull(inputObject[key])) {
                        throw new Error(constants.Errors.json2csv.valueExpected);
                    }
                }
                else {
                    result.fields[key].count++;
                    if (!_.isNull(inputObject[key])) {
                        result.fields[key].alwaysNull = false;
                    }

                    mergeStats.totalFieldCount++;
                }
            }
            else {
                result.fields[key] = {isNested: false, alwaysNull: _.isNull(inputObject[key]), count: 1};
                mergeStats.uniqueFieldCount++;
                mergeStats.totalFieldCount++;
            }
        }
    });
}

module.exports.buildCombinedDocumentSchema = buildCombinedDocumentSchema;
