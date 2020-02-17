const fs = require('fs'),
    path = require('path'),

    csvFileConfig = [
        {key: 'noData', file: '../data/csv/noData.csv'},
        {key: 'singleDocument', file: '../data/csv/singleDocument.csv'},
        {key: 'array', file: '../data/csv/array.csv'},
        {key: 'arrayObjects', file: '../data/csv/arrayObjects.csv'},
        {key: 'arrayMixedObjNonObj', file: '../data/csv/arrayMixedObjNonObj.csv'},
        {key: 'date', file: '../data/csv/date.csv'},
        {key: 'null', file: '../data/csv/null.csv'},
        {key: 'undefined', file: '../data/csv/undefined.csv'},
        {key: 'nested', file: '../data/csv/nested.csv'},
        {key: 'nestedMissingField', file: '../data/csv/nestedMissingField.csv'},
        {key: 'comma', file: '../data/csv/comma.csv'},
        {key: 'quotes', file: '../data/csv/quotes.csv'},
        {key: 'quotesAndCommas', file: '../data/csv/quotesAndCommas.csv'},
        {key: 'eol', file: '../data/csv/eol.csv'},
        {key: 'assortedValues', file: '../data/csv/assortedValues.csv'},
        {key: 'trimFields', file: '../data/csv/trimFields.csv'},
        {key: 'trimmedFields', file: '../data/csv/trimmedFields.csv'},
        {key: 'trimHeader', file: '../data/csv/trimHeader.csv'},
        {key: 'trimmedHeader', file: '../data/csv/trimmedHeader.csv'},
        {key: 'excelBOM', file: '../data/csv/excelBOM.csv'},
        {key: 'specifiedKeys', file: '../data/csv/specifiedKeys.csv'},
        {key: 'extraLine', file: '../data/csv/extraLine.csv'},
        {key: 'noHeader', file: '../data/csv/noHeader.csv'},
        {key: 'sortedHeader', file: '../data/csv/sortedHeader.csv'},
        {key: 'emptyFieldValues', file: '../data/csv/emptyFieldValues.csv'},
        {key: 'quotedEmptyFieldValue', file: '../data/csv/quotedEmptyFieldValue.csv'},
        {key: 'csvEmptyLastValue', file: '../data/csv/csvEmptyLastValue.csv'},
        {key: 'unwind', file: '../data/csv/unwind.csv'},
        {key: 'unwindWithSpecifiedKeys', file: '../data/csv/unwindWithSpecifiedKeys.csv'}
    ];

function readCsvFile(filePath) {
    let absoluteFilePath = path.join(__dirname, filePath);
    return fs.readFileSync(absoluteFilePath).toString();
}

function setupTestData() {
    let csvTestData = {};

    csvFileConfig.forEach((testFile) => {
        csvTestData[testFile.key] = readCsvFile(testFile.file);
    });

    return csvTestData;
}

module.exports = setupTestData();
