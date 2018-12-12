# json-2-csv
**Convert JSON to CSV _or_ CSV to JSON**

[![Dependencies](https://img.shields.io/david/mrodrig/json-2-csv.svg?style=flat-square)](https://www.npmjs.org/package/json-2-csv)
[![Build Status](https://travis-ci.org/mrodrig/json-2-csv.svg?branch=master)](https://travis-ci.org/mrodrig/json-2-csv)
[![Downloads](http://img.shields.io/npm/dm/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![NPM version](https://img.shields.io/npm/v/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![Known Vulnerabilities](https://snyk.io/test/npm/json-2-csv/badge.svg)](https://snyk.io/test/npm/json-2-csv)

This node module will convert an array of JSON documents to a CSV string.
Column headings will be automatically generated based on the keys of the JSON documents. Nested documents will have a '.' appended between the keys.

It is also capable of converting CSV of the same form back into the original array of JSON documents.
The columns headings will be used as the JSON document keys.  All lines must have the same exact number of CSV values.

## Installation

```bash
$ npm install json-2-csv
```

## Usage

```javascript
let converter = require('json-2-csv');
```

### API

#### `converter.json2csv(array, callback, options)`

* `array` - An array of JSON documents to be converted to CSV.
* `callback` - A function of the form `function (err, csv)`; 
  * This function will receive any errors and/or the string of CSV generated.
* `options` - (Optional) A JSON document specifying any of the following key value pairs:
  * `delimiter` - Document - Specifies the different types of delimiters
    * `field` - String - Field Delimiter. 
      * Default: `','`
    * `array` - String - Array Value Delimiter. 
      * Default: `';'`
    * `wrap` - String - Wrap values in the delimiter of choice (e.g. wrap values in quotes). 
      * Default: `''`
    * `eol` - String - End of Line Delimiter. 
      * Default: `'\n'`
  * `excelBOM` - Boolean - Should a unicode character be prepended to allow Excel to open a UTF-8 encoded file with non-ASCII characters present.
  * `prependHeader` - Boolean - Should the auto-generated header be prepended as the first line in the CSV?
    * Default: `true`
  * `sortHeader` - Boolean - Should the header keys be sorted in alphabetical order? 
    * Default: `false`
  * `emptyFieldValue` - String - Value for fields without data _when not checking schemas_.
    * Default: `'null'`
  * `trimHeaderFields` - Boolean - Should the header fields be trimmed? 
    * Default: `false`
  * `trimFieldValues` - Boolean - Should the field values be trimmed? (*in development*)
    * Default: `false`
  * `checkSchemaDifferences` - Boolean - Should all documents have the same schema?
    * Default: `true`
    * Note: Change this to `false` if some documents are missing certain fields and you still want to convert the data.
  * `keys` - Array - Specify the keys (as strings) that should be converted. 
    * Default: `null`
    * If you have a nested object (ie. {info : {name: 'Mike'}}), then set this to ['info.name']
    * If you want all keys to be converted, then specify ```null``` or don't specify the option to utilize the default.
    


For examples, please refer to the [json2csv API Documentation (Link)](https://github.com/mrodrig/json-2-csv/wiki/json2csv-Documentation)

#### Promisified Version: `converter.json2csvPromisified(array, options)`

Available in version `2.2.0`, this functionality makes use of promises from the `bluebird` module.

#### `converter.csv2json(csv, callback, options)`

* `csv` - A string of CSV
* `callback` - A function of the form `function (err, array)`; This function will receive any errors and/or the array of JSON documents generated.
* `options` - (Optional) A JSON document specifying any of the following key value pairs:
  * `delimiter` - Document - Specifies the different types of delimiters
    * `field` - String - Field Delimiter. 
      * Default: `','`
    * `array` - String - Array Value Delimiter. 
      * Default: `';'`
    * `wrap` - String - The character that field values are wrapped in. 
      * Default: `''`
    * `eol` - String - End of Line Delimiter. 
      * Default: `'\n'`
  * `trimHeaderFields` - Boolean - Should the header fields be trimmed? 
    * Default: `false`
  * `trimFieldValues` - Boolean - Should the field values be trimmed? 
    * Default: `false`
  * `keys` - Array - Specify the keys (as strings) that should be converted. 
    * Default: `null`
    * If you have a nested object (ie. `{info : {name: 'Mike'}}`), then set this to `['info.name']`
    * If you want all keys to be converted, then specify `null` or don't specify the option to utilize the default.

For examples, please refer to the [csv2json API Documentation (Link)](https://github.com/mrodrig/json-2-csv/wiki/csv2json-Documentation)

#### Promisified Version: `csv2jsonPromisified(csv, options)`

Available in version `2.2.0`, this functionality makes use of promises from the `bluebird` module.

## Tests

```bash
$ npm test
```

_Note_: This requires `mocha`, `should`, `async`, and `underscore`.

To see test coverage, please run:
```bash
$ npm run coverage
```

Current Coverage is:
```
Statements   : 97.3% ( 180/185 )
Branches     : 95.28% ( 121/127 )
Functions    : 100% ( 36/36 )
Lines        : 97.21% ( 174/179 )
```

## Frequently Asked Questions (FAQ)
Please find the updated list (relocated to the Wiki) here: [Frequently Asked Questions (Link)](https://github.com/mrodrig/json-2-csv/wiki/FAQ)

## Features
* Header Generation (per document keys)
* Allows for conversion of specific keys in both json2csv and csv2json via the options.KEYS parameter (as of 1.1.2)
* Verifies all documents have same schema (schema field order does not matter as of 1.1.0)
* Supports sub-documents natively
* Supports arrays as document values for both json2csv and csv2json
* Custom ordering of columns (see F.A.Q. for more information)
* Ability to re-generate the JSON documents that were used to generate the CSV (including nested documents)
* Allows for custom field delimiters, end of line delimiters, etc.
* Promisifiable via bluebird's .promisify(<function>) and .promisifyAll(<object>) (as of 1.1.1)
* Wrapped value support for json2csv and csv2json (as of 1.3.0)
* Support for multiple different schemas (as of 1.4.0)
* Promisified versions of the functions are now available by default: json2csvPromisified, csv2jsonPromisified (as of 2.2.0)
* Nested quotes are escaped with an additional quote (per [RFC 4180](https://tools.ietf.org/html/rfc4180)) thanks to @eric-thelin (as of 2.3.0)
