let json2csvTests = require('./testJson2Csv'),
    csv2jsonTests = require('./testCsv2Json'),
    jsonTestData = require('./testJsonFilesList'),
    async = require('async'),
    fs = require('fs'),
    _ = require('underscore'),
    csvTestData  = {unQuoted: {}, quoted: {}}, // Document where all csv files will be loaded into
    csvFiles = require('./testCsvFilesList');

let readCsvFile = function (masterKey, fileInfo, callback) {
    csvTestData[masterKey][fileInfo.key] = fs.readFileSync(fileInfo.file).toString();
    return callback(null, csvTestData[masterKey][fileInfo.key]);
};

describe('json-2-csv Module', function() {
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

    // json2csvTests.runTests({jsonTestData: jsonTestData, csvTestData: csvTestData});
    csv2jsonTests.runTests({jsonTestData: jsonTestData, csvTestData: csvTestData});
});