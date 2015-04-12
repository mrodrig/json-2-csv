var should = require('should'),
    converter = require('.././lib/converter'),
    fs = require('fs'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    async = require('async');

var options = {
    DELIMITER         : {
        FIELD  :  ';',
        ARRAY  :  '/'
    },
    EOL               : '\n',
    PARSE_CSV_NUMBERS : false
};

var json_regularJson                 = require('./JSON/regularJson'),
    json_nestedJson                  = require('./JSON/nestedJson'),
    json_nestedJson2                 = require('./JSON/nestedJson2'),
    json_nestedQuotes                = require('./JSON/nestedQuotes'),
    json_noData                      = require('./JSON/noData.json'),
    json_singleDoc                   = require('./JSON/singleDoc.json'),
    json_arrayValue                  = require('./JSON/arrayValueDocs.json'),
    json_sameSchemaDifferentOrdering = require('./JSON/sameSchemaDifferentOrdering'),
    json_differentSchemas            = require('./JSON/differentSchemas'),
    csv_regularJson                  = '',
    csv_nestedJson                   = '',
    csv_nestedJson2                  = '',
    csv_nestedQuotes                 = '',
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
                    csv.should.equal(csv_regularJson.replace(/,/g, ';'));
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

        describe('Options Un-specified', function (done) {
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
    });

    describe('json2csv - promisified', function (done) {
        beforeEach(function () {
            converter = Promise.promisifyAll(converter);
        });

        describe('Options Specified', function (done) {
            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvAsync(json_regularJson, options)
                    .then(function(csv) {
                        csv.should.equal(csv_regularJson.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csv_nestedJson.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csv_nestedJson2.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csv_nestedQuotes.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csv_noData.replace(/,/g, options.DELIMITER.FIELD));
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
                        csv.should.equal(csv_singleDoc.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvAsync(json_arrayValue, options)
                    .then(function (csv) {
                        csv.should.equal(csv_arrayValue.replace(/,/g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });


            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvAsync(json_sameSchemaDifferentOrdering, options)
                    .then(function (csv) {
                        csv.should.equal(csv_regularJson.replace(/,/g, ';'));
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvAsync(json_differentSchemas, options)
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

        describe('Options Un-specified', function (done) {
            it('should convert plain JSON to CSV', function(done) {
                converter.json2csvAsync(json_regularJson)
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
                converter.json2csvAsync(json_nestedJson)
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
                converter.json2csvAsync(json_nestedJson2)
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
                converter.json2csvAsync(json_nestedQuotes)
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
                converter.json2csvAsync(json_noData)
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
                converter.json2csvAsync(json_singleDoc)
                    .then(function (csv) {
                        csv.should.equal(csv_singleDoc);
                        csv.split(options.EOL).length.should.equal(3);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should parse an array of JSON documents to CSV', function (done) {
                converter.json2csvAsync(json_arrayValue)
                    .then(function (csv) {
                        csv.should.equal(csv_arrayValue.replace(/\//g, options.DELIMITER.FIELD));
                        csv.split(options.EOL).length.should.equal(5);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });


            it('should parse an array of JSON documents with the same schema but different ordering of fields', function (done) {
                converter.json2csvAsync(json_sameSchemaDifferentOrdering)
                    .then(function (csv) {
                        csv.should.equal(csv_regularJson);
                        csv.split(options.EOL).length.should.equal(6);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });

            it('should throw an error if the documents do not have the same schema', function (done) {
                converter.json2csvAsync(json_differentSchemas)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal('Not all documents have the same schema.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.json2csvAsync(null)
                    .then(function (csv) {
                        throw new Error('should not hit');
                    })
                    .catch(function (err) {
                        err.message.should.equal('Cannot call json2csv on null.');
                        done();
                    });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.json2csvAsync(undefined)
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

var csv2jsonTests = function () {
    describe('csv2json', function (done) {
        describe('Options Specified', function (done) {
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

        describe('Options Un-specified', function (done) {
            it('should convert a basic CSV to JSON', function(done) {
                converter.csv2json(csv_regularJson.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_regularJson);
                    false.should.equal(isEqual);
                    done();
                });
            });

            it('should parse a CSV representing nested objects to JSON - 1', function(done) {
                converter.csv2json(csv_nestedJson.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_nestedJson);
                    false.should.equal(isEqual);
                    done();
                });
            });

            it('should parse a CSV representing nested objects to JSON - 2', function(done) {
                converter.csv2json(csv_nestedJson2.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_nestedJson2);
                    false.should.equal(isEqual);
                    done();
                });
            });

            it('should parse nested quotes in a CSV to have nested quotes in JSON', function(done) {
                converter.csv2json(csv_nestedQuotes.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_nestedQuotes); // This should be equal because there are no delimiters in the file
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should parse an empty CSV to an empty JSON array', function(done) {
                converter.csv2json(csv_noData.replace(/,/g, options.DELIMITER.FIELD), function(err, json) {
                    var isEqual = _.isEqual(json, json_noData);
                    true.should.equal(isEqual);
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

            it('should parse a CSV with a nested array to the correct JSON representation', function (done) {
                converter.csv2json(csv_arrayValue.replace(/\//g, options.DELIMITER.FIELD), function (err, json) {
                    var isEqual = _.isEqual(json, json_arrayValue);
                    true.should.equal(isEqual);
                    done();
                });
            });

            it('should throw an error about not having been passed data - 1', function (done) {
                converter.csv2json(null, function (err, json) {
                    err.message.should.equal('Cannot call csv2json on null.');
                    done();
                });
            });

            it('should throw an error about not having been passed data - 2', function (done) {
                converter.csv2json(undefined, function (err, json) {
                    err.message.should.equal('Cannot call csv2json on undefined.');
                    done();
                });
            });

            it('should throw an error about not being provided a callback - 1', function (done) {
                try {
                    converter.csv2json(undefined, undefined);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 2', function (done) {
                try {
                    converter.csv2json(undefined, undefined);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 3', function (done) {
                try {
                    converter.csv2json(null, null);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 4', function (done) {
                try {
                    converter.csv2json(undefined, null);
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });

            it('should throw an error about not being provided a callback - 5', function (done) {
                try {
                    converter.csv2json();
                } catch (err) {
                    err.message.should.equal('A callback is required!');
                    done();
                }
            });
        });
    });
};

module.exports = {
    runTests: function (callback) {
        describe('";" Delimited', function() {
            before(function(done) {
                async.parallel([
                        function(callback) {
                            fs.readFile('test/CSV/regularJson.csv', function(err, data) {
                                if (err) callback(err);
                                csv_regularJson = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/nestedJson.csv', function(err, data) {
                                if (err) callback(err);
                                csv_nestedJson = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/nestedJson2.csv', function(err, data) {
                                if (err) callback(err);
                                csv_nestedJson2 = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/nestedQuotes.csv', function(err, data) {
                                if (err) callback(err);
                                csv_nestedQuotes = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/noData.csv', function (err, data) {
                                if (err) callback(err);
                                csv_noData = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/singleDoc.csv', function (err, data) {
                                if (err) callback(err);
                                csv_singleDoc = data.toString();
                                callback(null);
                            });
                        },
                        function(callback) {
                            fs.readFile('test/CSV/arrayValueDocs.csv', function (err, data) {
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

            // CSV to JSON
            csv2jsonTests();
        });
    }
};
