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
        let schema = "`{name}` {type}";

        if (!this.nullableFields.includes(this.getType())) {
            schema += " {required}";
        }

        return schema
            .replace("{name}", this.getName())
            .replace("{type}", this.getDbType())
            .replace("{required}", this.isRequired() ? "NOT NULL" : "");
    }

    /**
     * @description Converts the field to a query string for renaming the field
     */
    toDefinitionQueryForRename() {
        return this.getDbType();
    }
}
