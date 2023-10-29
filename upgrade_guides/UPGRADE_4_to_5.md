# Upgrade Guide - v4 to v5

## Breaking Changes

* Asynchronous methods are now synchronous

Thanks to [@Nokel81](https://github.com/Nokel81) for the pull request to convert the module to convert the asynchronous internal flow to be entirely synchronous. This helps enable certain use cases where a conversion is needed in a synchronous manner, or where asynchronous code might not be feasible. While these changes shift the module towards a more synchronous focused use case, it's still entirely possible to perform JSON to CSV or CSV to JSON conversions for an asynchronous use case too.

```javascript
const converter = require('json-2-csv');

// Synchronous:

const csv = converter.json2csv([ { level: 'info', message: 'Our first test' }]);
console.log('First output is', csv);

// Asynchronous:

async function runConversion() {
    return converter.json2csv([ { level: 'info', message: 'Another test...' }]);
}

async function runAsync() {
    const csv = await runConversion();
    console.log('Second output is', csv);
}

runAsync();
console.log('This can run before the second output appears...');
```

Example output:

```
First output is level,message
info,Our first test
This can run before the second output appears...
Second output is level,message
info,Another test...
```