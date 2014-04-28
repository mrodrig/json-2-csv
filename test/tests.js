var should = require('should'),
  commaTests = require('./testComma'),
  semiTests = require('./testSemi'),
  _ = require('underscore'),
  async = require('async');

describe('json-2-csv Module', function() {
    commaTests.runTests();
    semiTests.runTests();
});