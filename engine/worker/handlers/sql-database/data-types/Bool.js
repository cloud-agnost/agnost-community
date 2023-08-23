import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Bool extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE} {REQUIRED} {DEFAULT_VALUE}",
        [DATABASE.SQLServer]: "{NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE}",
    };

    getDefaultValue() {
        return super.getDefaultValue() ? "true" : "false";
    }

    toDefinitionQuery() {
        const schema = this.createMap[this.type];

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{DEFAULT_VALUE}", this.getDefaultValue() ? `DEFAULT ${this.getDefaultValue()}` : "")
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
