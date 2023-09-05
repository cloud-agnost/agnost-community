import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Decimal extends Field {
    baseLength = 15;

    createMap = {
        [DATABASE.PostgreSQL]: '"{NAME}" {TYPE}({BASE_LENGTH},{DIGITS}) {REQUIRED} {DEFAULT_VALUE}',
        [DATABASE.MySQL]: "`{NAME}` {TYPE}({BASE_LENGTH},{DIGITS}) {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE}({BASE_LENGTH},{DIGITS}) {REQUIRED} {DEFAULT_VALUE}",
    };

    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.MySQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: " CONSTRAINT DC_{CONSTRAINT_NAME} DEFAULT {DEFAULT_VALUE}",
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
        let schema = this.createMap[this.getDatabaseType()];

        if (this.getDefaultValue()) {
            schema = schema.replace("{DEFAULT_VALUE}", this.defaultMap[this.getDatabaseType()]);
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{BASE_LENGTH}", this.baseLength.toString())
            .replace("{DIGITS}", this.getDecimalDigits().toString())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ?? "")
            .replace("{CONSTRAINT_NAME}", this.getIid().replaceAll("-", "_"))
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
