import * as program from 'commander';
import { TSSchemaGenerator } from "./ts-schema-generator";

class CliGenerate {

    private pattern?: string;
    private verbose = false;
    
    public run() {
        program.name('generate')
            .arguments('<pattern>')
            .option('-o, --out <outDir>', 'Schema output destination folder. Defaults to \'schemas\'')
            .option('-t, --trace', 'Print to standard output results.')
            .action((pattern, cmd) => this.actionGenerate(pattern, this))
            .parse(process.argv);

        if (typeof this.pattern === 'undefined') {
            console.error('no <pattern> given!');
            process.exit(1);
        }
    }

    private actionGenerate(pattern: any, instance: CliGenerate) {
        const outDir = program.out ? program.out : 'schemas';

        instance.pattern = pattern;
        instance.verbose = program.trace || false;

        if(pattern !== null && pattern !== undefined && pattern.length > 0) {
            if (instance.verbose) {
                console.log('pattern: ', pattern);
                console.log('destination: ', outDir);
            }
            instance.generate(pattern, outDir);
        }
    }

    private generate(filesPattern: string, outputFolder: string) {
        TSSchemaGenerator.createWithPattern(filesPattern, outputFolder).generateSchema();
    }
}

new CliGenerate().run();