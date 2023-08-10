import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class DateTime extends Field {
    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT CURRENT_TIMESTAMP",
        [DATABASE.MySQL]: " DEFAULT CURRENT_TIMESTAMP",
        [DATABASE.SQLServer]: " DEFAULT CURRENT_TIMESTAMP",
    };

    toDefinitionQuery() {
        let schema = this.createMap[this.getDatabaseType()];

        if (!this.nullableFields.includes(this.getType())) {
            schema += " {REQUIRED}";
        }

        if (this.getType() === "createdat") {
            schema += this.defaultMap[this.getDatabaseType()];
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
