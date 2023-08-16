import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Decimal extends Field {
    baseLength = 10;

    createMap = {
        [DATABASE.PostgreSQL]: "{name} {type}({BASE_LENGTH},{DIGITS}) {required}",
        [DATABASE.MySQL]: "`{name}` {type}({BASE_LENGTH},{DIGITS}) {required}",
        [DATABASE.SQLServer]: "{name} {type}({BASE_LENGTH},{DIGITS}) {required}",
    };

    /**
     * @description Gets the decimal digits
     * @return {number}
     */
    getDecimalDigits() {
        return this.options.decimal.decimalDigits;
    }

    /**
     * @description Generates the query for the field.
     * @return {string}
     */
    toDefinitionQuery() {
        const schema = this.createMap[this.getDatabaseType()];

        return schema
            .replace("{name}", this.getName())
            .replace("{type}", this.getDbType())
            .replace("{BASE_LENGTH}", this.baseLength.toString())
            .replace("{DIGITS}", this.getDecimalDigits().toString())
            .replace("{required}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
