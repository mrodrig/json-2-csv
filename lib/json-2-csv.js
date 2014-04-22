'use strict';

var _ = require('underscore'),
    async = require('async');

var DELIMITER = ',',
    EOL = '\n';

// Takes the parent heading and this doc's data and creates the subdocument headings (string)
var retrieveSubHeading = function (heading, data) {
    var subKeys = _.keys(data),
        newKey;
    _.each(subKeys, function (subKey, indx) {
        newKey = heading === '' ? subKey : heading + '.' + subKey;
        if (typeof data[subKey] === 'object') { // Another nested document
            subKeys[indx] = retrieveSubHeading(newKey, data[subKey]);
        } else {
            subKeys[indx] = newKey;
        }
    });
    return subKeys.join(DELIMITER);
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
        cb(null, _.flatten(keys).join(DELIMITER));
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
    return output.join(DELIMITER);
};

var generateCsv = function (data) {
    return function (cb) {
        return cb(null, _.reduce(data, function (csv, doc) { return csv += convertData(doc, _.keys(doc)) + EOL; }, ''));
    };
};

module.exports = {

    json2csv: function (data, callback) {
        if (!callback) { throw new Error('A callback is required!'); }
        if (!data) { throw new Error('Cannot call json2csv on ' + data); }
        async.parallel([retrieveHeading(data), generateCsv(data)], function (err, res) {
            if (!err) {
                callback(null, res.join(EOL));
            } else {
                callback(err, null);
            }
        });
    }

};
