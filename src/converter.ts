'use strict';

import type { Json2CsvOptions, Csv2JsonOptions } from './types';
import { errors } from './constants';
import { Json2Csv } from './json2csv';
import { Csv2Json } from './csv2json';
import { buildJ2COptions, buildC2JOptions, validate, isObject, isString } from './utils';

export type { Json2CsvOptions, Csv2JsonOptions } from './types';

export async function json2csv(data: object[], options?: Json2CsvOptions): Promise<string> {
    const builtOptions = buildJ2COptions(options ?? {});
    
    // Validate the parameters before calling the converter's convert function
    validate(data, isObject, errors.json2csv);

    return Json2Csv(builtOptions).convert(data);
}

export async function csv2json(data: string, options?: Csv2JsonOptions): Promise<object[]> {
    const builtOptions = buildC2JOptions(options ?? {});
    
    // Validate the parameters before calling the converter's convert function
    validate(data, isString, errors.csv2json);

    return Csv2Json(builtOptions).convert(data);
}
