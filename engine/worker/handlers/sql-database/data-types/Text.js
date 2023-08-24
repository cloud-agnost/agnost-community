import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Text extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{name} {type}({maxLength}) {required} {DEFAULT_VALUE}",
        [DATABASE.MySQL]: "`{name}` {type}({maxLength}) {required} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{name} {type}({maxLength}) {required} {DEFAULT_VALUE}",
    };

    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.MySQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: " CONSTRAINT DC_{CONSTRAINT_NAME} DEFAULT {DEFAULT_VALUE}",
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

    toDefinitionQuery() {
        let schema = this.createMap[this.getDatabaseType()];

        if (this.getDefaultValue()) {
            schema = schema.replace("{DEFAULT_VALUE}", this.defaultMap[this.getDatabaseType()]);
        }

        return schema
            .replace("{name}", this.getName())
            .replace("{type}", this.getDbType())
            .replace("{maxLength}", this.getMaxLength())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ?? "")
            .replace("{CONSTRAINT_NAME}", this.getIid().replaceAll("-", "_"))
            .replace("{required}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
