var t = require('./converter');

t.json2csv({
    'name': 'mrodrig',
    'email': null,
    'country': 'USA',
    'githubUsername': 'mrodrig'
}, function (err, csv) {
    if (err) throw err;
    console.log(csv);
    }
);
