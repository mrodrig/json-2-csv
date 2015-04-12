var should = require('should'),
    converter = require('.././lib/converter'),
    fs = require('fs'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    async = require('async');

var options;

var json = {
        arrayValue: require('./JSON/arrayValueDocs'),
        arrayValue_specificKeys: require('./JSON/arrayValueDocs_specificKeys'),
        nestedJson: require('./JSON/nestedJson'),
        nestedJson2: require('./JSON/nestedJson2'),
        nestedQuotes: require('./JSON/nestedQuotes'),
        noData: require('./JSON/noData'),
        regularJson: require('./JSON/regularJson'),
        singleDoc: require('./JSON/singleDoc'),
        sameSchemaDifferentOrdering: require('./JSON/sameSchemaDifferentOrdering'),
        differentSchemas: require('./JSON/differentSchemas')
    },
    csv  = {}, // Document where all csv files will be loaded into
    csvFiles = [
        {key: 'arrayValue', file: './CSV/arrayValueDocs.csv'},
        {key: 'arrayValue_specificKeys', file: './CSV/arrayValueDocs_specificKeys.csv'},
        {key: 'nestedJson', file: './CSV/nestedJson.csv'},
        {key: 'nestedJson2', file: './CSV/nestedJson2.csv'},
        {key: 'nestedQuotes', file: './CSV/nestedQuotes.csv'},
        {key: 'noData', file: './CSV/noData.csv'},
        {key: 'regularJson', file: './CSV/regularJson.csv'},
        {key: 'singleDoc', file: './CSV/singleDoc.csv'}
    ];

var json2csvTests = function () {
    describe('Testing Default Usage', function () {
        describe('Default Options', function () {
            it('should convert plain JSON to CSV', function(done) {
                converter.json2csv(json_regularJson, function(err, csv) {
                    csv.should.equal(csv_regularJson
                    );
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(json_nestedJson, function(err, csv) {
                    csv.should.equal(csv_nestedJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(json_nestedJson2, function(err, csv) {
                    csv.should.equal(csv_nestedJson2);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(json_nestedQuotes, function(err, csv) {
                    csv.should.equal(csv_nestedQuotes);
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(json_noData, function(err, csv) {
                    csv.should.equal(csv_noData);
                    csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(json_singleDoc, function (err, csv) {
                    csv.should.equal(csv_singleDoc);
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(json_arrayValue, function (err, csv) {
                    csv.should.equal(csv_arrayValue.replace(/\//g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                });
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(json_sameSchemaDifferentOrdering, function (err, csv) {
                    csv.should.equal(csv_regularJson);
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(json_differentSchemas, function (err, csv) {
                    err.message.should.equal('Not all documents have the same schema.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csv(null, function (err, csv) {
                    err.message.should.equal('Cannot call json2csv on null.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csv(undefined, function (err, csv) {
                    err.message.should.equal('Cannot call json2csv on undefined.');
                    done();
                });
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.json2csv(undefined, undefined);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 5', function (done) {
                try {
                    converter.json2csv();
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });
        });

        describe('Custom Options - Comma Delimited', function () {
            beforeEach(function () {

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
                converter.json2csv(json_regularJson, function(err, csv) {
                    csv.should.equal(csv_regularJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csv(json_nestedJson, function(err, csv) {
                    csv.should.equal(csv_nestedJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csv(json_nestedJson2, function(err, csv) {
                    csv.should.equal(csv_nestedJson2.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csv(json_nestedQuotes, function(err, csv) {
                    csv.should.equal(csv_nestedQuotes.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(4);
                    done();
                }, options);
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csv(json_noData, function(err, csv) {
                    csv.should.equal(csv_noData.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(json_singleDoc, function (err, csv) {
                    csv.should.equal(csv_singleDoc.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csv(json_arrayValue, function (err, csv) {
                    csv.should.equal(csv_arrayValue.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, options);
            });

            it('should parse the specified keys to CSV', function (done) {
                // Create a copy so we don't modify the actual options object
                var opts = _.extend(JSON.parse(JSON.stringify(options)), {KEYS: ['info.name', 'year']});
                converter.json2csv(json_arrayValue, function (err, csv) {
                    csv.should.equal(csv_arrayValue_specificKeys.replace(/,/g, opts.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(5);
                    done();
                }, opts);
            });

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(json_sameSchemaDifferentOrdering, function (err, csv) {
                    csv.should.equal(csv_regularJson.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(6);
                    done();
                }, options);
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csv(json_differentSchemas, function (err, csv) {
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
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.json2csv(null, undefined, options);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.json2csv(null, null, options);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.json2csv(undefined, null, options);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });
        });

        describe('Custom Options - Quote Wrapped Fields', function () {
            beforeEach(function () {

            });
        });
    });

    describe('Testing Promisified Usage', function () {
        beforeEach(function () {
            converter = Promise.promisifyAll(converter);
        });

        describe('Default Options', function () {

        });

        describe('Custom Options - Comma Delimited', function () {
            beforeEach(function () {

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

            it('should convert a basic CSV to JSON', function(done) {
                converter.csv2json(csv_regularJson.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_regularJson);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse a CSV representing nested objects to JSON - 1', function(done) {
                converter.csv2json(csv_nestedJson.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_nestedJson);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse a CSV representing nested objects to JSON - 2', function(done) {
                converter.csv2json(csv_nestedJson2.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_nestedJson2);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse nested quotes in a CSV to have nested quotes in JSON', function(done) {
                converter.csv2json(csv_nestedQuotes.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_nestedQuotes);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse an empty CSV to an empty JSON array', function(done) {
                converter.csv2json(csv_noData.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_noData);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csv(json_singleDoc, function (err, csv) {
                    csv.should.equal(csv_singleDoc.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3);
                    done();
                }, options);
            });

            it('should parse a CSV with a nested array to the correct JSON representation', function (done) {
                converter.csv2json(csv_arrayValue.replace(/,/g, options.DELIMITER.FIELD), function (err, json) {
                    var isEqual = _.isEqual(json, json_arrayValue);
                    true.should.equal(isEqual);
                    done();
                }, options);
            });

            it('should parse the specified keys to JSON', function (done) {
                var opts = _.extend(JSON.parse(JSON.stringify(options)), {KEYS : ['info.name', 'year']});
                converter.csv2json(csv_arrayValue.replace(/,/g, options.DELIMITER.FIELD), function (err, json) {
                    var isEqual = _.isEqual(json, json_arrayValue_specificKeys);
                    true.should.equal(isEqual);
                    done();
                }, opts);
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.csv2json(null, function (err, json) {
                    err.message.should.equal('Cannot call csv2json on null.');
                    done();
                }, options);
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.csv2json(undefined, function (err, json) {
                    err.message.should.equal('Cannot call csv2json on undefined.');
                    done();
                }, options);
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.csv2json(undefined, undefined, options);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.csv2json(null, undefined, options);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.csv2json(null, null, options);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.csv2json(undefined, null, options);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });
        });

        describe('Custom Options - Quote Wrapped Fields', function () {
            beforeEach(function () {

            });
        });
    });
};

var readCsvFile = function (fileInfo, callback) {
    csv[fileInfo.key] = fs.readFileSync(fileInfo.file);
    return callback(null, csv[fileInfo.key]);
};

module.exports = {
    runTests: function (callback) {
        describe('json2csv', function() {
            before(function(done) {
                async.parallel(
                    _.map(csvFiles, function (fileInfo) { return _.partial(readCsvFile, fileInfo); }),
                    function(err, results) {
                        if (err) throw err;
                        done();
                    });
            });

            beforeEach(function () {
                options = null;
            });

            // Run JSON to CSV Tests
            json2csvTests();
        });
    }
};