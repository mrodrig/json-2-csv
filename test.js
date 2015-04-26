var Promise = require('bluebird'),
    converter = Promise.promisifyAll(require('./lib/converter'));

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
        Year: '2014',
        Model: 'X5',
        Specifications: {
            Mileage: '3287',
            Trim: 'M'
        }
    }
];

var csv = 'Make,Model,Year,Specifications.Mileage,Specifications.Trim\n' +
    'Nissan,Murano,2013,7106,S AWD\n' +
    'BMW,X5,2014,3287,M';

converter.json2csv(documents, function (err, csv) {
        if (!err) {
            return console.log('csv', csv);
        }
        return console.log('err', err);
    },
    {
        DELIMITER         : {
            FIELD  :  ',',
            ARRAY  :  '/',
            WRAP   :  '\"'
        },
        EOL               : '\n',
        PREPEND_HEADER    : false,
        PARSE_CSV_NUMBERS : false,
        KEYS: ['Make', 'Model', 'Specifications.Mileage']
    });

//converter.json2csvAsync(documents, {})
//    .then(function (csv) {
//        console.log('csv', csv);
//    })
//    .catch(function (err) {
//        console.log(err.stack);
//    });

//converter.csv2json(csv, function (err, json) {
//    if (!err) {
//        return console.log('json', json);
//    }
//    return console.log('err', err);
//}, {KEYS: ['Model', 'Specifications.Mileage']});

//converter.csv2jsonAsync(csv, {})
//    .then(function (json) {
//        console.log('json', json);
//    })
//    .catch(function (err) {
//        console.log('err', err.stack);
//    })