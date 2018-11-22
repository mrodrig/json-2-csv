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

* 