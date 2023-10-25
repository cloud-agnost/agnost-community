import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Id extends Field {
    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE} PRIMARY KEY",
        [DATABASE.MySQL]: "`{NAME}` {TYPE} AUTO_INCREMENT PRIMARY KEY",
        [DATABASE.SQLServer]: "{NAME} {TYPE} IDENTITY(1,1) PRIMARY KEY",
    };

    isIndexed() {
        return false;
    }

    isUnique() {
        return false;
    }

    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        const schema = this.createMap[this.type];

        return schema.replaceAll("{NAME}", this.getName()).replaceAll("{TYPE}", this.getDbType());
    }
}
