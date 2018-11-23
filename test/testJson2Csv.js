let should = require('should'),
    assert = require('assert'),
    converter = require('../src/converter'),
    constants = require('../src/constants'),
    _ = require('underscore'),
    promise = require('bluebird'),
    defaultOptions = constants.defaultOptions,
    jsonTestData,
    csvTestData,
    options;

let json2csvTests = function () {
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
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson2);
                    csv.split(options.delimiter.eol).length.should.equal(4);
                    done();
                });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.noData);
                    csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.singleDoc);
                    csv.split(options.delimiter.eol).length.should.equal(3);
                    done();
                });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue);
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.notSameSchema);
                    done();
                });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                    done();
                });
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    console.log('GOOD');
                    converter.json2csv(undefined, undefined, undefined);
                } catch (err) {
                    console.log('ERROR');
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, undefined);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 5', function (done) {
                try {
                    converter.json2csv();
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Custom Options - Comma Delimited', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ',',
                        array  :  '/',
                        eol    : '\n'
                    },
                    parseCsvNumbers : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson2);
                    csv.split(options.delimiter.eol).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.noData);
                    csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.singleDoc);
                    csv.split(options.delimiter.eol).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.delimiter.array, 'g'), options.delimiter.array));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {keys: ['info.name', 'year']});
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys);
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should repress the heading', function (done) {
                opts = JSON.parse(JSON.stringify(options));
                opts.prependHeader = false;

                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.split(options.delimiter.eol).slice(1).join(options.delimiter.eol));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.notSameSchema);
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Custom Options - Semicolon Delimited', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ';',
                        array  :  '/',
                        eol    : '\n'
                    },
                    parseCsvNumbers : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson2.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedQuotes.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.noData.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.singleDoc.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.delimiter.array, 'g'), options.delimiter.array)
                            .replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {keys: ['info.name', 'year']});
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should repress the heading', function (done) {
                opts = JSON.parse(JSON.stringify(options));
                opts.prependHeader = false;

                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, options.delimiter.field).split(options.delimiter.eol).slice(1).join(options.delimiter.eol));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.notSameSchema);
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Custom Options - Quote Wrapped Fields', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ',',
                        array  :  '/',
                        wrap   :  '\"',
                        eol    : '\n'
                    },
                    parseCsvNumbers : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.regularJson.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedJson.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedJson2.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedQuotes.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse nested commas in JSON to have commas in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedComma, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.nestedComma.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.noData.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.singleDoc.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.arrayValue.replace(/,/g, options.delimiter.field));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                let opts = _.extend(options, {keys: ['info.name', 'year']});
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.arrayValue_specificKeys);
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.regularJson);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });

            it('should repress the heading', function (done) {
                opts = JSON.parse(JSON.stringify(options));
                opts.prependHeader = false;

                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.quoted.regularJson.split(options.delimiter.eol).slice(1).join(options.delimiter.eol));
                    csv.split(options.delimiter.eol).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.notSameSchema);
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null, options);
                } catch (err) {
                    err.message.should.equal(constants.errors.callbackRequired);
                    done();
                }
            });
        });

        describe('Testing other functionality', function () {
            beforeEach(function () {
                options = defaultOptions;
            });

            it('should sort sort the headers alphabetically', function(done) {
                options = {sortHeader : true};
                
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJsonSorted);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });
            
            it('should not check for schema differences - same schema', function(done) {
                options = {checkSchemaDifferences : false};
                
                converter.json2csv(jsonTestData.regularJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });
            
            it('should not check for schema differences - different schema', function(done) {
                options = {checkSchemaDifferences : false};
                
                converter.json2csv(jsonTestData.differentSchemas, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemas);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });
            
            it('should not check for schema differences and sort header', function(done) {
                options = {checkSchemaDifferences : false, sortHeader : true};
                
                converter.json2csv(jsonTestData.differentSchemas, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemasSorted);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });
            
            it('should test the convert field branches', function (done) {
                converter.json2csv(jsonTestData.convertFieldTestCases, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.convertFieldTestCases);
                    csv.split(options.delimiter.eol).length.should.equal(4);
                    done();
                }, options);
            });
            
            it('should test the empty field value', function (done) {
                options = {checkSchemaDifferences: false, emptyFieldValue : ''};
                
                converter.json2csv(jsonTestData.differentSchemas, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.differentSchemasEmptyValue);
                    csv.split(options.delimiter.eol).length.should.equal(6);
                    done();
                }, options);
            });
            
            it('should trim the headers and fields - 1', function (done) {
                converter.json2csv(jsonTestData.needsTrimming, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.trimmed);
                    csv.split(options.delimiter.eol).length.should.equal(3);
                    done();
                }, {trimHeaderFields: true, trimFieldValues: true});
            });
            
            it('should trim the headers and fields - 2', function (done) {
                converter.json2csv(jsonTestData.trimmed, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.trimmed);
                    csv.split(options.delimiter.eol).length.should.equal(3);
                    done();
                }, {trimHeaderFields: true, trimFieldValues: true});
            });
        });
            
        describe('Testing other errors', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ',',
                        array  :  ';',
                        wrap   :  ''
                    },
                    eol               : '\n',
                    parseCsvNumbers : false,
                    keys              : null
                };
            });

            it('should throw an error about the field and array delimiters being the same', function (done) {
                options.delimiter.field = options.delimiter.array = ',';
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    err.message.should.equal(constants.errors.delimitersMustDiffer);
                    done();
                }, options);
            });
            
            it('should throw an error if the data is of the wrong type', function (done) {
                converter.json2csv(new Date().toString(), function (err, csv) {
                    err.message.should.equal(constants.errors.json2csv.dataCheckFailure);
                    done();
                }, options);
            });
        });
    });

    describe('Testing Promisified Usage', function () {
        describe('Default Options', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ',',
                        array  :  ';',
                        wrap   :  '',
                        eol    : '\n'
                    },
                    parseCsvNumbers : false,
                    keys              : null
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.regularJson)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson);
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson2)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson2);
                        csv.split(options.delimiter.eol).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedQuotes)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.noData)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.noData);
                        csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.singleDoc)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.singleDoc);
                        csv.split(options.delimiter.eol).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.arrayValue)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue);
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvPromisified(jsonTestData.sameSchemaDifferentOrdering)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvPromisified(jsonTestData.differentSchemas)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvPromisified(null)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvPromisified(undefined)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Custom Options - Comma Delimited', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ',',
                        array  :  '/',
                        eol    : '\n'
                    },
                    parseCsvNumbers : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson);
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson2, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson2);
                        csv.split(options.delimiter.eol).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedQuotes, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedQuotes);
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.noData, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.noData);
                        csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.singleDoc, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.singleDoc);
                        csv.split(options.delimiter.eol).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.delimiter.array, 'g'), options.delimiter.array));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {keys: ['info.name', 'year']});
                converter.json2csvPromisified(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys);
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvPromisified(jsonTestData.sameSchemaDifferentOrdering, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson);
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should repress the heading', function (done) {
                let opts = JSON.parse(JSON.stringify(options));
                opts.prependHeader = false;

                converter.json2csvPromisified(jsonTestData.sameSchemaDifferentOrdering, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.split(options.delimiter.eol).slice(1).join(options.delimiter.eol));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvPromisified(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvPromisified(null, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvPromisified(undefined, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Custom Options - Semicolon Delimited', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ';',
                        array  :  '/',
                        eol    : '\n'
                    },
                    parseCsvNumbers : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson2, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedJson2.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedQuotes, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.nestedQuotes.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.noData, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.unQuoted.noData.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.singleDoc, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.singleDoc.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue.replace(new RegExp(defaultOptions.delimiter.array, 'g'), options.delimiter.array)
                            .replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                options = _.extend(options, {keys: ['info.name', 'year']});
                converter.json2csvPromisified(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvPromisified(jsonTestData.sameSchemaDifferentOrdering, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(new RegExp(defaultOptions.delimiter.field, 'g'), options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should repress the heading', function (done) {
                let opts = JSON.parse(JSON.stringify(options));
                opts.prependHeader = false;

                converter.json2csvPromisified(jsonTestData.sameSchemaDifferentOrdering, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, options.delimiter.field).split(options.delimiter.eol).slice(1).join(options.delimiter.eol));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvPromisified(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvPromisified(null, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvPromisified(undefined, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Custom Options - Quote Wrapped Fields', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ',',
                        array  :  '/',
                        wrap   :  '\"',
                        eol    : '\n'
                    },
                    parseCsvNumbers : false
                };
            });

            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.regularJson.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedJson.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedJson2, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedJson2.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedQuotes, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedQuotes.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested commas in JSON to have commas in CSV ', function(done) {
                converter.json2csvPromisified(jsonTestData.nestedComma, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.nestedComma.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvPromisified(jsonTestData.noData, options)
                    .then(function(csv) {
                        csv.should.equal(csvTestData.quoted.noData.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.singleDoc, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.singleDoc.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvPromisified(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.arrayValue.replace(/,/g, options.delimiter.field));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                let opts = _.extend(options, {keys: ['info.name', 'year']});
                converter.json2csvPromisified(jsonTestData.arrayValue, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.arrayValue_specificKeys);
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvPromisified(jsonTestData.sameSchemaDifferentOrdering, options)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.regularJson);
                        csv.split(options.delimiter.eol).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should repress the heading', function (done) {
                let opts = JSON.parse(JSON.stringify(options));
                opts.prependHeader = false;

                converter.json2csvPromisified(jsonTestData.sameSchemaDifferentOrdering, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.quoted.regularJson.split(options.delimiter.eol).slice(1).join(options.delimiter.eol));
                        csv.split(options.delimiter.eol).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvPromisified(jsonTestData.differentSchemas, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.notSameSchema);
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvPromisified(null, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvPromisified(undefined, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.cannotCallOn + 'undefined.');
                        done();
                    });
            });
        });

        describe('Testing other errors', function () {
            beforeEach(function () {
                options = {
                    delimiter         : {
                        field  :  ',',
                        array  :  ';',
                        wrap   :  ''
                    },
                    eol               : '\n',
                    parseCsvNumbers : false,
                    keys              : null
                };
            });

            it('should throw an error about the field and array delimiters being the same', function (done) {
                options.delimiter.field = options.delimiter.array = ',';
                converter.json2csvPromisified(jsonTestData.arrayValue, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.delimitersMustDiffer);
                        done();
                    });
            });

            it('should throw an error if the data is of the wrong type', function (done) {
                converter.json2csvPromisified(new Date().toString(), options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.errors.json2csv.dataCheckFailure);
                        done();
                    });
            });
        });
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