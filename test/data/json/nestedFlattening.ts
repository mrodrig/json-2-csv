'use strict';

export const nested: number[][] = [],
    expected: number[] = [];

for (let a = 0; a < 234567; a++) {
    nested.push([a]);
    expected.push(a);
}
