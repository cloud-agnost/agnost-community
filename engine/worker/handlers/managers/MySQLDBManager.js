import { SQLBaseManager } from "./SQLBaseManager.js";
import fieldMap from "../sql-database/fieldMap.js";

export class MySQLDBManager extends SQLBaseManager {
    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);
    }

    startTransaction() {
        this.sql = `CREATE PROCEDURE TransactionFN()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;

    START TRANSACTION;
`;
    }
    endTransaction() {
        this.sql += `COMMIT;
END;
CALL TransactionFN();
DROP PROCEDURE IF EXISTS TransactionFN;
`;
    }
    async runQuery() {
        if (!this.getQuery()) return;

        /**
         * @type {import("mysql2/promise").Connection}
         */
        const conn = await this.getConn();

        if (this.getDatabaseName()) {
            this.setQuery(`USE ${this.getDatabaseName()};\n` + this.getQuery());
        }

        console.log("query \n", this.getQuery(), "\n end query");

        const result = await conn.query(this.getQuery());
        this.addLog(
            "⤵\n" + this.getQuery() + "\n" + t("Query executed successfully")
        );
        this.resetQuery();
        return result;
    }

    /**
     * @description Get all databases in a server
     * @return {Promise<[]>}
     * @throws Rejects when the query fails
     */
    async getExistingDatabases() {
        this.setQuery(
            `SELECT schema_name as name FROM information_schema.schemata;`
        );
        const [databases] = await this.runQuery();
        if (Array.isArray(databases))
            return databases.map((database) => database.name);
        return [];
    }

    /**
     * @description Get all tables in a database
     * @returns {Promise<[]>} - The tables in the database
     * @throws Rejects when the query fails;
     */
    async getExistingModels() {
        this.addQuery(
            `SELECT TABLE_NAME as name FROM information_schema.TABLES WHERE TABLE_SCHEMA = '${this.getDatabaseName()}' AND TABLE_TYPE LIKE 'BASE_TABLE';`
        );
        const [[_, rows]] = await this.runQuery();
        if (Array.isArray(rows)) return rows.map((database) => database.name);
        return [];
    }

    /**
     * Create the foreign key query
     * @param {object[]} modelsWithRefs
     * @return {string}
     */
    createForeignKeyQuery(modelsWithRefs) {
        const Ref = fieldMap.get("reference");
        if (modelsWithRefs.length === 0 || !Ref) return "";

        let addFieldQuery = "";

        for (let model of modelsWithRefs) {
            for (let field of model.fields) {
                const reference = new Ref(this.databaseType, field);
                addFieldQuery += `
IF NOT EXISTS(
		SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
		WHERE COLUMN_NAME='${field.name}'
		AND TABLE_NAME='${model.name}'
		AND TABLE_SCHEMA='${this.getDatabaseName()}'
) THEN
${reference.afterCreateQuery(model.name)}
END IF;
`;
            }
        }

        let SQL = `
DROP PROCEDURE IF EXISTS ADD_NEW_COLUMN;
CREATE PROCEDURE ADD_NEW_COLUMN()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    ${addFieldQuery}
END;
CALL ADD_NEW_COLUMN();		
DROP PROCEDURE IF EXISTS ADD_NEW_COLUMN;
`;

        return SQL;
    }

    /**
     * Create a new field in the table
     * @param {string} modelName - name of the table
     * @param {Field[]} fields
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]> | string}
     */
    createField(modelName, fields, returnQuery = false) {
        let addFieldQuery = "";

        fields.forEach((field) => {
            addFieldQuery += `
IF NOT EXISTS(
		SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
		WHERE COLUMN_NAME='${field.getName()}'
		AND TABLE_NAME='${modelName}'
		AND TABLE_SCHEMA='${this.getDatabaseName()}'
) THEN
 ALTER TABLE ${modelName} ADD COLUMN ${field.toDefinitionQuery()};
END IF;
`;
        });

        const SQL = `
DROP PROCEDURE IF EXISTS ADD_NEW_COLUMN;
CREATE PROCEDURE ADD_NEW_COLUMN()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    ${addFieldQuery}
END;

CALL ADD_NEW_COLUMN();		
DROP PROCEDURE IF EXISTS ADD_NEW_COLUMN;
`;

        if (returnQuery) return SQL;

        this.setQuery(SQL);
        return this.runQuery();
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

        const SQL = `DROP PROCEDURE IF EXISTS ADD_INDEX_PROCEDURE;
CREATE PROCEDURE ADD_INDEX_PROCEDURE()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    IF NOT EXISTS(
        SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE table_name = '${tableName}' AND index_name = '${indexName}'
    ) THEN
     CREATE INDEX ${indexName} ON ${tableName}(${columnName});
    END IF;
END;

CALL ADD_INDEX_PROCEDURE();
DROP PROCEDURE IF EXISTS ADD_INDEX_PROCEDURE;`;

        console.log({
            addIndex: SQL,
        });
        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * @description Drop an index from the column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - Return the query instead of running it
     * @return {Promise<Object|[]>|string}
     */
    dropIndex(tableName, columnName, returnQuery = false) {
        console.log("dropIndex", tableName, columnName);
        const indexName = `${tableName}_index_${columnName}`.toLowerCase();

        const SQL = `DROP PROCEDURE IF EXISTS DROP_INDEX_PROCEDURE;
CREATE PROCEDURE DROP_INDEX_PROCEDURE()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    IF EXISTS(
        SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE table_name = '${tableName}' AND index_name = '${indexName}'
    ) THEN
     ALTER TABLE ${tableName} DROP INDEX ${indexName};
    END IF;
END;

CALL DROP_INDEX_PROCEDURE();
DROP PROCEDURE IF EXISTS DROP_INDEX_PROCEDURE;`;
        console.log(SQL);
        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
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

        const SQL = `DROP PROCEDURE IF EXISTS ADD_UNIQUE_INDEX_PROCEDURE;
CREATE PROCEDURE ADD_UNIQUE_INDEX_PROCEDURE()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    IF NOT EXISTS(
        SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = '${tableName}' && CONSTRAINT_NAME = '${constraintName}'
    ) THEN
     ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} UNIQUE(${columnName});
    END IF;
END;

CALL ADD_UNIQUE_INDEX_PROCEDURE;
DROP PROCEDURE IF EXISTS ADD_UNIQUE_INDEX_PROCEDURE;`;

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
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

        const SQL = `DROP PROCEDURE IF EXISTS DROP_UNIQUE_INDEX_PROCEDURE;
CREATE PROCEDURE DROP_UNIQUE_INDEX_PROCEDURE()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    IF EXISTS(
        SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = '${tableName}' && CONSTRAINT_NAME = '${constraintName}'
    ) THEN
     ALTER TABLE ${tableName} DROP INDEX ${constraintName};
    END IF;
END;

CALL DROP_UNIQUE_INDEX_PROCEDURE();
DROP PROCEDURE IF EXISTS DROP_UNIQUE_INDEX_PROCEDURE;`;

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
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

        const SQL = `DROP PROCEDURE IF EXISTS ADD_FULLTEXT_INDEX_PROCEDURE;
CREATE PROCEDURE ADD_FULLTEXT_INDEX_PROCEDURE()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    IF NOT EXISTS(
        SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE table_name = '${tableName}' AND index_name = '${indexName}'
    ) THEN
     CREATE FULLTEXT INDEX ${indexName} ON ${tableName}(${columnName});
    END IF;
END;

CALL ADD_FULLTEXT_INDEX_PROCEDURE();
DROP PROCEDURE IF EXISTS ADD_FULLTEXT_INDEX_PROCEDURE;`;

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
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

        const SQL = `DROP PROCEDURE IF EXISTS DROP_FULLTEXT_INDEX_PROCEDURE;
CREATE PROCEDURE DROP_FULLTEXT_INDEX_PROCEDURE()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    IF EXISTS(
        SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE table_name = '${tableName}' AND index_name = '${indexName}'
    ) THEN
     DROP INDEX ${indexName} ON ${tableName};
    END IF;
END;

CALL DROP_FULLTEXT_INDEX_PROCEDURE();
DROP PROCEDURE IF EXISTS DROP_FULLTEXT_INDEX_PROCEDURE;`;

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }
}
