var should = require('should'),
  commaTests = require('./testComma'),
  semiTests = require('./testSemi'),
  quotedTests = require('./testQuoted'),
  _ = require('underscore'),
  async = require('async');

describe('json-2-csv Module', function() {
    commaTests.runTests();
    semiTests.runTests();
    quotedTests.runTests();
});