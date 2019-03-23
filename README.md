# json-2-csv
**Convert JSON to CSV _or_ CSV to JSON**

[![Dependencies](https://img.shields.io/david/mrodrig/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![Downloads](http://img.shields.io/npm/dm/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![NPM version](https://img.shields.io/npm/v/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![Known Vulnerabilities](https://snyk.io/test/npm/json-2-csv/badge.svg)](https://snyk.io/test/npm/json-2-csv)
[![Package Size](https://img.shields.io/bundlephobia/min/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![Typings](https://shields-staging.herokuapp.com/npm/types/json-2-csv.svg?style=flat)](https://www.npmjs.org/package/json-2-csv)

[![Build Status](https://travis-ci.org/mrodrig/json-2-csv.svg?branch=master)](https://travis-ci.org/mrodrig/json-2-csv)
[![Maintainability](https://api.codeclimate.com/v1/badges/8c0cc3699d054fb77abe/maintainability)](https://codeclimate.com/github/mrodrig/json-2-csv/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8c0cc3699d054fb77abe/test_coverage)](https://codeclimate.com/github/mrodrig/json-2-csv/test_coverage)

This node module will convert an array of JSON documents to a CSV string.
Column headings will be automatically generated based on the keys of the JSON documents. Nested documents will have a '.' appended between the keys.

It is also capable of converting CSV of the same form back into the original array of JSON documents.
The columns headings will be used as the JSON document keys.  All lines must have the same exact number of CSV values.

## Installation

```bash
$ npm install json-2-csv
```

## Upgrading?

Upgrading to v3 from v2? Check out the [upgrade guide](https://github.com/mrodrig/json-2-csv/blob/master/upgrade_guides/UPGRADE_2_to_3.md).

## Usage

```javascript
let converter = require('json-2-csv');
```
Looking for examples? Check out the Wiki: [json-2-csv Wiki](https://github.com/mrodrig/json-2-csv/wiki)

### API

#### `converter.json2csv(array, callback, options)`

* `array` - An array of JSON documents to be converted to CSV.
* `callback` - A function of the form `function (err, csv)`; 
  * This function will receive any errors and/or the string of CSV generated.
* `options` - (Optional) A JSON document specifying any of the following key value pairs:
  * `checkSchemaDifferences` - Boolean - Should all documents have the same schema?
    * Default: `false`
    * Note: An error will be thrown if some documents have differing schemas when this is set to `true`.
  * `delimiter` - Document - Specifies the different types of delimiters
    * `field` - String - Field Delimiter. 
      * Default: `,`
    * `wrap` - String - Wrap values in the delimiter of choice (e.g. wrap values in quotes). 
      * Default: `"`
    * `eol` - String - End of Line Delimiter. 
      * Default: `\n`
  * `emptyFieldValue` - Any - Value that, if specified, will be substituted in for field values that are `undefined`, `null`, or an empty string.
    * Default: none
  * `excelBOM` - Boolean - Should a unicode character be prepended to allow Excel to open a UTF-8 encoded file with non-ASCII characters present.
  * `expandArrayObjects` - Boolean - Should objects in array values be deep-converted to CSV?
  	* Default: `false`
  	* Example:
	```json
	[
		{ 
			"specifications": [
				{ "features": [...] },
				{ "mileage": "5000" }
			]
		}
	]
	```
  	* `true` uses the following keys:
  		* `['specifications.features', 'specifications.mileage']`
  	* `false` uses the following keys:
  		* `['specifications']`
	* Note: This may result in CSV output that does not map back exactly to the original JSON. See #102 for more information.
  * `keys` - Array - Specify the keys (as strings) that should be converted. 
    * Default: `null`
    * If you have a nested object (ie. {info : {name: 'Mike'}}), then set this to ['info.name']
    * If you want all keys to be converted, then specify ```null``` or don't specify the option to utilize the default.
  * `prependHeader` - Boolean - Should the auto-generated header be prepended as the first line in the CSV?
    * Default: `true`
  * `sortHeader` - Boolean - Should the header keys be sorted in alphabetical order? 
    * Default: `false`
  * `trimHeaderFields` - Boolean - Should the header fields be trimmed? 
    * Default: `false`
  * `trimFieldValues` - Boolean - Should the field values be trimmed? (*in development*)
    * Default: `false`


For examples, please refer to the [json2csv API Documentation (Link)](https://github.com/mrodrig/json-2-csv/wiki/json2csv-Documentation)

#### Promisified Version: `converter.json2csvAsync(array, options)`

Available in version `2.2.0`, this functionality makes use of promises from the `bluebird` module.

#### `converter.csv2json(csv, callback, options)`

* `csv` - A string of CSV
* `callback` - A function of the form `function (err, array)`; This function will receive any errors and/or the array of JSON documents generated.
* `options` - (Optional) A JSON document specifying any of the following key value pairs:
  * `delimiter` - Document - Specifies the different types of delimiters
    * `field` - String - Field Delimiter. 
      * Default: `,`
    * `wrap` - String - The character that field values are wrapped in. 
      * Default: `"`
    * `eol` - String - End of Line Delimiter. 
      * Default: `\n`
  * `excelBOM` - Boolean - Does the CSV contain a unicode character prepended in order to allow Excel to open a UTF-8 encoded file with non-ASCII characters present?
    * Default: `false`
  * `keys` - Array - Specify the keys (as strings) that should be converted. 
    * Default: `null`
    * If you have a nested object (ie. `{info : {name: 'Mike'}}`), then set this to `['info.name']`
    * If you want all keys to be converted, then specify `null` or don't specify the option to utilize the default.
  * `trimHeaderFields` - Boolean - Should the header fields be trimmed? 
    * Default: `false`
  * `trimFieldValues` - Boolean - Should the field values be trimmed? 
    * Default: `false`

For examples, please refer to the [csv2json API Documentation (Link)](https://github.com/mrodrig/json-2-csv/wiki/csv2json-Documentation)

#### Promisified Version: `csv2jsonAsync(csv, options)`

Available in version `2.2.0`, this functionality makes use of promises from the `bluebird` module.

### CLI
#### json2csv
```
Usage: json2csv <jsonFile> [options]

Options:
  -V, --version                    output the version number
  -o, --output [output]            Path of output file. If not provided, then stdout will be used
  -f, --field <delimiter>          Optional field delimiter
  -w, --wrap <delimiter>           Optional wrap delimiter
  -e, --eol <delimiter>            Optional end of line delimiter
  -b, --excel-bom                  Excel Byte Order Mark character prepended to CSV
  -W, --without-header             Withhold the prepended header
  -s, --sort-header                Sort the header fields
  -H, --trim-header                Trim header fields
  -F, --trim-fields                Trim field values
  -S, --check-schema               Check for schema differences
  -E, --empty-field-value <value>  Empty field value
  -k, --keys [keys]                Keys of documents to convert to CSV
  -h, --help                       output usage information
```

#### csv2json
```
Usage: csv2json <csvFile> [options]

Options:
  -V, --version            output the version number
  -c, --csv <csv>          Path of json file to be converted
  -o, --output [output]    Path of output file. If not provided, then stdout will be used
  -f, --field <delimiter>  Optional field delimiter
  -w, --wrap <delimiter>   Optional wrap delimiter
  -e, --eol <delimiter>    Optional end of line delimiter
  -b, --excel-bom          Excel Byte Order Mark character prepended to CSV
  -H, --trim-header        Trim header fields
  -F, --trim-fields        Trim field values
  -k, --keys [keys]        Keys of documents to convert to CSV
  -h, --help               output usage information
```

## Tests

```bash
$ npm test
```

To see test coverage, please run:
```bash
$ npm run coverage
```

Current Coverage is:
```
Statements   : 100% ( 275/275 )
Branches     : 100% ( 149/149 )
Functions    : 100% ( 49/49 )
Lines        : 100% ( 269/269 )
```

## Frequently Asked Questions (FAQ)
Please find the updated list (relocated to the Wiki) here: [Frequently Asked Questions (Link)](https://github.com/mrodrig/json-2-csv/wiki/FAQ)

## Features
* Header Generation (per document keys)
* Allows for conversion of specific keys in both json2csv and csv2json via the options.keys parameter (as of 1.1.2)
* Document schema verification functionality (field order is irrelevant) (as of 1.1.0)
* Supports sub-documents natively
* Supports arrays as document values for both json2csv and csv2json
* Custom ordering of columns (see F.A.Q. for more information)
* Ability to re-generate the JSON documents that were used to generate the CSV (including nested documents)
* Allows for custom field delimiters, end of line delimiters, etc.
* Wrapped value support for json2csv and csv2json (as of 1.3.0)
* Support for multiple different schemas (as of 1.4.0)
* Promisified versions of the functions are now available by default: json2csvAsync, csv2jsonAsync (as of 2.2.0)
* RFC 4180 Compliance (as of 3.0.0)
* CLI functionality (as of 3.0.0)
	* `csv2json test.csv -o output.json`
	* *and*
	* `json2csv test.json -o output.csv -W -k arrayOfStrings -o output.csv`
* Empty field value option (as of 3.1.0)
* TypeScript typings included (as of 3.4.0) - thanks to [@GabrielCastro](https://github.com/GabrielCastro)!
