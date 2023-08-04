import Field from "./Field.js";

export default class Id extends Field {
    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        const schema = "`{NAME}` {TYPE} PRIMARY KEY";

        return schema
            .replaceAll("{NAME}", this.getName())
            .replaceAll("{TYPE}", this.getDbType());
    }
}
