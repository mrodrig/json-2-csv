'use strict';

const nested = [],
    expected = [];

for (let a = 0; a < 234567; a++) {
    nested.push([a]);
    expected.push(a);
}

module.exports = {
    nested,
    expected
};
