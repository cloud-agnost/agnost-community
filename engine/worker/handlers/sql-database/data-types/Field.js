import { DATABASE } from "../../../config/constants.js";

/**
 * @description The base class for all fields
 * @class Field
 * @description Abstract class for fields
 */
export default class Field {
    nullableFields = [];

    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE}",
    };

    constructor(options, type) {
        this.options = options;
        this.type = type;
    }

    getDatabaseType() {
        return this.type;
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

    getDefaultValue() {
        return this.options.defaultValue;
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
        let schema = this.createMap[this.type];

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
