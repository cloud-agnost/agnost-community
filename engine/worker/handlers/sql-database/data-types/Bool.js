import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";
import { SQLBaseManager } from "../../managers/SQLBaseManager.js";

export default class Bool extends Field {
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

    getDefaultValue() {
        const defaultValue = super.getDefaultValue();
        const isBool = typeof defaultValue === "boolean";
        if (!isBool) return;

        if (this.type === DATABASE.SQLServer) return super.getDefaultValue() ? "1" : "0";
        return super.getDefaultValue() ? "true" : "false";
    }

    toDefinitionQuery() {
        let schema = this.createMap[this.type];

        if (this.getDefaultValue()) {
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
