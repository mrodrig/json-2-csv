# Convert JSON to CSV or CSV to JSON

[![Build Status](https://travis-ci.org/mrodrig/json-2-csv.svg?branch=master)](https://travis-ci.org/mrodrig/json-2-csv)
![David - Dependency Checker Icon](https://david-dm.org/mrodrig/json-2-csv.png "json-2-csv Dependency Status")
[![NPM version](http://img.shields.io/npm/dm/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)
[![NPM version](https://img.shields.io/npm/v/json-2-csv.svg)](https://www.npmjs.org/package/json-2-csv)

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
var converter = require('json-2-csv');
```

### API

#### json2csv(array, callback, options)

* `array` - An array of JSON documents to be converted to CSV.
* `callback` - A function of the form `function (err, csv)`; This function will receive any errors and/or the string of CSV generated.
* `options` - (Optional) A JSON document specifying any of {`DELIMITER`, `EOL`, `PARSE_CSV_NUMBERS`}
  * `DELIMITER` - Document - Specifies the different types of delimiters
    * `FIELD` - String - Field Delimiter. Default: `','`
    * `ARRAY` - String - Array Value Delimiter. Default: `';'`
    * `WRAP` - String - Wrap values in the delimiter of choice (e.g. wrap values in quotes). Default: `null`
  * `EOL` - String - End of Line Delimiter. Default: `'\n'`
  * `PARSE_CSV_NUMBERS` - Boolean - Should numbers that are found in the CSV be converted to numbers? Default: `false`

##### json2csv Example:

```javascript

var converter = require('json-2-csv');

var documents = [
    {
        Make: 'Nissan',
        Model: 'Murano',
        Year: '2013',
        Specifications: {
            Mileage: '7106',
            Trim: 'S AWD'
        }
    },
    {
        Make: 'BMW',
        Model: 'X5',
        Year: '2014',
        Specifications: {
            Mileage: '3287',
            Trim: 'M'
        }
    }
];

var json2csvCallback = function (err, csv) {
    if (err) throw err;
    console.log(csv);
};

converter.json2csv(documents, json2csvCallback);

```

The above code prints out:

```csv
Make,Model,Year,Specifications.Mileage,Specifications.Trim
Nissan,Murano,2013,7106,S AWD
BMW,X5,2014,3287,M
```

#### csv2json(csv, callback, options)

* `csv` - A string of CSV
* `callback` - A function of the form `function (err, array)`; This function will receive any errors and/or the array of JSON documents generated.
* `options` - (Optional) A JSON document specifying any of {`DELIMITER`, `EOL`, `PARSE_CSV_NUMBERS`}
  * `DELIMITER` - Document - Specifies the different types of delimiters
    * `FIELD` - String - Field Delimiter. Default: `','`
    * `ARRAY` - String - Array Value Delimiter. Default: `';'`
  * `EOL` - String - End of Line Delimiter. Default: `'\n'`
  * `PARSE_CSV_NUMBERS` - Boolean - Should numbers that are found in the CSV be converted to numbers? Default: `false`

##### csv2json Example:

```javascript
var converter = require('json-2-csv');

var csv = "Make,Model,Year,Specifications.Mileage,Specifications.Trim\n" +
          "Nissan,Murano,2013,7106,S AWD\n" +
          "BMW,X5,2014,3287,M\n";

var csv2jsonCallback = function (err, json) {
    if (err) throw err;
    console.log(typeof json);
    console.log(json.length);
    console.log(json);
}

converter.csv2json(csv, csv2jsonCallback);
```

The above code prints out:

```text
object
2
[ { Make: 'Nissan',
    Model: 'Murano',
    Year: '2013',
    Specifications: { Mileage: '7106', Trim: 'S AWD' } },
  { Make: 'BMW',
    Model: 'X5',
    Year: '2014',
    Specifications: { Mileage: '3287', Trim: 'M' } } ]
```

## Tests

```bash
$ npm test
```

_Note_: This requires `mocha`, `should`, `async`, and `underscore`.

## Features

- Header Generation (per document keys)
- Verifies all documents have same schema
- Supports sub-documents natively
- Supports arrays as document values for both json2csv and csv2json
- Custom ordering of columns (see F.A.Q. for more information)
- Ability to re-generate the JSON documents that were used to generate the CSV (including nested documents)
- Allows for custom field delimiters, end of line delimiters, etc.

## F.A.Q.

- Can the order of the keys be changed in the output?
__Yes.__ Currently, changing the order of the keys in the JSON document will also change the order of the columns. (Tested on Node 10.xx)

## Milestones
 - Created: Apr 23, 2014
 - 1K Downloads/Month: January 15, 2015

## TODO
- Use PARSE_CSV_NUMBERS option to actually convert numbers. Not currently implemented.
- Respect nested arrays when in json2csv - Currently flattens them
- If quotes in CSV header, strip them? Add as an option?
