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
 * @param array Object[] data to be converted
 * @param cb Function callback
 * @param opts Object options object
 */
function json2csv(array, cb, opts) {
    let {options, callback} = utilities.parseArguments(cb, opts);

    utilities.buildOptions(options,
        (error, options) => {
            if (error) {
                return callback(error);
            }
            let converter = new Json2Csv(options);
            converter.convert(array, callback); // Call our internal json2csv function
        });
}


/**
 * Client accessible csv2json function
 * Takes a string of CSV to be converted to a JSON document array, a callback that will be called
 * with (err, json) after processing is complete, and optional options
 * @param csv String csv data to be converted
 * @param cb Function callback
 * @param opts Object options object
 */
function csv2json(csv, cb, opts) {
    let {options, callback} = utilities.parseArguments(cb, opts);

    utilities.buildOptions(options,
        (error, options) => {
            if (error) {
                return callback(error);
            }
            let converter = new Csv2Json(options);
            converter.convert(csv, callback); // Call our internal csv2json function
        });
}
