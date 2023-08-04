import { DBManager } from "./dbManager.js";
import fieldMap from "../sql-database/fieldMap.js";
import Model from "../sql-database/Model.js";
import { customAlphabet } from "nanoid";

export class SQLBaseManager extends DBManager {
    /**
     * Type of execution
     * @type {"deploy"| "redeploy"}
     */
    type;

    /**
     * SQL query to be executed
     * @type {string[]}
     */
    sqlQueries = [];

    /**
     * Check if the transaction is open
     * @type {boolean}
     */
    isTransactionOpen = false;

    /**
     * Database name
     * @type {string}
     */
    databaseName;

    /**
     * Database type (MySQL, PostgreSQL, etc.)
     * @type {string}
     */
    databaseType;

    /**
     * SQLBaseManager constructor
     * @param {object} env - environment
     * @param {object} dbConfig - database configuration
     * @param {object} prevDbConfig - previous database configuration
     * @param {function} addLogFn - function to add log
     */
    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);
    }

    /**
     * Use the database
     * @param databaseName
     * @return {void}
     */
    async useDatabase(databaseName) {
        this.setDatabaseName(databaseName);
    }

    /**
     * Create the database
     * @return {Promise<void>}
     * @throws Rejects when the query fails or database already exists;
     */
    async createDatabase() {
        const dbName = this.getDbName();

        if (await this.isDatabaseExists(dbName)) {
            await this.useDatabase(dbName);
            return;
        }

        this.addQuery(`CREATE DATABASE ${dbName};`);
        await this.runQuery();
        this.addLog(t("Created the database"));
        await this.useDatabase(dbName);
    }

    async deploy() {
        let createSQL = "";
        // existing models in the database
        const existingModels = await this.getExistingModels();
        const { modelsWithRefs, modelsWithoutRefs } = this.getConfiguredModels();

        // Create tables and regular indexes
        for (let model of modelsWithoutRefs) {
            const modelName = model.name.toLowerCase();
            if (model.type !== "model" || existingModels.includes(modelName)) continue;

            createSQL += this.createModel(model);
        }

        this.addQuery(createSQL);

        if (modelsWithRefs.length > 0) {
            this.addQuery(this.createForeignKeyQuery(modelsWithRefs));
        }

        // run the query
        await this.runQuery();

        this.addLog(t("Tables created successfully"));

        // Create unique indexes and full text search indexes
        for (let model of modelsWithoutRefs) {
            if (model.type !== "model") continue;

            this.addQuery(await this.handleIndexes(model, true));
            this.addQuery(await this.handleUniqueIndexes(model, true));
            this.addQuery(await this.handleFullTextSearchIndexes(model, true));
        }

        // run the query
        await this.runQuery();

        this.addLog(t("Tables' indexes created successfully"));
    }

    async redeploy() {
        const changedModels = this.getChangedModels();
        console.log("changedModels", JSON.stringify(changedModels, null, 4));
        if (!changedModels) return;

        const existingModels = await this.getExistingModels();

        const { modelsWithRefs, modelsWithoutRefs } = this.getConfiguredModels(changedModels?.added);

        // Create tables and regular indexes
        // TODO refactor it later
        for (const model of modelsWithoutRefs) {
            const modelName = model.name.toLowerCase();
            if (model.type !== "model" || existingModels.includes(modelName)) continue;
            this.addQuery(this.createModel(model));
        }

        this.addQuery(this.createForeignKeyQuery(modelsWithRefs));
        await this.runQuery();

        for (let updatedModel of changedModels?.updated) {
            // if the model is existing, update its name
            if (existingModels.includes(updatedModel?.oldName)) {
                await this.handleRenameModel(updatedModel);
            }

            // if the model is existing, update it
            if (existingModels.includes(updatedModel?.name)) {
                this.addQuery(await this.handleRequiredField(updatedModel, true));
                this.addQuery(await this.handleAddFields(updatedModel, true));
                this.addQuery(await this.handleRenameField(updatedModel, true));
                this.addQuery(await this.handleIndexes(updatedModel, true));
                this.addQuery(await this.handleUniqueIndexes(updatedModel, true));
                this.addQuery(await this.handleFullTextSearchIndexes(updatedModel, true));
                this.addQuery(await this.handleReferenceModelChanges(updatedModel, true));
            }

            await this.runQuery();
        }

        this.setQuery(
            [
                await this.handleModelsDrop(changedModels?.deleted, true),
                await this.handleDropFields(changedModels?.updated, true),
            ].join("\n")
        );

        await this.runQuery();
    }

    /**
     * Manage the models
     * @return {Promise<void>}
     */
    async manageModels() {
        console.log(`\n--------------- ${this.getType()} started ---------------\n`);

        if (this.getType() === "redeploy") {
            await this.redeploy();
        } else {
            await this.deploy();
        }

        console.log(`\n--------------- ${this.getType()} ended ---------------\n`);
    }

    /**
     *
     * @param {{name: string, fieldChanges: {updated:[]}}} model
     * @param returnQuery
     * @return {Promise<string>}
     */
    async handleRenameField(model, returnQuery = false) {
        let SQL = "";

        for (const field of model.fieldChanges.updated) {
            if (!field.isNameChanged) continue;

            const query = await this.renameField(model.name, field.oldName, field.name, returnQuery);

            if (returnQuery) SQL += query + "\n";
        }

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     *
     * @param {{name: string, fieldChanges: {updated:[]}}} model
     * @param returnQuery
     * @return {Promise<string>}
     */
    async handleRequiredField(model, returnQuery = false) {
        let SQL = "";

        for (const field of model.fieldChanges.updated) {
            if (!field.isRequiredChanged) continue;
            const query = await this.setNullability(model.name, field, returnQuery);
            if (returnQuery) SQL += query + "\n";
        }

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Returns models with and without references
     * @param {[]?} models
     * @return {{modelsWithoutRefs: object[], modelsWithRefs: object[]}}
     */
    getConfiguredModels(models) {
        const modelsWithRefs = [];
        const _models = models ?? this.getModels();
        const modelsWithoutRefs = _models.reduce((acc, curr) => {
            const withReferences = curr.fields
                .filter((field) => field.type === "reference")
                .map((field) => {
                    field.reference.modelName = this.getModelNameByIid(field?.reference?.iid);
                    return field;
                });

            const nonReferences = curr.fields.filter((field) => field.type !== "reference");

            if (nonReferences.length > 0) {
                curr.fields = nonReferences;
            }

            if (withReferences.length > 0) {
                // Structured clone is available since node v17.0
                const cloned = structuredClone(curr);
                cloned.fields = withReferences;
                modelsWithRefs.push(cloned);
            }

            acc.push(curr);
            return acc;
        }, []);

        return {
            modelsWithRefs,
            modelsWithoutRefs,
        };
    }

    /**
     * @description Delete fields from tables
     * @param {object[]} models - array of models
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleDropFields(models, returnQuery = false) {
        let SQL = "";

        for (const model of models) {
            for (const field of model.fieldChanges.deleted) {
                const query = await this.dropField(model.name, field, true);
                SQL += query + "\n";
            }
        }
        if (returnQuery) return SQL;

        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * @description Add fields to tables
     * @param {object} model - model object
     * @param returnQuery
     * @return {Promise<string|[]>}
     */
    async handleAddFields(model, returnQuery = false) {
        let SQL = "";

        if (model.fieldChanges.added.length === 0) return "";

        const fields = model.fieldChanges.added
            .filter((field) => field.type !== "reference")
            .map((field) => {
                const FieldClass = fieldMap.get(field.type);

                if (!FieldClass) {
                    throw new AgnostError(t(`Field type '${field.type}' is not supported`));
                }

                return new FieldClass(field);
            });
        SQL = await this.createField(model.name, fields, returnQuery);

        const modelToCreate = structuredClone(model);
        modelToCreate.fields = model.fieldChanges.added
            .filter((field) => field.type === "reference")
            .map((field) => {
                field.reference.modelName = this.getModelNameByIid(field.reference.iid);
                return field;
            });
        SQL += this.createForeignKeyQuery([modelToCreate]);

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Delete models from database
     * @param {object[]} deletedModels
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<void|string>}
     */
    async handleModelsDrop(deletedModels, returnQuery = false) {
        let SQL = "";
        for (const model of deletedModels) {
            const query = await this.dropModel(model, returnQuery);
            SQL += query + "\n";
        }

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Rename the model
     * @param {object} model
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleRenameModel(model, returnQuery = false) {
        let SQL = "";
        if (!model.isNameChanged) return SQL;

        SQL = await this.renameModel(model.oldName, model.name, returnQuery);

        if (returnQuery) return SQL;
    }

    /**
     * Add or drop indexes from fields
     * @param {object} model
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleIndexes(model, returnQuery = false) {
        let SQL = "";

        for (const { indexed, name } of model.fields) {
            let query = "";

            if (indexed) {
                query = (await this.addIndex(model.name, name, returnQuery)) + "\n";
            } else {
                query = (await this.dropIndex(model.name, name, returnQuery)) + "\n";
            }

            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Add or drop unique constraint from fields
     * @param {object} model
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleUniqueIndexes(model, returnQuery = false) {
        let SQL = "";

        for (const field of model.fields) {
            let query = "";

            if (field.unique) {
                query = "\n" + (await this.addUniqueConstraint(model.name, field.name, returnQuery)) + "\n";
            } else {
                query = "\n" + (await this.dropUniqueConstraint(model.name, field.name, returnQuery)) + "\n";
            }

            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Add or drop unique constraint from fields
     * @param {object} model
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleReferenceModelChanges(model, returnQuery = false) {
        let SQL = "";

        for (const field of model.fields) {
            if (field.type !== "reference") continue;
            if (field?.isRefChanged || field?.isActionChanged) {
                const modelName = this.getModelNameByIid(field?.oldIid ?? field.reference.iid);
                const foreignName = SQLBaseManager.getForeignKeyName(field.iid);

                SQL += this.dropForeignKey(model.name, foreignName, returnQuery);
                SQL += "\n";
            }
        }

        const { modelsWithRefs } = this.getConfiguredModels([model]);
        SQL += this.createForeignKeyQuery(modelsWithRefs);

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Add or drop full text search indexes from the table
     * @param {object} model
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleFullTextSearchIndexes(model, returnQuery = false) {
        let SQL = "";

        for (const field of model.fields) {
            if (!["text", "rich-text"].includes(field.type) || !field.isSearchableChanged) continue;
            let query = "";

            if (field?.text?.searchable || field?.richText?.searchable) {
                query = (await this.addFullTextIndex(model.name, field.name, returnQuery)) + "\n";
            } else {
                query = (await this.dropFullTextIndex(model.name, field.name, returnQuery)) + "\n";
            }

            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Create a table and with its fields for the model
     * @param {object} model
     * @param {string} model.name
     * @param {object[]} model.fields
     * @return {string}
     */
    createModel({ fields, name }) {
        const model = new Model(name);

        for (const field of fields) {
            const FieldClass = fieldMap.get(field.type);

            if (!FieldClass) {
                throw new AgnostError(t(`Field type '${field.type}' is not supported`));
            }
            model.addField(new FieldClass(field));
        }

        return model.toString();
    }

    /**
     * Start a transaction
     * @return {void}
     */
    beginTransaction() {}

    /**
     * End a transaction if it is started
     * @return {void}
     */
    endTransaction() {}

    /**
     * Get the existing models
     * @param {string} databaseName - name of the database
     * @return {Promise<boolean>}
     */
    async isDatabaseExists(databaseName) {
        const databases = await this.getExistingDatabases();
        return databases.includes(databaseName);
    }

    /**
     * Rename the table
     * @param {string} oldName - old name of the model
     * @param {string} newName - new name of the model
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<void> | string}
     */
    async renameModel(oldName, newName, returnQuery = false) {
        const SQL = `ALTER TABLE ${oldName} RENAME TO ${newName};`;
        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
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
        const SQL = `ALTER TABLE ${modelName} RENAME COLUMN ${fieldOldName} TO ${fieldNewName};`;
        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * @description Set the nullability of the field
     * @param modelName {string} - The name of the model
     * @param field {object} - The field to set nullability
     * @param returnQuery {boolean} - return the query or run it
     */
    setNullability(modelName, field, returnQuery = false) {}

    /**
     * Drop the field from the table
     * @param {string} modelName - name of the table
     * @param {object} field - the field to drop
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]> | string}
     */
    async dropField(modelName, field, returnQuery = false) {
        const schema = "ALTER TABLE `{TABLE_NAME}` DROP COLUMN `{COLUMN_NAME}`;";

        const SQL = schema.replace("{TABLE_NAME}", modelName).replace("{COLUMN_NAME}", field.name);

        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Set the database name
     * @param {string} databaseName
     */
    setDatabaseName(databaseName) {
        this.databaseName = databaseName;
    }

    /**
     * @param {"redeploy"|"deploy"} type
     */
    setType(type) {
        this.type = type;
    }

    /**
     * @return {"deploy"|"redeploy"}
     */
    getType() {
        return this.type;
    }

    /**
     * Get the database name
     * @return {string}
     */
    getDatabaseName() {
        return this.databaseName;
    }

    /**
     * Add a query to the existing query
     * @param {string} query
     */
    addQuery(query) {
        this.sqlQueries.push(query);
    }

    /**
     * Reset the query
     */
    resetQuery() {
        this.sqlQueries = [];
    }

    /**
     * Set the query
     * @param {string} query
     */
    setQuery(query) {
        this.sqlQueries = [query];
    }

    /**
     * Get the model name by iid
     * @param {string} iid - id of the model
     * @return {string}
     */
    getModelNameByIid(iid) {
        return this.getModelByIid(iid)?.name;
    }

    /**
     * Get the model by iid
     * @param {string} iid - id of the model
     * @return {object}
     */
    getModelByIid(iid) {
        return this.getModels().find((model) => model.iid === iid);
    }

    /**
     * Get the query
     * @return {string}
     */
    getQuery() {
        return this.sqlQueries.join("\n");
    }

    /**
     * Run the query
     * @return {Promise<object|[]>}
     */
    async runQuery() {}

    /**
     * Get the models
     * @return {Promise<[]>}
     */
    async getExistingModels() {}

    /**
     * Get the databases
     * @return {Promise<[]>}
     */
    async getExistingDatabases() {}

    /**
     * @description Drop an index from the column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]>}
     */
    dropIndex(tableName, columnName, returnQuery = false) {}

    /**
     * @description Add an index to the column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]>}
     */
    addIndex(tableName, columnName, returnQuery = false) {}

    /**
     * @description Add a unique constraint to a column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]>}
     */
    addUniqueConstraint(tableName, columnName, returnQuery = false) {}

    /**
     * @description Drop a unique constraint from the column
     * @param {string} tableName - The table name
     * @param {string} columnName - The column name
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]>}
     */
    dropUniqueConstraint(tableName, columnName, returnQuery = false) {}

    /**
     * @description Add a full text index to the table
     * @param {string} tableName
     * @param {string} columnName
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]>}
     */
    addFullTextIndex(tableName, columnName, returnQuery = false) {}

    /**
     * @description Drop the full text index from the table
     * @param {string} tableName
     * @param {string} columnName
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]>}
     */
    dropFullTextIndex(tableName, columnName, returnQuery = false) {}

    /**
     * Create the foreign key query
     * @param {object[]} modelsWithRefs
     * @return {string}
     */
    createForeignKeyQuery(modelsWithRefs) {}

    /**
     * Drop the table
     * @param {object} model - the model object
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<void>}
     */
    async dropModel(model, returnQuery = false) {}

    /**
     * @description Drop the foreign key
     * @param modelName {string} - the model name
     * @param foreignKeyName {string} - the foreign key name
     * @param returnQuery {boolean} - return the query or run it
     * @return {Promise<void> | string}
     */
    dropForeignKey(modelName, foreignKeyName, returnQuery = false) {}

    /**
     *
     * @param baseModel {object} - the model object
     * @return {[]}
     */
    getForeignKeyField(baseModel) {
        const models = this.getPrevModels();
        const foreignKeys = [];

        for (let model of models) {
            for (let field of model.fields) {
                if (field.type === "reference" && field?.reference?.iid === baseModel.iid) {
                    field.belongsTo = model.name;
                    foreignKeys.push(field);
                }
            }
        }

        return foreignKeys;
    }

    /**
     * @description Return the foreign key name
     * @param iid {string} - The field iid
     * @return {string}
     */
    static getForeignKeyName(iid) {
        return `fk_${iid.replaceAll("-", "_")}`;
    }
}
