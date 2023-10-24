import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";
import { SQLBaseManager } from "../../managers/SQLBaseManager.js";

export default class Text extends Field {
    collateMap = {
        [DATABASE.MySQL]: "ALTER TABLE {TABLE_NAME} MODIFY {NAME} {TYPE}({MAX_LENGTH}) COLLATE {COLLATE};",
    };

    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE}({MAX_LENGTH}) {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE}({MAX_LENGTH}) {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE}({MAX_LENGTH}) {REQUIRED} {DEFAULT_VALUE}",
    };

    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT '{DEFAULT_VALUE}'",
        [DATABASE.MySQL]: " DEFAULT '{DEFAULT_VALUE}'",
        [DATABASE.SQLServer]: " CONSTRAINT {CONSTRAINT_NAME} DEFAULT '{DEFAULT_VALUE}'",
    };

    maxLengthMap = {
        [DATABASE.PostgreSQL]: "ALTER TABLE {TABLE_NAME} ALTER COLUMN {NAME} TYPE {TYPE}({MAX_LENGTH});",
        [DATABASE.MySQL]: "ALTER TABLE {TABLE_NAME} MODIFY {NAME} {TYPE}({MAX_LENGTH});",
        [DATABASE.SQLServer]: "ALTER TABLE {TABLE_NAME} ALTER COLUMN {NAME} {TYPE}({MAX_LENGTH});",
    };

    /**
     * @description Checks if the field is searchable
     * @return {boolean}
     */
    isSearchable() {
        return this.options?.text?.searchable;
    }

    /**
     * @description Gets the max length of the field
     * @return {number}
     */
    getMaxLength() {
        return this.options?.text?.maxLength;
    }

    /**
     * @description Gets the language of the field
     * @return {string}
     */
    getLanguage() {
        return this.options?.text?.language;
    }

    toDefinitionQuery() {
        let schema = this.createMap[this.getDatabaseType()];

        if (this.getDefaultValue()) {
            schema = schema.replace("{DEFAULT_VALUE}", this.defaultMap[this.getDatabaseType()]);
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{MAX_LENGTH}", this.getMaxLength())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ?? "")
            .replace("{CONSTRAINT_NAME}", SQLBaseManager.getDefaultConstraintName(this.getIid()))
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }

    changeMaxLengthQuery(model, field) {
        return this.maxLengthMap[this.getDatabaseType()]
            .replace("{TABLE_NAME}", model.name)
            .replace("{NAME}", field.name)
            .replace("{TYPE}", this.getDbType())
            .replace("{MAX_LENGTH}", this.getMaxLength());
    }

    toAddCollateQuery(model, field) {
        return this.collateMap[this.getDatabaseType()]
            .replace("{TABLE_NAME}", model.name)
            .replace("{NAME}", field.name)
            .replace("{TYPE}", this.getDbType())
            .replace("{MAX_LENGTH}", this.getMaxLength())
            .replace("{COLLATE}", this.getLanguage());
    }
}
