let converter = require('./src/converter');

// let csv = 'field1,field2,field3,field4\n' +
// '"test,string","["arrayval1","arrayval2"]",string123,"""test with quote"';

let csv = 'field1,field2,field3,field4\n' +
    '"test,string","[""sure"",""thing"",""boss""]","{""test"":""123""}","""test with quote"\n' +
    '"testingwithquote""","""test""","{""yello""}","""end"""\n' +
    'false,null, nopest ,  nopes   \n' +
    'undefined,null,false,1545278758108';

let csv2jsonCallback = function (err, json) {
    if (err) throw err;
    console.log(typeof json);
    console.log(json.length);
    console.log(json);
};

converter.csv2json(csv, csv2jsonCallback);