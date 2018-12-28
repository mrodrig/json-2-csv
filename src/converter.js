'use strict';

let {Json2Csv} = require('./json2csv'), // Require our json-2-csv code
    {Csv2Json} = require('./csv2json'), // Require our csv-2-json code
    utils = require('./utils');

module.exports = {
    json2csv: (data, callback, options) => convert(Json2Csv, data, callback, options),
    csv2json: (data, callback, options) => convert(Csv2Json, data, callback, options),
    json2csvAsync: (json, options) => convertAsync(Json2Csv, json, options),
    csv2jsonAsync: (csv, options) => convertAsync(Csv2Json, csv, options),

    /**
     * @deprecated Since v3.0.0
     */
    json2csvPromisified: (json, options) => deprecatedAsync(Json2Csv, 'json2csvPromisified()', 'json2csvAsync()', json, options),

    /**
     * @deprecated Since v3.0.0
     */
    csv2jsonPromisified: (csv, options) => deprecatedAsync(Csv2Json, 'csv2jsonPromisified()', 'csv2jsonAsync()', csv, options)
};

/**
 * Abstracted converter function for json2csv and csv2json functionality
 * Takes in the converter to be used (either Json2Csv or Csv2Json)
 * @param converter
 * @param data
 * @param callback
 * @param options
 */
function convert(converter, data, callback, options) {
    return utils.convert({
        data: data,
        callback,
        options,
        converter: converter
    });
}

/**
 * Simple way to promisify a callback version of json2csv or csv2json
 * @param converter
 * @param data
 * @param options
 * @returns {Promise<any>}
 */
function convertAsync(converter, data, options) {
    return new Promise((resolve, reject) => convert(converter, data, (err, data) => {
        if (err) {
            return reject(err);
        }
        return resolve(data);
    }, options));
}

/**
 * Simple way to provide a deprecation warning for previous promisified versions
 * of module functionality.
 * @param converter
 * @param deprecatedName
 * @param replacementName
 * @param data
 * @param options
 * @returns {Promise<any>}
 */
function deprecatedAsync(converter, deprecatedName, replacementName, data, options) {
    console.warn('WARNING: ' + deprecatedName + ' is deprecated and will be removed soon. Please use ' + replacementName + ' instead.');
    return convertAsync(converter, data, options);
}
