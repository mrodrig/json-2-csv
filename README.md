# json-2-csv
**Convert JSON to CSV _or_ CSV to JSON**

[![NPM version](https://img.shields.io/npm/v/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![Typings](https://img.shields.io/npm/types/json-2-csv)](https://www.npmjs.org/package/json-2-csv)
[![Downloads](https://img.shields.io/npm/dm/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![Minzipped Size](https://img.shields.io/bundlephobia/minzip/json-2-csv)](https://bundlephobia.com/result?p=json-2-csv)

[![Build Status](https://img.shields.io/github/actions/workflow/status/mrodrig/json-2-csv/automated-tests-workflow.yml)](https://github.com/mrodrig/json-2-csv/actions/workflows/automated-tests-workflow.yml)
[![Coverage Status](https://coveralls.io/repos/github/mrodrig/json-2-csv/badge.svg?branch=main)](https://coveralls.io/github/mrodrig/json-2-csv?branch=main)
[![Maintainability](https://api.codeclimate.com/v1/badges/8c0cc3699d054fb77abe/maintainability)](https://codeclimate.com/github/mrodrig/json-2-csv/maintainability)

This node module will convert an array of JSON documents to a CSV string.
Column headings will be automatically generated based on the keys of the JSON documents. Nested documents will have a '.' appended between the keys.

It is also capable of converting CSV of the same form back into the original array of JSON documents.
The columns headings will be used as the JSON document keys.  All lines must have the same exact number of CSV values.

## Installation

```bash
$ npm install json-2-csv
```

CLI:
```bash
$ npm install @mrodrig/json-2-csv-cli
```

## Upgrading?

Upgrading to v5 from v4? Check out the [upgrade guide](https://github.com/mrodrig/json-2-csv/blob/master/upgrade_guides/UPGRADE_4_to_5.md).

## Usage

```javascript
let converter = require('json-2-csv');
const csv = await converter.json2csv(data, options);
```
or
```javascript
import { json2csv } from 'json-2-csv';
```

### API

#### `json2csv(array, options)` => `string`

Returns the CSV `string` or rejects with an `Error` if there was an issue.

* `array` - An array of JSON documents to be converted to CSV.
* `options` - (Optional) A JSON document specifying any of the following key value pairs:
  * `arrayIndexesAsKeys` - Boolean - Should array indexes be included in the generated keys?
    * Default: `false`
    * Note: This provides a more accurate representation of the JSON in the returned CSV, but may be less human readable. See [#207](https://github.com/mrodrig/json-2-csv/issues/207) for more details.
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
  * `escapeHeaderNestedDots` - Boolean - Should nested dots in header keys be escaped?
    * Default: `true`
    * Example:
    ```json
    [
      {
        "a.a": "1"
      }
    ]
    ```
      * `true` will generate the following CSV:
      ```csv
      a\.a
      1
      ```
      * `false` will generate the following CSV:
      ```csv
      a.a
      1
      ```
    * Note: This may result in CSV output that does not map back exactly to the original JSON.
  * `excelBOM` - Boolean - Should a unicode character be prepended to allow Excel to open a UTF-8 encoded file with non-ASCII characters present.
  * `excludeKeys` - Array - Specify the `string` keys or `RegExp` patterns that should be excluded from the output. Provided `string` keys will also be used as a RegExp to help exclude keys under a specified prefix, such as all keys of Objects in an Array when `expandArrayObjects` is `true` (e.g., providing `'baz'` will exclude `'baz.a'` too).
    * Default: `[]`
    * Note: When used with `unwindArrays`, arrays present at excluded key paths will not be unwound.
  * `expandNestedObjects` - Boolean - Should nested objects be deep-converted to CSV?
  	* Default: `true`
  	* Example:
	```json
	[
		{
      "make": "Nissan",
      "model": "Murano",
      "year": 2013,
      "specifications": {
        "mileage": 7106,
        "trim": "S AWD"
      }
    }
	]
	```
  	* `true` uses the following keys:
  		* `['make', 'model', 'year', 'specifications.mileage', 'specifications.trim']`
  	* `false` uses the following keys:
  		* `['make', 'model', 'year', 'specifications']`
    * Note: This may result in CSV output that does not map back exactly to the original JSON.
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
  * `fieldTitleMap` - Object - Specify field titles that should be renamed.
    * Default: `{}`
    * Example: `{ "key1": "Key 1", "key2": "Key 2"}`
  * `keys` - Array - Specify the keys that should be converted.
    * Default: These will be auto-detected from your data by default.
    * Keys can either be specified as a String representing the key path that should be converted, or as an Object of the following format:
    ```javascript
    {
      "field": "string", // required
      "title": "string", // optional
      "wildcardMatch": false, // optional - default: false
    }
    ```
      * When specifying keys as an Object, the `field` property specifies the key path, while `title` specifies a more human readable field heading. Additionally, the `wildcardMatch` option allows you to optionally specify that all auto-detected fields with the specified field prefix should be included in the CSV. The list specified can contain a combination of Objects and Strings.
      * Examples:
        * `[ 'key1', 'key2', ... ]`
        * `[ 'key1', { field: 'key2', wildcardMatch: true }]`
        * `[ { field: 'key1', title: 'Key 1' }, { field: 'key2' }, 'key3', ... ]`
    * Key Paths - If you are converting a nested object (ie. {info : {name: 'Mike'}}), then set this to ['info.name']
  * `parseValue` - Function - Specify how values should be converted into CSV format. This function is provided a single field value at a time and must return a `String`. The built-in parsing method is provided as the second argument for cases where default parsing is preferred.
    * Default: A built-in method is used to parse out a variety of different value types to well-known formats.
    * Note: Using this option may override other options, including `useDateIso8601Format` and `useLocaleFormat`.
  * `prependHeader` - Boolean - Should the auto-generated header be prepended as the first line in the CSV?
    * Default: `true`
  * `sortHeader` - Boolean or Function - Should the header keys be sorted in alphabetical order? or pass a function to use a custom sorting function
    * Default: `false`
  * `trimFieldValues` - Boolean - Should the field values be trimmed?
    * Default: `false`
  * `trimHeaderFields` - Boolean - Should the header fields be trimmed? 
    * Default: `false`
  * `unwindArrays` - Boolean - Should array values be "unwound" such that there is one line per value in the array?
      * Default: `false`
      * Example:
      ```json
      [
          {
              "_id": {"$oid": "5cf7ca3616c91100018844af"},
              "data": {"category": "Computers", "options": [{"name": "MacBook Pro 15"}, {"name": "MacBook Air 13"}]}
          },
          {
              "_id": {"$oid": "5cf7ca3616c91100018844bf"},
              "data": {"category": "Cars", "options": [{"name": "Supercharger"}, {"name": "Turbocharger"}]}
          }
      ]
      ```
      * `true` will unwind the JSON to four objects, and therefore four lines of CSV values:
      ```csv
      _id.$oid,data.category,data.options.name
      5cf7ca3616c91100018844af,Computers,MacBook Pro 15
      5cf7ca3616c91100018844af,Computers,MacBook Air 13
      5cf7ca3616c91100018844bf,Cars,Supercharger
      5cf7ca3616c91100018844bf,Cars,Turbocharger
      ```
      * `false` will leave the values unwound and will convert the array as-is (when this option is used without expandArrayObjects):
      ```csv
      _id.$oid,data.category,data.options
      5cf7ca3616c91100018844af,Computers,"[{""name"":""MacBook Pro 15""},{""name"":""MacBook Air 13""}]"
      5cf7ca3616c91100018844bf,Cars,"[{""name"":""Supercharger""},{""name"":""Turbocharger""}]"
      ```
  	* Note: This may result in CSV output that does not map back exactly to the original JSON.
  * `useDateIso8601Format` - Boolean - Should date values be converted to an ISO8601 date string?
    * Default: `false`
    * Note: If selected, values will be converted using `toISOString()` rather than `toString()` or `toLocaleString()` depending on the other options provided.
  * `useLocaleFormat` - Boolean - Should values be converted to a locale specific string?
    * Default: `false`
    * Note: If selected, values will be converted using `toLocaleString()` rather than `toString()`
  * `wrapBooleans` - Boolean - Should boolean values be wrapped in wrap delimiters to prevent Excel from converting them to Excel's TRUE/FALSE Boolean values.
    * Default: `false`
  * `preventCsvInjection` - Boolean - Should CSV injection be prevented by left trimming these characters: Equals (=), Plus (+), Minus (-), At (@), Tab (0x09), Carriage return (0x0D).
    * Default: `false`


#### `csv2json(csv, options)` => object[]

Returns the JSON object array (`object[]`) or rejects with an `Error` if there was an issue.

* `csv` - A string of CSV
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
  * `headerFields` - Array - Specify the field names (as strings) in place of a header line in the CSV itself.
    * Default: Parses the header fields directly from the CSV string
    * If you want to generate a nested object (ie. `{info : {name: 'Mike'}}`), then use `.` characters in the string to denote a nested field, like ['info.name']
    * If your CSV has a header line included, then don't specify the option to utilize the default values that will be parsed from the CSV.
  * `keys` - Array - Specify the keys (as strings) that should be converted. 
    * Default: `null`
    * If you have a nested object (ie. `{info : {name: 'Mike'}}`), then set this to `['info.name']`
    * If you want all keys to be converted, then specify `null` or don't specify the option to utilize the default.
  * `parseValue` - Function - Specify how `String` representations of field values should be parsed when converting back to JSON. This function is provided a single `String` and can return any value.
    * Default: `JSON.parse` - An attempt is made to convert the String back to its original value using `JSON.parse`.
  * `trimHeaderFields` - Boolean - Should the header fields be trimmed? 
    * Default: `false`
  * `trimFieldValues` - Boolean - Should the field values be trimmed? 
    * Default: `false`

### CLI
Note: As of `3.5.8`, the command line interface functionality has been pulled out to a separate package. Please be sure to
install the `@mrodrig/json-2-csv-cli` NPM package if you wish to use the CLI functionality shown below:

```bash
$ npm install @mrodrig/json-2-csv-cli
``` 

#### json2csv
```
Usage: json2csv <jsonFile> [options]

Arguments:
  jsonFile                         JSON file to convert

Options:
  -V, --version                    output the version number
  -o, --output [output]            Path of output file. If not provided, then stdout will be used
  -a, --array-indexes-as-keys      Includes array indexes in the generated keys
  -S, --check-schema               Check for schema differences
  -f, --field <delimiter>          Field delimiter
  -w, --wrap <delimiter>           Wrap delimiter
  -e, --eol <delimiter>            End of Line delimiter
  -E, --empty-field-value <value>  Empty field value
  -n, --expand-nested-objects      Expand nested objects to be deep converted to CSV
  -k, --keys [keys]                Keys of documents to convert to CSV
  -d, --escape-header-nested-dots  Escape header nested dots
  -b, --excel-bom                  Excel Byte Order Mark character prepended to CSV
  -x, --exclude-keys [keys]        Comma separated list of keys to exclude
  -A, --expand-array-objects       Expand array objects
  -W, --without-header             Withhold the prepended header
  -p, --prevent-csv-injection      Prevent CSV Injection
  -s, --sort-header                Sort the header fields
  -F, --trim-fields                Trim field values
  -H, --trim-header                Trim header fields
  -U, --unwind-arrays              Unwind array values to their own CSV line
  -I, --iso-date-format            Use ISO 8601 date format
  -L, --locale-format              Use locale format for values
  -B, --wrap-booleans              Wrap booleans
  -h, --help                       display help for command
```

#### csv2json
```
Usage: csv2json <csvFile> [options]

Arguments:
  csvFile                      CSV file to convert

Options:
  -V, --version                output the version number
  -o, --output [output]        Path of output file. If not provided, then stdout will be used
  -f, --field <delimiter>      Field delimiter
  -w, --wrap <delimiter>       Wrap delimiter
  -e, --eol <delimiter>        End of Line delimiter
  -b, --excel-bom              Excel Byte Order Mark character prepended to CSV
  -p, --prevent-csv-injection  Prevent CSV Injection
  -F, --trim-fields            Trim field values
  -H, --trim-header            Trim header fields
  -h, --header-fields          Specify the fields names in place a header line in the CSV itself
  -k, --keys [keys]            Keys of documents to convert to CSV
  --help                       display help for command
```

## Tests

```bash
$ npm test
```

To see test coverage, please run:
```bash
$ npm run coverage
```

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
* RFC 4180 Compliance (as of 3.0.0)
* CLI functionality (as of 3.0.0)
	* `csv2json test.csv -o output.json`
	* *and*
	* `json2csv test.json -o output.csv -W -k arrayOfStrings -o output.csv`
* Empty field value option (as of 3.1.0)
* TypeScript typings included (as of 3.4.0) - thanks to [@GabrielCastro](https://github.com/GabrielCastro)!
* Synchronous use case support (as of 5.0.0) - thanks to [@Nokel81](https://github.com/Nokel81)