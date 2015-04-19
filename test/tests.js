var json2csvTests = require('./testJson2Csv'),
    csv2jsonTests = require('./testCsv2Json'),
    pathTests     = require('./testPath');

describe('json-2-csv Module', function() {
    json2csvTests.runTests();
    csv2jsonTests.runTests();
    pathTests.runTests();
});