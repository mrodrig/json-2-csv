'use strict';

var _ = require('underscore'),
    path = require('doc-path'),
    constants = require('./constants.json');

var options = {}; // Initialize the options - this will be populated when the csv2json function is called.

/**
 * Generate the JSON heading from the CSV
 * @param lines
 * @param callback
 * @returns {*}
 */
var retrieveHeading = function (lines, callback) {
    // If there are no lines passed in, return an error
    if (!lines.length) {
        return callback(new Error(constants.Errors.csv2json.noDataRetrieveHeading)); // Pass an error back to the user
    }

    // Generate and return the heading keys
    return _.map(splitLine(lines[0]),
        function (headerKey, index) {
            return {
                value: options.TRIM_HEADER_FIELDS ? headerKey.trim() : headerKey,
                index: index
            };
        });
};

/**
 * Does the given value represent an array?
 * @param value
 * @returns {boolean}
 */
var isArrayRepresentation = function (value) {
    // Verify that there is a value and it starts with '[' and ends with ']'
    return (value && /^\[.*\]$/.test(value));
};

/**
 * Converts the value from a CSV 'array'
 * @param val
 * @returns {Array}
 */
var convertArrayRepresentation = function (arrayRepresentation) {
    // Remove the '[' and ']' characters
    arrayRepresentation = arrayRepresentation.replace(/(\[|\])/g, '');

    // Split the arrayRepresentation into an array by the array delimiter
    arrayRepresentation = arrayRepresentation.split(options.DELIMITER.ARRAY);

    // Filter out non-empty strings
    return _.filter(arrayRepresentation, function (value) {
        return value;
    });
};

/**
 * Create a JSON document with the given keys (designated by the CSV header)
 *   and the values (from the given line)
 * @param keys String[]
 * @param line String
 * @returns {Object} created json document
 */
var createDocument = function (keys, line) {
    line = splitLine(line); // Split the line using the given field delimiter after trimming whitespace
    var val; // Temporary variable to set the current key's value to

    // Reduce the keys into a JSON document representing the given line
    return _.reduce(keys, function (document, key) {
        // If there is a value at the key's index in the line, set the value; otherwise null
        val = line[key.index] ? line[key.index] : null;
        
        // If the user wants to trim field values, trim the value
        val = options.TRIM_FIELD_VALUES && !_.isNull(val) ? val.trim() : val;

        // If the value is an array representation, convert it
        if (isArrayRepresentation(val)) {
            val = convertArrayRepresentation(val);
        }
        // Otherwise add the key and value to the document
        return path.setPath(document, key.value, val);
    }, {});
};

/**
 * Main helper function to convert the CSV to the JSON document array
 * @param lines String[]
 * @param callback Function callback function
 * @returns {Array}
 */
var convertCSV = function (lines, callback) {
    var generatedHeaders = retrieveHeading(lines, callback), // Retrieve the headings from the CSV, unless the user specified the keys
        nonHeaderLines = lines.splice(1), // All lines except for the header line
    // If the user provided keys, filter the generated keys to just the user provided keys so we also have the key index
        headers = options.KEYS ? _.filter(generatedHeaders, function (headerKey) {
            return _.contains(options.KEYS, headerKey.value);
        }) : generatedHeaders;

    return _.reduce(nonHeaderLines, function (documentArray, line) { // For each line, create the document and add it to the array of documents
        if (!line) { return documentArray; } // skip over empty lines
        var generatedDocument = createDocument(headers, line.trim());
        return documentArray.concat(generatedDocument);
    }, []);
};

/**
 * Helper function that splits a line so that we can handle wrapped fields
 * @param line
 */
var splitLine = function (line) {
    // If the fields are not wrapped, return the line split by the field delimiter
    if (!options.DELIMITER.WRAP) { return line.split(options.DELIMITER.FIELD); }

    // Parse out the line...
    var splitLine = [],
        character,
        charBefore,
        charAfter,
        lastCharacterIndex = line.length - 1,
        stateVariables = {
            insideWrapDelimiter: false,
            parsingValue: true,
            startIndex: 0
        },
        index = 0;

    // Loop through each character in the line to identify where to split the values
    while(index < line.length) {
        // Current character
        character  = line[index];
        // Previous character
        charBefore = index ? line[index - 1] : '';
        // Next character
        charAfter = index < lastCharacterIndex ? line[index + 1] : '';

        // If we reached the end of the line, add the remaining value
        if (index === lastCharacterIndex) {
            splitLine.push(line.substring(stateVariables.startIndex, stateVariables.insideWrapDelimiter ? index : undefined));
        }
        // If the line starts with a wrap delimiter
        else if (character === options.DELIMITER.WRAP && index === 0) {
            stateVariables.insideWrapDelimiter = true;
            stateVariables.parsingValue = true;
            stateVariables.startIndex = index + 1;
        }

        // If we reached a wrap delimiter with a field delimiter after it (ie. *",)
        else if (character === options.DELIMITER.WRAP && charAfter === options.DELIMITER.FIELD) {
            splitLine.push(line.substring(stateVariables.startIndex, index));
            stateVariables.startIndex = index + 2; // next value starts after the field delimiter
            stateVariables.insideWrapDelimiter = false;
            stateVariables.parsingValue = false;
        }
        // If we reached a wrap delimiter with a field delimiter after it (ie. ,"*)
        else if (character === options.DELIMITER.WRAP && charBefore === options.DELIMITER.FIELD) {
            if (stateVariables.parsingValue) {
                splitLine.push(line.substring(stateVariables.startIndex, index-1));
            }
            stateVariables.insideWrapDelimiter = true;
            stateVariables.parsingValue = true;
            stateVariables.startIndex = index + 1;
        }
        // If we reached a field delimiter and are not inside the wrap delimiters (ie. *,*)
        else if (character === options.DELIMITER.FIELD && charBefore !== options.DELIMITER.WRAP &&
                    charAfter !== options.DELIMITER.WRAP && !stateVariables.insideWrapDelimiter &&
                    stateVariables.parsingValue) {
            splitLine.push(line.substring(stateVariables.startIndex, index));
            stateVariables.startIndex = index + 1;
        }
        else if (character === options.DELIMITER.FIELD && charBefore === options.DELIMITER.WRAP &&
                    charAfter !== options.DELIMITER.WRAP) {
            stateVariables.insideWrapDelimiter = false;
            stateVariables.parsingValue = true;
            stateVariables.startIndex = index + 1;
        }
        // Otherwise increment to the next character
        index++;
    }

    return splitLine;
};

module.exports = {

    /**
     * Internally exported csv2json function
     * Takes options as a document, data as a CSV string, and a callback that will be used to report the results
     * @param opts Object options object
     * @param data String csv string
     * @param callback Function callback function
     */
    csv2json: function (opts, data, callback) {
        // If a callback wasn't provided, throw an error
        if (!callback) { throw new Error(constants.Errors.callbackRequired); }

        // Shouldn't happen, but just in case
        if (!opts) { return callback(new Error(constants.Errors.optionsRequired)); }
        options = opts; // Options were passed, set the global options value

        // If we don't receive data, report an error
        if (!data) { return callback(new Error(constants.Errors.csv2json.cannotCallCsv2JsonOn + data + '.')); }

        // The data provided is not a string
        if (!_.isString(data)) {
            return callback(new Error(constants.Errors.csv2json.csvNotString)); // Report an error back to the caller
        }

        // Split the CSV into lines using the specified EOL option
        var lines = data.split(options.DELIMITER.EOL),
            json = convertCSV(lines, callback); // Retrieve the JSON document array
        return callback(null, json); // Send the data back to the caller
    }

};
