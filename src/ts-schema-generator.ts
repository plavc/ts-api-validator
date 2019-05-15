
import * as TJS from "typescript-json-schema";
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";

import { SchemaFilenameProvider } from "./schema-filename-provider";

export class TSSchemaGenerator {

    private _program: TJS.Program | undefined;
    private _generator: TJS.JsonSchemaGenerator | null = null;

    private schemaFilenameProvider = new SchemaFilenameProvider();

    public settings: TJS.PartialArgs = {
        ref: true,
        aliasRef: true,
        topRef: true,
        titles: true,
        defaultProps: true,
        noExtraProps: true,
        propOrder: true,
        typeOfKeyword: true,
        required: true,
        strictNullChecks: true,
        ignoreErrors: false
    };

    public compilerOptions: TJS.CompilerOptions = {
        ref: true,
        aliasRef: true,
        topRef: true,
        titles: true,
        defaultProps: false,
        noExtraProps: true,
        propOrder: true,
        typeOfKeyword: true,
        required: true,
        strictNullChecks: true,
        ignoreErrors: true,
        // out: string,
        validationKeywords: [],
        include: [],
        excludePrivate: false,
        uniqueNames: true,
        rejectDateType: false,
        skipLibCheck: true,
        skipDefaultLibCheck: true
        //id: string,
    }

    public static findFiles(filePattern: string, trace: boolean = false): string[] {
        const globBase = new glob.GlobSync(filePattern);

        const resolvedInternal: string[] = []

        globBase.found.forEach(tsFile => {
            resolvedInternal.push(path.resolve(tsFile));
        });

        if (trace) {
            console.log('Source files:');
            resolvedInternal.forEach(f => console.log('  ' + f));
        }

        return resolvedInternal;
    }

    static createWithPattern(modelFilesPattern: string, schemasOutputFolder: string, trace: boolean = false): TSSchemaGenerator {
        const files = this.findFiles(modelFilesPattern, trace);
        return this.create(files, schemasOutputFolder);
    }

    static create(modelFiles: string[], schemasOutputFolder: string): TSSchemaGenerator {
        return new TSSchemaGenerator(modelFiles, schemasOutputFolder);
    }

    private constructor(public readonly modelFiles: string[], public readonly schemasOutputFolder: string) {
        this.createProgram(modelFiles);
        this.createGenerator();
    }

    private createProgram(modelFiles: string[]) {
        this._program = TJS.getProgramFromFiles(modelFiles, this.compilerOptions);
    }

    private createGenerator() {
        if (this._program) {
            this._generator = TJS.buildGenerator(this._program, this.settings);
        }

        if (!this._generator) {
            throw Error('Not initialized!');
        }
    }

    private writeSchemaFile(modelName: string, schema: object) {
        const schemaStr = JSON.stringify(schema, null, 2);
        fs.writeFileSync(this.schemaFilenameProvider.getFilePath(modelName, this.schemasOutputFolder), schemaStr);
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