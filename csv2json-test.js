var converter = require('./lib/converter');

var mycsv = 'header1,header2,"header3"\n'
        + '"row1 column1",row1 column2,row1 column3\n'
        + '"row2 column1","row2 column2","row2 column3"\n';

var csv = 'header1,header2,header3\n'
        + ',"row1 column2, with comma", row1 column3\n'
        + 'row2 column1,row2 column2, row2 column3\n';

var allCasesTest = '"carModel","priceRange.min","priceRange.max"\n'
        + 'Audi,"9000",11000\n'
        + '"BMW",14000,16000\n'
        + '"Mercedes",19000,"21000"\n'
        + '"Porsche","29000",31000\n'
        + ',200,300\n';


converter.csv2json(allCasesTest, function (err, json) {
    if (!err) {
        return console.log(json);
    }
    throw err;
}, {
    DELIMITER : {
        WRAP: '"'
    }
});