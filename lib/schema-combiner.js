'use-strict';

var _ = require('underscore');
var constants = require('./constants');

/**
 * Build a 'schema' document with all field names that are available in a list with documents. Runs recursive.
 * Every field name will also contain a valueCount, so that you can deduce how many times a certain property has been used in the set of documents.
 * @param documents The array with 1..n documents that is to be processed.
 * @returns A document with all properties that where found in the given set of documents.
 */
var buildCombinedDocumentSchema = function(documents) {
    var result = {
        totals: {
            uniqueFieldCount: 0,
            fieldCount: 0
        },
        fields: {
        }
    };

    _.each(documents, function(document) {
        if (_.isObject(document)) {
            collectAndCountObjectFields(document, result, result.totals);
        }
    });

    return result;
};

/**
 * Does a value contain other fields? At this moment we only allow this for objects. Not for functions and arrays.
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
var collectAndCountObjectFields = function(inputObject, result, totals) {
    _.each(_.keys(inputObject), function(key) {
        // We have another fields, always counts from now on.
        totals.fieldCount++;

        // Check if we already have something in our results for this? If not then we should add our default
        if (!_.has(result.fields, key)){
            result.fields[key] = {
                primitives: {
                    emptyCount: 0,
                    filledCount: 0
                },
                objects: {
                    count: 0,
                    fields: {}
                }
            };

            totals.uniqueFieldCount++;
        }

        if (isPropertyParent(inputObject[key])) {
            result.fields[key].objects.count++;
            collectAndCountObjectFields(inputObject[key], result.fields[key].objects, totals);
        }
        else {
            if (_.isNull(inputObject[key]) || _.isUndefined(inputObject[key])) {
                result.fields[key].primitives.emptyCount++;
            }
            else {
                result.fields[key].primitives.filledCount++;
            }
        }
    });
}

module.exports.buildCombinedDocumentSchema = buildCombinedDocumentSchema;
