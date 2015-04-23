'use strict';

var _ = require('underscore'),
    path = require('doc-path'),
    constants = require('./constants');

var options = {}; // Initialize the options - this will be populated when the csv2json function is called.

/** Helper function from http://phpjs.org/functions/addslashes/ **/
var addSlashes = function (str) {
    return (str + '')
        .replace(/[\\"']/g, '\\$&')
        .replace(/\u0000/g, '\\0');
};

var lstrip = function (str, search) {
    return str.replace(new RegExp('^' + search + '*'), '');
};

var rstrip = function (str, search) {
    return str.replace(new RegExp(search + '*$'), '');
};

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
                value: headerKey,
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
    var line = splitLine(line), // Split the line using the given field delimiter after trimming whitespace
        val; // Temporary variable to set the current key's value to

    // Reduce the keys into a JSON document representing the given line
    return _.reduce(keys, function (document, key) {
        // If there is a value at the key's index in the line, set the value; otherwise null
        val = line[key.index] ? line[key.index] : null;

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
        lastLineIndex = line.length - 1,
        stateVariables = {
            insideWrapDelimiter: false,
            startIndex: 0
        },
        index = 0;

    while(index < line.length) {
        character = line[index];
        charBefore = index ? line[index - 1] : '';
        charAfter = index < lastLineIndex ? line[index + 1] : '';

        console.log(charBefore, character, charAfter);

        if (character === options.DELIMITER.FIELD && charBefore === options.DELIMITER.WRAP && charAfter === options.DELIMITER.WRAP) {
            console.log('CASE 1.5');
            stateVariables.insideWrapDelimiter = true;
            stateVariables.startIndex = index + 2; // set start to one after the current index to avoid the ','
            index++;
        } else if (character === options.DELIMITER.WRAP && charBefore === options.DELIMITER.FIELD) {
            console.log('  CASE 2');
            stateVariables.insideWrapDelimiter = true;
            stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the wrap delimiter
        } else if (character === options.DELIMITER.WRAP && charAfter === options.DELIMITER.FIELD) {
            console.log('  CASE 3');
            stateVariables.insideWrapDelimiter = false;
            splitLine.push(line.substring(stateVariables.startIndex, index));
            stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the ','
        } else if (character === options.DELIMITER.FIELD && !stateVariables.insideWrapDelimiter) {
            console.log('  CASE 1');
            splitLine.push(line.substring(stateVariables.startIndex, index));
            stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the ','
        } else if (character === options.DELIMITER.WRAP && index === 0) {
            console.log('  CASE 4');
            stateVariables.insideWrapDelimiter = false;
            stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the ','
        }
        // If we reached the end of the line and are in the wrap delimiter, substring up to, but not including this char
        else if (index === lastLineIndex && stateVariables.insideWrapDelimiter) {
            console.log('  CASE 5');
            splitLine.push(line.substring(stateVariables.startIndex, index));
        }
        // If we reached the end of the line and are not in the wrap delimiter
        else if (index === lastLineIndex) {
            splitLine.push(line.substring(stateVariables.startIndex));
        }
        console.log('__splitLine__', splitLine);
        index++;
    }

    //_.each(line, function (character, index) {
    //    charBefore = index ? line[index - 1] : '';
    //    charAfter = index < lastLineIndex ? line[index + 1] : '';
    //
    //    console.log(charBefore, character, charAfter);
    //
    //    if (character === options.DELIMITER.FIELD && !stateVariables.insideWrapDelimiter) {
    //        console.log('  CASE 1');
    //        splitLine.push(line.substring(stateVariables.startIndex, index));
    //        stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the ','
    //    } else if (character === options.DELIMITER.WRAP && charBefore === options.DELIMITER.FIELD) {
    //        console.log('  CASE 2');
    //        stateVariables.insideWrapDelimiter = true;
    //        stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the wrap delimiter
    //    } else if (character === options.DELIMITER.WRAP && charAfter === options.DELIMITER.FIELD) {
    //        console.log('  CASE 3');
    //        stateVariables.insideWrapDelimiter = false;
    //        splitLine.push(line.substring(stateVariables.startIndex, index));
    //        stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the ','
    //    } else if (character === options.DELIMITER.WRAP && index === 0) {
    //        console.log('  CASE 4');
    //        stateVariables.insideWrapDelimiter = false;
    //        stateVariables.startIndex = index + 1; // set start to one after the current index to avoid the ','
    //    }
    //    // If we reached the end of the line and are in the wrap delimiter, substring up to, but not including this char
    //    else if (index === lastLineIndex && stateVariables.insideWrapDelimiter) {
    //        console.log('  CASE 5');
    //        return splitLine.push(line.substring(stateVariables.startIndex, index));
    //    }
    //    // If we reached the end of the line and are not in the wrap delimiter
    //    else if (index === lastLineIndex) {
    //        return splitLine.push(line.substring(stateVariables.startIndex));
    //    }
    //    console.log('__splitLine__', splitLine);
    //    return ;
    //});

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
        if (!opts) { return callback(new Error(constants.Errors.optionsRequired)); return null; }
        options = opts; // Options were passed, set the global options value

        // If we don't receive data, report an error
        if (!data) { return callback(new Error(constants.Errors.csv2json.cannotCallCsv2JsonOn + data + '.')); return null; }

        // The data provided is not a string
        if (!_.isString(data)) {
            return callback(new Error(constants.Errors.csv2json.csvNotString)); // Report an error back to the caller
        }

        // Split the CSV into lines using the specified EOL option
        var lines = data.split(options.EOL),
            json = convertCSV(lines, callback); // Retrieve the JSON document array
        return callback(null, json); // Send the data back to the caller
    }

};