import { SQLBaseManager } from "./SQLBaseManager.js";
import fieldMap from "../sql-database/fieldMap.js";

export class MsSQLDBManager extends SQLBaseManager {
    static CHECK_UNIQUE_CONSTRAINT_SCHEMA =
        "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME='{TABLE_NAME}' AND CONSTRAINT_TYPE='UNIQUE' AND CONSTRAINT_NAME='{CONSTRAINT_NAME}' AND CONSTRAINT_SCHEMA = '{SCHEMA_NAME}'";

    static CHECK_FOREIGN_KEY_CONSTRAINT_SCHEMA =
        "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME='{TABLE_NAME}' AND CONSTRAINT_TYPE='FOREIGN KEY' AND CONSTRAINT_NAME='{CONSTRAINT_NAME}' AND CONSTRAINT_SCHEMA = '{SCHEMA_NAME}'";

    static CHECK_INDEX_SCHEMA =
        "SELECT name FROM sys.indexes WHERE name = '{INDEX_NAME}' AND object_id = OBJECT_ID('{SCHEMA_NAME}.{TABLE_NAME}')";

    static CHECK_CATALOG_SCHEMA = "SELECT name FROM sys.fulltext_catalogs WHERE name = '{CATALOG_NAME}'";

    static CHECK_FIELD_SCHEMA =
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{TABLE_NAME}' AND COLUMN_NAME = '{FIELD_NAME}' AND TABLE_SCHEMA = '{SCHEMA_NAME}'";

    static CHECK_FULL_TEXT_INDEX_SCHEMA =
        "SELECT object_id FROM sys.fulltext_indexes WHERE object_id =  OBJECT_ID('{SCHEMA_NAME}.{TABLE_NAME}')";

    static CHECK_SCHEMA = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{SCHEMA_NAME}'";

