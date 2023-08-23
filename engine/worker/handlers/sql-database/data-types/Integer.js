import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Integer extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE} {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE}",
    };

    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.MySQL]: " DEFAULT {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: " CONSTRAINT DC_{CONSTRAINT_NAME} DEFAULT {DEFAULT_VALUE}",
    };

    toDefinitionQuery() {
        let schema = this.createMap[this.getDatabaseType()];

        if (this.getDefaultValue()) {
            schema = schema.replace("{DEFAULT_VALUE}", this.defaultMap[this.getDatabaseType()]);
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ?? "")
            .replace("{CONSTRAINT_NAME}", this.getIid().replaceAll("-", "_"))
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
