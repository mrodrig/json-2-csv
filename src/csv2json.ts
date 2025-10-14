'use strict';

import { setPath } from 'doc-path';
import { excelBOM } from './constants';
import type { Csv2JsonParams, FullCsv2JsonOptions, HeaderField } from './types';
import * as utils from './utils';

export const Csv2Json = function (options: FullCsv2JsonOptions) {
    const escapedWrapDelimiterRegex = new RegExp(options.delimiter.wrap + options.delimiter.wrap, 'g'),
        excelBOMRegex = new RegExp('^' + excelBOM),
        valueParserFn = options.parseValue && typeof options.parseValue === 'function' ? options.parseValue : JSON.parse;
    // micro-optimization: cache delimiter and commonly read options locally for hot paths
    const delimiter = options.delimiter;
    const trimHeaderFields = options.trimHeaderFields;
    const headerFieldsOption = options.headerFields;
    const keysOption = options.keys;
    const excelBOMOption = options.excelBOM;
    const trimFieldValues = options.trimFieldValues;
    // Cache hot utility references to avoid repeated property lookups in hot paths
    const getNCharacters = utils.getNCharacters;
    const isStringRepresentation = utils.isStringRepresentation;
    const isDateRepresentation = utils.isDateRepresentation;
    const isError = utils.isError;
    const isInvalid = utils.isInvalid;
    const setPathLocal = setPath;

    /**
     * Trims the header key, if specified by the user via the provided options
     */
    function processHeaderKey(headerKey: string) {
        headerKey = removeWrapDelimitersFromValue(headerKey);
        if (trimHeaderFields) {
            return headerKey.split('.').map((component) => component.trim()).join('.');
        }
        return headerKey;
    }

    /**
     * Generate the JSON heading from the CSV
     */
    function retrieveHeading(lines: string[][]): Csv2JsonParams {
        let headerFields: HeaderField[] = [];

        if (headerFieldsOption) {
            headerFields = headerFieldsOption.map((headerField, index): HeaderField => ({
                value: processHeaderKey(headerField),
                index
            }));
        } else {
            // Generate and return the heading keys
            const headerRow = lines[0];
            headerFields = headerRow.map((headerKey, index) => ({
                value: processHeaderKey(headerKey),
                index
            }));

            // If the user provided keys, filter the generated keys to just the user provided keys so we also have the key index
            if (keysOption) {
                const keys = keysOption; // TypeScript type checking work around to get it to recognize the option is not undefined
                headerFields = headerFields.filter((headerKey) => keys.includes(headerKey.value));
            }
        }

        return {
            lines,
            headerFields,
            // precompute accessors for each header to speed up document creation
            headerAccessors: headerFields.map((hf) => {
                const idx = hf.index;
                const path = hf.value;
                return function setField(document: any, line: string[]) {
                    try {
                        const value = processRecordValue(line[idx]);
                        setPathLocal(document, path, value);
                    } catch (err) {
                        // ignore invalid paths
                    }
                };
            }),
            recordLines: [] as string[][],
        };
    }

    /**
     * Removes the Excel BOM value, if specified by the options object
     */
    function stripExcelBOM(csv: string) {
        if (excelBOMOption) {
            return csv.replace(excelBOMRegex, '');
        }
        return csv;
    }

    /**
     * Helper function that splits a line so that we can handle wrapped fields
     */
    function splitLines(csv: string) {
        // Parse out the line...
        const lines = [],
            lastCharacterIndex = csv.length - 1,
            eolDelimiterLength = delimiter.eol.length,
            stateVariables = {
                insideWrapDelimiter: false,
                parsingValue: true,
                justParsedDoubleQuote: false,
                startIndex: 0
            };

        let splitLine = [],
            character,
            charBefore,
            charAfter,
            nextNChar,
            index = 0;

        // Loop through each character in the line to identify where to split the values
        while (index < csv.length) {
            // Current character
            character = csv[index];
            // Previous character
            charBefore = index ? csv[index - 1] : '';
            // Next character
            charAfter = index < lastCharacterIndex ? csv[index + 1] : '';
            // Next n characters, including the current character, where n = length(EOL delimiter)
            // This allows for the checking of an EOL delimiter when if it is more than a single character (eg. '\r\n')
            nextNChar = getNCharacters(csv, index, eolDelimiterLength);

            if ((nextNChar === options.delimiter.eol && !stateVariables.insideWrapDelimiter ||
                index === lastCharacterIndex) && charBefore === options.delimiter.field) {
                // If we reached an EOL delimiter or the end of the csv and the previous character is a field delimiter...

                // If the start index is the current index (and since the previous character is a comma),
                //   then the value being parsed is an empty value accordingly, add an empty string
                if (nextNChar === options.delimiter.eol && stateVariables.startIndex === index) {
                    splitLine.push('');
                } else if (character === options.delimiter.field) {
                    // If we reached the end of the CSV, there's no new line, and the current character is a comma
                    // then add an empty string for the current value
                    splitLine.push('');
                } else {
                    // Otherwise, there's a valid value, and the start index isn't the current index, grab the whole value
                    splitLine.push(csv.substring(stateVariables.startIndex));
                }

                // Since the last character is a comma, there's still an additional implied field value trailing the comma.
                //   Since this value is empty, we push an extra empty value
                splitLine.push('');

                // Finally, push the split line values into the lines array and clear the split line
                lines.push(splitLine);
                splitLine = [];
                stateVariables.startIndex = index + eolDelimiterLength;
                stateVariables.parsingValue = true;
                stateVariables.insideWrapDelimiter = charAfter === options.delimiter.wrap;
            } else if (index === lastCharacterIndex && character === options.delimiter.field) {
                // If we reach the end of the CSV and the current character is a field delimiter

                // Parse the previously seen value and add it to the line
                const parsedValue = csv.substring(stateVariables.startIndex, index);
                splitLine.push(parsedValue);

                // Then add an empty string to the line since the last character being a field delimiter indicates an empty field
                splitLine.push('');
                lines.push(splitLine);
            } else if (index === lastCharacterIndex || nextNChar === options.delimiter.eol &&
                // if we aren't inside wrap delimiters or if we are but the character before was a wrap delimiter and we didn't just see two
                (!stateVariables.insideWrapDelimiter ||
                    stateVariables.insideWrapDelimiter && charBefore === options.delimiter.wrap && !stateVariables.justParsedDoubleQuote)) {
                // Otherwise if we reached the end of the line or csv (and current character is not a field delimiter)

                const toIndex = index !== lastCharacterIndex || charBefore === options.delimiter.wrap ? index : undefined;

                // Retrieve the remaining value and add it to the split line list of values
                splitLine.push(csv.substring(stateVariables.startIndex, toIndex));

                // Finally, push the split line values into the lines array and clear the split line
                lines.push(splitLine);
                splitLine = [];
                stateVariables.startIndex = index + eolDelimiterLength;
                stateVariables.parsingValue = true;
                stateVariables.insideWrapDelimiter = charAfter === options.delimiter.wrap;
            } else if (character === options.delimiter.wrap && charBefore === options.delimiter.field &&
                !stateVariables.insideWrapDelimiter && !stateVariables.parsingValue) {
                // If we reached a wrap delimiter after a comma and we aren't inside a wrap delimiter

                stateVariables.startIndex = index;
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;

                // If the next character(s) are an EOL delimiter, then skip them so we don't parse what we've seen as another value
                if (getNCharacters(csv, index + 1, eolDelimiterLength) === delimiter.eol) {
                    index += delimiter.eol.length + 1; // Skip past EOL
                }
            } else if (charBefore === options.delimiter.field && character === options.delimiter.wrap && charAfter === options.delimiter.eol) {
                // We reached the start of a wrapped new field that begins with an EOL delimiter

                // Retrieve the remaining value and add it to the split line list of values
                splitLine.push(csv.substring(stateVariables.startIndex, index - 1));

                stateVariables.startIndex = index;
                stateVariables.parsingValue = true;
                stateVariables.insideWrapDelimiter = true;
                stateVariables.justParsedDoubleQuote = true;
                index += 1;
            } else if ((charBefore !== delimiter.wrap || stateVariables.justParsedDoubleQuote && charBefore === delimiter.wrap) &&
                character === delimiter.wrap && getNCharacters(csv, index + 1, eolDelimiterLength) === delimiter.eol) {
                // If we reach a wrap which is not preceded by a wrap delim and the next character is an EOL delim (ie. *"\n)

                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
                // Next iteration will substring, add the value to the line, and push the line onto the array of lines
            } else if (character === delimiter.wrap && (index === 0 || getNCharacters(csv, index - eolDelimiterLength, eolDelimiterLength) === delimiter.eol && !stateVariables.insideWrapDelimiter)) {
                // If the line starts with a wrap delimiter (ie. "*)

                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === delimiter.wrap && charAfter === delimiter.field && stateVariables.insideWrapDelimiter) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. *",)

                splitLine.push(csv.substring(stateVariables.startIndex, index + 1));
                stateVariables.startIndex = index + 2; // next value starts after the field delimiter
                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
            } else if (character === delimiter.wrap && charBefore === delimiter.field &&
                !stateVariables.insideWrapDelimiter && stateVariables.parsingValue) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. ,"*)

                splitLine.push(csv.substring(stateVariables.startIndex, index - 1));
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === delimiter.wrap && charAfter === delimiter.wrap && index !== stateVariables.startIndex) {
                // If we run into an escaped quote (ie. "") skip past the second quote

                index += 2;
                stateVariables.justParsedDoubleQuote = true;
                continue;
            } else if (character === delimiter.field && charBefore !== delimiter.wrap &&
                charAfter !== delimiter.wrap && !stateVariables.insideWrapDelimiter &&
                stateVariables.parsingValue) {
                // If we reached a field delimiter and are not inside the wrap delimiters (ie. *,*)

                splitLine.push(csv.substring(stateVariables.startIndex, index));
                stateVariables.startIndex = index + 1;
            } else if (character === delimiter.field && charBefore === delimiter.wrap &&
                charAfter !== delimiter.wrap && !stateVariables.parsingValue) {
                // If we reached a field delimiter, the previous character was a wrap delimiter, and the
                //   next character is not a wrap delimiter (ie. ",*)

                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index + 1;
            }
            // Otherwise increment to the next character
            index++;
            // Reset the double quote state variable
            stateVariables.justParsedDoubleQuote = false;
        }

        return lines;
    }

    /**
     * Retrieves the record lines from the split CSV lines and sets it on the params object
     */
    function retrieveRecordLines(params: Csv2JsonParams) {
        if (headerFieldsOption) { // This option is passed for instances where the CSV has no header line
            params.recordLines = params.lines;
        } else { // All lines except for the header line
            params.recordLines = params.lines.splice(1);
        }

        return params;
    }

    /**
     * Retrieves the value for the record from the line at the provided key.
     */
    function retrieveRecordValueFromLine(headerField: HeaderField, line: string[]) {
        // If there is a value at the key's index, use it; otherwise, null
        const value = line[headerField.index];

        // Perform any necessary value conversions on the record value
        return processRecordValue(value);
    }

    /**
     * Processes the record's value by parsing the data to ensure the CSV is
     * converted to the JSON that created it.
     */
    function processRecordValue(fieldValue: string) {
        // If the value is an array representation, convert it
        const parsedJson = parseValue(fieldValue);
        // If parsedJson is anything aside from an error, then we want to use the parsed value
        // This allows us to interpret values like 'null' --> null, 'false' --> false
        if (!isError(parsedJson) && !isInvalid(parsedJson)) {
            return parsedJson;
        } else if (fieldValue === 'undefined') {
            return undefined;
        }

        return fieldValue;
    }

    /**
     * Trims the record value, if specified by the user via the options object
     */
    function trimRecordValue(fieldValue: string) {
        if (trimFieldValues && fieldValue !== null) {
            return fieldValue.trim();
        }
        return fieldValue;
    }

    /**
     * Create a JSON document with the given keys (designated by the CSV header)
     *   and the values (from the given line)
     * @returns {Object} created json document
     */
    function createDocument(headerFields: HeaderField[], line: string[]) {
        const document: any = {};

        for (let i = 0; i < headerFields.length; i++) {
            const headerField = headerFields[i];
            try {
                const value = retrieveRecordValueFromLine(headerField, line);
                setPathLocal(document, headerField.value, value);
            } catch (err) {
                // ignore errors when setting invalid paths
            }
        }

        return document;
    }

    /**
     * Removes the outermost wrap delimiters from a value, if they are present
     * Otherwise, the non-wrapped value is returned as is
     */
    function removeWrapDelimitersFromValue(fieldValue: string) {
        const firstChar = fieldValue[0],
            lastIndex = fieldValue.length - 1,
            lastChar = fieldValue[lastIndex];
        // If the field starts and ends with a wrap delimiter
        if (firstChar === delimiter.wrap && lastChar === delimiter.wrap) {
            // Handle the case where the field is just a pair of wrap delimiters 
            return fieldValue.length <= 2 ? '' : fieldValue.substring(1, lastIndex);
        }
        return fieldValue;
    }

    /**
     * Unescapes wrap delimiters by replacing duplicates with a single (eg. "" -> ")
     * This is done in order to parse RFC 4180 compliant CSV back to JSON
     */
    function unescapeWrapDelimiterInField(fieldValue: string) {
        return fieldValue.replace(escapedWrapDelimiterRegex, delimiter.wrap);
    }

    /**
     * Main helper function to convert the CSV to the JSON document array
     */
    function transformRecordLines(params: Csv2JsonParams) {
        const results: object[] = [];

        const accessors = params.headerAccessors;

        for (let i = 0; i < params.recordLines.length; i++) {
            let line = params.recordLines[i];

            for (let j = 0; j < line.length; j++) {
                let fieldValue = line[j];
                fieldValue = removeWrapDelimitersFromValue(fieldValue);
                fieldValue = unescapeWrapDelimiterInField(fieldValue);
                fieldValue = trimRecordValue(fieldValue);
                line[j] = fieldValue;
            }

            if (accessors && accessors.length) {
                const document: any = {};
                for (let a = 0; a < accessors.length; a++) {
                    accessors[a](document, line);
                }
                results.push(document);
            } else {
                const generatedDocument = createDocument(params.headerFields, line);
                results.push(generatedDocument);
            }
        }

        return results;
    }

    /**
     * Attempts to parse the provided value. If it is not parsable, then an error is returned
     */
    function parseValue(value: string) {
        try {
            if (isStringRepresentation(value, options) && !isDateRepresentation(value)) {
                return value;
            }

            const parsedJson = valueParserFn(value);

            // If the parsed value is an array, then we also need to trim record values, if specified
            if (Array.isArray(parsedJson)) {
                return parsedJson.map(trimRecordValue);
            }

            return parsedJson;
        } catch (err) {
            return err;
        }
    }

    /**
     * Internally exported csv2json function
     */
    function convert(data: string) {
        // Split the CSV into lines using the specified EOL option
        const stripped = stripExcelBOM(data);
        const split = splitLines(stripped);
        const heading = retrieveHeading(split); // Retrieve the headings from the CSV, unless the user specified the keys
        const lines = retrieveRecordLines(heading); // Retrieve the record lines from the CSV

        return transformRecordLines(lines); // Retrieve the JSON document array
    }

    return {
        convert,
    };
};
