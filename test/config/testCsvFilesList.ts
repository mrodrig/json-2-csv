import { readFileSync } from 'fs';
import path from 'path';

const csvFileConfig = [
    {key: 'noData', file: '../data/csv/noData.csv'},
    {key: 'singleDocument', file: '../data/csv/singleDocument.csv'},
    {key: 'array', file: '../data/csv/array.csv'},
    {key: 'arrayObjects', file: '../data/csv/arrayObjects.csv'},
    {key: 'arrayMixedObjNonObj', file: '../data/csv/arrayMixedObjNonObj.csv'},
    {key: 'arraySingleArray', file: '../data/csv/arraySingleArray.csv'},
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
    {key: 'sortedHeaderCustom', file: '../data/csv/sortedHeaderCustom.csv'},
    {key: 'emptyFieldValues', file: '../data/csv/emptyFieldValues.csv'},
    {key: 'quotedEmptyFieldValue', file: '../data/csv/quotedEmptyFieldValue.csv'},
    {key: 'csvEmptyLastValue', file: '../data/csv/csvEmptyLastValue.csv'},
    {key: 'unwind', file: '../data/csv/unwind.csv'},
    {key: 'unwindEmptyArray', file: '../data/csv/unwindEmptyArray.csv'},
    {key: 'unwindWithSpecifiedKeys', file: '../data/csv/unwindWithSpecifiedKeys.csv'},
    {key: 'withSpecifiedKeys', file: '../data/csv/withSpecifiedKeys.csv'},
    {key: 'localeFormat', file: '../data/csv/localeFormat.csv'},
    {key: 'invalidParsedValues', file: '../data/csv/invalidParsedValues.csv'},
    {key: 'firstColumnWrapCRLF', file: '../data/csv/firstColumnWrapCRLF.csv'},
    {key: 'emptyLastFieldValue', file: '../data/csv/emptyLastFieldValue.csv'},
    {key: 'emptyLastFieldValueNoEol', file: '../data/csv/emptyLastFieldValueNoEol.csv'},
    {key: 'lastCharFieldDelimiter', file: '../data/csv/lastCharFieldDelimiter.csv'},
    {key: 'nativeMapMethod', file: '../data/csv/nativeMapMethod.csv'},
    {key: 'nestedDotKeys', file: '../data/csv/nestedDotKeys.csv'},
    {key: 'nestedDotKeysWithArray', file: '../data/csv/nestedDotKeysWithArray.csv'},
    {key: 'nestedDotKeysWithArrayExpandedUnwound', file: '../data/csv/nestedDotKeysWithArrayExpandedUnwound.csv'},
    {key: 'emptyColumns', file: '../data/csv/emptyColumns.csv'},
    {key: 'quotedFieldWithNewline', file: '../data/csv/quotedFieldWithNewline.csv'},
    {key: 'falsyValues', file: '../data/csv/falsyValues.csv'},
    {key: 'nestedNotUnwoundObjects', file: '../data/csv/nestedNotUnwoundObjects.csv'},
    {key: 'newlineWithWrapDelimiters', file: '../data/csv/newlineWithWrapDelimiters.csv'},
];

function readCsvFile(filePath: string) {
    const absoluteFilePath = path.join(__dirname, filePath);
    return readFileSync(absoluteFilePath).toString();
}

function setupTestData() {
    const csvTestData: Record<string, string> = {};

    csvFileConfig.forEach((testFile) => {
        csvTestData[testFile.key] = readCsvFile(testFile.file);
    });

    return csvTestData;
}

export default setupTestData();
