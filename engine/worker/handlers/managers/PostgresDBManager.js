import { SQLBaseManager } from "./SQLBaseManager.js";
import connManager from "../../init/connManager.js";
import fieldMap from "../sql-database/fieldMap.js";

export class PostgresDBManager extends SQLBaseManager {
    static CHECK_FIELD_EXISTS =
        "SELECT column_name FROM information_schema.columns WHERE table_name = '{TABLE_NAME}' AND column_name = '{FIELD_NAME}'";

    static CHECK_CONSTRAINT_EXISTS =
        "SELECT constraint_name FROM information_schema.constraint_column_usage WHERE table_name = '{TABLE_NAME}' AND constraint_name = '{CONSTRAINT_NAME}'";

    static CHECK_FOREIGN_KEY_EXISTS =
        "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = '{TABLE_NAME}' AND constraint_name = '{CONSTRAINT_NAME}' AND constraint_type = 'FOREIGN KEY'";

    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);
    }

    /**
     *
     * @param databaseName
     * @return {Promise<void>}
     */
    async useDatabase(databaseName) {
        const config = this.getResourceAccessSettings();

        this.setDatabaseName(databaseName);
        config.database = this.getDatabaseName();

        // In the case of postgres, we need to create a new connection with the new database name,
        // so we need to set true as the 4th parameter of getConn
        this.conn = await connManager.getConn(this.getDbId(), this.getDbType(), config, true);
    }
    /**
     * Drop the database
     * @param {string} dbName - name of the database
     * @return {Promise<void>}
     */
    async dropDatabase(dbName) {
        await this.useDatabase("postgres");
        return this.runQuery(`DROP DATABASE IF EXISTS ${dbName ?? this.getDbName()} WITH (FORCE);`);
    }

    dropForeignKey(modelName, foreignKeyName, returnQuery = false) {
        const SQL = `ALTER TABLE ${modelName} DROP CONSTRAINT IF EXISTS ${foreignKeyName};`;
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
            `SELECT table_name as name FROM information_schema.tables WHERE table_type = 'BASE TABLE' and table_schema = 'public';`
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

    /**
     * @description Add a unique constraint to a column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    addUniqueConstraint(tableName, columnName, returnQuery = false) {
        const constraintName = `uc_${tableName}_${columnName}`.toLowerCase();
        const condition = PostgresDBManager.CHECK_CONSTRAINT_EXISTS.replace("{TABLE_NAME}", tableName).replace(
            "{CONSTRAINT_NAME}",
            constraintName
        );
        const query = `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} UNIQUE(${columnName});`;
        const SQL = this.ifWrapper(`NOT EXISTS(${condition})`, query);

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
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
        const SQL = `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`;
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
        const SQL = `DROP INDEX IF EXISTS ${indexName};`;

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    /**
     * @description Add an index to the column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    addIndex(tableName, columnName, returnQuery = false) {
        const indexName = `${tableName}_index_${columnName}`.toLowerCase();
        const SQL = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${columnName.toLowerCase()});`;

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    /**
     * @description Add a full text index to the table
     * @param {string} tableName
     * @param {string} columnName
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    addFullTextIndex(tableName, columnName, returnQuery = false) {
        const indexName = `${tableName}_fulltext_${columnName}`.toLowerCase();
        const SQL = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName} USING GIN(to_tsvector('english', ${columnName}));`;

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
        const indexName = `${tableName}_fulltext_${columnName}`.toLowerCase();
        const SQL = `DROP INDEX IF EXISTS ${indexName};`;

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    /**
     * Create a new field in the table
     * @param {string} modelName - name of the table
     * @param {Field[]} fields
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]> | string}
     */
    createField(modelName, fields, returnQuery = false) {
        const SQL =
            fields
                .map((field) => {
                    return `ALTER TABLE ${modelName} ADD COLUMN IF NOT EXISTS ${field.toDefinitionQuery()};`;
                })
                .join("\n") + "\n";

        if (returnQuery) return SQL;

        return this.runQuery(SQL);
    }

    /**
     * Create the foreign key query
     * @param {object[]} modelsWithRefs
     * @return {string}
     */
    createForeignKeyQuery(modelsWithRefs) {
        const Ref = fieldMap.get("reference");
        if (!Ref || modelsWithRefs.length === 0) return "";

        let addFieldQuery = "";

        for (let model of modelsWithRefs) {
            for (let field of model.fields) {
                const reference = new Ref(field, this.getDbType());

                const foreignName = SQLBaseManager.getForeignKeyName(field.iid);

                const onlyConstraint = reference.createConstraint(model.name);
                const withField = reference.createConstraint(model.name, true);

                const condition = PostgresDBManager.CHECK_FIELD_EXISTS.replace("{TABLE_NAME}", model.name).replace(
                    "{FIELD_NAME}",
                    field.name
                );

                const foreignKeyCondition = PostgresDBManager.CHECK_FOREIGN_KEY_EXISTS.replace(
                    "{TABLE_NAME}",
                    model.name
                ).replace("{CONSTRAINT_NAME}", foreignName);

                addFieldQuery += `IF EXISTS(${condition}) AND NOT EXISTS(${foreignKeyCondition}) THEN ${onlyConstraint} END IF; \n`;
                addFieldQuery += `IF NOT EXISTS(${condition}) THEN ${withField} END IF;`;
            }
        }

        return this.doWrapper(addFieldQuery);
    }

    /**
     * Drop the table
     * @param {object} model - the model object
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<void>|string}
     */
    async dropModel(model, returnQuery = false) {
        const SQL = `DROP TABLE IF EXISTS ${model.name} CASCADE;`;

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

    /**
     * Drop the field from the table
     * @param {string} modelName - name of the table
     * @param {object} field - the field to drop
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]> | string}
     */
    async dropField(modelName, field, returnQuery = false) {
        const schema = "ALTER TABLE {TABLE_NAME} DROP COLUMN IF EXISTS {COLUMN_NAME};";

        const SQL = schema.replace("{TABLE_NAME}", modelName).replace("{COLUMN_NAME}", field.name);

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

        const SQL = `ALTER TABLE ${modelName} ALTER COLUMN ${field.name} ${
            refField.isRequired() ? "SET NOT NULL" : "DROP NOT NULL"
        };`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }
}
