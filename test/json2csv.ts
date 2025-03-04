/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import assert from 'assert';
import { json2csv } from '../src/converter';
import * as constants from '../src/constants';
import * as utils from '../src/utils';
import testJsonFiles from './config/testJsonFilesList';
import testCsvFiles from './config/testCsvFilesList';

const defaultOptions = constants.defaultJson2CsvOptions,
    testFailureError = new Error('Should not have succeeded');

export function runTests() {
    let options = utils.deepCopy(defaultOptions),
        jsonTestData: typeof testJsonFiles,
        csvTestData: typeof testCsvFiles;

    describe('json2csv Usage', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(testJsonFiles);
                csvTestData = utils.deepCopy(testCsvFiles);
            });

            it('should convert an empty array to an empty csv', () => {
                const csv = json2csv(jsonTestData.noData);
                assert.equal(csv, csvTestData.noData);
            });

            it('should convert a single document to csv', () => {
                const csv = json2csv(jsonTestData.singleDocument);
                assert.equal(csv, csvTestData.singleDocument);
            });

            it('should convert objects with arrays to csv correctly', () => {
                const csv = json2csv(jsonTestData.array);
                assert.equal(csv, csvTestData.array);
            });

            it('should convert objects with dates to csv correctly', () => {
                const csv = json2csv([jsonTestData.date]);
                assert.equal(csv, csvTestData.date);
            });

            it('should convert objects with null to csv correctly', () => {
                const csv = json2csv(jsonTestData.null);
                assert.equal(csv, csvTestData.null);
            });

            it('should convert objects with undefined to csv correctly', () => {
                // Force the value to be set to undefined
                jsonTestData.undefined.colorPreference = undefined;

                const csv = json2csv([jsonTestData.undefined]);
                assert.equal(csv, csvTestData.undefined);
            });

            it('should convert nested json documents to csv', () => {
                const csv = json2csv(jsonTestData.nested);
                assert.equal(csv, csvTestData.nested);
            });

            it('should convert nested json documents with missing fields to csv', () => {
                const csv = json2csv(jsonTestData.nestedMissingField);
                assert.equal(csv, csvTestData.nestedMissingField);
            });

            it('should convert a document with fields containing commas to csv', () => {
                const csv = json2csv(jsonTestData.comma);
                assert.equal(csv, csvTestData.comma);
            });

            it('should convert a document with fields containing quotes to csv', () => {
                const csv = json2csv(jsonTestData.quotes);
                assert.equal(csv, csvTestData.quotes);
            });

            it('should convert a document with header containing quotes to csv', () => {
                const csv = json2csv(jsonTestData.quotesHeader);
                assert.equal(csv, csvTestData.quotesHeader);
            });

            it('should convert a document with fields containing quotes and commas to csv', () => {
                const csv = json2csv(jsonTestData.quotesAndCommas);
                assert.equal(csv, csvTestData.quotesAndCommas);
            });

            it('should convert a document with fields containing an assortment of values to csv', () => {
                const csv = json2csv(jsonTestData.assortedValues);
                assert.equal(csv, csvTestData.assortedValues);
            });

            it('should convert a document with fields containing eol characters to csv', () => {
                const csv = json2csv(jsonTestData.eol);
                assert.equal(csv, csvTestData.eol);
            });

            it('should properly convert the cases involving an empty field value in the csv', () => {
                const csv = json2csv(jsonTestData.csvEmptyLastValue);
                assert.equal(csv, csvTestData.csvEmptyLastValue);
            });

            it('should properly handle headers with the same name as native Map methods', () => {
                const csv = json2csv(jsonTestData.nativeMapMethod);
                assert.equal(csv, csvTestData.nativeMapMethod);
            });

            // Test case for #184
            it('should properly handle keys with nested dots in them', () => {
                const csv = json2csv(jsonTestData.nestedDotKeys);
                assert.equal(csv, csvTestData.nestedDotKeys);
            });

            // Test case for #184
            it('should properly handle keys with nested dots in them even when they appear in array fields', () => {
                const csv = json2csv(jsonTestData.nestedDotKeysWithArray);
                assert.equal(csv, csvTestData.nestedDotKeysWithArray);
            });

            // Test case for #230
            it('should properly handle falsy values in documents', () => {
                const csv = json2csv(jsonTestData.falsyValues);
                assert.equal(csv, csvTestData.falsyValues);
            });
        });

        describe('Error Handling', () => {
            it('should throw an error when the provided data is of the wrong type', () => {
                try {
                    json2csv(undefined as any);
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', `${constants.errors.json2csv.cannotCallOn} undefined.`);
                }
            });

            it('should throw an error about not having been passed data - null', () => {
                try {
                    json2csv(null as any);
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', `${constants.errors.json2csv.cannotCallOn} null.`);
                }
            });

            it('should throw an error about not having been passed data - undefined', () => {
                try {
                    json2csv(undefined as any);
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', `${constants.errors.json2csv.cannotCallOn} undefined.`);
                }
            });

            it('should throw an error if the documents do not have the same schema', () => {
                try {
                    json2csv(jsonTestData.nestedMissingField, {
                        checkSchemaDifferences: true
                    });
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', constants.errors.json2csv.notSameSchema);
                }
            });
        });

        describe('RFC 4180 Compliance', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(testJsonFiles);
                csvTestData = utils.deepCopy(testCsvFiles);
            });

            /**
             * TODO: tests for these conditions:
             * 1. Each record is on a separate line, delimited by a line break
             * 2. Last record in the file may or may not have an ending line break
             * 3. There may be an optional header line appearing as the first line in the file
             *      a. Should contain same number of fields as records in rest of file
             * 4. There may be one or more fields separated by commas.
             *      a. Spaces are considered part of a field and should not be ignored.
             *      b. The last field in a record must not contain a comma
             * 5. Each field may or may not be enclosed in double quotes.
             *      a. If fields are enclosed, then double quotes may not appear inside the field.
             * 6. Fields containing line breaks, CRLF, double quotes, and commas should be enclosed in double quotes
             * 7. If double quotes are used to enclose fields, then a double quote appearing insid a field must be escaped by preceding it with another double quote.
             */

        });

        describe('Custom Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(testJsonFiles);
                csvTestData = utils.deepCopy(testCsvFiles);
            });

            it('should use the provided field delimiter and still convert to json', () => {
                const testFieldDelimiter = '/',
                    replacementRegex = new RegExp(options.delimiter.field, 'g'),
                    testCsv = csvTestData.nested.replace(replacementRegex, testFieldDelimiter);

                const csv = json2csv(jsonTestData.nested, {
                    delimiter: { field: testFieldDelimiter }
                });
                assert.equal(csv, testCsv);
            });

            it('should use the provided wrap delimiter and still convert to json', () => {
                const testWrapDelimiter = '\'',
                    replacementRegex = new RegExp(options.delimiter.wrap, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testWrapDelimiter);

                const csv = json2csv(jsonTestData.comma, {
                    delimiter: { wrap: testWrapDelimiter }
                });
                assert.equal(csv, testCsv);
            });

            it('should use the provided end of line delimiter and still convert to json', () => {
                const testEolDelimiter = '\r\n',
                    replacementRegex = new RegExp(options.delimiter.eol, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testEolDelimiter);

                const csv = json2csv(jsonTestData.comma, {
                    delimiter: { eol: testEolDelimiter }
                });
                assert.equal(csv, testCsv);
            });

            it('should include an excel byte order mark character at the beginning of the csv', () => {
                const csv = json2csv(jsonTestData.assortedValues, {
                    excelBOM: true
                });
                assert.equal(csv, csvTestData.excelBOM);
            });

            it('should not prepend a header if it the options indicate not to add one to the csv', () => {
                const csv = json2csv(jsonTestData.assortedValues, {
                    prependHeader: false
                });
                assert.equal(csv, csvTestData.noHeader);
            });

            it('should sort the header in the csv', () => {
                const csv = json2csv(jsonTestData.assortedValues, {
                    sortHeader: true
                });
                assert.equal(csv, csvTestData.sortedHeader);
            });

            it('should sort the header with a custom function in the csv', () => {
                const csv = json2csv(jsonTestData.assortedValues, {
                    sortHeader: (a, b) => b.localeCompare(a)
                });
                assert.equal(csv, csvTestData.sortedHeaderCustom);
            });

            it('should trim the header fields when specified', () => {
                const csv = json2csv(jsonTestData.trimHeader, {
                    trimHeaderFields: true
                });
                assert.equal(csv, csvTestData.trimmedHeader);
            });

            it('should trim the field values when specified', () => {
                const csv = json2csv(jsonTestData.trimFields, {
                    trimFieldValues: true
                });
                assert.equal(csv, csvTestData.trimmedFields);
            });

            it('should check schema differences when specified - no data', () => {
                const csv = json2csv(jsonTestData.noData, {
                    checkSchemaDifferences: true
                });
                assert.equal(csv, csvTestData.noData);
            });

            it('should check schema differences when specified - same schema', () => {
                const csv = json2csv(jsonTestData.quotesAndCommas, {
                    checkSchemaDifferences: true
                });
                assert.equal(csv, csvTestData.quotesAndCommas);
            });

            it('should use the specified keys, if provided', () => {
                const csv = json2csv(jsonTestData.assortedValues, {
                    keys: ['arrayOfStrings', 'object.subField']
                });
                assert.equal(csv, csvTestData.specifiedKeys);
            });

            it('should only contain a header when given an empty array and the keys option is provided', () => {
                const csv = json2csv(jsonTestData.noData, {
                    keys: ['arrayOfStrings', 'object.subField']
                });
                assert.equal(csv, csvTestData.specifiedKeysNoData);
            });

            it('should use the specified empty field value, if provided', () => {
                jsonTestData.emptyFieldValues[0].number = undefined;

                const csv = json2csv(jsonTestData.emptyFieldValues, {
                    emptyFieldValue: ''
                });

                // Replace double quotation marks around the empty field which are used
                //   to verify that csv2json properly handles that case
                const expectedCsv = csvTestData.emptyFieldValues
                    .replace(',"",', ',,')
                    .replace(/\n"",/g, '\n,');

                assert.equal(csv, expectedCsv);
            });

            it('should expand array objects when specified - without objects', () => {
                const csv = json2csv(jsonTestData.array, {
                    expandArrayObjects: true
                });
                const expectedCsv = csvTestData.array
                    .replace('"[""json-2-csv""]"', 'json-2-csv')
                    .replace('[]', '');
                assert.equal(csv, expectedCsv);
            });

            it('should expand array objects when specified - with an object containing an empty array', () => {
                // Change the features array to be empty
                jsonTestData.arrayObjects[1].features = [];
                const csv = json2csv(jsonTestData.arrayObjects, {
                    expandArrayObjects: true
                });
                assert.equal(csv, csvTestData.arrayObjects.replace('testing', ''));
            });

            it('should expand array objects when specified - with objects containing an array of objects', () => {
                const csv = json2csv(jsonTestData.arrayMixedObjNonObj, {
                    expandArrayObjects: true
                });
                assert.equal(csv, csvTestData.arrayMixedObjNonObj);
            });

            it('should expand array objects when specified - with objects containing an array of objects', () => {
                const csv = json2csv(jsonTestData.arrayObjects, {
                    expandArrayObjects: true
                });
                assert.equal(csv, csvTestData.arrayObjects);
            });

            it('should handle unwinding empty array values when specified', () => {
                const csv = json2csv(jsonTestData.unwindEmptyArray, {
                    unwindArrays: true
                });
                assert.equal(csv, csvTestData.unwindEmptyArray);
            });

            it('should unwind array values when specified', () => {
                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true
                });
                assert.equal(csv, csvTestData.unwind);
            });

            it('should unwind nested array values when the earlier array has a length of 1', () => {
                const csv = json2csv(jsonTestData.arraySingleArray, {
                    unwindArrays: true
                });
                assert.equal(csv, csvTestData.arraySingleArray);
            });

            it('should unwind array values when specified - with keys specified', () => {
                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    keys: ['data.category', 'data.options.name']
                });
                assert.equal(csv, csvTestData.unwindWithSpecifiedKeys);
            });

            it('should use the locale format when specified', () => {
                const csv = json2csv(jsonTestData.localeFormat, {
                    useLocaleFormat: true,
                    unwindArrays: true
                });
                assert.equal(csv, csvTestData.localeFormat);
            });

            it('should convert objects with dates to iso8601 format correctly', () => {
                // Convert to a date since the `dob` value is imported as a string by default for some reason
                jsonTestData.date.dob = new Date('1990-01-01T05:00:00.000Z');

                const csv = json2csv([jsonTestData.date], { useDateIso8601Format: true });
                assert.equal(csv, csvTestData.date);
            });

            it('should allow keys to be specified without titles', () => {
                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    keys: [
                        { field: 'data.category' },
                        'data.options.name'
                    ]
                });
                assert.equal(csv, csvTestData.unwindWithSpecifiedKeys);
            });

            it('should allow titles to be specified for certain keys, but not others when not unwinding arrays', () => {
                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: false,
                    keys: [
                        { field: 'data.category', title: 'Category' },
                        'data.options.name'
                    ]
                });
                assert.equal(csv, csvTestData.withSpecifiedKeys.replace('data.category,data.options.name', 'Category,data.options.name'));
            });

            it('should allow titles to be specified for certain keys, but not others', () => {
                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    keys: [
                        { field: 'data.category', title: 'Category' },
                        'data.options.name'
                    ]
                });
                assert.equal(csv, csvTestData.unwindWithSpecifiedKeys.replace('data.category,data.options.name', 'Category,data.options.name'));
            });

            it('should allow titles to be specified', () => {

                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: false,
                    keys: [
                        { field: 'data.category', title: 'Category' },
                        { field: 'data.options.name', title: 'Option Name' }
                    ]
                });
                assert.equal(csv, csvTestData.withSpecifiedKeys.replace('data.category,data.options.name', 'Category,Option Name'));
            });

            it('should allow titles to be specified when not unwinding arrays', () => {
                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    keys: [
                        { field: 'data.category', title: 'Category' },
                        { field: 'data.options.name', title: 'Option Name' }
                    ]
                });
                assert.equal(csv, csvTestData.unwindWithSpecifiedKeys.replace('data.category,data.options.name', 'Category,Option Name'));
            });

            it('should exclude specified keys from the output', () => {
                // Change the features array to be empty
                const updatedCsvPerOptions = csvTestData.arrayObjects.replace('features.cons,', '')
                    .replace('"[""cost"",""time""]",', '')
                    .replace(',,,', ',,');

                const csv = json2csv(jsonTestData.arrayObjects, {
                    expandArrayObjects: true,
                    keys: ['name', 'features.name', 'features.pros', 'features.cons', 'downloads'],
                    excludeKeys: ['features.cons']
                });
                assert.equal(csv, updatedCsvPerOptions);
            });

            it('should exclude specified keys from the output when unwinding arrays', () => {
                const updatedCsv = csvTestData.unwind.replace(',data.options.name', '')
                    .replace(/,MacBook (Pro|Air) \d+/g, '')
                    .replace(/,(Super|Turbo)charger/g, '')
                    // De-duplicate the lines since the field isn't unwound due to being excluded
                    .replace('5cf7ca3616c91100018844af,Computers\n', '')
                    .replace('5cf7ca3616c91100018844bf,Cars\n', '');

                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    excludeKeys: ['data.options.name', 'data.options']
                });
                assert.equal(csv, updatedCsv);
            });

            it('should exclude specified deeply nested key from the output when unwinding arrays', () => {
                const updatedCsv = csvTestData.unwind.replace(',data.options.name', '')
                    .replace(/,MacBook (Pro|Air) \d+/g, '')
                    .replace(/,(Super|Turbo)charger/g, '');

                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    excludeKeys: ['data.options.name']
                });
                assert.equal(csv, updatedCsv);
            });

            // Test case for #244
            it('should exclude a matched key prefix from the output when unwinding arrays', () => {
                const updatedCsv = csvTestData.unwind.replace(',data.options.name', '')
                    .replace(/,MacBook (Pro|Air) \d+/g, '')
                    .replace(/,(Super|Turbo)charger/g, '')
                    .replace('5cf7ca3616c91100018844af,Computers\n', '')
                    // Remove duplicate lines
                    .replace('5cf7ca3616c91100018844bf,Cars\n', '');

                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    expandArrayObjects: true,
                    excludeKeys: ['data.options']
                });

                assert.equal(csv, updatedCsv);
            });

            // Test case for #244
            it('should exclude a matched key prefix from the output when unwinding arrays', () => {
                const updatedCsv = csvTestData.unwind.replace(',data.category,data.options.name', '')
                    .replace(/,Computers,MacBook (Pro|Air) \d+/g, '')
                    .replace(/,Cars,(Super|Turbo)charger/g, '')
                    .replace('5cf7ca3616c91100018844af\n', '')
                    // Remove duplicate lines
                    .replace('5cf7ca3616c91100018844bf\n', '');

                const csv = json2csv(jsonTestData.unwind, {
                    unwindArrays: true,
                    excludeKeys: ['data']
                });

                assert.equal(csv, updatedCsv);
            });

            // Test case for #244
            it('should exclude a matched key prefix, but not if it is not at the start of the key path', () => {
                const csv = json2csv(jsonTestData.excludeKeyPattern, {
                    expandArrayObjects: true,
                    excludeKeys: ['arr']
                });

                assert.equal(csv, csvTestData.excludeKeyPattern);
            });

            // Test case for #245
            it('should not escape nested dots in keys with nested dots in them if turned on via the option', () => {
                const csv = json2csv(jsonTestData.nestedDotKeys, { escapeHeaderNestedDots: true }); // Default option value
                assert.equal(csv, csvTestData.nestedDotKeys);
            });

            // Test case for #245
            it('should not escape nested dots in keys with nested dots in them if turned off via the option', () => {
                const csv = json2csv(jsonTestData.nestedDotKeys, { escapeHeaderNestedDots: false });
                assert.equal(csv, csvTestData.nestedDotKeys.replace(/\\\./g, '.'));
            });

            // Test case for #247
            it('should not escape nested dots in keys with nested dots in them if turned off via the option', () => {
                const csv = json2csv(jsonTestData.wildcardMatch, {
                    keys: ['foo', 'bar', 'baz.a', 'baz.array'],
                });
                assert.equal(csv, csvTestData.wildcardMatch);
            });

            // Test case for #247
            it('should not escape nested dots in keys with nested dots in them if turned off via the option', () => {
                const csv = json2csv(jsonTestData.wildcardMatch, {
                    keys: ['foo', 'bar', { field: 'baz.a', wildcardMatch: true }],
                });
                assert.equal(csv, csvTestData.wildcardMatch);
            });

            // Test case for #247
            it('should not escape nested dots in keys with nested dots in them if turned off via the option', () => {
                const updatedCsv = csvTestData.wildcardMatch.replace('baz.a,baz.array', 'baz.a,baz.b,baz.array')
                    .replace('a,c', 'a,b,c');

                const csv = json2csv(jsonTestData.wildcardMatch, {
                    keys: ['foo', 'bar', { field: 'baz', wildcardMatch: true }],
                });
                assert.equal(csv, updatedCsv);
            });

            // Test case for #247
            it('should not escape nested dots in keys with nested dots in them if turned off via the option', () => {
                const updatedCsv = csvTestData.wildcardMatch.replace('foo,bar,baz.a,baz.array', 'foo,baz.a,baz.array,bar')
                    .replace('foo,bar,a,c', 'foo,a,c,bar');

                const csv = json2csv(jsonTestData.wildcardMatch, {
                    keys: ['foo', { field: 'baz.a', wildcardMatch: true }, 'bar'],
                });
                assert.equal(csv, updatedCsv);
            });

            // Test case for #252
            it('should exclude a single key that matches a provided excludeKeys RegExp', () => {
                const updatedCsv = csvTestData.wildcardMatch.replace(',baz.array', ',baz.b').replace(',c', ',b');

                const csv = json2csv(jsonTestData.wildcardMatch, {
                    excludeKeys: [/array/],
                });
                assert.equal(csv, updatedCsv);
            });

            // Test case for #252
            it('should exclude multiple keys that match a provided excludeKeys RegExp', () => {
                const updatedCsv = csvTestData.wildcardMatch.replace(',baz.a,baz.array', '').replace(',a,c', '');

                const csv = json2csv(jsonTestData.wildcardMatch, {
                    excludeKeys: [/baz/],
                });
                assert.equal(csv, updatedCsv);
            });

            // Test case for #207
            it('should include the array indexes in CSV key headers if specified via the option', () => {
                const csv = json2csv(jsonTestData.arrayIndexesAsKeys, {
                    arrayIndexesAsKeys: true,
                });
                assert.equal(csv, csvTestData.arrayIndexesAsKeys);
            });

            it('should use a custom value parser function when provided', () => {
                const updatedCsv = csvTestData.trimmedFields.split('\n');
                const textRow = 'Parsed Value,Parsed Value,Parsed Value,Parsed Value,Parsed Value';
                updatedCsv[1] = textRow;
                updatedCsv[2] = textRow;
                const expectedCsv = updatedCsv.join('\n');

                const csv = json2csv(jsonTestData.trimmedFields, {
                    parseValue: () => 'Parsed Value'
                });
                assert.equal(csv, expectedCsv);
            });

            it('should pass the default value parser to custom value parser function when provided', () => {
                const csv = json2csv(jsonTestData.trimmedFields, {
                    parseValue: (fieldValue, defaultParser) => defaultParser(fieldValue)
                });
                assert.equal(csv, csvTestData.trimmedFields);
            });

            it('should wrap boolean values in wrap delimiters, if specified', () => {
                const csv = json2csv(jsonTestData.emptyFieldValues, {
                    emptyFieldValue: '',
                    wrapBooleans: true
                });

                // Replace raw boolean values with quoted versions
                const expectedCsv = csvTestData.emptyFieldValues
                    .replace(',"",', ',,')
                    .replace(/\n"",/g, '\n,')
                    .replace(/false/g, '"false"')
                    .replace(/true/g, '"true"');

                assert.equal(csv, expectedCsv);
            });

            // Test cases for https://github.com/mrodrig/json-2-csv/issues/209
            it('should left trim equals (=) if preventCsvInjection is specified', () => {
                const csv = json2csv([{ name: '=Bob' }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'name\nBob';

                assert.equal(csv, expectedCsv);
            });

            it('should left trim plus (+) if preventCsvInjection is specified', () => {
                const csv = json2csv([{ name: '+Bob' }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'name\nBob';

                assert.equal(csv, expectedCsv);
            });

            it('should left trim minus (-) if preventCsvInjection is specified', () => {
                const csv = json2csv([{ name: '-Bob' }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'name\nBob';

                assert.equal(csv, expectedCsv);
            });

            it('should left trim at (@) if preventCsvInjection is specified', () => {
                const csv = json2csv([{ name: '@Bob' }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'name\nBob';

                assert.equal(csv, expectedCsv);
            });

            it('should left trim tab (0x09) if preventCsvInjection is specified', () => {
                const csv = json2csv([{ name: String.fromCharCode(9) + 'Bob' }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'name\nBob';

                assert.equal(csv, expectedCsv);
            });

            it('should left trim carriage return (0x0D) if preventCsvInjection is specified', () => {
                const csv = json2csv([{ name: String.fromCharCode(13) + 'Bob' }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'name\nBob';

                assert.equal(csv, expectedCsv);
            });

            it('should left trim a combination of csv injection characters if preventCsvInjection is specified', () => {
                const csv = json2csv([{ name: String.fromCharCode(9) + String.fromCharCode(13) + '=+-@Bob' }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'name\nBob';

                assert.equal(csv, expectedCsv);
            });

            it('should not alter numbers by removing minus (-) even if preventCsvInjection is specified', () => {
                const csv = json2csv([{ temperature: -10 }], {
                    preventCsvInjection: true
                });

                const expectedCsv = 'temperature\n-10';

                assert.equal(csv, expectedCsv);
            });

            it('should not left trim a combination of csv injection characters if preventCsvInjection is not specified', () => {
                const originalValue = String.fromCharCode(9) + String.fromCharCode(13) + '=+-@Bob';
                const csv = json2csv([{ name: originalValue }], {});

                const expectedCsv = `name\n"${originalValue}"`;

                assert.equal(csv, expectedCsv);
            });

            // Test case for #184
            it('should handle keys with nested dots when expanding and unwinding arrays', () => {
                const csv = json2csv(jsonTestData.nestedDotKeysWithArrayExpandedUnwound, {
                    expandArrayObjects: true,
                    unwindArrays: true
                });

                // Replace raw boolean values with quoted versions
                const expectedCsv = csvTestData.nestedDotKeysWithArrayExpandedUnwound;

                assert.equal(csv, expectedCsv);
            });

            it('should respect the expandNestedObjects option being set to false', () => {
                const csv = json2csv(jsonTestData.nested, {
                    expandNestedObjects: false,
                });

                assert.equal(csv, csvTestData.nestedNotUnwoundObjects);
            });

            it('should unwind all found arrays', () => {
                const options = {
                    expandArrayObjects: true,
                    unwindArrays: true,
                    emptyFieldValue: '---'
                };

                let expectedCSV = 'Countries.Cities.Streets.Name,Countries.Cities.Streets.Number,Countries.Cities.field\n' +
                    'Road 1,1,---\n' +
                    'Road 2,2,---\n' +
                    '---,---,value';
                let csv = json2csv(jsonTestData.deepNestedArrays.was_already_working, options);
                assert.equal(csv, expectedCSV);

                expectedCSV = 'Countries.Cities.Streets.Name,Countries.Cities.Streets.Number\n' +
                    'Road 1,1\n' +
                    'Road 2,2';
                csv = json2csv(jsonTestData.deepNestedArrays.was_not_working_1, options);
                assert.equal(csv, expectedCSV);

                expectedCSV = 'Continents.Countries.Cities.Streets.Name,Continents.Countries.Cities.Streets.Number,Continents.Countries.Cities.field\n' +
                    'Road 1,1,---\n' +
                    'Road 2,2,---\n' +
                    '---,---,value';
                csv = json2csv(jsonTestData.deepNestedArrays.was_not_working_2, options);
                assert.equal(csv, expectedCSV);

                expectedCSV = 'SolarSystems.Planets.Hemispheres.Continents.Countries.Cities.Streets.Name,SolarSystems.Planets.Hemispheres.Continents.Countries.Cities.Streets.Number\n' +
                    'Road 1,1\n' +
                    'Road 2,2';
                csv = json2csv(jsonTestData.deepNestedArrays.seven_levels_deep, options);
                assert.equal(csv, expectedCSV);
            });
        });
    });

    describe('json2csv Promise Chain Usage', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(testJsonFiles);
                csvTestData = utils.deepCopy(testCsvFiles);
            });

            /**
             * Since the functionality has been thoroughly tested in the main json2csv() block,
             * we just need to verify that the promisified version of the function is working
             * as expected here - specifically that data is returned properly and errors are
             * sent to the catch block.
             */

            it('should still work with an empty array', () => {
                const csv = json2csv(jsonTestData.noData);

                assert.equal(csv, csvTestData.noData);
            });

            it('should still work with an array of documents', () => {
                const csv = json2csv(jsonTestData.array);

                assert.equal(csv, csvTestData.array);
            });
        });

        describe('Error Handling', () => {
            it('should throw an error about not having been passed data', () => {
                try {
                    json2csv(undefined as any);
                } catch (error) {
                    assert.equal((error as Error).message, `${constants.errors.json2csv.cannotCallOn} undefined.`);

                    return;
                }

                throw testFailureError;
            });

            it('should throw an error about not having been passed data - null', () => {
                try {
                    json2csv(null as any);
                } catch (error) {
                    assert.equal((error as Error).message, `${constants.errors.json2csv.cannotCallOn} null.`);

                    return;
                }

                throw testFailureError;
            });
        });
    });
}

module.exports = { runTests };
