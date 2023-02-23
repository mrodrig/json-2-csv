/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import assert from 'assert';
import { csv2json } from '../src/converter';
import * as constants from '../src/constants';
import * as utils from '../src/utils';
import testJsonFiles from './config/testJsonFilesList';
import testCsvFiles from './config/testCsvFilesList';

const defaultOptions = constants.defaultCsv2JsonOptions,
    testFailureError = new Error('Should not have succeeded');

export function runTests() {
    let options = utils.deepCopy(defaultOptions),
        jsonTestData: typeof testJsonFiles,
        csvTestData: typeof testCsvFiles;

    describe('csv2json Async/Await Usage', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(testJsonFiles);
                csvTestData = utils.deepCopy(testCsvFiles);
            });

            it('should return an empty array when provided an empty csv', async () => {
                const json = await csv2json(csvTestData.noData);
                assert.deepEqual(json, jsonTestData.noData);
            });

            it('should convert a single basic document from csv to json', async () => {
                const json = await csv2json(csvTestData.singleDocument);
                assert.deepEqual(json, jsonTestData.singleDocument);
            });

            it('should convert csv containing an array representation to json', async () => {
                const json = await csv2json(csvTestData.array);
                assert.deepEqual(json, jsonTestData.array);
            });

            it('should convert csv containing a date to json', async () => {
                const json = await csv2json(csvTestData.date);
                assert.deepEqual(json, [jsonTestData.date]);
            });

            it('should convert csv containing null to json', async () => {
                const json = await csv2json(csvTestData.null);
                assert.deepEqual(json, jsonTestData.null);
            });

            it('should convert csv containing undefined to json', async () => {
                const json = await csv2json(csvTestData.undefined);
                jsonTestData.undefined.colorPreference = undefined;
                assert.deepEqual(json, [jsonTestData.undefined]);
            });

            it('should convert csv representing nested json to the correct json structure', async () => {
                const json = await csv2json(csvTestData.nested);
                assert.deepEqual(json, jsonTestData.nested);
            });

            it('should convert csv representing nested json with a missing field to the correct json structure', async () => {
                const json = await csv2json(csvTestData.nestedMissingField);
                jsonTestData.nestedMissingField[0].level1.level2.level3 = {level: null};
                assert.deepEqual(json, jsonTestData.nestedMissingField);
            });

            it('should convert csv containing a field with a comma to json', async () => {
                const json = await csv2json(csvTestData.comma);
                assert.deepEqual(json, jsonTestData.comma);
            });

            it('should convert csv containing a field with quotes to json', async () => {
                const json = await csv2json(csvTestData.quotes);
                assert.deepEqual(json, jsonTestData.quotes);
            });

            it('should convert csv containing quotes and commas to json', async () => {
                const json = await csv2json(csvTestData.quotesAndCommas);
                assert.deepEqual(json, jsonTestData.quotesAndCommas);
            });

            it('should convert csv containing a field with eol characters to json', async () => {
                const json = await csv2json(csvTestData.eol);
                assert.deepEqual(json, jsonTestData.eol);
            });

            it('should ignore empty lines and not convert them to json', async () => {
                const json = await csv2json(csvTestData.eol + '\n');
                assert.deepEqual(json, jsonTestData.eol);
            });

            it('should convert csv containing an assortment of values to json', async () => {
                const json = await csv2json(csvTestData.assortedValues);
                assert.deepEqual(json, jsonTestData.assortedValues);
            });

            it('should handle an extra new line at the end of the csv', async () => {
                const json = await csv2json(csvTestData.extraLine);
                assert.deepEqual(json, jsonTestData.assortedValues);
            });

            // Test case for #109
            it('should properly handle the cases involving an empty field value', async () => {
                const json = await csv2json(csvTestData.csvEmptyLastValue);
                assert.deepEqual(json, jsonTestData.csvEmptyLastValue);
            });

            // Test case for #115
            it('should properly handle quoted empty field values', async () => {
                const json = await csv2json(csvTestData.quotedEmptyFieldValue);
                assert.deepEqual(json, jsonTestData.quotedEmptyFieldValue);
            });

            // Test case for #149
            it('should properly handle invalid parsed values', async () => {
                const json = await csv2json(csvTestData.invalidParsedValues);
                assert.deepEqual(json, jsonTestData.invalidParsedValues);
            });

            // Test case for #155
            it('should properly convert empty field values if they occur at the end of the csv', async () => {
                const json = await csv2json(csvTestData.emptyLastFieldValue);
                assert.deepEqual(json, jsonTestData.emptyLastFieldValue);
            });

            // Test case for #161
            it('should properly convert an empty field value if it occurs at the end of the csv with no EOL at the end', async () => {
                const json = await csv2json(csvTestData.lastCharFieldDelimiter);
                assert.deepEqual(json, jsonTestData.emptyLastFieldValue);
            });

            // Test case for #161
            it('should properly convert two empty field values if they occur at the end of the csv with no EOL at the end', async () => {
                const json = await csv2json(csvTestData.emptyLastFieldValueNoEol);
                assert.deepEqual(json, jsonTestData.emptyLastFieldValueNoEol);
            });

            // Test case for #184
            it('should properly convert keys with escaped/nested dots in them', async () => {
                const json = await csv2json(csvTestData.nestedDotKeys);
                assert.deepEqual(json, jsonTestData.nestedDotKeys);
            });

            // Test case for #184
            it('should properly convert keys with escaped/nested dots in them even when they appear in an array', async () => {
                const json = await csv2json(csvTestData.nestedDotKeysWithArray);
                assert.deepEqual(json, jsonTestData.nestedDotKeysWithArray);
            });

            // Test case for #184
            it('should properly convert keys with escaped/nested dots in them even when they appear in an expanded, unwound array', async () => {
                const json = await csv2json(csvTestData.nestedDotKeysWithArrayExpandedUnwound);
                assert.deepEqual(json, jsonTestData.nestedDotKeysWithArrayExpandedUnwound);
            });

            // Test case for #204
            it('should drop any values with empty column headers', async () => {
                const json = await csv2json(csvTestData.emptyColumns);
                assert.deepEqual(json, jsonTestData.emptyColumns);
            });

            // Test case for #214
            it('should handle quoted fields with nested EOL characters', async () => {
                const json = await csv2json(csvTestData.quotedFieldWithNewline);
                assert.deepEqual(json, jsonTestData.quotedFieldWithNewline);
            });
        });

        describe('Error Handling', () => {
            it('should throw an error about not having been passed data - null', async () => {
                try {
                    await csv2json(null as any);
                    throw testFailureError;            
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', `${constants.errors.csv2json.cannotCallOn} null.`);
                }
            });

            it('should throw an error about not having been passed data - undefined', async () => {
                try {
                    await csv2json(undefined as any);
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', `${constants.errors.csv2json.cannotCallOn} undefined.`);
                }
            });

            it('should throw an error if data is not the proper type - no options provided', async () => {
                try {
                    await csv2json([] as any);
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', constants.errors.csv2json.dataCheckFailure);
                    
                }
            });

            it('should throw an error if data is not the proper type - options provided', async () => {
                try {
                    await csv2json([] as any, {});
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', constants.errors.csv2json.dataCheckFailure);
                    
                }
            });

            it('should throw an error when the provided data is of the wrong type', async () => {
                try {
                    await csv2json(new Date() as any);
                    throw testFailureError;
                } catch (error) {
                    assert.equal(error instanceof Error ? error.message : '', constants.errors.csv2json.dataCheckFailure);
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

            it('should use the provided field delimiter and still convert to json', async () => {
                const testFieldDelimiter = '/',
                    replacementRegex = new RegExp(options.delimiter.field, 'g'),
                    testCsv = csvTestData.nested.replace(replacementRegex, testFieldDelimiter);

                const json = await csv2json(testCsv, {
                    delimiter: { field: testFieldDelimiter }
                });
                assert.deepEqual(json, jsonTestData.nested);
            });

            it('should use the provided wrap delimiter and still convert to json', async () => {
                const testWrapDelimiter = '\'',
                    replacementRegex = new RegExp(options.delimiter.wrap, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testWrapDelimiter);

                const json = await csv2json(testCsv, {
                    delimiter: { wrap: testWrapDelimiter }
                });
                assert.deepEqual(json, jsonTestData.comma);
            });

            it('should use the provided end of line delimiter and still convert to json', async () => {
                const testEolDelimiter = '\r\n',
                    replacementRegex = new RegExp(options.delimiter.eol, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testEolDelimiter);

                const json = await csv2json(testCsv, {
                    delimiter: { eol: testEolDelimiter }
                });
                assert.deepEqual(json, jsonTestData.comma);
            });

            // Test case for #153
            it('should wrap first column with crlf line break', async () => {
                const json = await csv2json(csvTestData.firstColumnWrapCRLF, {
                    delimiter: { eol: '\r\n' }
                });
                assert.deepEqual(json, jsonTestData.firstColumnWrapCRLF);
            });

            it('should strip the excel byte order mark character, if specified, and convert to json', async () => {
                const json = await csv2json(csvTestData.excelBOM, {
                    excelBOM: true
                });
                assert.deepEqual(json, jsonTestData.assortedValues);
            });

            it('should trim header fields and still convert to json', async () => {
                const json = await csv2json(csvTestData.trimHeader, {
                    trimHeaderFields: true
                });
                assert.deepEqual(json, jsonTestData.trimmedHeader);
            });

            it('should trim field values and still convert to json', async () => {
                const json = await csv2json(csvTestData.trimFields, {
                    trimFieldValues: true
                });
                assert.deepEqual(json, jsonTestData.trimmedFields);
            });

            it('should use the provided keys and still convert to json', async () => {
                const json = await csv2json(csvTestData.assortedValues, {
                    keys: ['arrayOfStrings', 'object.subField']
                });
                assert.deepEqual(json, jsonTestData.specifiedKeys);
            });

            it('should use a custom value parser function when provided', async () => {
                const updatedJson = jsonTestData.trimmedFields.map((doc: any) => {
                    doc.arrayOfStrings = 'Parsed Value';
                    doc.object.subField = 'Parsed Value';
                    doc.number = 'Parsed Value';
                    doc.isBoolean = 'Parsed Value';
                    doc.optionalField = 'Parsed Value';
                    return doc;
                });

                const json = await csv2json(csvTestData.trimmedFields, {
                    parseValue: () => 'Parsed Value'
                });
                assert.deepEqual(json, updatedJson);
            });

            it('should be able to parse CSV with no header line provided', async () => {
                const headerlessCsv = csvTestData.unwindWithSpecifiedKeys.split(options.delimiter.eol)
                    .splice(1)
                    .join(options.delimiter.eol);

                const json = await csv2json(headerlessCsv, {
                    headerFields: ['data.category', 'data.options.name']
                });
                assert.deepEqual(json, jsonTestData.unwindWithSpecifiedKeys);
            });

            it('should be able to parse CSV with no header line provided and different header fields', async () => {
                const headerlessCsv = csvTestData.unwindWithSpecifiedKeys.split(options.delimiter.eol)
                        .splice(1)
                        .join(options.delimiter.eol),
                    expectedJson = jsonTestData.unwindWithSpecifiedKeys.map((doc: any) => {
                        doc.category = doc.data.category;
                        doc.product = doc.data.options.name;
                        delete doc.data;
                        return doc;
                    });

                const json = await csv2json(headerlessCsv, {
                    headerFields: ['category', 'product']
                });
                assert.deepEqual(json, expectedJson);
            });

            it('should be able to parse CSV with no header line provided and only some of the fields', async () => {
                const headerlessCsv = csvTestData.unwindWithSpecifiedKeys.split(options.delimiter.eol)
                        .splice(1)
                        .join(options.delimiter.eol),
                    expectedJson = jsonTestData.unwindWithSpecifiedKeys.map((doc: any) => {
                        doc.category = doc.data.category;
                        delete doc.data;
                        return doc;
                    });

                const json = await csv2json(headerlessCsv, {
                    headerFields: ['category']
                });
                assert.deepEqual(json, expectedJson);
            });
        });
    });

    describe('csv2json Promise Chain Usage', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(testJsonFiles);
                csvTestData = utils.deepCopy(testCsvFiles);
            });

            /**
             * Since the functionality has been thoroughly tested in the main csv2json() block,
             * we just need to verify that the promisified version of the function is working
             * as expected here - specifically that data is returned properly and errors are
             * sent to the catch block.
             */

            it('should still work with an empty array', async () => {
                return csv2json(csvTestData.noData)
                    .then((json) => {
                        assert.deepEqual(json, jsonTestData.noData);
                    });
            });

            it('should still convert an array of json documents', async () => {
                return csv2json(csvTestData.array)
                    .then((json) => {
                        assert.deepEqual(json, jsonTestData.array);
                    });
            });

            describe('Error Handling', async () => {
                it('should still throw an error when not passed data and it should hit the catch block', async () => {
                    return csv2json(null as any)
                        .then(() => {
                            throw testFailureError;
                        })
                        .catch((error) => {
                            assert.equal(error.message, `${constants.errors.csv2json.cannotCallOn} null.`);
                        });
                });

                it('should still throw an error the data is of the wrong type and it should hit the catch block', async () => {
                    return csv2json(new Date() as any)
                        .then(() => {
                            throw testFailureError;
                        })
                        .catch((error) => {
                            assert.equal(error.message, constants.errors.csv2json.dataCheckFailure);
                        });
                });
            });
        });
    });
}