    static CHECK_TABLE_SCHEMA =
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '{SCHEMA_NAME}' AND TABLE_NAME = '{TABLE_NAME}'";

    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);
    }

    getSchemaName() {
        return true ? "dbo" : "";
    }

    async useDatabase(databaseName) {
        this.setDatabaseName(databaseName);
    }

    /**
     * Create the database
     * @return {Promise<void>}
     * @throws Rejects when the query fails or database already exists;
     */
    async createDatabase() {
        const dbName = this.getDatabaseNameToUse();

        if (await this.isDatabaseExists(dbName)) {
            await this.useDatabase(dbName);
            return;
        }

        await this.runQuery(`CREATE DATABASE ${dbName};`);
        this.addLog(t("Created the database"));
        await this.useDatabase(dbName);
        await this.runQuery(
            this.ifWrapper(
                `NOT EXISTS(${MsSQLDBManager.CHECK_SCHEMA.replace("{SCHEMA_NAME}", this.getSchemaName())})`,
                `EXEC('CREATE SCHEMA ${this.getSchemaName()}')`
            )
        );
    }

    beginSession() {}
    endSession() {}
    async runQuery(query) {
        let resetQuery = true;
        let SQL = this.getQuery();

        if (query) {
            resetQuery = false;
            SQL = query;
        }

        const hasSQL = SQL.trim().length > 0;
        if (!hasSQL) return;

        if (this.getDatabaseName()) {
            SQL = `USE ${this.getDatabaseName()};\n` + SQL;
        }

        /**
         * @type {import("mssql").ConnectionPool}
         */
        const conn = await this.getConn();

        // TODO - Remove this
        if (hasSQL) {
            console.log("-------------- QUERY START --------------");
            console.log(SQL.trim());
            console.log("-------------- QUERY END --------------");
        }

        const result = await conn.request().query(SQL);
        this.addLog(t("Query executed successfully"));
        if (resetQuery) {
            console.log("============== RESET QUERY ==============");
            this.resetQuery();
        }
        return result;
    }

    async renameModel(oldName, newName, returnQuery = false) {
        const SQL = `EXEC sp_rename '${this.getSchemaName()}.${oldName}', '${newName}';`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async renameField(modelName, fieldOldName, fieldNewName, returnQuery = false) {
        const SQL = `EXEC sp_rename '${this.getSchemaName()}.${modelName}.${fieldOldName}', '${fieldNewName}', 'COLUMN';`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addUniqueConstraint(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getUniqueIndexName(field.iid);
        const selectQuery = MsSQLDBManager.CHECK_UNIQUE_CONSTRAINT_SCHEMA.replace("{TABLE_NAME}", model.name)
            .replace("{CONSTRAINT_NAME}", constraintName)
            .replace("{SCHEMA_NAME}", this.getSchemaName());

        const condition = `NOT EXISTS (${selectQuery})`;
        const query = `ALTER TABLE ${this.getSchemaName()}.${model.name} ADD CONSTRAINT ${constraintName} UNIQUE(${
            field.name
        });`;
        const SQL = this.ifWrapper(condition, query);

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    ifWrapper(condition, query) {
        return `IF ${condition} BEGIN \n\t${query} \nEND; \n`;
    }

    /**
     * @description Drop the database
     * @param {string?} dbName
     * @return {Promise<Object|[]>}
     */
    async dropDatabase(dbName) {
        const db = dbName ?? this.getDatabaseNameToUse();
        await this.useDatabase("master");

        const condition = `EXISTS(SELECT name FROM master.sys.databases WHERE name = '${db}')`;
        const query = `ALTER DATABASE ${db} SET SINGLE_USER WITH ROLLBACK IMMEDIATE;\nDROP DATABASE IF EXISTS ${db};\n`;

        const SQL = this.ifWrapper(condition, query);
        return this.runQuery(SQL);
    }

    /**
     * @description List all the tables in the database
     * @return {Promise<string[]>}
     */
    async getExistingModels() {
        const result = await this.runQuery(
            `SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${this.getSchemaName()}';`
        );
        if (Array.isArray(result?.recordset)) return result?.recordset?.map((table) => table.name);
        return [];
    }

    /**
     * @description List all the databases
     * @return {Promise<string[]>}
     */
    async getExistingDatabases() {
        const result = await this.runQuery(`SELECT name FROM sys.databases;`);
        if (Array.isArray(result?.recordset)) return result?.recordset?.map((database) => database.name);
        return [];
    }

    dropUniqueConstraint(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getUniqueIndexName(field.iid);
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${model.name} DROP CONSTRAINT IF EXISTS ${constraintName};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async dropField(model, field, returnQuery = false) {
        const DROP_FIELD_QUERY = `ALTER TABLE ${this.getSchemaName()}.${model.name} DROP COLUMN IF EXISTS ${
            field.name
        };`;

        const SQL = [
            await this.dropFullTextIndexByColumn(model.name, field.name, true),
            await this.dropUniqueConstraint(model, field, true),
            await this.dropIndex(model, field, true),
            await this.dropForeignKey(model, SQLBaseManager.getForeignKeyName(field.iid), true),
            await this.dropDefaultConstraint(model.name, field, true),
            DROP_FIELD_QUERY,
            await this.dropFullTextIndexIfDisabled(model.name, true),
        ].join("\n");

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Drop the default constraint from the column
     * @param modelName {string}
     * @param field {object}
     * @param returnQuery {boolean}
     * @return {Promise<Object|[]>|string}
     */
    dropDefaultConstraint(modelName, field, returnQuery = false) {
        const DC_NAME = SQLBaseManager.getDefaultConstraintName(field.iid);
        let SQL = `ALTER TABLE ${this.getSchemaName()}.${modelName} DROP CONSTRAINT IF EXISTS ${DC_NAME};\n`;
        SQL += `DROP DEFAULT IF EXISTS ${DC_NAME};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getIndexName(field.iid);
        const SQL = `DROP INDEX IF EXISTS ${indexName} ON ${this.getSchemaName()}.${model.name};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addIndex(model, field, returnQuery = false) {
        const isGeoPoint = field.type === "geo-point";
        const indexName = SQLBaseManager.getIndexName(field.iid);

        const selectQuery = MsSQLDBManager.CHECK_INDEX_SCHEMA.replace("{TABLE_NAME}", model.name)
            .replace("{INDEX_NAME}", indexName)
            .replace("{SCHEMA_NAME}", this.getSchemaName());

        const condition = `NOT EXISTS(${selectQuery})`;
        const query = `CREATE INDEX ${indexName} ON ${this.getSchemaName()}.${model.name}(${field.name})`;
        const queryWithSpatial = `CREATE SPATIAL INDEX ${indexName} ON ${this.getSchemaName()}.${model.name}(${
            field.name
        })`;
        const SQL = this.ifWrapper(condition, isGeoPoint ? queryWithSpatial : query);

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Get the primary key name of the table
     * @param tableName
     * @return {Promise<string>}
     */
    async getPrimaryKeyName(tableName) {
        const { recordset } = await this.runQuery(
            `SELECT name FROM sys.indexes WHERE object_id = OBJECT_ID('${this.getSchemaName()}.${tableName}') AND is_primary_key = 1;`
        );

        return recordset[0]?.name;
    }

    /**
     * @description Add a full text index to the table
     * @param {object} model
     * @param {object[]} fields
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<string | object>}
     */
    async addFullTextIndex(model, fields, returnQuery = false) {
        if (!Array.isArray(fields)) throw AgnostError(t(`fields must be an array`));
        let SQL = "";
        if (fields.length === 0) return SQL;

        const catalogName = `agnost_default_fulltext_catalog`;
        const PK_NAME = await this.getPrimaryKeyName(model.name);

        const createCatalogIfNotExists = this.ifWrapper(
            `NOT EXISTS(${MsSQLDBManager.CHECK_CATALOG_SCHEMA.replace("{CATALOG_NAME}", catalogName)})`,
            `CREATE FULLTEXT CATALOG ${catalogName} AS DEFAULT;`
        );

        const fieldsToIndex = fields.map((field) => field.name).join(", ");

        const dropFullTextIndexIfExists = this.ifWrapper(
            `EXISTS(${MsSQLDBManager.CHECK_FULL_TEXT_INDEX_SCHEMA.replace("{TABLE_NAME}", model.name).replace(
                "{SCHEMA_NAME}",
                this.getSchemaName()
            )})`,
            `DROP FULLTEXT INDEX ON ${this.getSchemaName()}.${model.name}`
        );

        const createFullTextIndex = `CREATE FULLTEXT INDEX ON ${this.getSchemaName()}.${
            model.name
        }(${fieldsToIndex}) KEY INDEX ${PK_NAME} WITH CHANGE_TRACKING = AUTO;`;

        SQL = [createCatalogIfNotExists, dropFullTextIndexIfExists, createFullTextIndex, "\n"].join("\n");

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropFullTextIndex(model, field, returnQuery = false) {
        const SQL = this.ifWrapper(
            `EXISTS(${MsSQLDBManager.CHECK_FULL_TEXT_INDEX_SCHEMA.replace(
                "{SCHEMA_NAME}",
                this.getSchemaName()
            ).replace("{TABLE_NAME}", model.name)})`,
            `DROP FULLTEXT INDEX ON ${model.name};`
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     *
     * @param modelName {string}
     * @param returnQuery {boolean}
     * @return {Promise<Object|[]>|string}
     */
    dropFullTextIndexIfDisabled(modelName, returnQuery = false) {
        const SQL = this.ifWrapper(
            `EXISTS(SELECT is_enabled FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('${this.getSchemaName()}.${modelName}') AND is_enabled = 0)`,
            `DROP FULLTEXT INDEX ON ${this.getSchemaName()}.${modelName};`
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     *
     * @param modelName {string}
     * @param fieldName {string}
     * @param returnQuery {boolean}
     * @return {Promise<Object|[]>|string}
     */
    dropFullTextIndexByColumn(modelName, fieldName, returnQuery = false) {
        const SQL = this.ifWrapper(
            `(SELECT COLUMNPROPERTY(OBJECT_ID('${this.getSchemaName()}.${modelName}'), '${fieldName}', 'IsFulltextIndexed')) = 1`,
            `ALTER FULLTEXT INDEX ON ${this.getSchemaName()}.${modelName} DROP (${fieldName})`
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    createField(modelName, fields, returnQuery = false) {
        let SQL = "";

        for (let field of fields) {
            const schema = MsSQLDBManager.CHECK_FIELD_SCHEMA.replace("{TABLE_NAME}", modelName)
                .replace("{FIELD_NAME}", field.getName())
                .replace("{SCHEMA_NAME}", this.getSchemaName());

            SQL += this.ifWrapper(
                `NOT EXISTS(${schema})`,
                `ALTER TABLE ${this.getSchemaName()}.${modelName} ADD ${field.toDefinitionQuery()};`
            );
        }

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    createForeignKeyQuery(modelsWithRefs) {
        const Ref = fieldMap.get("reference");
        if (modelsWithRefs.length === 0 || !Ref) return "";

        let SQL = "";
        for (let model of modelsWithRefs) {
            for (let field of model.fields) {
                const reference = new Ref(field, this.getDbType());
                const foreignName = SQLBaseManager.getForeignKeyName(field.iid);

                const onlyConstraint = reference.createConstraint(this.getModelNameWithSchema(model.name));
                const withField = reference.createConstraint(this.getModelNameWithSchema(model.name), true);

                const condition = MsSQLDBManager.CHECK_FIELD_SCHEMA.replace("{TABLE_NAME}", model.name)
                    .replace("{FIELD_NAME}", field.name)
                    .replace("{SCHEMA_NAME}", this.getSchemaName());

                const foreignKeyCondition = MsSQLDBManager.CHECK_FOREIGN_KEY_CONSTRAINT_SCHEMA.replace(
                    "{TABLE_NAME}",
                    model.name
                )
                    .replace("{CONSTRAINT_NAME}", foreignName)
                    .replace("{SCHEMA_NAME}", this.getSchemaName());

                SQL +=
                    this.ifWrapper(`EXISTS(${condition}) AND NOT EXISTS(${foreignKeyCondition})`, onlyConstraint) +
                    "\n";
                SQL += this.ifWrapper(`NOT EXISTS(${condition})`, withField);
            }
        }

        return SQL;
    }

    async dropModel(model, returnQuery = false) {
        const SQL = `DROP TABLE IF EXISTS ${this.getSchemaName()}.${model.name};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropForeignKey(model, foreignKeyName, returnQuery = false) {
        const SQL = `ALTER TABLE ${this.getModelNameWithSchema(model.name)} DROP CONSTRAINT IF EXISTS ${FK_NAME};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    setNullability(modelName, field, returnQuery = false) {
        const FieldType = fieldMap.get(field.type);
        if (!FieldType) throw new AgnostError(t(`Field type '${field.type}' is not supported`));
        /**
         * @type {Field}
         */
        const refField = new FieldType(field, this.getDbType());

        const SQL = `ALTER TABLE ${this.getSchemaName()}.${modelName} ALTER COLUMN ${refField.toDefinitionQueryForModify()};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async handleFullTextSearchIndexes(model, fields, returnQuery = false) {
        const searchableFields = fields.filter((field) => field?.text?.searchable || field?.richText?.searchable);
        let SQL = await this.addFullTextIndex(model, searchableFields, returnQuery);

        for (const field of fields) {
            if (!["text", "rich-text"].includes(field.type) || field?.text?.searchable || field?.richText?.searchable) {
                continue;
            }

            const query = (await this.dropFullTextIndex(model, field, returnQuery)) + "\n";
            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async addDefaultValues(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getDefaultConstraintName(field.iid);
        const isString = typeof field.defaultValue === "string";
        const isNumber = isString && !isNaN(Number(field.defaultValue));
        const defaultValue = isString && !isNumber ? `'${field.defaultValue}'` : field.defaultValue;

        let SQL = (await this.removeDefaultValues(model, field, true)) + "\n";
        SQL += `ALTER TABLE ${this.getSchemaName()}.${
            model.name
        } ADD CONSTRAINT ${constraintName} DEFAULT ${defaultValue} FOR ${field.name};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    removeDefaultValues(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getDefaultConstraintName(field.iid);
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${model.name} DROP CONSTRAINT IF EXISTS ${constraintName};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async handleModelsDrop(deletedModels, returnQuery = false) {
        let SQL = "";

        for (const model of deletedModels) {
            let ifQuery = "";
            for (let field of model.fields) {
                let query = "";

                if (field.type === "reference") {
                    ifQuery = MsSQLDBManager.CHECK_TABLE_SCHEMA.replace("{SCHEMA_NAME}", this.getSchemaName()).replace(
                        "{TABLE_NAME}",
                        model.name
                    );
                    query += this.dropForeignKey(model, SQLBaseManager.getForeignKeyName(field.iid), true) + "\n";
                }

                SQL += (ifQuery ? this.ifWrapper(`EXISTS(${ifQuery})`, query) : query) + "\n";
            }
        }

        for (const model of deletedModels) {
            const query = await this.dropModel(model, returnQuery);
            SQL += query + "\n";
        }

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }
}
