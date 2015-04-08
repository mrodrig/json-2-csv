var should = require('should'),
    converter = require('.././lib/converter'),
    fs = require('fs'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    async = require('async');

var options = {
    DELIMITER         : {
        FIELD  :  ',',
        ARRAY  :  '/',
        WRAP   :  '\"'
    },
    EOL               : '\n',
    PARSE_CSV_NUMBERS : false
};

var json_regularJson                 = require('./JSON/regularJson'),
    json_nestedJson                  = require('./JSON/nestedJson'),
    json_nestedJson2                 = require('./JSON/nestedJson2'),
    json_nestedQuotes                = require('./JSON/nestedQuotes'),
    json_nestedComma                 = require('./JSON/nestedComma'),
    json_noData                      = require('./JSON/noData.json'),
    json_singleDoc                   = require('./JSON/singleDoc.json'),
    json_arrayValue                  = require('./JSON/arrayValueDocs.json'),
    json_sameSchemaDifferentOrdering = require('./JSON/sameSchemaDifferentOrdering'),
    json_differentSchemas            = require('./JSON/differentSchemas'),
    csv_regularJson                  = '',
    csv_nestedJson                   = '',
    csv_nestedJson2                  = '',
    csv_nestedQuotes                 = '',
    csv_nestedComma                  = '',
    csv_noData                       = '',
    csv_singleDoc                    = '',
    csv_arrayValue                   = '';

var json2csvTests = function () {
    describe('json2csv - non-promisified', function (done) {
        describe('Options Specified', function (done) {
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

            it('should parse nested commas in JSON to have commas in CSV ', function(done) {
                converter.json2csv(json_nestedComma, function(err, csv) {
                    csv.should.equal(csv_nestedComma.replace(/,/g, options.DELIMITER.FIELD));
                    csv.split(options.EOL).length.should.equal(3);
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

            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csv(json_sameSchemaDifferentOrdering, function (err, csv) {
                    csv.should.equal(csv_regularJson);
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
    });

    describe('json2csv - promisified', function (done) {
        beforeEach(function () {
            converter = Promise.promisifyAll(converter);
        });

        describe('Options Specified', function (done) {
            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvAsync(json_regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csv_regularJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 1', function(done) {
                converter.json2csvAsync(json_nestedJson, options)
                    .then(function(csv) {
                        csv.should.equal(csv_nestedJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested JSON to CSV - 2', function(done) {
                converter.json2csvAsync(json_nestedJson2, options)
                    .then(function(csv) {
                        csv.should.equal(csv_nestedJson2);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse nested quotes in JSON to have quotes in CSV ', function(done) {
                converter.json2csvAsync(json_nestedQuotes, options)
                    .then(function(csv) {
                        csv.should.equal(csv_nestedQuotes);
                        csv.split(options.EOL).length.should.equal(4);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an empty array to an empty CSV', function(done) {
                converter.json2csvAsync(json_noData, options)
                    .then(function(csv) {
                        csv.should.equal(csv_noData);
                        csv.split(options.EOL).length.should.equal(3); // Still adds newlines for header, first data row, and end of data
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvAsync(json_singleDoc, options)
                    .then(function (csv) {
                        csv.should.equal(csv_singleDoc);
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse a single JSON document to CSV', function (done) {
                converter.json2csvAsync(json_arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csv_arrayValue);
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
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
    });
};

module.exports = {
    runTests: function (callback) {
        describe('Wrapped in Quotes', function() {
            before(function(done) {
                async.parallel([
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/regularJson.csv', function(err, data) {
                                if (err) callback(err);
                                csv_regularJson = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/nestedJson.csv', function(err, data) {
                                if (err) callback(err);
                                csv_nestedJson = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/nestedJson2.csv', function(err, data) {
                                if (err) callback(err);
                                csv_nestedJson2 = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/nestedQuotes.csv', function(err, data) {
                                if (err) callback(err);
                                csv_nestedQuotes = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/nestedComma.csv', function(err, data) {
                                if (err) callback(err);
                                csv_nestedComma = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/noData.csv', function (err, data) {
                                if (err) callback(err);
                                csv_noData = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/singleDoc.csv', function (err, data) {
                                if (err) callback(err);
                                csv_singleDoc = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/withQuotes/arrayValueDocs.csv', function (err, data) {
                                if (err) callback(err);
                                csv_arrayValue = data.toString();
                                callback(null);
                            });
                        }
                    ],
                    function(err, results) {
                        if (err) console.log(err);
                        done();
                    });
            });

            // JSON to CSV
            json2csvTests();

        });
    }
};
