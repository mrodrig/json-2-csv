'use strict';

import { evaluatePath, setPath } from 'doc-path';
import { defaultJson2CsvOptions, defaultCsv2JsonOptions } from './constants';
import type { Json2CsvOptions, Csv2JsonOptions, FullJson2CsvOptions, FullCsv2JsonOptions } from './types';

const dateStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
    MAX_ARRAY_LENGTH = 100000;

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
export function buildJ2COptions(opts: Json2CsvOptions): FullJson2CsvOptions {
    return {
        ...defaultJson2CsvOptions,
        ...opts,
        delimiter: {
            field: opts?.delimiter?.field ?? defaultJson2CsvOptions.delimiter.field,
            wrap: opts?.delimiter?.wrap || defaultJson2CsvOptions.delimiter.wrap,
            eol: opts?.delimiter?.eol || defaultJson2CsvOptions.delimiter.eol,
        },
        fieldTitleMap: Object.create({}),
    };
}

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
export function buildC2JOptions(opts: Csv2JsonOptions): FullCsv2JsonOptions {
    return {
        ...defaultCsv2JsonOptions,
        ...opts,
        delimiter: {
            field: opts?.delimiter?.field ?? defaultCsv2JsonOptions.delimiter.field,
            wrap: opts?.delimiter?.wrap || defaultCsv2JsonOptions.delimiter.wrap,
            eol: opts?.delimiter?.eol || defaultCsv2JsonOptions.delimiter.eol,
        },
    };
}

export function validate(data: unknown, validationFn: (data: unknown) => boolean, errorMessages: Record<string, string>) {
    if (!data) throw new Error(`${errorMessages.cannotCallOn} ${data}.`);
    if (!validationFn(data)) throw new Error(errorMessages.dataCheckFailure);
    return true;
}

/**
 * Utility function to deep copy an object, used by the module tests
 */
export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Helper function that determines whether the provided value is a representation
 *   of a string. Given the RFC4180 requirements, that means that the value is
 *   wrapped in value wrap delimiters (usually a quotation mark on each side).
 */
export function isStringRepresentation(fieldValue: string, options: FullJson2CsvOptions | FullCsv2JsonOptions) {
    const firstChar = fieldValue[0],
        lastIndex = fieldValue.length - 1,
        lastChar = fieldValue[lastIndex];

    // If the field starts and ends with a wrap delimiter
    return firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap;
}

/**
 * Helper function that determines whether the provided value is a representation
 *   of a date.
 */
export function isDateRepresentation(fieldValue: string) {
    return dateStringRegex.test(fieldValue);
}

/**
 * Helper function that determines the schema differences between two objects.
 */
export function computeSchemaDifferences<T>(schemaA: T[], schemaB: T[]): T[] {
    return arrayDifference(schemaA, schemaB)
        .concat(arrayDifference(schemaB, schemaA));
}

/**
 * Utility function to check if a field is considered empty so that the emptyFieldValue can be used instead
 */
export function isEmptyField(fieldValue: unknown) {
    return isUndefined(fieldValue) || isNull(fieldValue) || fieldValue === '';
}

/**
 * Helper function that removes empty field values from an array.
 */
export function removeEmptyFields(fields: unknown[]) {
    return fields.filter((field: unknown) => !isEmptyField(field));
}

/**
 * Helper function that retrieves the next n characters from the start index in
 *   the string including the character at the start index. This is used to
 *   check if are currently at an EOL value, since it could be multiple
 *   characters in length (eg. '\r\n')
 */
export function getNCharacters(str: string, start: number, n: number) {
    return str.substring(start, start + n);
}

/**
 * The following unwind functionality is a heavily modified version of @edwincen's
 * unwind extension for lodash. Since lodash is a large package to require in,
 * and all of the required functionality was already being imported, either
 * natively or with doc-path, I decided to rewrite the majority of the logic
 * so that an additional dependency would not be required. The original code
 * with the lodash dependency can be found here:
 *
 * https://github.com/edwincen/unwind/blob/master/index.js
 */

/**
 * Core function that unwinds an item at the provided path
 */
function unwindItem(accumulator: unknown[], item: unknown, fieldPath: string) {
    const valueToUnwind = evaluatePath(item, fieldPath);
    let cloned = deepCopy(item);

    if (Array.isArray(valueToUnwind) && valueToUnwind.length) {
        valueToUnwind.forEach((val) => {
            cloned = deepCopy(item);
            accumulator.push(setPath(cloned, fieldPath, val));
        });
    } else if (Array.isArray(valueToUnwind) && valueToUnwind.length === 0) {
        // Push an empty string so the value is empty since there are no values
        setPath(cloned, fieldPath, '');
        accumulator.push(cloned);
    } else {
        accumulator.push(cloned);
    }
}

/**
 * Main unwind function which takes an array and a field to unwind.
 */
export function unwind<T>(array: T[], field: string) {
    const result: T[] = [];
    array.forEach((item) => {
        unwindItem(result, item, field);
    });
    return result;
}

/**
 * Checks whether value can be converted to a number
 */
export function isNumber(value: unknown) {
    return !isNaN(Number(value));
}

/*
 * Helper functions which were created to remove underscorejs from this package.
 */

export function isString(value: unknown) {
    return typeof value === 'string';
}

export function isObject(value: unknown) {
    return typeof value === 'object';
}

export function isNull(value: unknown) {
    return value === null;
}

export function isUndefined(value: unknown) {
    return typeof value === 'undefined';
}

export function isError(value: unknown) {
    // TODO(mrodrig): test this possible change
    // return value instanceof Error;
    return Object.prototype.toString.call(value) === '[object Error]';
}

export function arrayDifference<T>(a: T[], b: T[]) {
    return a.filter((x) => !b.includes(x));
}

export function unique<T>(array: T[]): T[] {
    return [...new Set(array)];
}

export function flatten<T>(array: T[][]): T[] {
    // Node 11+ - use the native array flattening function
    if (array.flat) {
        return array.flat();
    }

    // #167 - allow browsers to flatten very long 200k+ element arrays
    if (array.length > MAX_ARRAY_LENGTH) {
        let safeArray: T[] = [];
        for (let a = 0; a < array.length; a += MAX_ARRAY_LENGTH) {
            safeArray = safeArray.concat(...array.slice(a, a + MAX_ARRAY_LENGTH));
        }
        return safeArray;
    }
    return array.reduce((accumulator, value) => accumulator.concat(value), []);
}

/**
 * Used to help avoid incorrect values returned by JSON.parse when converting
 * CSV back to JSON, such as '39e1804' which JSON.parse converts to Infinity
 */
export function isInvalid(parsedJson: unknown) {
    return parsedJson === Infinity ||
        parsedJson === -Infinity;
}
