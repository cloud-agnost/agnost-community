import { SQLBaseManager } from "./SQLBaseManager.js";
import connManager from "../../init/connManager.js";
import fieldMap from "../sql-database/fieldMap.js";

export class PostgresDBManager extends SQLBaseManager {
    static CHECK_FIELD_EXISTS =
        "SELECT column_name FROM information_schema.columns WHERE table_name = '{TABLE_NAME}' AND column_name = '{FIELD_NAME}' AND table_schema = '{SCHEMA_NAME}'";

    static CHECK_CONSTRAINT_EXISTS =
        "SELECT constraint_name FROM information_schema.constraint_column_usage WHERE table_name = '{TABLE_NAME}' AND constraint_name = '{CONSTRAINT_NAME}' AND table_schema = '{SCHEMA_NAME}'";

    static CHECK_FOREIGN_KEY_EXISTS =
        "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = '{TABLE_NAME}' AND constraint_name = '{CONSTRAINT_NAME}' AND constraint_type = 'FOREIGN KEY' AND table_schema = '{SCHEMA_NAME}'";

    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);
    }

    getSchemaName() {
        return true ? "public" : "";
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
        await this.runQuery(`CREATE SCHEMA IF NOT EXISTS ${this.getSchemaName()};`);
    }

    async renameModel(oldName, newName, returnQuery = false) {
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${oldName} RENAME TO ${newName};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async renameField(modelName, fieldOldName, fieldNewName, returnQuery = false) {
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${modelName} RENAME COLUMN ${fieldOldName} TO ${fieldNewName};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     *
     * @param databaseName
     * @return {Promise<void>}
     */
    async useDatabase(databaseName, forceNewConnection = false) {
        const config = this.getResourceAccessSettings();

        this.setDatabaseName(databaseName);
        config.database = this.getDatabaseName();

        // In the case of postgres, we need to create a new connection with the new database name,
        // so we need to set true as the 4th parameter of getConn
        this.conn = await connManager.getConn(
            `${this.getDbId()}_${config.database}`,
            this.getDbType(),
            config,
            forceNewConnection
        );
    }

    /**
     * Drop the database
     * @param {string} dbName - name of the database
     * @return {Promise<void>}
     */
    async dropDatabase(dbName) {
        try {
            await connManager.removeConnection(this.getDbId(), this.getDbType());
            await connManager.removeConnection(`${this.getDbId()}_${this.getDatabaseNameToUse()}`, this.getDbType());

            await this.useDatabase("postgres", true);
            return this.runQuery(`DROP DATABASE IF EXISTS ${dbName ?? this.getDatabaseNameToUse()} WITH (FORCE);`);
        } catch (err) {}
    }

    dropForeignKey(model, foreignKeyName, returnQuery = false) {
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${model.name} DROP CONSTRAINT IF EXISTS ${foreignKeyName};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    inTransaction(query) {
        return `DO $$
BEGIN
    ${query}
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE EXCEPTION '%', SQLERRM;
END
$$;`;
    }

    beginTransaction() {}

    endTransaction() {}

    async runQuery(query) {
        let resetQuery = true;
        let SQL = this.getQuery();

        if (query) {
            resetQuery = false;
            SQL = query;
        }

        const hasSQL = SQL.trim().length > 0;
        if (!hasSQL) return;

        /**
         * @type {BoundPool}
         */
        const conn = await this.getConn();

        // TODO - Remove this
        if (hasSQL) {
            console.log("-------------- QUERY START --------------");
            console.log(SQL.trim());
            console.log("-------------- QUERY END --------------");
        }

        const result = await conn.query(SQL);

        this.addLog(t("Query executed successfully"));
        if (resetQuery) {
            console.log("============== RESET QUERY ==============");
            this.resetQuery();
        }
        return result;
    }

    /**
     * @description Get all tables in a database
     * @returns {Promise<[]>} - The tables in the database
     * @throws Rejects when the query fails or database name is not provided or the query fails
     */
    async getExistingModels() {
        const { rows } = await this.runQuery(
            `SELECT table_name as name FROM information_schema.tables WHERE table_type = 'BASE TABLE' and table_schema = '${this.getSchemaName()}';`
        );
        if (Array.isArray(rows)) return rows.map((table) => table.name);
        return [];
    }

    /**
     * @description Get all databases in a server
     * @return {Promise<[]>}
     * @throws Rejects when the query fails
     */
    async getExistingDatabases() {
        const { rows } = await this.runQuery(`SELECT datname as name FROM pg_database;`);
        if (Array.isArray(rows)) return rows.map((database) => database.name);
        return [];
    }

    addUniqueConstraint(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getUniqueIndexName(field.iid);
        const condition = PostgresDBManager.CHECK_CONSTRAINT_EXISTS.replace("{TABLE_NAME}", model.name)
            .replace("{CONSTRAINT_NAME}", constraintName)
            .replace("{SCHEMA_NAME}", this.getSchemaName());

        const query = `ALTER TABLE ${model.name} ADD CONSTRAINT ${constraintName} UNIQUE(${field.name});`;
        const SQL = this.ifWrapper(`NOT EXISTS(${condition})`, query);

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropUniqueConstraint(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getUniqueIndexName(field.iid);
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${model.name} DROP CONSTRAINT IF EXISTS ${constraintName};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getIndexName(field.iid);
        const SQL = `DROP INDEX IF EXISTS ${indexName};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addIndex(model, field, returnQuery = false) {
        const isGeoPoint = field.type === "geo-point";
        const indexName = SQLBaseManager.getIndexName(field.iid);

        const SQL = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${this.getSchemaName()}.${model.name} USING ${
            isGeoPoint ? "GIST" : "BTREE"
        }(${field.name});`;

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    addFullTextIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getFullTextIndexName(field.iid);
        let language = "english";

        if (field.type === "text") {
            language = field?.text?.language ?? "english";
        } else if (field.type === "rich-text") {
            language = field?.richText?.language ?? "english";
        }

        const SQL = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${this.getSchemaName()}.${
            model.name
        } USING GIN(to_tsvector('${language}', ${field.name}));`;

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    dropFullTextIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getFullTextIndexName(field.iid);
        const SQL = `DROP INDEX IF EXISTS ${indexName};`;

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    createField(modelName, fields, returnQuery = false) {
        const SQL =
            fields
                .map((field) => {
                    return `ALTER TABLE ${this.getSchemaName()}.${modelName} ADD COLUMN IF NOT EXISTS ${field.toDefinitionQuery()};`;
                })
                .join("\n") + "\n";

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    createForeignKeyQuery(modelsWithRefs) {
        const Ref = fieldMap.get("reference");
        if (!Ref || modelsWithRefs.length === 0) return "";

        let addFieldQuery = "";

        for (let model of modelsWithRefs) {
            for (let field of model.fields) {
                const reference = new Ref(field, this.getDbType());

                const foreignName = SQLBaseManager.getForeignKeyName(field.iid);

                const onlyConstraint = reference.createConstraint(this.getModelNameWithSchema(model.name));
                const withField = reference.createConstraint(this.getModelNameWithSchema(model.name), true);

                const fieldCondition = PostgresDBManager.CHECK_FIELD_EXISTS.replace(
                    "{TABLE_NAME}",
                    model.name.toLowerCase()
                )
                    .replace("{FIELD_NAME}", field.name.toLowerCase())
                    .replace("{SCHEMA_NAME}", this.getSchemaName());

                const foreignKeyCondition = PostgresDBManager.CHECK_FOREIGN_KEY_EXISTS.replace(
                    "{TABLE_NAME}",
                    model.name.toLowerCase()
                )
                    .replace("{CONSTRAINT_NAME}", foreignName)
                    .replace("{SCHEMA_NAME}", this.getSchemaName());

                addFieldQuery += `IF EXISTS(${fieldCondition}) AND NOT EXISTS(${foreignKeyCondition}) THEN ${onlyConstraint} END IF; \n`;
                addFieldQuery += `IF NOT EXISTS(${fieldCondition}) THEN ${withField} END IF;`;
            }
        }

        return this.doWrapper(addFieldQuery);
    }

    async dropModel(model, returnQuery = false) {
        const SQL = `DROP TABLE IF EXISTS ${this.getSchemaName()}.${model.name} CASCADE;`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    ifWrapper(conditionQuery, query) {
        if (!query || !conditionQuery) {
            throw new AgnostError(t("Query and conditionQuery are required"));
        }

        return `DO $$
BEGIN
    IF ${conditionQuery} THEN
        ${query}
    END IF;
END $$;`;
    }

    doWrapper(query) {
        if (query.trim().length === 0) return "";

        return `DO $$
BEGIN
        ${query}
END $$;`;
    }

    async dropField(model, field, returnQuery = false) {
        const schema = "ALTER TABLE {SCHEMA_NAME}.{TABLE_NAME} DROP COLUMN IF EXISTS {COLUMN_NAME};";

        const SQL = schema
            .replace("{TABLE_NAME}", model.name)
            .replace("{COLUMN_NAME}", field.name)
            .replace("{SCHEMA_NAME}", this.getSchemaName());

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

        const SQL = `ALTER TABLE ${this.getSchemaName()}.${modelName} ALTER COLUMN ${field.name} ${
            refField.isRequired() ? "SET NOT NULL" : "DROP NOT NULL"
        };`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addDefaultValues(model, field, returnQuery = false) {
        const isString = typeof field.defaultValue === "string";
        const isNumber = isString && !isNaN(Number(field.defaultValue));
        const defaultValue = isString && !isNumber ? `'${field.defaultValue}'` : field.defaultValue;

        const SQL = `ALTER TABLE ${this.getSchemaName()}.${model.name} ALTER COLUMN ${
            field.name
        } SET DEFAULT ${defaultValue};`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    removeDefaultValues(model, field, returnQuery = false) {
        const SQL = `ALTER TABLE ${this.getSchemaName()}.${model.name} ALTER COLUMN ${field.name} DROP DEFAULT;`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }
}
