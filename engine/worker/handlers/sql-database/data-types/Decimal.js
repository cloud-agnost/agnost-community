import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Decimal extends Field {
    baseLength = 15;

    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE}({BASE_LENGTH},{DIGITS}) {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE}({BASE_LENGTH},{DIGITS}) {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE}({BASE_LENGTH},{DIGITS}) {REQUIRED} {DEFAULT_VALUE}",
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
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{BASE_LENGTH}", this.baseLength.toString())
            .replace("{DIGITS}", this.getDecimalDigits().toString())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ? `DEFAULT ${this.getDefaultValue()}` : "")
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
