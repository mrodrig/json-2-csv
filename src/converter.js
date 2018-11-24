'use strict';

let {Json2Csv} = require('./json-2-csv'), // Require our json-2-csv code
    {Csv2Json} = require('./csv-2-json'), // Require our csv-2-json code
    utilities = require('./utils'),
    Promise = require('bluebird');

module.exports = {
    json2csv : json2csv,
    csv2json : csv2json,
    json2csvPromisified :  Promise.promisify(json2csv),
    csv2jsonPromisified : Promise.promisify(csv2json)
};

/**
 * Client accessible json2csv function
 * Takes an array of JSON documents to be converted, a callback that will be called with (err, csv)
 * after processing is complete, and optional options
 * @param documents {Array<Object>} data to be converted
 * @param callback {Function} callback function
 * @param options {Object} options object
 */
function json2csv(documents, callback, options) {
    return utilities.convert({
        data: documents,
        callback,
        options,
        converter: Json2Csv
    });
}


/**
 * Client accessible csv2json function
 * Takes a string of CSV to be converted to a JSON document array, a callback that will be called
 * with (err, json) after processing is complete, and optional options
 * @param csv String csv data to be converted
 * @param callback Function callback
 * @param options Object options object
 */
function csv2json(csv, callback, options) {
    return utilities.convert({
        data: csv,
        callback,
        options,
        converter: Csv2Json
    });
}
