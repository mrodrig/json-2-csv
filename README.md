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
    * `WRAP` - String - Wrap values in the delimiter of choice (e.g. wrap values in quotes). Default: `''`
  * `CHECK_SCHEMA_DIFFERENCES` - Boolean - Should we require all documents to have the same schema? Default: `true`
  * `PREPEND_HEADER` - Boolean - Should the auto-generated header be prepended as the first line in the CSV? Default: `true`
  * `SORT_HEADER` - Boolean - Should the auto-generated header be sorted? Default: `false`
  * `EOL` - String - End of Line Delimiter. Default: `'\n'`
  * `KEYS` - Array - Specify the keys (as strings) that should be converted. Default: `null`
    * If you have a nested object (ie. {info : {name: 'Mike'}}), then set options.KEYS to ['info.name']
    * If you want all keys to be converted, then specify ```null``` or don't specify the option to utilize the default.

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
    * `WRAP` - String - The character that field values are wrapped in. Default: `''`
  * `EOL` - String - End of Line Delimiter. Default: `'\n'`
  * `PARSE_CSV_NUMBERS` - Boolean - (TODO) Should numbers that are found in the CSV be converted to numbers? Default: `false`
  * `KEYS` - Array - Specify the keys (as strings) that should be converted. Default: `null`
    * If you have a nested object (ie. {info : {name: 'Mike'}}), then set options.KEYS to ['info.name']
    * If you want all keys to be converted, then specify `null` or don't specify the option to utilize the default.

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

To see test coverage, please run:
```bash
$ npm run coverage
```

Current Coverage is:
```
Statements   : 96.88% ( 155/160 )
Branches     : 93.55% ( 116/124 )
Functions    : 100% ( 31/31 )
Lines        : 97.99% ( 146/149 )
```

## Features

- Header Generation (per document keys)
- Allows for conversion of specific keys in both json2csv and csv2json via the options.KEYS parameter (as of 1.1.2)
- Verifies all documents have same schema (schema field order does not matter as of 1.1.0)
- Supports sub-documents natively
- Supports arrays as document values for both json2csv and csv2json
- Custom ordering of columns (see F.A.Q. for more information)
- Ability to re-generate the JSON documents that were used to generate the CSV (including nested documents)
- Allows for custom field delimiters, end of line delimiters, etc.
- Promisifiable via bluebird's .promisify(<function>) and .promisifyAll(<object>) (as of 1.1.1)
- Wrapped value support for json2csv and csv2json (as of 1.3.0)
- Support for multiple different schemas (as of 1.4.0)

## F.A.Q.

- Can the order of the keys be changed in the output?
__Yes.__ Currently, changing the order of the keys in the JSON document will also change the order of the columns. (Tested on Node 10.xx)

- Can I specify the keys that I would like to have converted to CSV or JSON?
__Yes.__ This is currently supported for both json2csv and csv2json.  Specify the keys in options.KEYS. For example,

```javascript
var converter = require('json-2-csv');

var options = {
    KEYS : ['info.name', 'year']
};

var documents = [
    {
        "info": {
            "name": "Mike"
        },
        "coursesTaken": ["CS2500", "CS2510"],
        "year": "Sophomore"
    },
    {
        "info": {
            "name": "John"
        },
        "coursesTaken": ["ANTH1101", "POL2312", "MATH2142", "POL3305", "LAW2100"],
        "year": "Senior"
    },
    {
        "info": {
                    "name": "Joe"
        },
        "coursesTaken": [],
        "year": "Freshman"
    }
];

converter.json2csv(documents, function (err, csv) {
    if (!err) {
        return console.log(csv);
    }
    throw err;
}, options);
```

This prints out:

```csv
info.name,year
Mike,Sophomore
John,Senior
Joe,Freshman

```

## Milestones
 - Created: Apr 23, 2014
 - 1K Downloads/Month: January 15, 2015
