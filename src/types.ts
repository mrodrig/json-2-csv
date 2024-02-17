'use strict';

interface DelimiterOptions {
  /** @default ',' */
  field?: string;
  /** @default '"' */
  wrap?: string;
  /** @default '\n' */
  eol?: string;
}

export type KeysList = (string | {
  field: string;
  title?: string;
})[];

interface SharedConverterOptions {
  /**
   * Specifies the different types of delimiters
   */
  delimiter?: DelimiterOptions;

  /**
   *  Should a unicode character be prepended to allow Excel to open
   *  a UTF-8 encoded file with non-ASCII characters present
   *  @default false
   */
  excelBOM?: boolean;

  /**
   * Should boolean values be wrapped in wrap delimiters to prevent Excel from
   * converting them to Excel's TRUE/FALSE Boolean values.
   * @default false
   */
  wrapBooleans?: boolean;

  /**
   * Specify the keys that should be converted
   *
   * * If you have a nested object (ie. {info : {name: 'Mike'}}), then set this to ['info.name']
   * * If you want all keys to be converted, then specify null or don't specify the option to utilize the default.
   */
  keys?: KeysList;

  /**
   * Should the header fields be trimmed
   * @default false
   */
  trimHeaderFields?: boolean;

  /**
   * Should the field values be trimmed? (in development)
   * @default false
   */
  trimFieldValues?: boolean;

  /**
   * Should CSV injection be prevented by left trimming these characters:
   * Equals (=), Plus (+), Minus (-), At (@), Tab (0x09), Carriage return (0x0D).
   * @default false
   */
  preventCsvInjection?: boolean;
}
  
export interface Csv2JsonOptions extends Omit<SharedConverterOptions, 'keys'> {
  /**
   * Specify the keys that should be converted
   *
   * * If you have a nested object (ie. {info : {name: 'Mike'}}), then set this to ['info.name']
   * * If you want all keys to be converted, then specify null or don't specify the option to utilize the default.
   */
  keys?: string[];

  /**
   * Specify the header fields in the event that the CSV does not container a header line
   *
   * If you want to generate a nested object (ie. {info : {name: 'Mike'}}), then use `.` characters in the string to denote a nested field, like ['info.name']
   * If your CSV has a header line included, then don't specify the option to utilize the default values that will be parsed from the CSV.
   */
  headerFields?: string[];

  /**
   * Specify how String representations of field values should be parsed when converting back to JSON. This function is provided a single String and can return any value.
   */
  parseValue?: (fieldValue: string) => unknown;
}
  
export interface Json2CsvOptions extends SharedConverterOptions {
  /**
   * Should all documents have the same schema?
   * @default false
   */
  checkSchemaDifferences?: boolean;

  /**
   * Value that, if specified, will be substituted in for field values
   * that are undefined, null, or an empty string
   */
  emptyFieldValue?: unknown;

  /**
   * Should dots (`.`) appearing in header keys be escaped with a preceding slash (`\`)?
   * @default true
   */
  escapeHeaderNestedDots?: boolean;

  /**
   *  Should nested objects be deep-converted to CSV
   *  @default true
   */
  expandNestedObjects?: boolean;

  /**
   *  Should objects in array values be deep-converted to CSV
   *  @default false
   */
  expandArrayObjects?: boolean;

  /**
   * Should the auto-generated header be prepended as the first line in the CSV
   * @default true
   */
  prependHeader?: boolean;

  /**
   * Should the header keys be sorted in alphabetical order
   * @default false
   */
  sortHeader?: boolean|((a: string, b: string) => number);

  /**
   * Should array values be "unwound" such that there is one line per value in the array?
   * @default false
   */
  unwindArrays?: boolean;

  /**
   * Should values be converted to a locale specific string?
   * @default false
   */
  useLocaleFormat?: boolean;

  /**
   * Should dates be output in ISO 8601 "Z" format:
   * @default false
   */
  useDateIso8601Format?: boolean;

  /**
   * Specify the keys that should be excluded from the output.
   */
  excludeKeys?: string[];

  /**
   * Specify how values should be converted into CSV format. This function is provided a single field value at a time and must return a `String`.
   * Note: Using this option may override other options, including `useDateIso8601Format` and `useLocaleFormat`.
   */
  parseValue?: (
    fieldValue: unknown,
    defaultParser: (fieldValue: unknown) => string
  ) => string;
}

export interface BuiltCsv2JsonOptions extends Required<Csv2JsonOptions> {
  delimiter: Required<DelimiterOptions>;
}
export interface BuiltJson2CsvOptions extends Required<Json2CsvOptions> {
  delimiter: Required<DelimiterOptions>;
}

export interface DefaultJson2CsvOptions extends
  // Pick optional fields since there are no defaults set:
  Pick<SharedConverterOptions, 'keys'>,
  Pick<Json2CsvOptions, 'parseValue'>,
  // Then extend the types with required fields and specific fields omitted:
  Omit<Omit<BuiltJson2CsvOptions, 'keys'>, 'parseValue'> {}

export interface DefaultCsv2JsonOptions extends
  // Pick optional fields since there are no defaults set:
  Pick<SharedConverterOptions, 'keys'>,
  Pick<Csv2JsonOptions, 'headerFields'>,
  Pick<Csv2JsonOptions, 'parseValue'>,
  // Then extend the types with required fields and specific fields omitted:
  Omit<Omit<Omit<BuiltCsv2JsonOptions, 'keys'>, 'headerFields'>, 'parseValue'> {}

export interface FullJson2CsvOptions extends DefaultJson2CsvOptions {
  /**
   * Internal field that is used to map keys to user provided titles.
   */
  fieldTitleMap: Record<string, string>;
}

export type FullCsv2JsonOptions = DefaultCsv2JsonOptions

export interface HeaderField {
  value: string;
  index: number;
}

export interface Json2CsvParams {
  headerFields: string[];
  header: string;
  records: object[];
  recordString: string;
}

export interface Csv2JsonParams {
  headerFields: HeaderField[];
  lines: string[][];
  recordLines: string[][];
}
