import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Json extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: '"{NAME}" {TYPE} {REQUIRED}',
        [DATABASE.MySQL]: "`{NAME}` {TYPE} {REQUIRED}",
        [DATABASE.SQLServer]: "{NAME} {TYPE}({MAX_LENGTH}) {REQUIRED}",
    };

    /**
     * @description Gets the max length of the field
     * @return {number}
     */
    getMaxLength() {
        return config.get("database.jsonMaxLength") ?? 4000;
    }

    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        const schema = this.createMap[this.type];

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{MAX_LENGTH}", this.getMaxLength())
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
