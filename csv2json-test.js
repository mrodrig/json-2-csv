var converter = require('./lib/converter');

var mycsv = 'header1,header2,"header3"\n'
        + '"row1 column1",row1 column2,row1 column3\n'
        + '"row2 column1","row2 column2","row2 column3"\n';

var csv = 'header1,header2,header3\n'
        + ',"row1 column2, with comma", row1 column3\n'
        + 'row2 column1,row2 column2, row2 column3\n';

var csvArrays = '"info.name","coursesTaken","year"\n'
        + '"Mike","[CS2500/CS2510]","Sophomore"\n'
        + '"John","[ANTH1101/POL2312/MATH2142/POL3305/LAW2100]","Senior"\n'
        + '"Joe","[]","Freshman"\n';

converter.csv2json(mycsv, function (err, json) {
    if (!err) {
        return console.log(json);
    }
    throw err;
}, {
    DELIMITER : {
        WRAP: '"'
    }
});