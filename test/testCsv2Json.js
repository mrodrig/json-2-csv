var should = require('should'),
    assert = require('assert'),
    converter = require('../lib/converter'),
    constants = require('../lib/constants'),
    fs = require('fs'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    async = require('async'),
    defaultOptions = constants.DefaultOptions,
    jsonTestData = require('./testJsonFilesList'),
    csvTestData  = {unQuoted: {}, quoted: {}}, // Document where all csv files will be loaded into
    csvFiles = require('./testCsvFilesList'),
    options;

var csv2jsonTests = function () {
    describe('Testing Default Usage', function () {
        describe('Default Options', function () {
            beforeEach(function () {
                options = defaultOptions;
            });

            it('should convert a basic CSV to JSON', function(done) {
                converter.csv2json(csvTestData.unQuoted.regularJson, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.regularJson);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should parse a CSV representing nested objects to JSON - 1', function(done) {
                converter.csv2json(csvTestData.unQuoted.nestedJson, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.nestedJson);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should parse a CSV representing nested objects to JSON - 2', function(done) {
                converter.csv2json(csvTestData.unQuoted.nestedJson2, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.nestedJson2);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should parse nested quotes in a CSV to have nested quotes in JSON', function(done) {
                converter.csv2json(csvTestData.unQuoted.nestedQuotes, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.nestedQuotes);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should parse an empty CSV to an empty JSON array', function(done) {
                converter.csv2json(csvTestData.unQuoted.noData, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.noData);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should parse a single CSV entry to an array of a single JSON document', function (done) {
                converter.csv2json(csvTestData.unQuoted.singleDoc, function (err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, [jsonTestData.singleDoc]);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should parse a CSV with a nested array to the correct JSON representation', function (done) {
                converter.csv2json(csvTestData.unQuoted.arrayValue, function (err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.arrayValue);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.csv2json(null, function (err, json) {
                    err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'null.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.csv2json(undefined, function (err, json) {
                    err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'undefined.');
                    done();
                });
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.csv2json(undefined, undefined);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.csv2json(null, undefined);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.csv2json(null, null);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.csv2json(undefined, null);
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

            it('should convert a basic CSV to JSON', function(done) {
                converter.csv2json(csvTestData.unQuoted.regularJson, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.regularJson);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse a CSV representing nested objects to JSON - 1', function(done) {
                converter.csv2json(csvTestData.unQuoted.nestedJson, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.nestedJson);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse a CSV representing nested objects to JSON - 2', function(done) {
                converter.csv2json(csvTestData.unQuoted.nestedJson2, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.nestedJson2);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse nested quotes in a CSV to have nested quotes in JSON', function(done) {
                converter.csv2json(csvTestData.unQuoted.nestedQuotes, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.nestedQuotes);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse an empty CSV to an empty JSON array', function(done) {
                converter.csv2json(csvTestData.unQuoted.noData, function(err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.noData);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse a single CSV entry to an array of a single JSON document', function (done) {
                converter.csv2json(csvTestData.unQuoted.singleDoc, function (err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, [jsonTestData.singleDoc]);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse a CSV with a nested array to the correct JSON representation', function (done) {
                converter.csv2json(csvTestData.unQuoted.arrayValue.replace(/;/g, options.DELIMITER.ARRAY), function (err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.arrayValue);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse the specified keys to JSON', function (done) {
                var opts = _.extend(JSON.parse(JSON.stringify(options)), {KEYS : ['info.name', 'year']});
                converter.csv2json(csvTestData.unQuoted.arrayValue.replace(/,/g, options.DELIMITER.FIELD), function (err, json) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    var isEqual = _.isEqual(json, jsonTestData.arrayValue_specificKeys);
                    true.should.equal(isEqual);
                    done();
                }, opts);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.csv2json(null, function (err, json) {
                    err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.csv2json(undefined, function (err, json) {
                    err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.csv2json(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.csv2json(null, undefined, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.csv2json(null, null, options);
                } catch (err) {
                    err.message.should.equal(constants.Errors.callbackRequired);
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.csv2json(undefined, null, options);
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
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(jsonTestData.nestedJson, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(jsonTestData.nestedJson2, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedJson2.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(jsonTestData.nestedQuotes, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.nestedQuotes.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(jsonTestData.noData, function(err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.noData.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(jsonTestData.singleDoc, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.singleDoc.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue.replace(/;/g, options.DELIMITER.ARRAY).replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                var opts = _.extend(JSON.parse(JSON.stringify(options)), {KEYS: ['info.name', 'year']});
                converter.json2csv(jsonTestData.arrayValue, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys.replace(/,/g, opts.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(jsonTestData.sameSchemaDifferentOrdering, function (err, csv) {
                    if (err) { throw err; }
                    true.should.equal(_.isEqual(err, null));
                    csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(jsonTestData.differentSchemas, function (err, csv) {
                    err.message.should.equal('Not all documents have the same schema.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal('Cannot call json2csv on null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal('Cannot call json2csv on undefined.');
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
                };
            });

            // TODO: implement csv2json quote handling and test it
        });

        describe('Testing other errors', function () {
            beforeEach(function () {
                options = JSON.parse(JSON.stringify(defaultOptions));
            });

            it('should throw an error about the field and array delimiters being the same', function (done) {
                options.DELIMITER.FIELD = options.DELIMITER.ARRAY = ',';
                converter.csv2json(csvTestData.unQuoted.regularJson, function (err, json) {
                    err.message.should.equal(constants.Errors.delimitersMustDiffer);
                    done();
                }, options);
            });

            it('should throw an error if the data is of the wrong type', function (done) {
                converter.csv2json(new Date(), function (err, json) {
                    err.message.should.equal(constants.Errors.csv2json.csvNotString);
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
                options = defaultOptions;
            });

            it('should convert a basic CSV to JSON', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.regularJson)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.regularJson);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a CSV representing nested objects to JSON - 1', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.nestedJson)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.nestedJson);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a CSV representing nested objects to JSON - 2', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.nestedJson2)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.nestedJson2);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in a CSV to have nested quotes in JSON', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.nestedQuotes)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.nestedQuotes);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty CSV to an empty JSON array', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.noData)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.noData);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single CSV entry to an array of a single JSON document', function (done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.singleDoc)
                    .then(function (json) {
                        var isEqual = _.isEqual(json, [jsonTestData.singleDoc]);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a CSV with a nested array to the correct JSON representation', function (done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.arrayValue)
                    .then(function (json) {
                        var isEqual = _.isEqual(json, jsonTestData.arrayValue);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.csv2jsonAsync(null)
                    .then(function (json) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.csv2jsonAsync(undefined)
                    .then(function (json) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'undefined.');
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

            it('should convert a basic CSV to JSON', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.regularJson, options)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.regularJson);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a CSV representing nested objects to JSON - 1', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.nestedJson, options)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.nestedJson);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a CSV representing nested objects to JSON - 2', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.nestedJson2, options)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.nestedJson2);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in a CSV to have nested quotes in JSON', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.nestedQuotes, options)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.nestedQuotes);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty CSV to an empty JSON array', function(done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.noData, options)
                    .then(function(json) {
                        var isEqual = _.isEqual(json, jsonTestData.noData);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single CSV entry to an array of a single JSON document', function (done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.singleDoc, options)
                    .then(function (json) {
                        var isEqual = _.isEqual(json, [jsonTestData.singleDoc]);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a CSV with a nested array to the correct JSON representation', function (done) {
                converter.csv2jsonAsync(csvTestData.unQuoted.arrayValue.replace(/;/g, options.DELIMITER.ARRAY), options)
                    .then(function (json) {
                        var isEqual = _.isEqual(json, jsonTestData.arrayValue);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to JSON', function (done) {
                var opts = _.extend(JSON.parse(JSON.stringify(options)), {KEYS : ['info.name', 'year']});
                converter.csv2jsonAsync(csvTestData.unQuoted.arrayValue.replace(/,/g, options.DELIMITER.FIELD), opts)
                    .then(function (json) {
                        var isEqual = _.isEqual(json, jsonTestData.arrayValue_specificKeys);
                        true.should.equal(isEqual);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.csv2jsonAsync(null, options)
                    .then(function (json) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.csv2jsonAsync(undefined, options)
                    .then(function (json) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.csv2json.cannotCallCsv2JsonOn + 'undefined.');
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
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csvTestData.unQuoted.nestedJson.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csvTestData.unQuoted.nestedJson2.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csvTestData.unQuoted.nestedQuotes.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csvTestData.unQuoted.noData.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csvTestData.unQuoted.singleDoc.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csvTestData.unQuoted.arrayValue.replace(/;/g, options.DELIMITER.ARRAY).replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                var opts = _.extend(JSON.parse(JSON.stringify(options)), {KEYS: ['info.name', 'year']});
                converter.json2csvAsync(jsonTestData.arrayValue, opts)
                    .then(function (csv) {
                        csv.should.equal(csvTestData.unQuoted.arrayValue_specificKeys.replace(/,/g, opts.DELIMITER.FIELD));
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
                        csv.should.equal(csvTestData.unQuoted.regularJson.replace(/,/g, ';'));
                        csv.split(options.EOL).length.should.equal(6);
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
                        err.message.should.equal('Not all documents have the same schema.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvAsync(null, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal('Cannot call json2csv on null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvAsync(undefined, options)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal('Cannot call json2csv on undefined.');
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
                };
            });

            // TODO: implement csv2json quote handling and test it
        });

        describe('Testing other errors', function () {
            beforeEach(function () {
                options = JSON.parse(JSON.stringify(defaultOptions));
            });

            it('should throw an error about the field and array delimiters being the same', function (done) {
                options.DELIMITER.FIELD = options.DELIMITER.ARRAY = ',';
                converter.csv2jsonAsync(csvTestData.unQuoted.regularJson, options)
                    .then(function (json) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.delimitersMustDiffer);
                        done();
                    });
            });

            it('should throw an error if the data is of the wrong type', function (done) {
                converter.csv2jsonAsync(new Date(), options)
                    .then(function (json) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal(constants.Errors.csv2json.csvNotString);
                        done();
                    });
            });
        })
    });
};

var readCsvFile = function (masterKey, fileInfo, callback) {
    csvTestData[masterKey][fileInfo.key] = fs.readFileSync(fileInfo.file).toString();
    return callback(null, csvTestData[masterKey][fileInfo.key]);
};

module.exports = {
    runTests: function () {
        describe('csv2json', function() {
            before(function(done) {
                async.parallel(
                    _.flatten(_.map(csvFiles, function (grouping) {
                        return _.map(grouping.files, function (fileInfo) {
                            return _.partial(readCsvFile, grouping.key, fileInfo);
                        });
                    })),
                    function(err, results) {
                        if (err) throw err;
                        done();
                    });
            });

            beforeEach(function () {
                options = null;
            });

            // Run JSON to CSV Tests
            csv2jsonTests();
        });
    }
};