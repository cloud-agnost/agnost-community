/**
 * @description The base class for all fields
 * @class Field
 * @description Abstract class for fields
 */
export default class Field {
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
     * @description Converts the field to a query string
     */
    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        return this.getName() + " " + this.getDbType();
    }

    /**
     * @description Converts the field to a query string for renaming the field
     */
    toDefinitionQueryForRename() {
        return this.getDbType();
    }
}
