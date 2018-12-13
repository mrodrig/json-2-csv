# Upgrade Guide - v2 to v3

## Breaking Changes
* Options Keys

Starting with v3.0.0, the uppercase option keys from v1 (and still supported in
v2), will no longer be supported. In order to improve maintainability, the
functionality that was implemented to copy the upper-case option values over to
the new lower-case option keys has been removed. The same options are still
available, however, you will need to update your code to use the new keys.

The following lists the key name changes (left = old, right = new)

```
EMPTY_FIELD_VALUE        --> emptyFieldValue
CHECK_SCHEMA_DIFFERENCES --> checkSchemaDifferences
KEYS                     --> keys
PARSE_CSV_NUMBERS        --> parseCsvNumbers
SORT_HEADER              --> sortHeader
TRIM_FIELD_VALUES        --> trimFieldValues
TRIM_HEADER_FIELDS       --> trimHeaderFields
PREPEND_HEADER           --> prependHeader
DELIMITER.FIELD          --> delimiter.field
DELIMITER.ARRAY          --> delimiter.array
DELIMITER.WRAP           --> delimiter.wrap
DELIMITER.EOL            --> delimiter.eol
```

* Schema Difference Check

By default, the schema difference check for `json2csv` has now been disabled.
As a result, if you wish to ensure that all documents have the same schema, you
will need to specify `checkSchemaDifferences: true` in the options object you
pass to the `json2csv` function.

* RFC 4180 Compliance

As of v3.0.0, the module is now compliant with RFC 4180, which means improved
compatibility with spreadsheet applications, like Microsoft Excel. This is great
news, however, it may mean that any applications or tools that depend on the
previous CSV format that the module generated may need to be updated since they
may break as a result.

## Improvements

* Class-based functionality

Starting with v3.0.0, the internal workings of json-2-csv have been revamped to
utilize a class-based structure. Previously, the options objects were set on a
global scope ☹️ which could result in options being overwritten if there were
two or more simultaneous calls to the json2csv or csv2json function. This has
been fixed to improve parallel processing. This change is invisible to the
developer though, as it requires no changes to your code. 🙂

* Duplicated code, no longer!

Another invisible improvement is that duplicated code has been removed. More 
specifically, the functionality has been abstracted out to avoid having the same
underlying support code in multiple spots. This falls moreso under technical
debt, but nonetheless, it's an improvement that will help improve 
maintainability long-term.

* Excel Byte Order Mark (BOM) Support

Starting in v3, there's a new option `excelBom` which allows you to specify that
a Byte Order Mark (BOM) be prepended to the beginning of the CSV. This allows
Microsoft Excel to open a UTF-8 encoded CSV file with non-ASCII characters,
without them being scrambled. This, however, is not needed when using Apple's 
Numbers app. 