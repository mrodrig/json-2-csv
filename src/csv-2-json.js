'use strict';

let _ = require('underscore'),
    path = require('doc-path'),
    constants = require('./constants.json');

const Csv2Json = function (options) {
    /**
     * Generate the JSON heading from the CSV
     * @param lines
     * @param callback
     * @returns {*}
     */
    function retrieveHeading(lines, callback) {
        // If there are no lines passed in, return an error
        if (!lines.length) {
            return callback(new Error(constants.Errors.csv2json.noDataRetrieveHeading)); // Pass an error back to the user
        }

        // Generate and return the heading keys
        return _.map(splitLine(lines[0]),
            function (headerKey, index) {
                return {
                    value: options.trimHeaderFields ? headerKey.trim() : headerKey,
                    index: index
                };
            });
    }

    /**
     * Does the given value represent an array?
     * @param value
     * @returns {boolean}
     */
    function isArrayRepresentation(value) {
        // Verify that there is a value and it starts with '[' and ends with ']'
        return (value && /^\[.*\]$/.test(value));
    }

    /**
     * Converts the value from a CSV 'array'
     * @param arrayRepresentation
     * @returns {Array}
     */
    function convertArrayRepresentation(arrayRepresentation) {
        // Remove the '[' and ']' characters
        arrayRepresentation = arrayRepresentation.replace(/(\[|\])/g, '');

        // Split the arrayRepresentation into an array by the array delimiter
        arrayRepresentation = arrayRepresentation.split(options.delimiter.array);

        // Filter out non-empty strings
        return _.filter(arrayRepresentation, function (value) {
            return value;
        });
    }

    /**
     * Create a JSON document with the given keys (designated by the CSV header)
     *   and the values (from the given line)
     * @param keys String[]
     * @param line String
     * @returns {Object} created json document
     */
    function createDocument(keys, line) {
        line = splitLine(line); // Split the line using the given field delimiter after trimming whitespace
        let val; // Temporary letiable to set the current key's value to

        // Reduce the keys into a JSON document representing the given line
        return _.reduce(keys, function (document, key) {
            // If there is a value at the key's index in the line, set the value; otherwise null
            val = line[key.index] ? line[key.index] : null;

            // If the user wants to trim field values, trim the value
            val = options.trimFieldValues && !_.isNull(val) ? val.trim() : val;

            // If the value is an array representation, convert it
            if (isArrayRepresentation(val)) {
                val = convertArrayRepresentation(val);
            }
            // Otherwise add the key and value to the document
            return path.setPath(document, key.value, val);
        }, {});
    }

    /**
     * Main helper function to convert the CSV to the JSON document array
     * @param lines String[]
     * @param callback Function callback function
     * @returns {Array}
     */
    function convertCSV(lines, callback) {
        let generatedHeaders = retrieveHeading(lines, callback), // Retrieve the headings from the CSV, unless the user specified the keys
            nonHeaderLines = lines.splice(1), // All lines except for the header line
            // If the user provided keys, filter the generated keys to just the user provided keys so we also have the key index
            headers = options.keys ? _.filter(generatedHeaders, function (headerKey) {
                return _.contains(options.keys, headerKey.value);
            }) : generatedHeaders;

        return _.reduce(nonHeaderLines, function (documentArray, line) { // For each line, create the document and add it to the array of documents
            if (!line) { return documentArray; } // skip over empty lines
            let generatedDocument = createDocument(headers, line.trim());
            return documentArray.concat(generatedDocument);
        }, []);
    }

    /**
     * Helper function that splits a line so that we can handle wrapped fields
     * @param line
     */
    function splitLine(line) {
        // If the fields are not wrapped, return the line split by the field delimiter
        if (!options.delimiter.wrap) { return line.split(options.delimiter.field); }

        // Parse out the line...
        let splitLine = [],
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
            else if (character === options.delimiter.wrap && index === 0) {
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index + 1;
            }

            // If we reached a wrap delimiter with a field delimiter after it (ie. *",)
            else if (character === options.delimiter.wrap && charAfter === options.delimiter.field) {
                splitLine.push(line.substring(stateVariables.startIndex, index));
                stateVariables.startIndex = index + 2; // next value starts after the field delimiter
                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
            }
            // If we reached a wrap delimiter with a field delimiter after it (ie. ,"*)
            else if (character === options.delimiter.wrap && charBefore === options.delimiter.field) {
                if (stateVariables.parsingValue) {
                    splitLine.push(line.substring(stateVariables.startIndex, index-1));
                }
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index + 1;
            }
            // If we reached a field delimiter and are not inside the wrap delimiters (ie. *,*)
            else if (character === options.delimiter.field && charBefore !== options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap && !stateVariables.insideWrapDelimiter &&
                stateVariables.parsingValue) {
                splitLine.push(line.substring(stateVariables.startIndex, index));
                stateVariables.startIndex = index + 1;
            }
            else if (character === options.delimiter.field && charBefore === options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap) {
                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index + 1;
            }
            else if (character === options.delimiter.wrap && charAfter === options.delimiter.wrap && stateVariables.insideWrapDelimiter) {
                line = line.slice(0, index) + line.slice(index+1); // Remove the current character from the line
                lastCharacterIndex--; // Update the value since we removed a character
            }
            // Otherwise increment to the next character
            index++;
        }

        return splitLine;
    }

    /**
     * Internally exported csv2json function
     * Takes options as a document, data as a CSV string, and a callback that will be used to report the results
     * @param data String csv string
     * @param callback Function callback function
     */
    function convert(data, callback) {
        // If a callback wasn't provided, throw an error
        if (!callback) { throw new Error(constants.Errors.callbackRequired); }

        // Shouldn't happen, but just in case
        if (!opts) { return callback(new Error(constants.Errors.optionsRequired)); }

        // If we don't receive data, report an error
        if (!data) { return callback(new Error(constants.Errors.csv2json.cannotCallCsv2JsonOn + data + '.')); }

        // The data provided is not a string
        if (!_.isString(data)) {
            return callback(new Error(constants.Errors.csv2json.csvNotString)); // Report an error back to the caller
        }

        // Split the CSV into lines using the specified EOL option
        let lines = data.split(options.delimiter.eol),
            json = convertCSV(lines, callback); // Retrieve the JSON document array
        return callback(null, json); // Send the data back to the caller
    }

    return { convert };
};

module.exports = { Csv2Json };