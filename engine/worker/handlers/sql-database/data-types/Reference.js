import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Reference extends Field {
    getReferenceModelIid() {
        return this.config?.reference?.iid;
    }

    afterQuery = {
        [DATABASE.MySQL]:
            `ALTER TABLE {{TABLE_NAME}} ADD COLUMN {{COLUMN_NAME}} ${
                this.versions[DATABASE.MySQL]
            };` + "\n",
        [DATABASE.PostgreSQL]:
            `ALTER TABLE {{TABLE_NAME}} ADD COLUMN {{COLUMN_NAME}} ${
                this.versions[DATABASE.PostgreSQL]
            };` + "\n",
        [DATABASE.SQLServer]:
            `ALTER TABLE {{TABLE_NAME}} ADD {{COLUMN_NAME}} ${
                this.versions[DATABASE.SQLServer]
            };` + "\n",
    };

    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        return (
            this.getName() +
            " " +
            this.versions[this.adapter] +
            `, CONSTRAINT FK_${this.getName()} FOREIGN KEY(${this.getName()}) REFERENCES ${
                this.config.reference.modelName
            }(${this.defaultField})` +
            this.onDelete() +
            this.onUpdate()
        );
    }

    afterCreateQuery(tableName) {
        const foreignTable = this.config.reference.modelName;
        const foreignName = `fk_${tableName}_${foreignTable}`;

        let SQL = this.afterQuery[this.adapter]
            .replaceAll("{{TABLE_NAME}}", tableName)
            .replaceAll("{{COLUMN_NAME}}", this.getName());

        SQL += `ALTER TABLE ${tableName} ADD CONSTRAINT ${foreignName} FOREIGN KEY (${this.getName()}) REFERENCES ${foreignTable}(${
            this.defaultField
        })`;

        SQL += this.onDelete();
        SQL += this.onUpdate();

        SQL += ";";

        return SQL;
    }

    /**
     * @description Returns the onDelete part of the query
     * @private
     */
    onDelete() {
        if (this.config.reference.onDelete) {
            return ` ON DELETE ${this.config.reference.onDelete}`;
        }
        return "";
    }

    /**
     * @description Returns the onUpdate part of the query
     * @private
     */
    onUpdate() {
        if (this.config.reference.onUpdate) {
            return ` ON UPDATE ${this.config.reference.onUpdate}`;
        }
        return "";
    }
}
