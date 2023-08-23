import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class DateTime extends Field {
    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT CURRENT_TIMESTAMP",
        [DATABASE.MySQL]: " DEFAULT CURRENT_TIMESTAMP",
        [DATABASE.SQLServer]: " CONSTRAINT DC_{CONSTRAINT_NAME} DEFAULT CURRENT_TIMESTAMP",
    };

    toDefinitionQuery() {
        let schema = this.createMap[this.getDatabaseType()];

        if (!this.nullableFields.includes(this.getType())) {
            schema += " {REQUIRED}";
        }

        if (["createdat", "updatedat"].includes(this.getType())) {
            schema += this.defaultMap[this.getDatabaseType()];
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{CONSTRAINT_NAME}", `${this.getIid().replaceAll("-", "_")}`)
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
