# Upgrade Guide - v3 to v4

## Breaking Changes

* Callback Flow Not Supported

As JavaScript has evolved, the older notion of using callbacks has mostly been replaced by `Promise`s. Accordingly, this module has updated to solely use Promise chains going forward and dropped the older convention of allowing a callback to be specified.

* Promise Flow Naming Changes

Since the callback flow functionality has been removed, the Promise flow function names have been updated accordingly:

```
Old Function Name          --> New Function Name
json2csv (using callback)  --> (dropped from module)
json2csvAsync              --> json2csv
json2csvPromisified        --> json2csv

csv2json (using callback)  --> (dropped from module)
csv2jsonAsync              --> csv2json
csv2jsonPromisified        --> csv2json
```

## Improvements

* Fully Converted to TypeScript!

This means that going forward, new options that are added to the library won't be forgotten about when it comes to the TypeScript declarations. Additionally, in the migration process, some of the options that were configurable for `csv2json` functionality were found to have not been specified in the existing type declarations. This migration fixes those issues and ensured that the options declared in the `README.md` file are supported by the appropriate options type. This will also help with providing another layer of confidence that new bug fixes and additional refactoring won't introduce new issues.
