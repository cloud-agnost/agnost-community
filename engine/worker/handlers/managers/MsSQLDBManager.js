import { SQLBaseManager } from "./SQLBaseManager.js";
import fieldMap from "../sql-database/fieldMap.js";
import Model from "../sql-database/Model.js";

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

    /**
     * Rename the table
     * @param {string} oldName - old name of the model
     * @param {string} newName - new name of the model
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<void> | string}
     */
    async renameModel(oldName, newName, returnQuery = false) {
        const SQL = `EXEC sp_rename '${this.getSchemaName()}.${oldName}', '${newName}';`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * Rename the field
     * @param {string} modelName - name of the table
     * @param {string} fieldOldName - old name of the field
     * @param {string} fieldNewName - new name of the field
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]> | string}
     */
    async renameField(modelName, fieldOldName, fieldNewName, returnQuery = false) {
        const SQL = `EXEC sp_rename '${this.getSchemaName()}.${modelName}.${fieldOldName}', '${fieldNewName}', 'COLUMN';`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Add a unique constraint to a column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    addUniqueConstraint(tableName, columnName, returnQuery = false) {
        const constraintName = `uc_${tableName}_${columnName}`.toLowerCase();
        const selectQuery = MsSQLDBManager.CHECK_UNIQUE_CONSTRAINT_SCHEMA.replace("{TABLE_NAME}", tableName)
            .replace("{CONSTRAINT_NAME}", constraintName)
            .replace("{SCHEMA_NAME}", this.getSchemaName());

        const condition = `NOT EXISTS (${selectQuery})`;
        const query = `ALTER TABLE ${this.getSchemaName()}.${tableName} ADD CONSTRAINT ${constraintName} UNIQUE(${columnName});`;
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

    /**
     * @description Drop a unique constraint from the column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    dropUniqueConstraint(tableName, columnName, returnQuery = false) {
        const constraintName = `uc_${tableName}_${columnName}`.toLowerCase();
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * Create a table and with its fields for the model
     * @param {object} model
     * @param {string} model.name
     * @param {object[]} model.fields
     * @return {string}
     */
    createModel({ fields, name }) {
        const model = new Model(name, undefined, this.getSchemaName());

        for (const field of fields) {
            const FieldClass = fieldMap.get(field.type);

            if (!FieldClass) {
                throw new AgnostError(t(`Field type '${field.type}' is not supported`));
            }
            model.addField(new FieldClass(field, this.getDbType()));
        }

        return model.toString();
    }

    /**
     * @description Drop the field from the table
     * @param {string} modelName - name of the table
     * @param {object} field - the field to drop
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]> | string}
     */
    async dropField(modelName, field, returnQuery = false) {
        const DROP_FIELD_QUERY = `ALTER TABLE ${this.getSchemaName()}.${modelName} DROP COLUMN IF EXISTS ${
            field.name
        };`;

        const SQL = [
            await this.dropFullTextIndexByColumn(modelName, field.name, true),
            await this.dropUniqueConstraint(modelName, field.name, true),
            await this.dropIndex(modelName, field.name, true),
            await this.dropForeignKeyConstraint(modelName, field, true),
            await this.dropDefaultConstraint(modelName, field, true),
            DROP_FIELD_QUERY,
            await this.dropFullTextIndexIfDisabled(modelName, true),
        ].join("\n");

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Drop the foreign key constraint from the column
     * @param modelName {string}
     * @param field {object}
     * @param returnQuery {boolean}
     * @return {Promise<Object|[]>|string}
     */
    dropForeignKeyConstraint(modelName, field, returnQuery = false) {
        const FK_NAME = SQLBaseManager.getForeignKeyName(field.iid);
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${modelName} DROP CONSTRAINT IF EXISTS ${FK_NAME};`;
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
        const DC_NAME = `DC_${field.iid.replaceAll("-", "_")}`;
        let SQL = `ALTER TABLE ${this.getSchemaName()}.${modelName} DROP CONSTRAINT IF EXISTS ${DC_NAME};\n`;
        SQL += `DROP DEFAULT IF EXISTS ${DC_NAME};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Drop an index from the column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    dropIndex(tableName, columnName, returnQuery = false) {
        const indexName = `${tableName}_index_${columnName}`.toLowerCase();
        const SQL = `DROP INDEX IF EXISTS ${indexName} ON ${this.getSchemaName()}.${tableName};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Add an index to the column
     * @param tableName
     * @param column
     * @param returnQuery
     * @return {Promise|string}
     */
    addIndex(tableName, column, returnQuery = false) {
        const isGeoPoint = column.type === "geo-point";

        const indexName = `${tableName}_index_${column.name}`.toLowerCase();
        const selectQuery = MsSQLDBManager.CHECK_INDEX_SCHEMA.replace("{TABLE_NAME}", tableName)
            .replace("{INDEX_NAME}", indexName)
            .replace("{SCHEMA_NAME}", this.getSchemaName());

        const condition = `NOT EXISTS(${selectQuery})`;
        const query = `CREATE INDEX ${indexName} ON ${this.getSchemaName()}.${tableName}(${column.name})`;
        const queryWithSpatial = `CREATE SPATIAL INDEX ${indexName} ON ${this.getSchemaName()}.${tableName}(${
            column.name
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
     * @param {string} tableName
     * @param {object[]} fields
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<string | object>}
     */
    async addFullTextIndex(tableName, fields, returnQuery = false) {
        if (!Array.isArray(fields)) throw AgnostError(t(`fields must be an array`));
        let SQL = "";
        if (fields.length === 0) return SQL;

        const catalogName = `agnost_default_fulltext_catalog`;
        const PK_NAME = await this.getPrimaryKeyName(tableName);

        const createCatalogIfNotExists = this.ifWrapper(
            `NOT EXISTS(${MsSQLDBManager.CHECK_CATALOG_SCHEMA.replace("{CATALOG_NAME}", catalogName)})`,
            `CREATE FULLTEXT CATALOG ${catalogName} AS DEFAULT;`
        );

        const fieldsToIndex = fields.map((field) => field.name).join(", ");

        const dropFullTextIndexIfExists = this.ifWrapper(
            `EXISTS(${MsSQLDBManager.CHECK_FULL_TEXT_INDEX_SCHEMA.replace("{TABLE_NAME}", tableName).replace(
                "{SCHEMA_NAME}",
                this.getSchemaName()
            )})`,
            `DROP FULLTEXT INDEX ON ${this.getSchemaName()}.${tableName}`
        );

        const createFullTextIndex = `CREATE FULLTEXT INDEX ON ${this.getSchemaName()}.${tableName}(${fieldsToIndex}) KEY INDEX ${PK_NAME} WITH CHANGE_TRACKING = AUTO;`;

        SQL = [createCatalogIfNotExists, dropFullTextIndexIfExists, createFullTextIndex, "\n"].join("\n");

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Drop the full text index from the table
     * @param {string} tableName
     * @param {string} columnName
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    dropFullTextIndex(tableName, columnName, returnQuery = false) {
        const SQL = this.ifWrapper(
            `EXISTS(${MsSQLDBManager.CHECK_FULL_TEXT_INDEX_SCHEMA.replace(
                "{SCHEMA_NAME}",
                this.getSchemaName()
            ).replace("{TABLE_NAME}", tableName)})`,
            `DROP FULLTEXT INDEX ON ${tableName};`
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropFullTextIndexIfDisabled(tableName, returnQuery = false) {
        const SQL = this.ifWrapper(
            `EXISTS(SELECT is_enabled FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('${this.getSchemaName()}.${tableName}') AND is_enabled = 0)`,
            `DROP FULLTEXT INDEX ON ${this.getSchemaName()}.${tableName};`
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropFullTextIndexByColumn(tableName, columnName, returnQuery = false) {
        const SQL = this.ifWrapper(
            `(SELECT COLUMNPROPERTY(OBJECT_ID('${this.getSchemaName()}.${tableName}'), '${columnName}', 'IsFulltextIndexed')) = 1`,
            `ALTER FULLTEXT INDEX ON ${this.getSchemaName()}.${tableName} DROP (${columnName})`
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

                const onlyConstraint = reference.createConstraint(model.name);
                const withField = reference.createConstraint(model.name, true);

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

    /**
     * Drop the table
     * @param {object} model - the model object
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<void|string>}
     */
    async dropModel(model, returnQuery = false) {
        const SQL = `DROP TABLE IF EXISTS ${this.getSchemaName()}.${model.name};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropForeignKey(modelName, foreignKeyName, returnQuery = false) {
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${modelName} DROP CONSTRAINT IF EXISTS ${foreignKeyName};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     * @description Set the nullability of the field
     * @param modelName {string} - The name of the model
     * @param field {object} - The field to set nullability
     * @param returnQuery {boolean} - return the query or run it
     */
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

    /**
     * Add or drop full text search indexes from the table
     * @param {object} model
     * @param {object[]} fields
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleFullTextSearchIndexes(model, fields, returnQuery = false) {
        const searchableFields = fields.filter((field) => field?.text?.searchable || field?.richText?.searchable);
        let SQL = await this.addFullTextIndex(model.name, searchableFields, returnQuery);

        for (const field of fields) {
            if (!["text", "rich-text"].includes(field.type) || field?.text?.searchable || field?.richText?.searchable) {
                continue;
            }

            const query = (await this.dropFullTextIndex(model.name, field.name, returnQuery)) + "\n";
            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async addDefaultValues(model, field, returnQuery = false) {
        const constraintName = `DC_${field.iid.replace("-", "_")}`;
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
        const constraintName = `DC_${field.iid.replace("-", "_")}`;
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${model.name} DROP CONSTRAINT IF EXISTS ${constraintName};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }
}
