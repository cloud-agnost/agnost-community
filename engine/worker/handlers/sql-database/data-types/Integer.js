import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";
import { SQLBaseManager } from "../../managers/SQLBaseManager.js";

export default class Integer extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE} {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE}",
    };

    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.MySQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: " CONSTRAINT {CONSTRAINT_NAME} DEFAULT {DEFAULT_VALUE}",
    };

    toDefinitionQuery() {
        let schema = this.createMap[this.getDatabaseType()];

        if (/^[0-9]+$/.test(this.getDefaultValue())) {
            schema = schema.replace("{DEFAULT_VALUE}", this.defaultMap[this.getDatabaseType()]);
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ?? "")
            .replace("{CONSTRAINT_NAME}", SQLBaseManager.getDefaultConstraintName(this.getIid()))
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
