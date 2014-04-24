var should = require('should'),
  json2csv = require('.././lib/json-2-csv'),
  fs = require('fs'),
  async = require('async');

var in_regularJson    = require('./JSON/regularJson'),
    in_nestedJson     = require('./JSON/nestedJson'),
    in_nestedQuotes   = require('./JSON/nestedQuotes'),
    out_regularJson   = '',
    out_nestedJson    = '',
    out_nestedQuotes  = '';

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
          fs.readFile('test/CSV/nestedQuotes.csv', function(err, data) {
            if (err) callback(err);
            out_nestedQuotes = data.toString();
            callback(null);
          });
        }
      ],
      function(err, results) {
        if (err) console.log(err);
        done();
      }
    );
  });

  it('should convert JSON to CSV', function(done) {
    json2csv.json2csv(in_regularJson, function(err, csv) {
      csv.should.equal(out_regularJson);
      done();
    })
  });

  it('should parse nested JSON to CSV', function(done) {
    json2csv(in_nestedJson, function(err, csv) {
      csv.should.equal(out_nestedJson);
      done();
    })
  });

  it('should parse data:{} to csv with only column title', function(done) {
    json2csv({
      data: {},
      fields: ['carModel', 'price', 'color']
    }, function(err, csv) {
      csv.should.equal('"carModel","price","color"');
      done();
    })
  });

  it('should parse data:[null] to csv with only column title', function(done) {
    json2csv({
      data: [null],
      fields: ['carModel', 'price', 'color']
    }, function(err, csv) {
      csv.should.equal('"carModel","price","color"');
      done();
    })
  });
  it('should output only selected fields', function(done) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price']
    }, function(err, csv) {
      csv.should.equal(_out_selected);
      done();
    })
  });

  it('should output not exist field with empty value', function(done) {
    json2csv({
      data: _in,
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    }, function(err, csv) {
      csv.should.equal(_out_withNotExistField);
      done();
    })
  });

  it('should output reversed order', function(done) {
    json2csv({
      data: _in,
      fields: ['price', 'carModel']
    }, function(err, csv) {
      csv.should.equal(_out_reversed);
      done();
    })
  });

  it('should output a string', function(done) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color']
    }, function(err, csv) {
      csv.should.be.type('string');
      done();
    })
  });

  it('should escape quotes with double quotes', function(done) {
    json2csv({
      data: _in_quotes,
      fields: ['a string']
    }, function(err, csv) {
      csv.should.equal(_out_quotes);
      done();
    })
  });

  it('should use a custom delimiter when \'del\' property is present', function(done) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color'],
      del: '\t'
    }, function(err, csv) {
      csv.should.equal(_out_tsv);
      done();
    })
  })

  it('should name columns as specified in \'fieldNames\' property', function(done) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price'],
      fieldNames: ['Car Model', 'Price USD']
    }, function(err, csv) {
      csv.should.equal(_out_fieldNames);
      done();
    })
  })

  it('should parse nested properties', function(done) {
    json2csv({
      data: _in_nested,
      fields: ['carModel', 'priceRange.min', 'priceRange.max'],
      fieldNames: ['Car Model', 'Min Price', 'Max Price']
    }, function(err, csv) {
      csv.should.equal(_out_nested);
      done();
    })
  })

});
