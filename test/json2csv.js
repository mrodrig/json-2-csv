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

    describe('json2csv()', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(originalTestData.json);
                csvTestData = utils.deepCopy(originalTestData.csv);
            });

            it('should convert an empty array to an empty csv', (done) => {
                converter.json2csv(jsonTestData.noData, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.noData);
                    done();
                });
            });

            it('should convert a single document to csv', (done) => {
                converter.json2csv(jsonTestData.singleDocument, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.singleDocument);
                    done();
                });
            });

            it('should convert objects with arrays to csv correctly', (done) => {
                converter.json2csv(jsonTestData.array, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.array);
                    done();
                });
            });

            it('should convert objects with dates to csv correctly', (done) => {
                converter.json2csv(jsonTestData.date, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.date);
                    done();
                });
            });

            it('should convert objects with null to csv correctly', (done) => {
                converter.json2csv(jsonTestData.null, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.null);
                    done();
                });
            });

            it('should convert objects with undefined to csv correctly', (done) => {
                // Force the value to be set to undefined
                jsonTestData.undefined.colorPreference = undefined;

                converter.json2csv(jsonTestData.undefined, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.undefined);
                    done();
                });
            });

            it('should convert nested json documents to csv', (done) => {
                converter.json2csv(jsonTestData.nested, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.nested);
                    done();
                });
            });

            it('should convert nested json documents with missing fields to csv', (done) => {
                converter.json2csv(jsonTestData.nestedMissingField, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.nestedMissingField);
                    done();
                });
            });

            it('should convert a document with fields containing commas to csv', (done) => {
                converter.json2csv(jsonTestData.comma, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.comma);
                    done();
                });
            });

            it('should convert a document with fields containing quotes to csv', (done) => {
                converter.json2csv(jsonTestData.quotes, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.quotes);
                    done();
                });
            });

            it('should convert a document with fields containing quotes and commas to csv', (done) => {
                converter.json2csv(jsonTestData.quotesAndCommas, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.quotesAndCommas);
                    done();
                });
            });

            it('should convert a document with fields containing an assortment of values to csv', (done) => {
                converter.json2csv(jsonTestData.assortedValues, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.assortedValues);
                    done();
                });
            });

            it('should convert a document with fields containing eol characters to csv', (done) => {
                converter.json2csv(jsonTestData.eol, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.eol);
                    done();
                });
            });

            it('should properly convert the cases involving an empty field value in the csv', (done) => {
                converter.json2csv(jsonTestData.csvEmptyLastValue, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.csvEmptyLastValue);
                    done();
                });
            });
        });

        describe('Error Handling', () => {
            it('should throw an error when the provided data is of the wrong type', (done) => {
                try {
                    converter.json2csv();
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not having been passed data - null', (done) => {
                converter.json2csv(null, (err) => {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - undefined', (done) => {
                converter.json2csv(undefined, (err) => {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                    done();
                });
            });

            it('should throw an error about not being provided a callback - none', (done) => {
                try {
                    converter.json2csv(null);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - undefined', (done) => {
                try {
                    converter.json2csv(null, undefined);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - null', (done) => {
                try {
                    converter.json2csv(null, null);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error if the documents do not have the same schema', (done) => {
                converter.json2csv(jsonTestData.nestedMissingField, (err) => {
                    err.message.should.equal(constants.errors.json2csv.notSameSchema);
                    done();
                }, {
                    checkSchemaDifferences: true
                });
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
                jsonTestData = utils.deepCopy(originalTestData.json);
                csvTestData = utils.deepCopy(originalTestData.csv);
            });

            it('should use the provided field delimiter and still convert to json', (done) => {
                let testFieldDelimiter = '/',
                    replacementRegex = new RegExp(options.delimiter.field, 'g'),
                    testCsv = csvTestData.nested.replace(replacementRegex, testFieldDelimiter);

                converter.json2csv(jsonTestData.nested, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(testCsv);
                    done();
                }, {
                    delimiter: { field: testFieldDelimiter }
                });
            });

            it('should use the provided wrap delimiter and still convert to json', (done) => {
                let testWrapDelimiter = '\'',
                    replacementRegex = new RegExp(options.delimiter.wrap, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testWrapDelimiter);

                converter.json2csv(jsonTestData.comma, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(testCsv);
                    done();
                }, {
                    delimiter: { wrap: testWrapDelimiter }
                });
            });

            it('should use the provided end of line delimiter and still convert to json', (done) => {
                let testEolDelimiter = '\r\n',
                    replacementRegex = new RegExp(options.delimiter.eol, 'g'),
                    testCsv = csvTestData.comma.replace(replacementRegex, testEolDelimiter);

                converter.json2csv(jsonTestData.comma, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(testCsv);
                    done();
                }, {
                    delimiter: { eol: testEolDelimiter }
                });
            });

            it('should include an excel byte order mark character at the beginning of the csv', (done) => {
                converter.json2csv(jsonTestData.assortedValues, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.excelBOM);
                    done();
                }, {
                    excelBOM: true
                });
            });

            it('should not prepend a header if it the options indicate not to add one to the csv', (done) => {
                converter.json2csv(jsonTestData.assortedValues, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.noHeader);
                    done();
                }, {
                    prependHeader: false
                });
            });

            it('should sort the header in the csv', (done) => {
                converter.json2csv(jsonTestData.assortedValues, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.sortedHeader);
                    done();
                }, {
                    sortHeader: true
                });
            });

            it('should trim the header fields when specified', (done) => {
                converter.json2csv(jsonTestData.trimHeader, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.trimmedHeader);
                    done();
                }, {
                    trimHeaderFields: true
                });
            });

            it('should trim the field values when specified', (done) => {
                converter.json2csv(jsonTestData.trimFields, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.trimmedFields);
                    done();
                }, {
                    trimFieldValues: true
                });
            });

            it('should check schema differences when specified - no data', (done) => {
                converter.json2csv(jsonTestData.noData, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.noData);
                    done();
                }, {
                    checkSchemaDifferences: true
                });
            });

            it('should check schema differences when specified - same schema', (done) => {
                converter.json2csv(jsonTestData.quotesAndCommas, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.quotesAndCommas);
                    done();
                }, {
                    checkSchemaDifferences: true
                });
            });

            it('should use the specified keys, if provided', (done) => {
                converter.json2csv(jsonTestData.assortedValues, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.specifiedKeys);
                    done();
                }, {
                    keys: ['arrayOfStrings', 'object.subField']
                });
            });

            it('should use the specified empty field value, if provided', (done) => {
                jsonTestData.emptyFieldValues[0].number = undefined;
                converter.json2csv(jsonTestData.emptyFieldValues, (err, csv) => {
                    if (err) done(err);

                    // Replace double quotation marks around the empty field which are used
                    //   to verify that csv2json properly handles that case
                    let expectedCsv = csvTestData.emptyFieldValues
                        .replace(',"",', ',,')
                        .replace(/\n"",/g, '\n,');

                    csv.should.equal(expectedCsv);
                    done();
                }, {
                    emptyFieldValue: ''
                });
            });

            it('should expand array objects when specified - without objects', (done) => {
                converter.json2csv(jsonTestData.array, (err, csv) => {
                    if (err) done(err);
                    let expectedCsv = csvTestData.array
                        .replace('"[""json-2-csv""]"', 'json-2-csv')
                        .replace('[]', '');
                    csv.should.equal(expectedCsv);
                    done();
                }, {
                    expandArrayObjects: true
                });
            });

            it('should expand array objects when specified - with an object containing an empty array', (done) => {
                // Change the features array to be empty
                jsonTestData.arrayObjects[1].features = [];
                converter.json2csv(jsonTestData.arrayObjects, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.arrayObjects.replace('testing', ''));
                    done();
                }, {
                    expandArrayObjects: true
                });
            });

            it('should expand array objects when specified - with objects containing an array of objects', (done) => {
                converter.json2csv(jsonTestData.arrayMixedObjNonObj, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.arrayMixedObjNonObj);
                    done();
                }, {
                    expandArrayObjects: true
                });
            });

            it('should expand array objects when specified - with objects containing an array of objects', (done) => {
                converter.json2csv(jsonTestData.arrayObjects, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.arrayObjects);
                    done();
                }, {
                    expandArrayObjects: true
                });
            });

            it('should handle unwinding empty array values when specified', (done) => {
                converter.json2csv(jsonTestData.unwindEmptyArray, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.unwindEmptyArray);
                    done();
                }, {
                    unwindArrays: true
                });
            });

            it('should unwind array values when specified', (done) => {
                converter.json2csv(jsonTestData.unwind, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.unwind);
                    done();
                }, {
                    unwindArrays: true
                });
            });

            it('should unwind array values when specified - with keys specified', (done) => {
                converter.json2csv(jsonTestData.unwind, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.unwindWithSpecifiedKeys);
                    done();
                }, {
                    unwindArrays: true,
                    keys: ['data.category', 'data.options.name']
                });
            });

            it('should use the locale format when specified', (done) => {
                converter.json2csv(jsonTestData.localeFormat, (err, csv) => {
                    if (err) done(err);
                    csv.should.equal(csvTestData.localeFormat);
                    done();
                }, { useLocaleFormat: true, unwindArrays: true });
            });
        });
    });

    describe('json2csvAsync()', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
                jsonTestData = utils.deepCopy(originalTestData.json);
                csvTestData = utils.deepCopy(originalTestData.csv);
            });

            /**
             * Since the functionality has been thoroughly tested in the main json2csv() block,
             * we just need to verify that the promisified version of the function is working
             * as expected here - specifically that data is returned properly and errors are
             * sent to the catch block.
             */

            it('should still work with an empty array', (done) => {
                converter.json2csvAsync(jsonTestData.noData)
                    .then((csv) => {
                        csv.should.equal(csvTestData.noData);
                        done();
                    })
                    .catch(done);
            });

            it('should still work with an array of documents', (done) => {
                converter.json2csvAsync(jsonTestData.array)
                    .then((csv) => {
                        csv.should.equal(csvTestData.array);
                        done();
                    })
                    .catch(done);
            });

            describe('Error Handling', () => {
                it('should throw an error about not having been passed data - none', (done) => {
                    converter.json2csvAsync()
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                            done();
                        });
                });

                it('should throw an error about not having been passed data - null', (done) => {
                    converter.json2csvAsync(null)
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                            done();
                        });
                });

                it('should throw an error about not having been passed data - undefined', (done) => {
                    converter.json2csvAsync(undefined)
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                            done();
                        });
                });
            });
        });
    });

    describe('json2csvPromisified() [deprecated]', () => {
        describe('Default Options', () => {
            beforeEach(() => {
                options = utils.deepCopy(defaultOptions);
            });

            /**
             * Since the functionality has been thoroughly tested in the main json2csv() block,
             * we just need to verify that the promisified version of the function is working
             * as expected here - specifically that data is returned properly and errors are
             * sent to the catch block.
             */

            it('should still work with an empty array', (done) => {
                converter.json2csvPromisified(jsonTestData.noData)
                    .then((csv) => {
                        csv.should.equal(csvTestData.noData);
                        done();
                    })
                    .catch(done);
            });

            it('should still work with an array of documents', (done) => {
                converter.json2csvPromisified(jsonTestData.array)
                    .then((csv) => {
                        csv.should.equal(csvTestData.array);
                        done();
                    })
                    .catch(done);
            });

            describe('Error Handling', () => {
                it('should throw an error about not having been passed data - none', (done) => {
                    converter.json2csvPromisified()
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                            done();
                        });
                });

                it('should throw an error about not having been passed data - null', (done) => {
                    converter.json2csvPromisified(null)
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                            done();
                        });
                });

                it('should throw an error about not having been passed data - undefined', (done) => {
                    converter.json2csvPromisified(undefined)
                        .then(() => {
                            done(new Error('An error was expected, but was not thrown.'));
                        })
                        .catch((err) => {
                            err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                            done();
                        });
                });
            });
        });
    });
}

module.exports = { runTests };
