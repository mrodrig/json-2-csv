import { runTests as runJson2CsvTests } from './json2csv';
import { runTests as runCsv2JsonTests } from './csv2json';
import { runTests as runUtilsTests } from './utilsTests';

describe('json-2-csv Node Module', function() {
    process.env.TZ = 'America/New_York';
    // Run JSON to CSV tests
    runJson2CsvTests();

    // Run CSV to JSON Tests
    runCsv2JsonTests();

    // Run Utils Tests
    runUtilsTests();
});
