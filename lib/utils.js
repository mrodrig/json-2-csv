'use strict';

let path = require('doc-path'),
    constants = require('./constants.json');

const dateStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
    MAX_ARRAY_LENGTH = 100000;

module.exports = {
    isStringRepresentation,
    isDateRepresentation,
    computeSchemaDifferences,
    deepCopy,
    convert,
    isEmptyField,
    removeEmptyFields,
    getNCharacters,
    unwind,
    isInvalid,
    isNumber,

    // underscore replacements:
    isString,
    isNull,
    isError,
    isDate,
    isUndefined,
    isObject,
    unique,
    flatten
};

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 * @param opts {Object} options object
 * @return {Object} options object
 */
function buildOptions(opts) {
    opts = {...constants.defaultOptions, ...opts || {}};
    opts.fieldTitleMap = new Map();

    // Copy the delimiter fields over since the spread operator does a shallow copy
    opts.delimiter.field = opts.delimiter.field || constants.defaultOptions.delimiter.field;
    opts.delimiter.wrap = opts.delimiter.wrap || constants.defaultOptions.delimiter.wrap;
    opts.delimiter.eol = opts.delimiter.eol || constants.defaultOptions.delimiter.eol;

    // Otherwise, send the options back
    return opts;
}

/**
 * When promisified, the callback and options argument ordering is swapped, so
 * this function is intended to determine which argument is which and return
 * them in the correct order
 * @param arg1 {Object|Function} options or callback
 * @param arg2 {Object|Function} options or callback
 */
function parseArguments(arg1, arg2) {
    // If this was promisified (callback and opts are swapped) then fix the argument order.
    if (isObject(arg1) && !isFunction(arg1)) {
        return {
            options: arg1,
            callback: arg2
        };
    }
    // Regular ordering where the callback is provided before the options object
    return {
        options: arg2,
        callback: arg1
    };
}

/**
 * Validates the parameters passed in to json2csv and csv2json
 * @param config {Object} of the form: { data: {Any}, callback: {Function}, dataCheckFn: Function, errorMessages: {Object} }
 */
function validateParameters(config) {
    // If a callback wasn't provided, throw an error
    if (!config.callback) {
        throw new Error(constants.errors.callbackRequired);
    }

    // If we don't receive data, report an error
    if (!config.data) {
        config.callback(new Error(config.errorMessages.cannotCallOn + config.data + '.'));
        return false;
    }

    // The data provided data does not meet the type check requirement
    if (!config.dataCheckFn(config.data)) {
        config.callback(new Error(config.errorMessages.dataCheckFailure));
        return false;
    }

    // If we didn't hit any known error conditions, then the data is so far determined to be valid
    // Note: json2csv/csv2json may perform additional validity checks on the data
    return true;
}

/**
 * Abstracted function to perform the conversion of json-->csv or csv-->json
 * depending on the converter class that is passed via the params object
 * @param params {Object}
 */
function convert(params) {
    let {options, callback} = parseArguments(params.callback, params.options);
    options = buildOptions(options);

    let converter = new params.converter(options),

        // Validate the parameters before calling the converter's convert function
        valid = validateParameters({
            data: params.data,
            callback,
            errorMessages: converter.validationMessages,
            dataCheckFn: converter.validationFn
        });

    if (valid) converter.convert(params.data, callback);
}

/**
 * Utility function to deep copy an object, used by the module tests
 * @param obj
 * @returns {any}
 */
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Helper function that determines whether the provided value is a representation
 *   of a string. Given the RFC4180 requirements, that means that the value is
 *   wrapped in value wrap delimiters (usually a quotation mark on each side).
 * @param fieldValue
 * @param options
 * @returns {boolean}
 */
function isStringRepresentation(fieldValue, options) {
    const firstChar = fieldValue[0],
        lastIndex = fieldValue.length - 1,
        lastChar = fieldValue[lastIndex];

    // If the field starts and ends with a wrap delimiter
    return firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap;
}

/**
 * Helper function that determines whether the provided value is a representation
 *   of a date.
 * @param fieldValue
 * @returns {boolean}
 */
function isDateRepresentation(fieldValue) {
    return dateStringRegex.test(fieldValue);
}

/**
 * Helper function that determines the schema differences between two objects.
 * @param schemaA
 * @param schemaB
 * @returns {*}
 */
