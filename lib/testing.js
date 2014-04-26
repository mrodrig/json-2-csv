var t = require('./converter');

t.json2csv([{'test':{'a':2}}], function (err, csv) {
    if (err) throw err;
    t.csv2json(csv, function (err, json) {
        if (err) throw err;
        console.log(json);
    });
    }
);
