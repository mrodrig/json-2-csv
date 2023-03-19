'use strict';
import assert from 'assert';
import { flatten } from '../src/utils';
import * as nestedFlatteningTestData from './data/json/nestedFlattening';

export function runTests() {
    describe('utils', () => {
        describe('flatten()', () => {
            it('should flatten a nested array', (done) => {
                const nested = [[1], [2], [3], [4], [5]],
                    expected = [1, 2, 3, 4, 5],
                    result = flatten(nested);

                assert.deepEqual(result, expected);
                done();
            });

            it('should handle extremely large arrays', (done) => {
                const result = flatten(nestedFlatteningTestData.nested);
                assert.deepEqual(result, nestedFlatteningTestData.expected);
                done();
            });
        });
    });
}
