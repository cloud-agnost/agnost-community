import Field from "./Field.js";

export default class Decimal extends Field {
    baseLength = 10;

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
        let schema = "`{name}` {type}({BASE_LENGTH},{DIGITS}) {required}";

        return schema
            .replace("{name}", this.getName())
            .replace("{type}", this.getDbType())
            .replace("{BASE_LENGTH}", this.baseLength.toString())
            .replace("{DIGITS}", this.getDecimalDigits().toString())
            .replace("{required}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
