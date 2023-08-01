import Field from "./Field.js";

export default class RichText extends Field {
    /**
     * @description Checks if the field is searchable
     * @return {boolean}
     */
    isSearchable() {
        return this.options?.richText?.searchable ?? false;
    }

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
