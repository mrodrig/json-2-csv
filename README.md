# Convert JSON documents to CSV

This node module will convert an array of JSON documents to a CSV string.

Column headings will be automatically generated based on the keys of the JSON documents. Nested documents will have a '.' appended between the keys.

## Installation

```bash
$ npm install json-2-csv
```

## Usage

```javascript
var json2csv = require('json-2-csv');
```

### json2csv Example:

```javascript

var json2csv = require('json-2-csv');

var documents = [
    {
        'Make': 'Nissan',
        'Model': 'Murano',
        'Year': '2013'
        'Specifications': {
            'Mileage': '7106',
            'Trim': 'S AWD'
        }
    },
    {
        'Make': 'BMW',
        'Model' 'X5',
        'Year': '2014',
        'Specifications': {
            'Mileage': '3287',
            'Trim': 'M'
        }
    }
];

var json2csvCallback = function (err, res) {
    if (err) throw err;
    console.log(res);
};

json2csv.json2csv(documents, json2csvCallback);

```

The above code prints out:

```csv
Make,Model,Year,Specifications.Mileage,Specifications.Trim
Nissan,Murano,2013,7106,S AWD
BMW,X5,2014,3287,M
```

## Tests

TODO: Add tests

## Features

- Header Generation (per document keys)
- Verifies all documents have same schema
- Supports sub-documents natively
- Custom ordering of columns (see F.A.Q. for more information)

## F.A.Q.

- Can the order of the keys be changed in the output?
__Yes.__ Currently, changing the order of the keys in the JSON document will also change the order of the columns. (Node 10.26)
