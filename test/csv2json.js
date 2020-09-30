'use strict';

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

let should = require('should'),
    converter = require('../src/converter'),
    constants = require('../src/constants'),
    utils = require('../src/utils'),
    defaultOptions = constants.defaultOptions;

function runTests(jsonTestData, csvTestData) {
    let options,
        originalTestData = {
            json: utils.deepCopy(jsonTestData),
            csv: utils.deepCopy(csvTestData)
        };

    describe('csv2json()', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(originalTestData.json);
                csvTestData = utils.deepCopy(originalTestData.csv);
            });

            it('should return an empty array when provided an empty csv', (done) => {
                converter.csv2json(csvTestData.noData, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.noData);
                    done();
                });
            });

            it('should convert a single basic document from csv to json', (done) => {
                converter.csv2json(csvTestData.singleDocument, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.singleDocument);
                    done();
                });
            });

            it('should convert csv containing an array representation to json', (done) => {
                converter.csv2json(csvTestData.array, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.array);
                    done();
                });
            });

            it('should convert csv containing a date to json', (done) => {
                converter.csv2json(csvTestData.date, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual([jsonTestData.date]);
                    done();
                });
            });

            it('should convert csv containing null to json', (done) => {
                converter.csv2json(csvTestData.null, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.null);
                    done();
                });
            });

            it('should convert csv containing undefined to json', (done) => {
                converter.csv2json(csvTestData.undefined, (err, json) => {
                    if (err) done(err);
                    jsonTestData.undefined.colorPreference = undefined;
                    json.should.deepEqual([jsonTestData.undefined]);
                    done();
                });
            });

            it('should convert csv representing nested json to the correct json structure', (done) => {
                converter.csv2json(csvTestData.nested, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.nested);
                    done();
                });
            });

            it('should convert csv representing nested json with a missing field to the correct json structure', (done) => {
                converter.csv2json(csvTestData.nestedMissingField, (err, json) => {
                    if (err) done(err);
                    jsonTestData.nestedMissingField[0].level1.level2.level3 = {level: null};
                    json.should.deepEqual(jsonTestData.nestedMissingField);
                    done();
                });
            });

            it('should convert csv containing a field with a comma to json', (done) => {
                converter.csv2json(csvTestData.comma, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.comma);
                    done();
                });
            });

            it('should convert csv containing a field with quotes to json', (done) => {
                converter.csv2json(csvTestData.quotes, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.quotes);
                    done();
                });
            });

            it('should convert csv containing quotes and commas to json', (done) => {
                converter.csv2json(csvTestData.quotesAndCommas, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.quotesAndCommas);
                    done();
                }, {excelBOM: false});
            });

            it('should convert csv containing a field with eol characters to json', (done) => {
                converter.csv2json(csvTestData.eol, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.eol);
                    done();
                });
            });

            it('should ignore empty lines and not convert them to json', (done) => {
                converter.csv2json(csvTestData.eol + '\n', (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.eol);
                    done();
                });
            });

            it('should convert csv containing an assortment of values to json', (done) => {
                converter.csv2json(csvTestData.assortedValues, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.assortedValues);
                    done();
                });
            });

            it('should handle an extra new line at the end of the csv', (done) => {
                converter.csv2json(csvTestData.extraLine, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.assortedValues);
                    done();
                });
            });

            // Test case for #109
            it('should properly handle the cases involving an empty field value', (done) => {
                converter.csv2json(csvTestData.csvEmptyLastValue, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.csvEmptyLastValue);
                    done();
                });
            });

            // Test case for #115
            it('should properly handle quoted empty field values', (done) => {
                converter.csv2json(csvTestData.quotedEmptyFieldValue, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.quotedEmptyFieldValue);
                    done();
                });
            });

            // Test case for #149
            it('should properly handle invalid parsed values', (done) => {
                converter.csv2json(csvTestData.invalidParsedValues, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.invalidParsedValues);
                    done();
                });
            });

            // Test case for #155
            it('should properly convert empty field values if they occur at the end of the csv', (done) => {
                converter.csv2json(csvTestData.emptyLastFieldValue, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.emptyLastFieldValue);
                    done();
                });
            });

            // Test case for #161
            it('should properly convert empty field values if they occur at the end of the csv with no EOL at the end', (done) => {
                converter.csv2json(csvTestData.emptyLastFieldValueNoEol, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.emptyLastFieldValueNoEol);
                    done();
                });
            });
        });

        describe('Error Handling', () => {
            it('should throw an error about not having been passed data - null', (done) => {
                converter.csv2json(null, (err) => {
                    err.message.should.equal(constants.errors.csv2json.cannotCallOn + 'null.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - undefined', (done) => {
                converter.csv2json(undefined, (err) => {
                    err.message.should.equal(constants.errors.csv2json.cannotCallOn + 'undefined.');
                    done();
                });
            });

            it('should throw an error about not being provided a callback - none', (done) => {
                try {
                    let validButFakeData = [];
                    converter.csv2json(validButFakeData);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - undefined', (done) => {
                try {
                    converter.csv2json(null, undefined);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - null', (done) => {
                try {
                    converter.csv2json(null, null);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - options provided', (done) => {
                try {
                    let validButFakeData = [],
                        validButFakeOptions = {};
                    converter.csv2json(validButFakeData, validButFakeOptions);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error when the provided data is of the wrong type', (done) => {
                converter.csv2json(new Date(), (err) => {
                    err.message.should.equal(constants.errors.csv2json.dataCheckFailure);
                    done();
                }, options);
            });
        });

        describe('RFC 4180 Compliance', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(originalTestData.json);
                csvTestData = utils.deepCopy(originalTestData.csv);
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
                jsonTestData = utils.deepCopy(originalTestData.json);
                csvTestData = utils.deepCopy(originalTestData.csv);
            });

            it('should use the provided field delimiter and still convert to json', (done) => {
                let testFieldDelimiter = '/',
                    replacementRegex = new RegExp(options.delimiter.field, 'g'),
                    testCsv = csvTestData.nested.replace(replacementRegex, testFieldDelimiter);

                converter.csv2json(testCsv, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.nested);
                    done();
                }, {
                    delimiter: { field: testFieldDelimiter }
                });
            });

            it('should use the provided wrap delimiter and still convert to json', (done) => {
                let testWrapDelimiter = '\'',
                    replacementRegex = new RegExp(options.delimiter.wrap, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testWrapDelimiter);

                converter.csv2json(testCsv, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.comma);
                    done();
                }, {
                    delimiter: { wrap: testWrapDelimiter }
                });
            });

            it('should use the provided end of line delimiter and still convert to json', (done) => {
                let testEolDelimiter = '\r\n',
                    replacementRegex = new RegExp(options.delimiter.eol, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testEolDelimiter);

                converter.csv2json(testCsv, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.comma);
                    done();
                }, {
                    delimiter: { eol: testEolDelimiter }
                });
            });

            // Test case for #153
            it('should wrap first column with crlf line break', (done) => {
                converter.csv2json(csvTestData.firstColumnWrapCRLF, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.firstColumnWrapCRLF);
                    done();
                }, {
                    delimiter: { eol: '\r\n' }
                });
            });

            it('should strip the excel byte order mark character, if specified, and convert to json', (done) => {
                converter.csv2json(csvTestData.excelBOM, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.assortedValues);
                    done();
                }, {
                    excelBOM: true
                });
            });

            it('should trim header fields and still convert to json', (done) => {
                converter.csv2json(csvTestData.trimHeader, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.trimmedHeader);
                    done();
                }, {
                    trimHeaderFields: true
                });
            });

            it('should trim field values and still convert to json', (done) => {
                converter.csv2json(csvTestData.trimFields, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.trimmedFields);
                    done();
                }, {
                    trimFieldValues: true
                });
            });

            it('should use the provided keys and still convert to json', (done) => {
                converter.csv2json(csvTestData.assortedValues, (err, json) => {
                    if (err) done(err);
                    json.should.deepEqual(jsonTestData.specifiedKeys);
                    done();
                }, {
                    keys: ['arrayOfStrings', 'object.subField']
                });
            });
        });
    });

    describe('csv2jsonAsync()', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(originalTestData.json);
                csvTestData = utils.deepCopy(originalTestData.csv);
            });

            /**
             * Since the functionality has been thoroughly tested in the main csv2json() block,
             * we just need to verify that the promisified version of the function is working
             * as expected here - specifically that data is returned properly and errors are
             * sent to the catch block.
             */

            it('should still work with an empty array', (done) => {
                converter.csv2jsonAsync(csvTestData.noData)
                    .then((json) => {
                        json.should.deepEqual(jsonTestData.noData);
                        done();
                    })
                    .catch(done);
            });

            it('should still convert an array of json documents', (done) => {
                converter.csv2jsonAsync(csvTestData.array)
                    .then((json) => {
                        json.should.deepEqual(jsonTestData.array);
                        done();
                    })
                    .catch(done);
            });

            describe('Error Handling', () => {
                it('should still throw an error when not passed data and it should hit the catch block', (done) => {
                    converter.csv2jsonAsync(null)
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.csv2json.cannotCallOn + 'null.');
                            done();
                        });
                });

                it('should still throw an error the data is of the wrong type and it should hit the catch block', (done) => {
                    converter.csv2jsonAsync(new Date())
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.csv2json.dataCheckFailure);
                            done();
                        });
                });
            });
        });
    });

    describe('csv2jsonPromisified() [deprecated]', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
            });

            /**
             * Since the functionality has been thoroughly tested in the main csv2json() block,
             * we just need to verify that the promisified version of the function is working
             * as expected here - specifically that data is returned properly and errors are
             * sent to the catch block.
             */

            it('should still work with an empty array', (done) => {
                converter.csv2jsonPromisified(csvTestData.noData)
                    .then((json) => {
                        json.should.deepEqual(jsonTestData.noData);
                        done();
                    })
                    .catch(done);
            });

            it('should still convert an array of json documents', (done) => {
                converter.csv2jsonPromisified(csvTestData.array)
                    .then((json) => {
                        json.should.deepEqual(jsonTestData.array);
                        done();
                    })
                    .catch(done);
            });

            describe('Error Handling', () => {
                it('should still throw an error when not passed data and it should hit the catch block', (done) => {
                    converter.csv2jsonPromisified(null)
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.csv2json.cannotCallOn + 'null.');
                            done();
                        });
                });

                it('should still throw an error the data is of the wrong type and it should hit the catch block', (done) => {
                    converter.csv2jsonPromisified(new Date())
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.csv2json.dataCheckFailure);
                            done();
                        });
                });
            });
        });
    });
}

module.exports = { runTests };
