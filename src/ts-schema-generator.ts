
import * as TJS from "typescript-json-schema";
import * as fs from "fs";
import * as glob from "glob";

import { resolve } from "path";

export class TSSchemaGenerator {

    private _program: TJS.Program | undefined;
    private _generator: TJS.JsonSchemaGenerator | null = null;

    public basePath: undefined | string = undefined;

    public schemasOutputFolder: string = './schemas';

    public settings: TJS.PartialArgs = {
        required: true
    };

    public compilerOptions: TJS.CompilerOptions = {
        strictNullChecks: true
    }

    public static findFiles(filePattern: string): string[] {

        const globBase = new glob.GlobSync(filePattern);

        const resolvedInternal: string[] = []

        globBase.found.forEach(tsFile => {
            resolvedInternal.push(resolve(tsFile));
        });

        return resolvedInternal;
    }

    static createWithPattern(modelFilesPattern: string): TSSchemaGenerator {
        const files = this.findFiles(modelFilesPattern);
        return new TSSchemaGenerator(files);
    }

    static create(modelFiles: string[]): TSSchemaGenerator {
        return new TSSchemaGenerator(modelFiles);
    }

    private constructor(modelFiles: string[]) {
        this.createProgram(modelFiles);
        this.createGenerator();
    }

    private createProgram(modelFiles: string[]) {
        this._program = TJS.getProgramFromFiles(modelFiles, this.compilerOptions, this.basePath);
    }

    private createGenerator() {
        if (this._program) {
            this._generator = TJS.buildGenerator(this._program, this.settings);
        }

        if (!this._generator) {
            throw Error('Not initialized!');
        }
    }

    private getFileName(modelName: string) {
        return "_" + modelName.toLowerCase() + '.json';
    }

    private writeSchemaFile(modelName: string, schema: object) {
        const schemaStr = JSON.stringify(schema, null, 2);
        fs.writeFileSync(this.schemasOutputFolder + '/' + this.getFileName(modelName), schemaStr);
    }

    private mkdirOutput() {
        if(!fs.existsSync(this.schemasOutputFolder)) {
            fs.mkdirSync(this.schemasOutputFolder);
        }
    }

    public generateSchema() {
        
        if (this._generator && this._program) {

            this.mkdirOutput();

            const generatorLocal = this._generator;
            
            const modelNames = this._generator.getMainFileSymbols(this._program);

            modelNames.forEach(modelName => {
                const schema = generatorLocal.getSchemaForSymbol(modelName, true);
                this.writeSchemaFile(modelName, schema);
            });
        } else {
            throw Error('Not initialized!');
        }
    }

    public getSchemaForModelname(modelName: string) {
        if (this._generator && this._program) {
            this._generator.getSchemaForSymbol(modelName, true);
        } else {
            throw Error('Not initialized!');
        }
    }
}