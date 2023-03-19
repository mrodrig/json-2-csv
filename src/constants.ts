'use strict';

import type { DefaultCsv2JsonOptions, DefaultJson2CsvOptions } from './types';

export const errors = {
    optionsRequired: 'Options were not passed and are required.',

    json2csv: {
        cannotCallOn: 'Cannot call json2csv on',
        dataCheckFailure: 'Data provided was not an array of documents.',
        notSameSchema: 'Not all documents have the same schema.'
    },

    csv2json: {
        cannotCallOn: 'Cannot call csv2json on',
        dataCheckFailure: 'CSV is not a string.'
    }
};

export const defaultJson2CsvOptions: DefaultJson2CsvOptions = {
    checkSchemaDifferences: false,
    delimiter : {
        field : ',',
        wrap  : '"',
        eol   : '\n'
    },
    emptyFieldValue: undefined,
    excelBOM: false,
    excludeKeys: [],
    expandArrayObjects: false,
    prependHeader : true,
    preventCsvInjection: false,
    sortHeader : false,
    trimFieldValues : false,
    trimHeaderFields: false,
    unwindArrays: false,
    useDateIso8601Format: false,
    useLocaleFormat: false,
    wrapBooleans: false,
};

export const defaultCsv2JsonOptions: DefaultCsv2JsonOptions = {
    delimiter : {
        field : ',',
        wrap  : '"',
        eol   : '\n'
    },
    excelBOM: false,
    preventCsvInjection: false,
    trimFieldValues : false,
    trimHeaderFields: false,
    wrapBooleans: false,
};

export const excelBOM = '\ufeff';