function computeSchemaDifferences(schemaA, schemaB) {
    return arrayDifference(schemaA, schemaB)
        .concat(arrayDifference(schemaB, schemaA));
}

/**
 * Utility function to check if a field is considered empty so that the emptyFieldValue can be used instead
 * @param fieldValue
 * @returns {boolean}
 */
function isEmptyField(fieldValue) {
    return isUndefined(fieldValue) || isNull(fieldValue) || fieldValue === '';
}

/**
 * Helper function that removes empty field values from an array.
 * @param fields
 * @returns {Array}
 */
function removeEmptyFields(fields) {
    return fields.filter((field) => !isEmptyField(field));
}

/**
 * Helper function that retrieves the next n characters from the start index in
 *   the string including the character at the start index. This is used to
 *   check if are currently at an EOL value, since it could be multiple
 *   characters in length (eg. '\r\n')
 * @param str
 * @param start
 * @param n
 * @returns {string}
 */
function getNCharacters(str, start, n) {
    return str.substring(start, start + n);
}

/**
 * The following unwind functionality is a heavily modified version of @edwincen's
 * unwind extension for lodash. Since lodash is a large package to require in,
 * and all of the required functionality was already being imported, either
 * natively or with doc-path, I decided to rewrite the majority of the logic
 * so that an additional dependency would not be required. The original code
 * with the lodash dependency can be found here:
 *
 * https://github.com/edwincen/unwind/blob/master/index.js
 */

/**
 * Core function that unwinds an item at the provided path
 * @param accumulator {Array<any>}
 * @param item {any}
 * @param fieldPath {String}
 */
function unwindItem(accumulator, item, fieldPath) {
    const valueToUnwind = path.evaluatePath(item, fieldPath);
    let cloned = deepCopy(item);

    if (Array.isArray(valueToUnwind) && valueToUnwind.length) {
        valueToUnwind.forEach((val) => {
            cloned = deepCopy(item);
            accumulator.push(path.setPath(cloned, fieldPath, val));
        });
    } else if (Array.isArray(valueToUnwind) && valueToUnwind.length === 0) {
        // Push an empty string so the value is empty since there are no values
        path.setPath(cloned, fieldPath, '');
        accumulator.push(cloned);
    } else {
        accumulator.push(cloned);
    }
}

/**
 * Main unwind function which takes an array and a field to unwind.
 * @param array {Array<any>}
 * @param field {String}
 * @returns {Array<any>}
 */
function unwind(array, field) {
    const result = [];
    array.forEach((item) => {
        unwindItem(result, item, field);
    });
    return result;
}

/**
 * Checks whether value can be converted to a number
 * @param value {String}
 * @returns {boolean}
 */
function isNumber(value) {
    return !isNaN(Number(value));
}

/*
 * Helper functions which were created to remove underscorejs from this package.
 */

function isString(value) {
    return typeof value === 'string';
}

function isObject(value) {
    return typeof value === 'object';
}

function isFunction(value) {
    return typeof value === 'function';
}

function isNull(value) {
    return value === null;
}

function isDate(value) {
    return value instanceof Date;
}

function isUndefined(value) {
    return typeof value === 'undefined';
}

function isError(value) {
    return Object.prototype.toString.call(value) === '[object Error]';
}

function arrayDifference(a, b) {
    return a.filter((x) => !b.includes(x));
}

function unique(array) {
    return [...new Set(array)];
}

function flatten(array) {
    // Node 11+ - use the native array flattening function
    if (array.flat) {
        return array.flat();
    }

    // #167 - allow browsers to flatten very long 200k+ element arrays
    if (array.length > MAX_ARRAY_LENGTH) {
        let safeArray = [];
        for (let a = 0; a < array.length; a += MAX_ARRAY_LENGTH) {
            safeArray = safeArray.concat(...array.slice(a, a + MAX_ARRAY_LENGTH));
        }
        return safeArray;
    }
    return [].concat(...array);
}

/**
 * Used to help avoid incorrect values returned by JSON.parse when converting
 * CSV back to JSON, such as '39e1804' which JSON.parse converts to Infinity
 */
function isInvalid(parsedJson) {
    return parsedJson === Infinity ||
        parsedJson === -Infinity;
}
