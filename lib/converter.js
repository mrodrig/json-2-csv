'use strict';

var json2Csv = require('./json-2-csv'),
    csv2Json = require('./csv-2-json');

module.exports = {

    json2csv: function (data, callback) {
        json2Csv.json2csv(data, callback);
    },

    csv2json: function (data, callback) {
        csv2Json.csv2json(data, callback);
    }

};
