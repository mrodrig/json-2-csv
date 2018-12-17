'use strict';

let constants = require('./constants.json'),
    _ = require('underscore'),
    path = require('doc-path');

const Csv2Json = function (options) {
    const leadingWrapRegex = new RegExp('^' + options.delimiter.wrap),
        endingWrapRegex = new RegExp(options.delimiter.wrap + '$'),
        fieldValueWrapRegex = new RegExp('(^' + options.delimiter.wrap + '|' + options.delimiter.wrap + '$)');

    /**
     * Generate the JSON heading from the CSV
     * @param params {Object} {lines: [String], callback: Function}
     * @returns {*}
     */
    function retrieveHeading(params) {
        // Generate and return the heading keys
        let headerRow = params.lines[0];
        params.headerFields = splitLine(headerRow).map((headerKey, index) => {
            return {
                value: options.trimHeaderFields ? headerKey.trim() : headerKey,
                index: index
            };
        });

        // If the user provided keys, filter the generated keys to just the user provided keys so we also have the key index
        if (options.keys) {
            params.headerFields = _.filter(params.headerFields, function (headerKey) {
                return _.contains(options.keys, headerKey.value);
            });
        }

        return params;
    }

    /**
     * Splits the lines of the CSV string by the EOL delimiter and resolves and array of strings (lines)
     * @param csv
     * @returns {Promise.<*>}
     */
    function splitCsvLines(csv) {
        return Promise.resolve(csv.split(options.delimiter.eol));
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
            // If we reached a field delimiter, the previous character was a wrap delimiter, and the next character is not a wrap delimiter (ie. ",*)
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
     * Retrieves the record lines from the split CSV lines and sets it on the params object
     * @param params
     * @returns {*}
     */
    function retrieveRecordLines(params) {
        params.recordLines = params.lines.splice(1); // All lines except for the header line

        return params;
    }

    function retrieveRecordValueFromLine(line, key) {
        let value = null;

        if (line[key.index]) {
            value = line[key.index];
        }

        return processRecordValue(value);
    }

    function processRecordValue(fieldValue) {
        // Trim the value, if specified in the options
        fieldValue = trimRecordValue(fieldValue);

        // TODO: Handle case of null or undefined
        // If the value is an array representation, convert it
        if (isArrayRepresentation(fieldValue)) {
            fieldValue = convertArrayRepresentation(fieldValue);
        }

        return fieldValue;
    }

    function trimRecordValue(fieldValue) {
        if (options.trimFieldValues && !_.isNull(fieldValue)) {
            return fieldValue.trim();
        }
        return fieldValue;
    }

    /**
     * Create a JSON document with the given keys (designated by the CSV header)
     *   and the values (from the given line)
     * @param keys String[]
     * @param line String
     * @returns {Object} created json document
     */
    function createDocument(keys, line) {
        // Reduce the keys into a JSON document representing the given line
        return _.reduce(keys, function (document, key) {
            // If there is a value at the key's index in the line, set the value; otherwise null
            let value = retrieveRecordValueFromLine(line, key);

            // Otherwise add the key and value to the document
            return path.setPath(document, key.value, value);
        }, {});
    }

    function removeWrapDelimitersFromValue(fieldValue) {
        let firstChar = fieldValue[0],
            lastIndex = fieldValue.length - 1,
            lastChar = fieldValue[lastIndex];
        // If the field starts and ends with a wrap delimiter
        // TODO: add check for containing comma (
        if (firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap) {
            return fieldValue.substr(1, lastIndex - 1);
        }
        return fieldValue;
    }

    /**
     * Main helper function to convert the CSV to the JSON document array
     * @param params {Object} {lines: [String], callback: Function}
     * @returns {Array}
     */
    function transformRecordLines(params) {
        params.json = _.reduce(params.recordLines, function (generatedJsonObjects, line) { // For each line, create the document and add it to the array of documents
            // skip over empty lines
            if (!line) { return generatedJsonObjects; }

            // TODO: remove the trim in future version, gets rid of whitespace in leading/ending values
            // Split the line using the given field delimiter after trimming whitespace
            line = splitLine(line.trim()).map((fieldValue) => {
                fieldValue = removeWrapDelimitersFromValue(fieldValue);

                return fieldValue;
            });

            let generatedDocument = createDocument(params.headerFields, line);
            return generatedJsonObjects.concat(generatedDocument);
        }, []);

        return params;
    }

    /** TODO: Refactor array and object representation handling **/
    /**
     * Does the given value represent an array?
     * @param value
     * @returns {boolean}
     */
    function isArrayRepresentation(value) {
        // Verify that there is a value and it starts with '[' and ends with ']'
        return (value && /^\[.*\]$/.test(value));

        // Future version:
        // try {
        //     return JSON.parse(value);;
        // } catch (err) {
        //     return false;
        // }
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
     * Internally exported csv2json function
     * Takes options as a document, data as a CSV string, and a callback that will be used to report the results
     * @param data String csv string
     * @param callback Function callback function
     */
    function convert(data, callback) {
        // Split the CSV into lines using the specified EOL option
        splitCsvLines(data)
            .then((lines) => {
                // If there are no lines passed in, return an error
                if (!lines.length) {
                    return callback(new Error(constants.errors.csv2json.noDataRetrieveHeading)); // Pass an error back to the user
                }

                return {
                    lines,
                    callback
                };
            })
            .then(retrieveHeading) // Retrieve the headings from the CSV, unless the user specified the keys
            .then(retrieveRecordLines) // Retrieve the record lines from the CSV
            .then(transformRecordLines) // Retrieve the JSON document array
            .then((params) => {
                return callback(null, params.json); // Send the data back to the caller
            });
    }

    return {
        convert,
        validationFn: _.isString,
        validationMessages: constants.errors.csv2json
    };
};

module.exports = { Csv2Json };