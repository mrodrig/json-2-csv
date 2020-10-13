let json2csvTests = require('./json2csv'),
    csv2jsonTests = require('./csv2json'),
    utilsTests = require('./utilsTests'),
    jsonTestData = require('./config/testJsonFilesList'),
    csvTestData = require('./config/testCsvFilesList');

describe('json-2-csv Node Module', function() {
    process.env.TZ = 'America/New_York';
    // Run JSON to CSV tests
    json2csvTests.runTests(jsonTestData, csvTestData);

    // Run CSV to JSON Tests
    csv2jsonTests.runTests(jsonTestData, csvTestData);

    // Run Utils Tests
    utilsTests.runTests();
});
