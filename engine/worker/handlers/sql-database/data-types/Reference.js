import Field from "./Field.js";
import { SQLBaseManager } from "../../managers/SQLBaseManager.js";

export default class Reference extends Field {
    defaultField = "id";

    getReferenceModelIid() {
        return this.options?.reference?.iid;
    }

    getReferenceModelName() {
        return this.options?.reference?.modelName;
    }

    getAction() {
        return this.options?.reference?.action;
    }

    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        throw new AgnostError("toDefinitionQuery not implemented for Reference and will not be used.");
    }

    createConstraint(modelName, createField = false) {
        const foreignTable = this.getReferenceModelName();
        const foreignName = SQLBaseManager.getForeignKeyName(this.getIid());

        const createFieldSchema = "ALTER TABLE {TABLE_NAME} ADD COLUMN `{FIELD_NAME}` {TYPE} {REQUIRED};";

        const createConstraintSchema =
            "ALTER TABLE {TABLE_NAME} ADD CONSTRAINT {FOREIGN_NAME} FOREIGN KEY ({FIELD_NAME}) REFERENCES {FOREIGN_TABLE}({DEFAULT_FIELD}) ON DELETE {ACTION};";

        let schema = createConstraintSchema;

        if (createField) {
            schema = `${createFieldSchema} ${createConstraintSchema}`;
        }

        return schema
            .replaceAll("{TABLE_NAME}", modelName)
            .replaceAll("{TYPE}", this.getDbType())
            .replaceAll("{FOREIGN_NAME}", foreignName)
            .replaceAll("{FIELD_NAME}", this.getName())
            .replaceAll("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL")
            .replaceAll("{FOREIGN_TABLE}", foreignTable)
            .replaceAll("{DEFAULT_FIELD}", this.defaultField)
            .replaceAll("{ACTION}", this.getAction());
    }

    toDefinitionQueryForModify() {
        let schema = "`{NAME}` {TYPE} {REQUIRED}";

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
