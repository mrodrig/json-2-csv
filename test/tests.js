var commaTests = require('./testComma'),
    semiTests = require('./testSemi'),
    quotedTests = require('./testQuoted');

describe('json-2-csv Module', function() {
    commaTests.runTests();
    semiTests.runTests();
    quotedTests.runTests();
});