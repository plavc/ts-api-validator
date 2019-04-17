
export class SchemaFilenameProvider {

    public getFileName(typeName: string) {
        return typeName.toLowerCase() + '.schema.json';
    }

    public getFilePath(typeName: string, schemasOutputFolder: string) {
        return schemasOutputFolder + '/' + this.getFileName(typeName);
    }

}