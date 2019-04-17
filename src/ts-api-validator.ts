import * as Ajv from "ajv";
import { TSAPIValidatorResult } from "./ts-api-validator-result";

export class TSAPIValidator {

    private ajv: any;

    constructor() {
        this.ajv = new Ajv({ allErrors: true });
    }

    public validate(data: string, schema: string | object): TSAPIValidatorResult {

        let schemaInternal: object = { };

        if (typeof schema === 'object') {
            schemaInternal = schema;
        }

        if (typeof schema === 'string') {
            schemaInternal = JSON.parse(schema);
        }

        const valid = this.ajv.validate(schemaInternal, data);

        return new TSAPIValidatorResult(valid, this.ajv.errors);
    }
}