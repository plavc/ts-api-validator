import * as program from 'commander';
import * as fs from "fs";

import { TSAPIValidator } from "./ts-api-validator";

class CliValidate {

    private schemaFile?: string;
    private jsonFile?: string;
    private verbose = false;
    
    public run() {
        program
            .name('validate')
            .usage('[options] <schema> <json>')
            .arguments('<schema> <json>')
            .option('-t, --trace', 'Print to standard output results.')
            .option('-z, --zippo', 'Test')
            .action((schema, json, options) => this.actionValidate(schema, json, options, this))
            .parse(process.argv);

        if (typeof this.schemaFile === 'undefined') {
            console.error('no <schema> given!');
            process.exit(1);
        }

        if (typeof this.jsonFile === 'undefined') {
            console.error('no <json> given!');
            process.exit(1);
        }
    }

    private actionValidate(schemaFile: any, jsonFile: any, options: any, instance: CliValidate) {
        instance.verbose = program.trace || false;

        // reverse arguments - if options are present (BUG)
        if (program.trace) {
            instance.schemaFile = jsonFile;
            instance.jsonFile = schemaFile;
        } else {
            instance.schemaFile = schemaFile;
            instance.jsonFile = jsonFile;
        }

        if (typeof instance.schemaFile !== 'undefined' && typeof instance.jsonFile !== 'undefined') {
            if (instance.verbose) {
                console.log('schemaFile: ', instance.schemaFile);
                console.log('jsonFile: ', instance.jsonFile);
            }
            const result = instance.validate(instance.schemaFile, instance.jsonFile);

            console.log(JSON.stringify(result, null, 2));

            if (!result.valid) {
                process.exit(1);
            }
        }
    }

    private validate(schemaFile: string, jsonFile: string) {

        const schema = this.readTextFile(schemaFile);
        const json = this.readTextFile(jsonFile);

        const validator = new TSAPIValidator();
        const result = validator.validate(json, schema);

        return result;
    }

    private readTextFile(fileName: string) {
        return fs.readFileSync(fileName, { encoding: "UTF-8" });
    }
}

new CliValidate().run();