'use strict';

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

let should = require('should'),
    nestedFlatteningTestData = require('./data/json/nestedFlattening'),
    utils = require('../lib/utils');

function runTests() {
    describe('utils', () => {
        describe('flatten()', () => {
            it('should flatten a nested array', (done) => {
                const nested = [[1], [2], [3], [4], [5]],
                    expected = [1, 2, 3, 4, 5],
                    result = utils.flatten(nested);

                result.should.deepEqual(expected);
                done();
            });

            it('should handle extremely large arrays', (done) => {
                const result = utils.flatten(nestedFlatteningTestData.nested);
                result.should.deepEqual(nestedFlatteningTestData.expected);
                done();
            });
        });
    });
}

module.exports = { runTests };
