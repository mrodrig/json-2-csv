let json2csvTests = require('./json2csv'),
    csv2jsonTests = require('./csv2json'),
    jsonTestData = require('./config/testJsonFilesList'),
    csvTestData = require('./config/testCsvFilesList');

describe('json-2-csv Node Module', function() {
    // Run JSON to CSV tests
    json2csvTests.runTests(jsonTestData, csvTestData);

    // Run CSV to JSON Tests
    csv2jsonTests.runTests(jsonTestData, csvTestData);
});
