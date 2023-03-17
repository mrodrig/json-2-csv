'use strict';

import { evaluatePath } from 'doc-path';
import { deepKeysFromList } from 'deeks';
import { excelBOM, errors } from './constants';
import * as utils from './utils';
import type { FullJson2CsvOptions, Json2CsvParams } from './types';

export const Json2Csv = function(options: FullJson2CsvOptions) {
    const wrapDelimiterCheckRegex = new RegExp(options.delimiter.wrap, 'g'),
        crlfSearchRegex = /\r?\n|\r/,
        customValueParser = options.parseValue && typeof options.parseValue === 'function' ? options.parseValue : null,
        expandingWithoutUnwinding = options.expandArrayObjects && !options.unwindArrays,
        deeksOptions = {
            expandArrayObjects: expandingWithoutUnwinding,
            ignoreEmptyArraysWhenExpanding: expandingWithoutUnwinding,
            escapeNestedDots: true
        };

    /** HEADER FIELD FUNCTIONS **/

    /**
     * Returns the list of data field names of all documents in the provided list
     */
    async function getFieldNameList(data: object[]) {
        // If keys weren't specified, then we'll use the list of keys generated by the deeks module
        return deepKeysFromList(data, deeksOptions);
    }

    /**
     * Processes the schemas by checking for schema differences, if so desired.
     * If schema differences are not to be checked, then it resolves the unique
     * list of field names.
     */
    function processSchemas(documentSchemas: string[][]) {
        // If the user wants to check for the same schema (regardless of schema ordering)
        if (options.checkSchemaDifferences) {
            return checkSchemaDifferences(documentSchemas);
        } else {
            // Otherwise, we do not care if the schemas are different, so we should get the unique list of keys
            const uniqueFieldNames = utils.unique(utils.flatten(documentSchemas));
            return uniqueFieldNames;
        }
    }

    /**
     * This function performs the schema difference check, if the user specifies that it should be checked.
     * If there are no field names, then there are no differences.
     * Otherwise, we get the first schema and the remaining list of schemas
     */
    function checkSchemaDifferences(documentSchemas: string[][]) {
        // have multiple documents - ensure only one schema (regardless of field ordering)
        const firstDocSchema = documentSchemas[0],
            restOfDocumentSchemas = documentSchemas.slice(1),
            schemaDifferences = computeNumberOfSchemaDifferences(firstDocSchema, restOfDocumentSchemas);

        // If there are schema inconsistencies, throw a schema not the same error
        if (schemaDifferences) {
            throw new Error(errors.json2csv.notSameSchema);
        }

        return firstDocSchema;
    }

    /**
     * Computes the number of schema differences
     */
    function computeNumberOfSchemaDifferences(firstDocSchema: string[], restOfDocumentSchemas: string[][]) {
        return restOfDocumentSchemas.reduce((schemaDifferences, documentSchema) => {
            // If there is a difference between the schemas, increment the counter of schema inconsistencies
            const numberOfDifferences = utils.computeSchemaDifferences(firstDocSchema, documentSchema).length;
            return numberOfDifferences > 0
                ? schemaDifferences + 1
                : schemaDifferences;
        }, 0);
    }

    /**
     * If so specified, this filters the detected key paths to exclude any keys that have been specified
     */
    function filterExcludedKeys(keyPaths: string[]) {
        if (options.excludeKeys) {
            return keyPaths.filter((keyPath) => {
                return !options.excludeKeys.includes(keyPath);
            });
        }

        return keyPaths;
    }

    /**
     * If so specified, this sorts the header field names alphabetically
     */
    function sortHeaderFields(fieldNames: string[]) {
        if (options.sortHeader && typeof options.sortHeader === 'function') {
            return fieldNames.sort(options.sortHeader);
        } else if (options.sortHeader) {
            return fieldNames.sort();
        }
        return fieldNames;
    }

    /**
     * Trims the header fields, if the user desires them to be trimmed.
     */
    function trimHeaderFields(params: Json2CsvParams) {
        if (options.trimHeaderFields) {
            params.headerFields = params.headerFields.map((field) => field.split('.')
                .map((component) => component.trim())
                .join('.')
            );
        }
        return params;
    }

    /**
     * Wrap the headings, if desired by the user.
     */
    function wrapHeaderFields(params: Json2CsvParams) {
        // only perform this if we are actually prepending the header
        if (options.prependHeader) {
            params.headerFields = params.headerFields.map(function(headingKey) {
                return wrapFieldValueIfNecessary(headingKey);
            });
        }
        return params;
    }

    /**
     * Generates the CSV header string by joining the headerFields by the field delimiter
     */
    function generateCsvHeader(params: Json2CsvParams) {
        // #185 - generate a keys list to avoid finding native Map() methods
        const fieldTitleMapKeys = Object.keys(options.fieldTitleMap);

        params.header = params.headerFields
            .map(function(field) {
                const headerKey = fieldTitleMapKeys.includes(field) ? options.fieldTitleMap[field] : field;
                return wrapFieldValueIfNecessary(headerKey);
            })
            .join(options.delimiter.field);
        return params;
    }

    function convertKeysToHeaderFields() {
        if (!options.keys) return [];

        return options.keys.map((key) => {
            if (typeof key === 'object' && 'field' in key) {
                options.fieldTitleMap[key.field] = key.title ?? key.field;
                return key.field;
            }
            return key;
        });
    }

    /**
     * Retrieve the headings for all documents and return it.
     * This checks that all documents have the same schema.
     */
    function retrieveHeaderFields(data: object[]) {
        const keyStrings = convertKeysToHeaderFields();
        
        if (options.keys) {
            options.keys = keyStrings;

            if (!options.unwindArrays) {
                return Promise.resolve(keyStrings)
                    .then(filterExcludedKeys)
                    .then(sortHeaderFields);
            }
        }

        return getFieldNameList(data)
            .then(processSchemas)
            .then(filterExcludedKeys)
            .then(sortHeaderFields);
    }

    /** RECORD FIELD FUNCTIONS **/

    /**
     * Unwinds objects in arrays within record objects if the user specifies the
     * expandArrayObjects option. If not specified, this passes the params
     * argument through to the next function in the promise chain.
     * 
     * The `finalPass` parameter is used to trigger one last pass to ensure no more
     * arrays need to be expanded
     */
    async function unwindRecordsIfNecessary(params: Json2CsvParams, finalPass = false): Promise<Json2CsvParams> {
        if (options.unwindArrays) {
            const originalRecordsLength = params.records.length;

            // Unwind each of the documents at the given headerField
            params.headerFields.forEach((headerField) => {
                params.records = utils.unwind(params.records, headerField);
            });

            return retrieveHeaderFields(params.records)
                .then((headerFields) => {
                    params.headerFields = headerFields;

                    // If we were able to unwind more arrays, then try unwinding again...
                    if (originalRecordsLength !== params.records.length) {
                        return unwindRecordsIfNecessary(params);
                    }
                    // Otherwise, we didn't unwind any additional arrays, so continue...

                    // Run a final time in case the earlier unwinding exposed additional
                    // arrays to unwind...
                    if (!finalPass) {
                        return unwindRecordsIfNecessary(params, true);
                    }

                    // If keys were provided, set the headerFields back to the provided keys after unwinding:
                    if (options.keys) {
                        const userSelectedFields = convertKeysToHeaderFields();
                        params.headerFields = filterExcludedKeys(userSelectedFields);
                    }

                    return params;
                });
        }
        return params;
    }

    /**
     * Main function which handles the processing of a record, or document to be converted to CSV format
     * This function specifies and performs the necessary operations in the necessary order
     * in order to obtain the data and convert it to CSV form while maintaining RFC 4180 compliance.
     * * Order of operations:
     * - Get fields from provided key list (as array of actual values)
     * - Convert the values to csv/string representation [possible option here for custom converters?]
     * - Trim fields
     * - Determine if they need to be wrapped (& wrap if necessary)
     * - Combine values for each line (by joining by field delimiter)
     */
    function processRecords(params: Json2CsvParams) {
        params.recordString = params.records.map((record) => {
            // Retrieve data for each of the headerFields from this record
            const recordFieldData = retrieveRecordFieldData(record, params.headerFields),

                // Process the data in this record and return the
                processedRecordData = recordFieldData.map((fieldValue) => {
                    fieldValue = trimRecordFieldValue(fieldValue);
                    fieldValue = preventCsvInjection(fieldValue);
                    let stringified = customValueParser ? customValueParser(fieldValue, recordFieldValueToString) : recordFieldValueToString(fieldValue);
                    stringified = wrapFieldValueIfNecessary(stringified);

                    return stringified;
                });

            // Join the record data by the field delimiter
            return generateCsvRowFromRecord(processedRecordData);
        }).join(options.delimiter.eol);

        return params;
    }

    /**
     * Helper function intended to process *just* array values when the expandArrayObjects setting is set to true
     */
    function processRecordFieldDataForExpandedArrayObject(recordFieldValue: unknown[]) {
        const filteredRecordFieldValue = utils.removeEmptyFields(recordFieldValue);

        // If we have an array and it's either empty of full of empty values, then use an empty value representation
        if (!recordFieldValue.length || !filteredRecordFieldValue.length) {
            return options.emptyFieldValue || '';
        } else if (filteredRecordFieldValue.length === 1) {
            // Otherwise, we have an array of actual values...
            // Since we are expanding array objects, we will want to key in on values of objects.
            return filteredRecordFieldValue[0]; // Extract the single value in the array
        }

        return recordFieldValue;
    }

    /**
     * Gets all field values from a particular record for the given list of fields
     */
    function retrieveRecordFieldData(record: object, fields: string[]) {
        const recordValues: unknown[] = [];

        fields.forEach((field) => {
            let recordFieldValue = evaluatePath(record, field);

            if (!utils.isUndefined(options.emptyFieldValue) && utils.isEmptyField(recordFieldValue)) {
                recordFieldValue = options.emptyFieldValue;
            } else if (options.expandArrayObjects && Array.isArray(recordFieldValue)) {
                recordFieldValue = processRecordFieldDataForExpandedArrayObject(recordFieldValue);
            }

            recordValues.push(recordFieldValue);
        });

        return recordValues;
    }

    /**
     * Converts a record field value to its string representation
     */
    function recordFieldValueToString(fieldValue: unknown) {
        const isDate = fieldValue instanceof Date; // store to avoid checking twice

        if (fieldValue === null || Array.isArray(fieldValue) || typeof fieldValue === 'object' && !isDate) {
            return JSON.stringify(fieldValue);
        } else if (typeof fieldValue === 'undefined') {
            return 'undefined';
        } else if (isDate && options.useDateIso8601Format) {
            return fieldValue.toISOString();
        } else {
            return !options.useLocaleFormat ? fieldValue.toString() : fieldValue.toLocaleString();
        }
    }

    /**
     * Trims the record field value, if specified by the user's provided options
     */
    function trimRecordFieldValue(fieldValue: unknown): unknown {
        if (options.trimFieldValues) {
            if (Array.isArray(fieldValue)) {
                return fieldValue.map(trimRecordFieldValue);
            } else if (typeof fieldValue === 'string') {
                return fieldValue.trim();
            }
            return fieldValue;
        }
        return fieldValue;
    }

    /**
     * Prevent CSV injection on strings if specified by the user's provided options.
     * Mitigation will be done by ensuring that the first character doesn't being with:
     * Equals (=), Plus (+), Minus (-), At (@), Tab (0x09), Carriage return (0x0D).
     * More info: https://owasp.org/www-community/attacks/CSV_Injection
     */
    function preventCsvInjection(fieldValue: unknown): unknown {
        if (options.preventCsvInjection) {
            if (Array.isArray(fieldValue)) {
                return fieldValue.map(preventCsvInjection);
            } else if (typeof fieldValue === 'string' && !utils.isNumber(fieldValue)) {
                return fieldValue.replace(/^[=+\-@\t\r]+/g, '');
            }
            return fieldValue;
        }
        return fieldValue;
    }

    /**
     * Escapes quotation marks in the field value, if necessary, and appropriately
     * wraps the record field value if it contains a comma (field delimiter),
     * quotation mark (wrap delimiter), or a line break (CRLF)
     */
    function wrapFieldValueIfNecessary(fieldValue: string) {
        const wrapDelimiter = options.delimiter.wrap;

        // eg. includes quotation marks (default delimiter)
        if (fieldValue.includes(options.delimiter.wrap)) {
            // add an additional quotation mark before each quotation mark appearing in the field value
            fieldValue = fieldValue.replace(wrapDelimiterCheckRegex, wrapDelimiter + wrapDelimiter);
        }
        // if the field contains a comma (field delimiter), quotation mark (wrap delimiter), line break, or CRLF
        //   then enclose it in quotation marks (wrap delimiter)
        if (fieldValue.includes(options.delimiter.field) ||
            fieldValue.includes(options.delimiter.wrap) ||
            fieldValue.match(crlfSearchRegex) ||
            options.wrapBooleans && (fieldValue === 'true' || fieldValue === 'false')) {
            // wrap the field's value in a wrap delimiter (quotation marks by default)
            fieldValue = wrapDelimiter + fieldValue + wrapDelimiter;
        }

        return fieldValue;
    }

    /**
     * Generates the CSV record string by joining the field values together by the field delimiter
     */
    function generateCsvRowFromRecord(recordFieldValues: string[]) {
        return recordFieldValues.join(options.delimiter.field);
    }

    /** CSV COMPONENT COMBINER/FINAL PROCESSOR **/
    /**
     * Performs the final CSV construction by combining the fields in the appropriate
     * order depending on the provided options values and sends the generated CSV
     * back to the user
     */
    function generateCsvFromComponents(params: Json2CsvParams) {
        const header = params.header,
            records = params.recordString,

            // If we are prepending the header, then add an EOL, otherwise just return the records
            csv = (options.excelBOM ? excelBOM : '') +
                (options.prependHeader ? header + options.delimiter.eol : '') +
                records;

        return csv;
    }

    /** MAIN CONVERTER FUNCTION **/

    /**
     * Internally exported json2csv function
     */
    async function convert(data: object[]) {
        // Single document, not an array
        if (utils.isObject(data) && !data.length) {
            data = [data]; // Convert to an array of the given document
        }

        // Retrieve the heading and then generate the CSV with the keys that are identified
        return retrieveHeaderFields(data)
            .then((headerFields) => ({
                headerFields,
                records: data,
                header: '',
                recordString: '',
            }))
            .then(unwindRecordsIfNecessary)
            .then(processRecords)
            .then(wrapHeaderFields)
            .then(trimHeaderFields)
            .then(generateCsvHeader)
            .then(generateCsvFromComponents);
    }

    return {
        convert,
    };
};