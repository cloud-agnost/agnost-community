import Field from "./Field.js";

export default class EncryptedText extends Field {
    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        return this.name + " " + this.versions[this.adapter];
    }

    /**
     * @description Generates the query for the rename field.
     */
    toDefinitionQueryForRename() {
        return this.versions[this.adapter];
    }
}
