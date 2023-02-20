interface SharedConverterOptions {
  /**
   * Specifies the different types of delimiters
   */
  delimiter?: {
    /** @default ',' */
    field?: string;
    /** @default '"' */
    wrap?: string;
    /** @default '\n' */
    eol?: string;
  };

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
  keys?: (string | {
    field: string;
    title?: string;
  })[];

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

export interface Csv2JsonOptions extends SharedConverterOptions {
  /**
   * Specify the header fields in the event that the CSV does not container a header line
   *
   * If you want to generate a nested object (ie. {info : {name: 'Mike'}}), then use `.` characters in the string to denote a nested field, like ['info.name']
   * If your CSV has a header line included, then don't specify the option to utilize the default values that will be parsed from the CSV.
   */
  headerFields?: string[];
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
  emptyFieldValue?: any;

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
  sortHeader?: boolean|((a: any, b: any) => number);

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
    fieldValue: any,
    defaultParser: (fieldValue: any) => string
  ) => string;
}

export function json2csv(data: object[],
                         callback: (err?: Error, csv?: string) => void, options?: Json2CsvOptions): void;

export function json2csvAsync(data: object[], options?: Json2CsvOptions): Promise<string>;

export function csv2json(csv: string,
                         callback: (err?: Error, data?: any[]) => void, options?: Csv2JsonOptions): void;

export function csv2jsonAsync(csv: string, options?: Csv2JsonOptions): Promise<any[]>;
