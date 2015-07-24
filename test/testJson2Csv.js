var should = require('should'),
    assert = require('assert'),
    converter = require('../lib/converter'),
    constants = require('../lib/constants'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    defaultOptions = constants.DefaultOptions,
    jsonTestData,
    csvTestData,
    options;

var json2csvTests = function () {
    describe('Testing Default Usage', function () {
        describe('Default Options', function () {
            beforeEach(function () {
                options = defaultOptions;
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson2);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.noData);
                    csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.singleDoc);
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue);
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                    done();
                });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                    done();
                });
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 5', function (done) {
                try {
                    converter.json2csv();
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Custom Options - Comma Delimited', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ',',
                        ARRAY  :  '/'
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson2);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.noData);
                    csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.singleDoc);
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.DELIMITER.ARRAY, 'g'), options.DELIMITER.ARRAY));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {KEYS: ['info.name', 'year']});
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys);
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse different schemas when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemas);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse different schemas (only at nesting level) when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemasNested, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemasNested);
                    csv.split(options.EOL).length.should.equal(7);
                    done();
                }, options);
            });

            it("should parse different schemas that 'upgrade' from a null value to an nested object.", function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemasNullUpgrade, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemasNullUpgrade);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });


            /**
             * Replace all occurences inside a string, instead of only the first one as str.replace does...
             * http://stackoverflow.com/a/1144788/619465
             * @param find
             * @param replace
             * @param str
             * @returns {void|string|XML}
             */
            function replaceAll(find, replace, str) {
                return str.replace(new RegExp(find, 'g'), replace);
            }

            it("Should parse different schemas, even when the different data types are used for the same field name.", function(done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemasFieldTypes, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var quoted = csvTestData.quoted.differentSchemasFieldTypes;
                    var unquoted = replaceAll('"','', quoted);
                    csv.should.equal(unquoted);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            })

            it("Should convert false, 0 and null values to their expected value.", function(done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.false0null, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var quoted = csvTestData.quoted.false0null;
                    var unquoted = replaceAll('"','', quoted);
                    csv.should.equal(unquoted);
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            })

            it('should repress the heading', function (done) {
                options.PREPEND_HEADER = false;

                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.split(options.EOL).slice(1).join(options.EOL));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            // simon
            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Custom Options - Semicolon Delimited', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ';',
                        ARRAY  :  '/'
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson2.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedQuotes.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.noData.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.singleDoc.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.DELIMITER.ARRAY, 'g'), options.DELIMITER.ARRAY)
                            .replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {KEYS: ['info.name', 'year']});
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse different schemas when requested', function(done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemas, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemas.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options)
            });

            it('should parse different schemas (only at nesting level) when requested', function(done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemasNested, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemasNested.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(7);
                    done();
                }, options)
            });

            it("should parse different schemas that 'upgrade' from a null value to an nested object.", function(done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemasNullUpgrade, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemasNullUpgrade.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options)
            });

            it('should repress the heading', function (done) {
                options.PREPEND_HEADER = false;

                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, options.DELIMITER.FIELD).split(options.EOL).slice(1).join(options.EOL));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should throw an error if the documents are not the same by default', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                    done();
                }, options);
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = false;
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Custom Options - Quote Wrapped Fields', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ',',
                        ARRAY  :  '/',
                        WRAP   :  '\"'
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false
                }
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.regularJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedJson2.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedQuotes.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested commas in JSON to have commas in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedComma, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedComma.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.noData.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.singleDoc.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.arrayValue.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                var opts = _.extend(options, {KEYS: ['info.name', 'year']});
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.arrayValue_specificKeys);
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.regularJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse different schemas when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.differentSchemas);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse different schemas (only at nesting level) when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemasNested, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.differentSchemasNested);
                    csv.split(options.EOL).length.should.equal(7);
                    done();
                }, options);
            });

            it("should parse different schemas that 'upgrade' from a null value to an nested object.", function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csv(jsonTestData.differentSchemasNullUpgrade, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.differentSchemasNullUpgrade);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should repress the heading', function (done) {
                opts = JSON.parse(JSON.stringify(options));
                opts.PREPEND_HEADER = false;

                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.regularJson.split(options.EOL).slice(1).join(options.EOL));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Testing other errors', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ',',
                        ARRAY  :  ';',
                        WRAP   :  ''
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false,
                    KEYS              : null
                };
            });

            it('should throw an error about the field and array delimiters being the same', function (done) {
                options.DELIMITER.FIELD = options.DELIMITER.ARRAY = ',';
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    err.message.should.equal(constants.Errors.delimitersMustDiffer);
                    done();
                }, options);
            });
            
            it('should throw an error if the data is of the wrong type', function (done) {
                converter.json2csv(new Date().toString(), function (err, csv) {
                    err.message.should.equal(constants.Errors.json2csv.dataNotArrayOfDocuments);
                    done();
                }, options);
            });
        })
    });

    describe('Testing Promisified Usage', function () {
        beforeEach(function () {
            converter = Promise.promisifyAll(converter);
        });

        describe('Default Options', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ',',
                        ARRAY  :  ';',
                        WRAP   :  ''
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false,
                    KEYS              : null
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvAsync(jsonTestData.regularJson)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson2)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson2);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvAsync(jsonTestData.nestedQuotes)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvAsync(jsonTestData.noData)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.noData);
                        csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.singleDoc)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.singleDoc);
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.arrayValue)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue);
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvAsync(jsonTestData.sameSchemaDifferentOrdering)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvAsync(jsonTestData.differentSchemas)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvAsync(null)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvAsync(undefined)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Custom Options - Comma Delimited', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ',',
                        ARRAY  :  '/'
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvAsync(jsonTestData.regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson2, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson2);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvAsync(jsonTestData.nestedQuotes, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvAsync(jsonTestData.noData, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.noData);
                        csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.singleDoc, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.singleDoc);
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.DELIMITER.ARRAY, 'g'), options.DELIMITER.ARRAY));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {KEYS: ['info.name', 'year']});
                converter.json2csvAsync(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys);
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvAsync(jsonTestData.sameSchemaDifferentOrdering, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse different schemas when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.differentSchemas);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse different schemas (only at nesting level) when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemasNested, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.differentSchemasNested);
                        csv.split(options.EOL).length.should.equal(7);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it("should parse different schemas that 'upgrade' from a null value to an nested object.", function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemasNullUpgrade, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.differentSchemasNullUpgrade);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should repress the heading', function (done) {
                opts = JSON.parse(JSON.stringify(options));
                opts.PREPEND_HEADER = false;

                converter.json2csvAsync(jsonTestData.sameSchemaDifferentOrdering, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.split(options.EOL).slice(1).join(options.EOL));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvAsync(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvAsync(null, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvAsync(undefined, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Custom Options - Semicolon Delimited', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ';',
                        ARRAY  :  '/'
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvAsync(jsonTestData.regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson2, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson2.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvAsync(jsonTestData.nestedQuotes, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedQuotes.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvAsync(jsonTestData.noData, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.noData.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.singleDoc, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.singleDoc.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.DELIMITER.ARRAY, 'g'), options.DELIMITER.ARRAY)
                            .replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {KEYS: ['info.name', 'year']});
                converter.json2csvAsync(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvAsync(jsonTestData.sameSchemaDifferentOrdering, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse different schemas when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.differentSchemas.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse different schemas (only at nesting level) when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemasNested, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.differentSchemasNested.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(7);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it("should parse different schemas that 'upgrade' from a null value to an nested object.", function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemasNullUpgrade, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.differentSchemasNullUpgrade.replace(new RegExp(defaultOptions.DELIMITER.FIELD, 'g'), options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should repress the heading', function (done) {
                opts = JSON.parse(JSON.stringify(options));
                opts.PREPEND_HEADER = false;

                converter.json2csvAsync(jsonTestData.sameSchemaDifferentOrdering, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, options.DELIMITER.FIELD).split(options.EOL).slice(1).join(options.EOL));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvAsync(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvAsync(null, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvAsync(undefined, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Custom Options - Quote Wrapped Fields', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ',',
                        ARRAY  :  '/',
                        WRAP   :  '\"'
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false
                }
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvAsync(jsonTestData.regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.regularJson.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedJson.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvAsync(jsonTestData.nestedJson2, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedJson2.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvAsync(jsonTestData.nestedQuotes, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedQuotes.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested commas in JSON to have commas in CSV ', function(done) {
                converter.json2csvAsync(jsonTestData.nestedComma, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedComma.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvAsync(jsonTestData.noData, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.noData.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.singleDoc, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.singleDoc.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvAsync(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.arrayValue.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                var opts = _.extend(options, {KEYS: ['info.name', 'year']});
                converter.json2csvAsync(jsonTestData.arrayValue, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.arrayValue_specificKeys);
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.sameSchemaDifferentOrdering, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.regularJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse different schemas when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.differentSchemas);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse different schemas (only at nesting level) when requested', function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemasNested, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.differentSchemasNested);
                        csv.split(options.EOL).length.should.equal(7);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it("should parse different schemas that 'upgrade' from a null value to an nested object.", function (done) {
                options.ALLOW_DIFFERENT_SCHEMAS = true;
                converter.json2csvAsync(jsonTestData.differentSchemasNullUpgrade, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.differentSchemasNullUpgrade);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should repress the heading', function (done) {
                opts = JSON.parse(JSON.stringify(options));
                opts.PREPEND_HEADER = false;

                converter.json2csvAsync(jsonTestData.sameSchemaDifferentOrdering, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.regularJson.split(options.EOL).slice(1).join(options.EOL));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvAsync(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvAsync(null, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvAsync(undefined, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.cannotCallJson2CsvOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Testing other errors', function () {
            beforeEach(function () {
                options = {
                    DELIMITER         : {
                        FIELD  :  ',',
                        ARRAY  :  ';',
                        WRAP   :  ''
                    },
                    EOL               : '\n',
                    PARSE_CSV_NUMBERS : false,
                    KEYS              : null
                };
            });

            it('should throw an error about the field and array delimiters being the same', function (done) {
                options.DELIMITER.FIELD = options.DELIMITER.ARRAY = ',';
                converter.json2csvAsync(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.delimitersMustDiffer);
                        done();
                    });
            });

            it('should throw an error if the data is of the wrong type', function (done) {
                converter.json2csvAsync(new Date().toString(), options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.json2csv.dataNotArrayOfDocuments);
                        done();
                    });
            });
        })
    });
};

module.exports = {
    runTests: function (testData) {
        jsonTestData = testData.jsonTestData;
        csvTestData  = testData.csvTestData;

        describe('json2csv', function() {
            beforeEach(function () {
                options = null;
            });

            // Run JSON to CSV Tests
            json2csvTests();
        });
    }
};