'use strict';

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

let should = require('should'),
    utils = require('../src/utils');

function runTests() {
    describe('utils', () => {
        describe('flatten()', () => {
            it('should flatten a nested array', (done) => {
                const nested = [[1], [2], [3], [4], [5]],
                    expected = [1, 2, 3, 4, 5],
                    result = utils.flatten(nested);

                result.should.deepEqual(expected);
                done()
            });

            it('should handle extremely large arrays', (done) => {
                const nested = [],
                    expected = [];
                for (let a = 0; a < 234567; a++) {
                    nested.push([a]);
                    expected.push(a);
                }

                const result = utils.flatten(nested);
                result.should.deepEqual(expected);
                done();
            });
        });
    });
}

module.exports = { runTests };
