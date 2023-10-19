import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";
import { SQLBaseManager } from "../../managers/SQLBaseManager.js";

export default class DateTime extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE}",
    };

    defaultMap = {
        [DATABASE.PostgreSQL]: " DEFAULT CURRENT_TIMESTAMP",
        [DATABASE.MySQL]: " DEFAULT CURRENT_TIMESTAMP",
        [DATABASE.SQLServer]: " CONSTRAINT {CONSTRAINT_NAME} DEFAULT CURRENT_TIMESTAMP",
    };

    getDefaultValue() {
        /**
         * @type {string}
         */
        const value = super.getDefaultValue();
        if (value === "$$NOW") {
            return this.defaultMap[this.getDatabaseType()];
        }
    }

    toDefinitionQuery() {
        let schema = this.createMap[this.getDatabaseType()];

        if (!this.nullableFields.includes(this.getType())) {
            schema += " {REQUIRED}";
        }

        if (["createdat", "updatedat"].includes(this.getType())) {
            schema += this.defaultMap[this.getDatabaseType()];
        } else {
            if (DATABASE.SQLServer === this.getDatabaseType() && this.getDefaultValue()) {
                schema += " CONSTRAINT {CONSTRAINT_NAME} {DEFAULT_VALUE}";
            } else {
                schema += " {DEFAULT_VALUE}";
            }
        }

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ?? "")
            .replace("{CONSTRAINT_NAME}", SQLBaseManager.getDefaultConstraintName(this.getIid()))
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
