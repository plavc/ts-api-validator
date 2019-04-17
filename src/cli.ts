#!/usr/bin/env node

import * as program from 'commander';

class Cli {

    public run() {
        program
            .name('pl-ts-api-validator')
            .version(require('../package.json').version, '-v, --version')
            .description(require('../package.json').description)
            .command('generate', 'Generate schema for all types found by <pattern>.')
            .command('validate', 'Validate JSON file <jsonFile> against schema <schemaFile>.')
            .parse(process.argv);
    }
}

new Cli().run();