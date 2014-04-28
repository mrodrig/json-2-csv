'use strict';

var _ = require('underscore'),
    async = require('async');

var options = {};

// Takes the parent heading and this doc's data and creates the subdocument headings (string)
var retrieveSubHeading = function (heading, data) {
    var subKeys = _.keys(data),
        newKey;
    _.each(subKeys, function (subKey, indx) {
        newKey = heading === '' ? subKey : heading + '.' + subKey;
        if (typeof data[subKey] === 'object' && data[subKey] !== null) { // Another nested document
            subKeys[indx] = retrieveSubHeading(newKey, data[subKey]);
        } else {
            subKeys[indx] = newKey;
        }
    });
    return subKeys.join(options.DELIMITER);
};

var retrieveHeading = function (data) {
    return function (cb) {
        var keys = _.keys(data);
        _.each(keys, function (key, indx) {
            if (typeof data[key] === 'object') {
                keys[indx] = retrieveSubHeading('', data[key]);
            }
        });
        keys = _.uniq(keys);
        if (keys.length > 1) { throw new Error('Not all documents have the same schema.', keys); }
        cb(null, _.flatten(keys).join(options.DELIMITER));
    };
};

var convertData = function (data, keys) {
    var output = [];
    _.each(keys, function (key, indx) {
        var value = data[key];
        if (keys.indexOf(key) > -1) {
            if (typeof value === 'object') {
                output.push(convertData(value, _.keys(value)));
            } else {
                output.push(value);
            }
        }
    });
    return output.join(options.DELIMITER);
};

var generateCsv = function (data) {
    return function (cb) {
        return cb(null, _.reduce(data, function (csv, doc) { return csv += convertData(doc, _.keys(doc)) + options.EOL; }, ''));
    };
};

module.exports = {

    json2csv: function (opts, data, callback) {
        if (!callback) { throw new Error('A callback is required!'); }
        if (!opts) { callback(new Error('Options were not passed and are required.')); return null; } // Shouldn't happen, but just in case
        else { options = opts; }
        if (!data) { callback(new Error('Cannot call json2csv on ' + data)); return null; }
        if (typeof data === 'object' && !data.length) { // Single document, not an array
            data = [data]; // Convert to an array of the given document
        }
        async.parallel([retrieveHeading(data), generateCsv(data)], function (err, res) {
            if (!err) {
                callback(null, res.join(options.EOL));
            } else {
                callback(err, null);
            }
        });
    }

};
