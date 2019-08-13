export interface ISharedOptions {
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
   * Specify the keys (as strings) that should be converted
   *
   * * If you have a nested object (ie. {info : {name: 'Mike'}}), then set this to ['info.name']
   * * If you want all keys to be converted, then specify null or don't specify the option to utilize the default.
   */
  keys?: string[];
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
}

export interface IFullOptions extends ISharedOptions {
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
  sortHeader?: boolean;

}

export function json2csv(data: object[],
                         callback: (err?: Error, csv?: string) => void, options?: IFullOptions): void;

export function json2csvAsync(data: object[], options?: IFullOptions): Promise<string>;

export function csv2json(csv: string,
                         callback: (err?: Error, data?: any[]) => void, options?: ISharedOptions): void;

export function csv2jsonAsync(csv: string, options?: ISharedOptions): Promise<any[]>;
