/**
 * @description The base class for all fields
 * @class Field
 * @description Abstract class for fields
 */
export default class Field {
    nullableFields = ["createdat", "updatedat"];

    constructor(options) {
        this.options = options;
    }

    getName() {
        return this.options.name;
    }

    getType() {
        return this.options.type;
    }

    isRequired() {
        return this.options.required;
    }

    isUnique() {
        return this.options.unique;
    }

    isImmutable() {
        return this.options.immutable;
    }

    isIndexed() {
        return this.options.indexed;
    }

    getDbType() {
        return this.options.dbType;
    }

    getIid() {
        return this.options.iid;
    }

    /**
     * @description Checks if the field is searchable
     * @return {boolean}
     */
    isSearchable() {
        return false;
    }

    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        let schema = "`{NAME}` {TYPE}";

        if (!this.nullableFields.includes(this.getType())) {
            schema += " {REQUIRED}";
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }

    toDefinitionQueryForModify() {
        return this.toDefinitionQuery();
    }
}
