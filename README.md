# ts-api-validator

Generate JSON schema from Typescript interfaces and validate JSON against schema.

## Schema generation

`node dist/cli.js generate -o 'example/schemas' -t 'example/**/*.model.ts'`

## Schema validation

`node dist/cli.js validate example/schemas/iuser.schema.json example/user.json`