import Field from "./Field.js";

export default class Id extends Field {
    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        return this.getName() + " " + this.getDbType() + " PRIMARY KEY";
    }
}
