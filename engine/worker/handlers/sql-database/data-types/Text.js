import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Text extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{name} {type}({maxLength}) {required} {DEFAULT_VALUE}",
        [DATABASE.MySQL]: "`{name}` {type}({maxLength}) {required} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{name} {type}({maxLength}) {required} {DEFAULT_VALUE}",
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
        const schema = this.createMap[this.type];

        return schema
            .replace("{name}", this.getName())
            .replace("{type}", this.getDbType())
            .replace("{maxLength}", this.getMaxLength())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ? `DEFAULT '${this.getDefaultValue()}'` : "")
            .replace("{required}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
