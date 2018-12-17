let converter = require('./src/converter');

// let csv = 'field1,field2,field3,field4\n' +
// '"test,string","["arrayval1","arrayval2"]",string123,"""test with quote"';

let csv = 'eventId,values\n' +
    '185919,"[""sure"",""thing"",""boss""]"\n';

let csv2jsonCallback = function (err, json) {
    if (err) throw err;
    console.log(typeof json);
    console.log(json.length);
    console.log(json);
};

converter.csv2json(csv, csv2jsonCallback);