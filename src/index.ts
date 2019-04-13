
import * as fs from "fs";

import { TSSchemaGenerator } from "./ts-schema-generator";
import { TSAPIValidator } from "./ts-api-validator";

class Startup {
    public static main(): number {

        const schemaGen = TSSchemaGenerator.createWithPattern('test/model/**/*.ts');

        schemaGen.generateSchema();

        const apiValidator = new TSAPIValidator();

        const schema = fs.readFileSync('schemas/' + this.getFileName('IUser'), { encoding: "UTF-8" })
        const data = fs.readFileSync('test/user.json', { encoding: "UTF-8" })

        const res = apiValidator.validate(data, schema);

        console.log(res);
        return 0;
    }

    static getFileName(typeName: string) {
        return "_" + typeName.toLowerCase() + ".json"
    }
}

Startup.main();