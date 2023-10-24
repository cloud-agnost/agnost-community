import Field from "./Field.js";
import { SQLBaseManager } from "../../managers/SQLBaseManager.js";
import { DATABASE } from "../../../config/constants.js";

export default class Reference extends Field {
    defaultField = "id";

    defaultMap = {
        [DATABASE.PostgreSQL]: {
            CREATE: " DEFAULT {DEFAULT_VALUE}",
            ALTER: "ALTER TABLE {TABLE_NAME} ALTER COLUMN {FIELD_NAME} SET DEFAULT {DEFAULT_VALUE};",
        },
        [DATABASE.MySQL]: {
            CREATE: " DEFAULT {DEFAULT_VALUE}",
            ALTER: "ALTER TABLE {TABLE_NAME} ALTER {FIELD_NAME} SET DEFAULT {DEFAULT_VALUE};",
        },
        [DATABASE.SQLServer]: {
            CREATE: " CONSTRAINT {CONSTRAINT_NAME} DEFAULT {DEFAULT_VALUE}",
            ALTER: "ALTER TABLE {TABLE_NAME} ADD CONSTRAINT {CONSTRAINT_NAME} DEFAULT {DEFAULT_VALUE} FOR {FIELD_NAME};",
        },
    };

    dbMap = {
        [DATABASE.SQLServer]: {
            CREATE_SCHEMA: "ALTER TABLE {TABLE_NAME} ADD {FIELD_NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE};",
            CREATE_CONSTRAINT_SCHEMA:
                "ALTER TABLE {TABLE_NAME} ADD CONSTRAINT {FOREIGN_NAME} FOREIGN KEY ({FIELD_NAME}) REFERENCES {FOREIGN_TABLE}({DEFAULT_FIELD}) ON DELETE {ACTION};" +
                "\n" +
                "{DEFAULT_VALUE}",
        },
        [DATABASE.PostgreSQL]: {
            CREATE_SCHEMA: "ALTER TABLE {TABLE_NAME} ADD COLUMN {FIELD_NAME} {TYPE} {REQUIRED} {DEFAULT_VALUE};",
            CREATE_CONSTRAINT_SCHEMA:
                "ALTER TABLE {TABLE_NAME} ADD CONSTRAINT {FOREIGN_NAME} FOREIGN KEY ({FIELD_NAME}) REFERENCES {FOREIGN_TABLE}({DEFAULT_FIELD}) ON DELETE {ACTION};" +
                "\n" +
                "{DEFAULT_VALUE}",
        },
        [DATABASE.MySQL]: {
            CREATE_SCHEMA: "ALTER TABLE {TABLE_NAME} ADD COLUMN `{FIELD_NAME}` {TYPE} {REQUIRED} {DEFAULT_VALUE};",
            CREATE_CONSTRAINT_SCHEMA:
                "ALTER TABLE {TABLE_NAME} ADD CONSTRAINT {FOREIGN_NAME} FOREIGN KEY ({FIELD_NAME}) REFERENCES {FOREIGN_TABLE}({DEFAULT_FIELD}) ON DELETE {ACTION};" +
                "\n" +
                "{DEFAULT_VALUE}",
        },
    };

    createMap = {
        [DATABASE.PostgreSQL]: "{NAME} {TYPE} {REQUIRED}",
        [DATABASE.MySQL]: "`{NAME}` {TYPE} {REQUIRED}",
        [DATABASE.SQLServer]: "{NAME} {TYPE} {REQUIRED}",
    };

    isIndexed() {
        return false;
    }

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

    /**
     *
     * @param modelName {string}
     * @param createField {boolean}
     * @return {string}
     */
    createConstraint(modelName, createField = false) {
        const foreignTable = this.getReferenceModelName();
        const foreignName = SQLBaseManager.getForeignKeyName(this.getIid());

        let createFieldSchema = this.dbMap[this.getDatabaseType()].CREATE_SCHEMA;
        let createConstraintSchema = this.dbMap[this.getDatabaseType()].CREATE_CONSTRAINT_SCHEMA;

        let schema = createConstraintSchema;

        if (createField) {
            if (this.getDefaultValue()) {
                createConstraintSchema = createConstraintSchema.replace("{DEFAULT_VALUE}", "");
                createFieldSchema = createFieldSchema.replace(
                    "{DEFAULT_VALUE}",
                    this.defaultMap[this.getDatabaseType()].CREATE
                );
            }

            schema = `${createFieldSchema} ${createConstraintSchema}`;
        } else {
            if (this.getDefaultValue()) {
                schema = schema.replace("{DEFAULT_VALUE}", this.defaultMap[this.getDatabaseType()].ALTER);
            }
        }

        return schema
            .replaceAll("{TABLE_NAME}", modelName)
            .replaceAll("{TYPE}", this.getDbType())
            .replaceAll("{FOREIGN_NAME}", foreignName)
            .replaceAll("{FIELD_NAME}", this.getName())
            .replaceAll("{DEFAULT_VALUE}", this.getDefaultValue() ?? "")
            .replaceAll("{CONSTRAINT_NAME}", SQLBaseManager.getDefaultConstraintName(this.getIid()))
            .replaceAll("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL")
            .replaceAll("{FOREIGN_TABLE}", foreignTable)
            .replaceAll("{DEFAULT_FIELD}", this.defaultField)
            .replaceAll("{ACTION}", this.getAction());
    }

    toDefinitionQueryForModify() {
        const schema = this.createMap[this.type];

        return schema
            .replace("{NAME}", this.getName())
            .replace("{TYPE}", this.getDbType())
            .replace("{REQUIRED}", this.isRequired() ? "NOT NULL" : "NULL");
    }
}
