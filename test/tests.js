var should = require('should'),
  json2csv = require('.././lib/json-2-csv'),
  fs = require('fs'),
  async = require('async');

var in_regularJson    = require('./JSON/regularJson'),
    in_nestedJson     = require('./JSON/nestedJson'),
    in_nestedJson2    = require('./JSON/nestedJson2'),
    in_nestedQuotes   = require('./JSON/nestedQuotes'),
    in_noData         = require('./JSON/noData.json'),
    out_regularJson   = '',
    out_nestedJson    = '',
    out_nestedJson2   = '',
    out_nestedQuotes  = '',
    out_noData        = '';

describe('json-2-csv', function() {

  before(function(done) {
    async.parallel([
        function(callback) {
          fs.readFile('test/CSV/regularJson.csv', function(err, data) {
            if (err) callback(err);
            out_regularJson = data.toString();
            callback(null);
          });
        },
        function(callback) {
          fs.readFile('test/CSV/nestedJson.csv', function(err, data) {
            if (err) callback(err);
            out_nestedJson = data.toString();
            callback(null);
          });
        },
        function(callback) {
          fs.readFile('test/CSV/nestedJson2.csv', function(err, data) {
            if (err) callback(err);
            out_nestedJson2 = data.toString();
            callback(null);
          });
        },
        function(callback) {
          fs.readFile('test/CSV/nestedQuotes.csv', function(err, data) {
            if (err) callback(err);
            out_nestedQuotes = data.toString();
            callback(null);
          });
        },
        function(callback) {
          fs.readFile('test/CSV/noData.csv', function (err, data) {
            if (err) callback(err);
            out_noData = data.toString();
            callback(null);
          })
        }
      ],
      function(err, results) {
        if (err) console.log(err);
        done();
      }
    );
  });

  it('should convert plain JSON to CSV', function(done) {
    json2csv.json2csv(in_regularJson, function(err, csv) {
      csv.should.equal(out_regularJson);
      done();
    })
  });

  it('should parse nested JSON to CSV - 1', function(done) {
    json2csv.json2csv(in_nestedJson, function(err, csv) {
      csv.should.equal(out_nestedJson);
      done();
    })
  });

  it('should parse nested JSON to CSV - 2', function(done) {
    json2csv.json2csv(in_nestedJson2, function(err, csv) {
      csv.should.equal(out_nestedJson2);
      done();
    })
  });

  it('should parse nested quotes in JSON to have quotes in CSV', function(done) {
    json2csv.json2csv(in_nestedQuotes, function(err, csv) {
      csv.should.equal(out_nestedQuotes);
      done();
    })
  });

  it('should parse an empty array to an empty CSV', function(done) {
    json2csv.json2csv(in_noData, function(err, csv) {
      csv.should.equal(out_noData);
      done();
    })
  });
});
