import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Text extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{name} {type}({maxLength}) {required}",
        [DATABASE.MySQL]: "`{name}` {type}({maxLength}) {required}",
        [DATABASE.SQLServer]: "{name} {type}({maxLength}) {required}",
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
            .replace("{required}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
