import { SQLBaseManager } from "./SQLBaseManager.js";
import fieldMap from "../sql-database/fieldMap.js";
import { customAlphabet } from "nanoid";
import Model from "../sql-database/Model.js";

export class MySQLDBManager extends SQLBaseManager {
    static dropForeignKeySchema = "ALTER TABLE `{TABLE_NAME}` DROP FOREIGN KEY `{CONSTRAINT_NAME}`;";
    static deleteFieldSchema = "ALTER TABLE `{TABLE_NAME}` DROP COLUMN `{COLUMN_NAME}`;";
    static checkForeignKeySchema =
        "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = '{DATABASE_NAME}' AND CONSTRAINT_NAME = '{CONSTRAINT_NAME}' AND CONSTRAINT_TYPE = 'FOREIGN KEY'";
    static foreignKeyConditionSchema = `IF EXISTS(${MySQLDBManager.checkForeignKeySchema}) THEN {FOREIGN_KEY_DROP_SQL} END IF;`;
    static checkConstraintSchema =
        "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE CONSTRAINT_NAME = '{CONSTRAINT_NAME}'";
    static checkIndexConditionSchema =
        "NOT EXISTS(SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE table_name = '{TABLE_NAME}' AND index_name = '{INDEX_NAME}')";
    static checkFieldConditionSchema =
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '{DATABASE_NAME}' AND TABLE_NAME = '{TABLE_NAME}' AND COLUMN_NAME = '{FIELD_NAME}'";

    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);
    }

    /**
     * @description Returns the query in a transaction, if the query fails, it will roll back
     * @param {string} query
     * @param query
     * @return {string}
     */
    inTransaction(query) {
        if (!query) throw new AgnostError(t("Query is required"));

        const name = this.getRandomProcedureName("TransactionFN_");
        return `DROP PROCEDURE IF EXISTS ${name};
CREATE PROCEDURE ${name}()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    START TRANSACTION;
        ${query}
    COMMIT;
END;
    CALL ${name}();
    DROP PROCEDURE IF EXISTS ${name};
`;
    }

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
         * @type {import("mysql2/promise").Connection}
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
     * @description Get all databases in a server
     * @return {Promise<[]>}
     * @throws Rejects when the query fails
     */
    async getExistingDatabases() {
        const [databases] = await this.runQuery("SELECT schema_name as name FROM information_schema.schemata;");
        if (Array.isArray(databases)) return databases.map((database) => database.name);
        return [];
    }

    /**
     * @description Get all tables in a database
     * @returns {Promise<[]>} - The tables in the database
     * @throws Rejects when the query fails;
     */
    async getExistingModels() {
        const schema =
            "SELECT TABLE_NAME as name FROM information_schema.TABLES WHERE TABLE_SCHEMA = '{DATABASE_NAME}' AND TABLE_TYPE LIKE 'BASE_TABLE';";

        const [[_, rows]] = await this.runQuery(schema.replace("{DATABASE_NAME}", this.getDatabaseName()));
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
                const reference = new Ref(field, this.getDbType());

                const foreignName = SQLBaseManager.getForeignKeyName(field.iid);

                const condition = MySQLDBManager.checkFieldConditionSchema
                    .replace("{DATABASE_NAME}", this.getDatabaseName())
                    .replace("{TABLE_NAME}", model.name)
                    .replace("{FIELD_NAME}", reference.getName());

                const foreignKeyCondition = MySQLDBManager.checkForeignKeySchema
                    .replace("{DATABASE_NAME}", this.getDatabaseName())
                    .replace("{CONSTRAINT_NAME}", foreignName);

                const onlyConstraint = reference.createConstraint(model.name);
                const withField = reference.createConstraint(model.name, true);

                addFieldQuery += `IF EXISTS(${condition}) AND NOT EXISTS(${foreignKeyCondition}) THEN ${onlyConstraint} END IF; \n`;
                addFieldQuery += `IF NOT EXISTS(${condition}) THEN ${withField} END IF;`;
            }
        }

        return !addFieldQuery ? addFieldQuery : this.procedureWrapper(addFieldQuery, "CREATE FOREIGN KEY QUERY");
    }

    createField(modelName, fields, returnQuery = false) {
        let addFieldQuery = "";
        for (let field of fields) {
            const condition = MySQLDBManager.checkFieldConditionSchema
                .replace("{DATABASE_NAME}", this.getDatabaseName())
                .replace("{TABLE_NAME}", modelName)
                .replace("{FIELD_NAME}", field.getName());

            addFieldQuery += `IF NOT EXISTS(${condition}) THEN ALTER TABLE \`${modelName}\` ADD COLUMN ${field.toDefinitionQuery()}; END IF;`;
        }

        const SQL = addFieldQuery ? this.procedureWrapper(addFieldQuery, "CREATE FIELD QUERY") : "";

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getIndexName(field.iid);

        const schema = "CREATE INDEX `{INDEX_NAME}` ON {TABLE_NAME}({FIELD_NAME});";

        const SQL = this.ifWrapper(
            MySQLDBManager.checkIndexConditionSchema
                .replace("{TABLE_NAME}", model.name)
                .replace("{INDEX_NAME}", indexName),
            schema
                .replace("{INDEX_NAME}", indexName)
                .replace("{TABLE_NAME}", model.name)
                .replace("{FIELD_NAME}", field.name),
            "ADD INDEX TO COLUMN"
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getIndexName(field.iid);

        const schema = "ALTER TABLE `{TABLE_NAME}` DROP INDEX `{INDEX_NAME}`;";

        const conditionSchema =
            "EXISTS(SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE index_name = '{INDEX_NAME}')";

        const SQL = this.ifWrapper(
            conditionSchema.replace("{INDEX_NAME}", indexName),
            schema.replace("{INDEX_NAME}", indexName).replace("{TABLE_NAME}", model.name)
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addUniqueConstraint(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getUniqueIndexName(field.iid);

        const schema = "ALTER TABLE `{TABLE_NAME}` ADD CONSTRAINT `{CONSTRAINT_NAME}` UNIQUE({FIELD_NAME});";

        const conditionSchema = `NOT EXISTS(${MySQLDBManager.checkConstraintSchema})`;

        const SQL = this.ifWrapper(
            conditionSchema.replace("{CONSTRAINT_NAME}", constraintName),
            schema
                .replace("{CONSTRAINT_NAME}", constraintName)
                .replace("{TABLE_NAME}", model.name)
                .replace("{FIELD_NAME}", field.name),
            "ADD UNIQUE CONSTRAINT TO COLUMN"
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropUniqueConstraint(model, field, returnQuery = false) {
        const constraintName = SQLBaseManager.getUniqueIndexName(field.iid);

        const schema = "ALTER TABLE `{TABLE_NAME}` DROP INDEX `{CONSTRAINT_NAME}`;";

        const conditionSchema = `EXISTS(${MySQLDBManager.checkConstraintSchema})`;

        const SQL = this.ifWrapper(
            conditionSchema.replace("{CONSTRAINT_NAME}", constraintName),
            schema.replace("{CONSTRAINT_NAME}", constraintName).replace("{TABLE_NAME}", model.name)
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addFullTextIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getFullTextIndexName(field.iid);
        const fieldClass = new (fieldMap.get(field.type))(field, this.getDbType());
        const addCollateQuery = fieldClass.toAddCollateQuery(model, field);

        const schema = addCollateQuery + "\n" + "CREATE FULLTEXT INDEX `{INDEX_NAME}` ON {TABLE_NAME}({FIELD_NAME});";

        const SQL = this.ifWrapper(
            MySQLDBManager.checkIndexConditionSchema
                .replace("{TABLE_NAME}", model.name)
                .replace("{INDEX_NAME}", indexName),
            schema
                .replace("{INDEX_NAME}", indexName)
                .replace("{TABLE_NAME}", model.name)
                .replace("{FIELD_NAME}", field.name)
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    dropFullTextIndex(model, field, returnQuery = false) {
        const indexName = SQLBaseManager.getFullTextIndexName(field.iid);

        const schema = "DROP INDEX `{INDEX_NAME}` ON `{TABLE_NAME}`;";

        const conditionSchema =
            "EXISTS(SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE index_name = '{INDEX_NAME}')";

        const SQL = this.ifWrapper(
            conditionSchema.replace("{INDEX_NAME}", indexName),
            schema.replace("{INDEX_NAME}", indexName).replace("{TABLE_NAME}", model.name)
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async dropModel(model, returnQuery = false) {
        let SQL = "SET FOREIGN_KEY_CHECKS = 0;";
        SQL += `\n DROP TABLE IF EXISTS \`${model.name}\`;`;
        SQL += "SET FOREIGN_KEY_CHECKS = 1;\n";

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    createModel({ fields, name }) {
        const model = new Model(name);

        for (const field of fields) {
            const FieldClass = fieldMap.get(field.type);

            if (!FieldClass) {
                throw new AgnostError(t(`Field type '${field.type}' is not supported`));
            }
            model.addField(new FieldClass(field, this.getDbType()));
        }

        return model.toString();
    }

    dropForeignKey(model, foreignKeyName, returnQuery = false) {
        const query = MySQLDBManager.foreignKeyConditionSchema
            .replaceAll("{FOREIGN_KEY_DROP_SQL}", MySQLDBManager.dropForeignKeySchema)
            .replaceAll("{CONSTRAINT_NAME}", foreignKeyName)
            .replaceAll("{DATABASE_NAME}", this.getDatabaseName())
            .replaceAll("{TABLE_NAME}", model.name);

        const SQL = this.procedureWrapper(query, "DROP FOREIGN KEY");
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    async dropField(model, field, returnQuery = false) {
        const conditionSchema = `EXISTS(${MySQLDBManager.checkFieldConditionSchema})`;

        const foreignName = SQLBaseManager.getForeignKeyName(field.iid);

        let query = MySQLDBManager.foreignKeyConditionSchema
            .replace("{DATABASE_NAME}", this.getDatabaseName())
            .replace("{CONSTRAINT_NAME}", foreignName)
            .replace(
                "{FOREIGN_KEY_DROP_SQL}",
                MySQLDBManager.dropForeignKeySchema
                    .replace("{TABLE_NAME}", model.name)
                    .replace("{CONSTRAINT_NAME}", foreignName)
            );

        query += "\n";

        query += MySQLDBManager.deleteFieldSchema
            .replace("{TABLE_NAME}", model.name)
            .replace("{COLUMN_NAME}", field.name);

        const SQL = this.ifWrapper(
            conditionSchema
                .replace("{DATABASE_NAME}", this.getDatabaseName())
                .replace("{TABLE_NAME}", model.name)
                .replace("{FIELD_NAME}", field.name),
            query,
            "DROP FIELD"
        );

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    /**
     *
     * @param query {string} - Query to run
     * @param debugMessage {string?} - Debugging message
     * @return {string}
     */
    procedureWrapper(query, debugMessage) {
        if (!query) throw new AgnostError(t("Query is required"));

        const name = this.getRandomProcedureName("PROCEDURE_WRAPPER");

        return `DROP PROCEDURE IF EXISTS ${name};
CREATE PROCEDURE ${name}()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    ${debugMessage ? `-- ${debugMessage} \n` : ""}
    ${query}
END;

CALL ${name}();
DROP PROCEDURE IF EXISTS ${name};
    `;
    }

    /**
     *
     * @param conditionQuery {string} - query to check if the query should be run
     * @param query {string} - query to run
     * @param debugMessage {string?} - Debugging message
     * @return {string}
     */
    ifWrapper(conditionQuery, query, debugMessage) {
        if (!query || !conditionQuery) {
            throw new AgnostError(t("Query and conditionQuery are required"));
        }

        const name = this.getRandomProcedureName("IF_WRAPPER");

        return `DROP PROCEDURE IF EXISTS ${name};
CREATE PROCEDURE ${name}()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;
    ${debugMessage ? `-- ${debugMessage} \n` : ""}
    IF ${conditionQuery} THEN
        ${query}
    END IF;
END;

CALL ${name}();
DROP PROCEDURE IF EXISTS ${name};`;
    }

    getRandomProcedureName(prefix) {
        const nanoid = customAlphabet("qwertyuiopasdfghjklzxcvbnm");
        return `${prefix ?? "procedure"}_${nanoid()}`;
    }

    /**
     * @description Drop the database
     * @param {string?} dbName
     * @return {Promise<Object|[]>}
     */
    async dropDatabase(dbName) {
        return this.runQuery(`DROP DATABASE IF EXISTS ${dbName ?? this.getDatabaseNameToUse()};`);
    }

    setNullability(modelName, field, returnQuery = false) {
        const FieldType = fieldMap.get(field.type);
        if (!FieldType) throw new AgnostError(t(`Field type '${field.type}' is not supported`));
        /**
         * @type {Field}
         */
        const refField = new FieldType(field, this.getDbType());

        const SQL = `ALTER TABLE ${modelName} MODIFY ${refField.toDefinitionQueryForModify()};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    addDefaultValues(model, field, returnQuery = false) {
        const isString = typeof field.defaultValue === "string";
        const isNumber = isString && !isNaN(Number(field.defaultValue));
        const defaultValue = isString && !isNumber ? `'${field.defaultValue}'` : field.defaultValue;

        const SQL = `ALTER TABLE ${model.name} ALTER ${field.name} SET DEFAULT ${defaultValue};`;
        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }

    removeDefaultValues(model, field, returnQuery = false) {
        const SQL = `ALTER TABLE ${model.name} ALTER ${field.name} SET DEFAULT NULL;`;

        if (returnQuery) return SQL;
        return this.runQuery(SQL);
    }
}
