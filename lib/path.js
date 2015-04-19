var _ = require('underscore');

var controller = {};

controller.evaluatePath = function (document, keyPath) {
    if (!document) { return null; }
    var indexOfDot = _.indexOf(keyPath, '.');

    // If there is a '.' in the keyPath, recur on the subdoc and ...
    if (indexOfDot >= 0) {
        var currentKey = keyPath.slice(0, indexOfDot),
            remainingKeyPath = keyPath.slice(indexOfDot + 1);

        return controller.evaluatePath(document[currentKey], remainingKeyPath);
    }

    return document[keyPath];
};

controller.setPath = function (document, keyPath, value) {
    if (!document) { throw new Error('error occurred while setting'); }

    var indexOfDot = _.indexOf(keyPath, '.');

    // If there is a '.' in the keyPath, recur on the subdoc and ...
    if (indexOfDot >= 0) {
        var currentKey = keyPath.slice(0, indexOfDot),
            remainingKeyPath = keyPath.slice(indexOfDot + 1);

        if (!document[currentKey]) { document[currentKey] = {}; }
        controller.setPath(document[currentKey], remainingKeyPath, value);
    } else {
        document[keyPath] = value;
    }

    return document;
};

module.exports = controller;