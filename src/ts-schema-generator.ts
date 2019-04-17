
import * as TJS from "typescript-json-schema";
import * as fs from "fs";
import * as glob from "glob";

import { resolve } from "path";
import { SchemaFilenameProvider } from "./schema-filename-provider";

export class TSSchemaGenerator {

    private _program: TJS.Program | undefined;
    private _generator: TJS.JsonSchemaGenerator | null = null;

    public basePath: undefined | string = undefined;

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
        ignoreErrors: false,
        // out: string,
        validationKeywords: [],
        include: [],
        excludePrivate: false,
        uniqueNames: true,
        rejectDateType: false,
        //id: string,
    }

    public static findFiles(filePattern: string): string[] {

        const globBase = new glob.GlobSync(filePattern);

        const resolvedInternal: string[] = []

        globBase.found.forEach(tsFile => {
            resolvedInternal.push(resolve(tsFile));
        });

        return resolvedInternal;
    }

    static createWithPattern(modelFilesPattern: string, schemasOutputFolder: string): TSSchemaGenerator {
        const files = this.findFiles(modelFilesPattern);
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