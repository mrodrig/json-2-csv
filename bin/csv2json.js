#!/usr/bin/env node

'use strict';

const pkg = require('../package'),
    utils = require('./utils/utils'),
    program = require('commander');

program
    .version(pkg.version)
    .usage('<csvFile> [options]')
    .option('-c, --csv <csv>', 'Path of json file to be converted', utils.readInputFile)
    .option('-o, --output [output]', 'Path of output file. If not provided, then stdout will be used', utils.convertToAbsolutePath)
    .option('-f, --field <delimiter>', 'Optional field delimiter')
    .option('-w, --wrap <delimiter>', 'Optional wrap delimiter')
    .option('-e, --eol <delimiter>', 'Optional end of line delimiter')
    .option('-b, --excel-bom', 'Excel Byte Order Mark character prepended to CSV')
    .option('-H, --trim-header', 'Trim header fields')
    .option('-F, --trim-fields', 'Trim field values')
    .option('-k, --keys [keys]', 'Keys of documents to convert to CSV', utils.constructKeysList, undefined)
    .parse(process.argv);

Promise.resolve({
    csv: utils.readInputFile(program.args && program.args.length && program.args[0]),
    output: program.output,
    options: {
        delimiter: {
            field: program.field,
            wrap: program.wrap,
            eol: program.eol
        },
        excelBOM: Boolean(program.excelBom),
        trimHeaderFields: Boolean(program.trimHeader),
        trimFieldValues: Boolean(program.trimFields),
        keys: program.keys
    }
})
    .then(utils.parseInputFiles)
    .then(utils.determineConverter)
    .then(utils.performConversion)
    .then(utils.processOutput);
