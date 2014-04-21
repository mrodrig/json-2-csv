(function () {
	var json2csv, data, callback;

	json2csv = require('./json2csv');
	data = process.argv[2];

	console.log('json2csv required');
	json2csv(data, function (err, csv) {
		if (err) {
			throw err;
		} else { 
			console.log(csv);
		}
	});
}).call(this);