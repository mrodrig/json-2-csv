'use strict';

let constants = require('./constants.json'),
    utils = require('./utils'),
    _ = require('underscore'),
    path = require('doc-path');

const Csv2Json = function(options) {
    const escapedWrapDelimiterRegex = new RegExp(options.delimiter.wrap + options.delimiter.wrap, 'g'),
        excelBOMRegex = new RegExp('^' + constants.values.excelBOM);

    /**
     * Trims the header key, if specified by the user via the provided options
     * @param headerKey
     * @returns {*}
     */
    function trimHeaderKey(headerKey) {
        if (options.trimHeaderFields) {
            return headerKey.split('.')
                .map((component) => component.trim())
                .join('.');
        }
        return headerKey;
    }

    /**
     * Generate the JSON heading from the CSV
     * @param lines {Array<String>} csv lines split by EOL delimiter
     * @returns {*}
     */
    function retrieveHeading(lines) {
        let params = {lines},
            // Generate and return the heading keys
            headerRow = params.lines[0];
        params.headerFields = splitLine(headerRow).map((headerKey, index) => ({
            value: trimHeaderKey(headerKey),
            index: index
        }));

        // If the user provided keys, filter the generated keys to just the user provided keys so we also have the key index
        if (options.keys) {
            params.headerFields = params.headerFields.filter((headerKey) => options.keys.includes(headerKey.value));
        }

        return params;
    }

    /**
     * Splits the lines of the CSV string by the EOL delimiter and resolves and array of strings (lines)
     * @param csv
     * @returns {Promise.<String[]>}
     */
    function splitCsvLines(csv) {
        return Promise.resolve(csv.split(options.delimiter.eol));
    }

    /**
     * Removes the Excel BOM value, if specified by the options object
     * @param csv
     * @returns {Promise.<String>}
     */
    function stripExcelBOM(csv) {
        if (options.excelBOM) {
            return Promise.resolve(csv.replace(excelBOMRegex, ''));
        }
        return Promise.resolve(csv);
    }

    /**
     * Helper function that splits a line so that we can handle wrapped fields
     * @param line
     */
    function splitLine(line) {
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
        while (index < line.length) {
            // Current character
            character = line[index];
            // Previous character
            charBefore = index ? line[index - 1] : '';
            // Next character
            charAfter = index < lastCharacterIndex ? line[index + 1] : '';

            if (index === lastCharacterIndex && character === options.delimiter.field) {
                // If we reached the end of the line and the current character is a field delimiter...

                // Push the value for the field that we were parsing
                splitLine.push(
                    // If the start index is the current index (and since the character is a comma),
                    //   then the value being parsed is an empty value accordingly, add an empty string
                    stateVariables.startIndex === index
                        ? ''
                        // Otherwise there is a valid value, but we do not want to include the current character (field delimiter)
                        : line.substring(stateVariables.startIndex, index)
                );

                // Since the last character is a comma, there's still an additional implied field value trailing the comma.
                //   Since this value is empty, we push an extra empty value
                splitLine.push('');
            } else if (index === lastCharacterIndex) {
                // Otherwise if we reached the end of the line (and current character is not a field delimiter)

                // Retrieve the remaining value and add it to the split line list of values
                splitLine.push(line.substring(stateVariables.startIndex));
            } else if (character === options.delimiter.wrap && index === 0) {
                // If the line starts with a wrap delimiter (ie. "*)

                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === options.delimiter.wrap && charAfter === options.delimiter.field) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. *",)

                splitLine.push(line.substring(stateVariables.startIndex, index + 1));
                stateVariables.startIndex = index + 2; // next value starts after the field delimiter
                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
            } else if (character === options.delimiter.wrap && charBefore === options.delimiter.field &&
                !stateVariables.insideWrapDelimiter && stateVariables.parsingValue) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. ,"*)

                splitLine.push(line.substring(stateVariables.startIndex, index - 1));
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === options.delimiter.wrap && charAfter === options.delimiter.wrap) {
                // If we run into an escaped quote (ie. "") skip past the second quote

                index += 2;
                continue;
            } else if (character === options.delimiter.field && charBefore !== options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap && !stateVariables.insideWrapDelimiter &&
                stateVariables.parsingValue) {
                // If we reached a field delimiter and are not inside the wrap delimiters (ie. *,*)

                splitLine.push(line.substring(stateVariables.startIndex, index));
                stateVariables.startIndex = index + 1;
            } else if (character === options.delimiter.field && charBefore === options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap && !stateVariables.parsingValue) {
                // If we reached a field delimiter, the previous character was a wrap delimiter, and the
                //   next character is not a wrap delimiter (ie. ",*)

                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index + 1;
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

    /**
     * Retrieves the value for the record from the line at the provided key.
     * @param line {String[]} split line values for the record
     * @param key {Object} {index: Number, value: String}
     */
    function retrieveRecordValueFromLine(line, key) {
        // If there is a value at the key's index, use it; otherwise, null
        let value = line[key.index];

        // Perform any necessary value conversions on the record value
        return processRecordValue(value);
    }

    /**
     * Processes the record's value by parsing the data to ensure the CSV is
     * converted to the JSON that created it.
     * @param fieldValue {String}
     * @returns {*}
     */
    function processRecordValue(fieldValue) {
        // If the value is an array representation, convert it
        let parsedJson = parseValue(fieldValue);
        // If parsedJson is anything aside from an error, then we want to use the parsed value
        // This allows us to interpret values like 'null' --> null, 'false' --> false
        if (!_.isError(parsedJson)) {
            fieldValue = parsedJson;
        } else if (fieldValue === 'undefined') {
            fieldValue = undefined;
        }

        return fieldValue;
    }

    /**
     * Trims the record value, if specified by the user via the options object
     * @param fieldValue
     * @returns {String|null}
     */
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
        return keys.reduce((document, key) => {
            // If there is a value at the key's index in the line, set the value; otherwise null
            let value = retrieveRecordValueFromLine(line, key);

            // Otherwise add the key and value to the document
            return path.setPath(document, key.value, value);
        }, {});
    }

    /**
     * Removes the outermost wrap delimiters from a value, if they are present
     * Otherwise, the non-wrapped value is returned as is
     * @param fieldValue
     * @returns {String}
     */
    function removeWrapDelimitersFromValue(fieldValue) {
        let firstChar = fieldValue[0],
            lastIndex = fieldValue.length - 1,
            lastChar = fieldValue[lastIndex];
        // If the field starts and ends with a wrap delimiter
        if (firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap) {
            return fieldValue.substr(1, lastIndex - 1);
        }
        return fieldValue;
    }

    /**
     * Unescapes wrap delimiters by replacing duplicates with a single (eg. "" -> ")
     * This is done in order to parse RFC 4180 compliant CSV back to JSON
     * @param fieldValue
     * @returns {String}
     */
    function unescapeWrapDelimiterInField(fieldValue) {
        return fieldValue.replace(escapedWrapDelimiterRegex, options.delimiter.wrap);
    }

    /**
     * Main helper function to convert the CSV to the JSON document array
     * @param params {Object} {lines: [String], callback: Function}
     * @returns {Array}
     */
    function transformRecordLines(params) {
        params.json = params.recordLines.reduce((generatedJsonObjects, line) => { // For each line, create the document and add it to the array of documents
            // skip over empty lines
            if (!line) {
                return generatedJsonObjects;
            }

            // Split the line using the given field delimiter after trimming whitespace
            line = splitLine(line).map((fieldValue) => {
                fieldValue = removeWrapDelimitersFromValue(fieldValue);
                fieldValue = unescapeWrapDelimiterInField(fieldValue);
                fieldValue = trimRecordValue(fieldValue);

                return fieldValue;
            });

            let generatedDocument = createDocument(params.headerFields, line);
            return generatedJsonObjects.concat(generatedDocument);
        }, []);

        return params;
    }

    /**
     * Attempts to parse the provided value. If it is not parsable, then an error is returned
     * @param value
     * @returns {*}
     */
    function parseValue(value) {
        try {
            if (utils.isStringRepresentation(value, options) && !utils.isDateRepresentation(value)) {
                return value;
            }

            let parsedJson = JSON.parse(value);

            // If the parsed value is an array, then we also need to trim record values, if specified
            if (_.isArray(parsedJson)) {
                return parsedJson.map(trimRecordValue);
            }

            return parsedJson;
        } catch (err) {
            return err;
        }
    }

    /**
     * Internally exported csv2json function
     * Takes options as a document, data as a CSV string, and a callback that will be used to report the results
     * @param data String csv string
     * @param callback Function callback function
     */
    function convert(data, callback) {
        // Split the CSV into lines using the specified EOL option
        // validateCsv(data, callback)
        //     .then(stripExcelBOM)
        stripExcelBOM(data)
            .then(splitCsvLines)
            .then(retrieveHeading) // Retrieve the headings from the CSV, unless the user specified the keys
            .then(retrieveRecordLines) // Retrieve the record lines from the CSV
            .then(transformRecordLines) // Retrieve the JSON document array
            .then((params) => callback(null, params.json)) // Send the data back to the caller
            .catch(callback);
    }

    return {
        convert,
        validationFn: _.isString,
        validationMessages: constants.errors.csv2json
    };
};

module.exports = { Csv2Json };
