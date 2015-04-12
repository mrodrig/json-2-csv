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

var csv2jsonTests = function () {
    describe('Testing Default Usage', function () {
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
        describe('csv2json', function() {
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