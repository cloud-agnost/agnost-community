import { DBManager } from "./dbManager.js";
import fieldMap from "../sql-database/fieldMap.js";
import Model from "../sql-database/Model.js";

export class SQLBaseManager extends DBManager {
    /**
     * Type of execution
     * @type {"deploy"| "redeploy"}
     */
    type;

    /**
     * SQL query to be executed
     * @type {string}
     */
    sql = "";

    /**
     * Is creating table or not
     * @type {boolean}
     */
    isCreatingTable = false;

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

        // TODO: remove this after testing
        // await this.dropDatabase(dbName);
        // console.log("...Database removed...");

        if (await this.isDatabaseExists(dbName)) {
            await this.useDatabase(dbName);
            return;
        }

        this.addQuery(`CREATE DATABASE ${dbName};`);
        await this.runQuery();

        this.addLog(t("Created the database"));
        console.log(`********* Database created: ${dbName} *********`);

        await this.useDatabase(dbName);
    }

    async deploy() {
        let createSQL = "";
        // existing models in the database
        const existingModels = await this.getExistingModels();
        console.log("Existing models: ", existingModels);
        const { modelsWithRefs, modelsWithoutRefs } =
            this.getConfiguredModels();

        // Create tables and regular indexes
        for (let model of modelsWithoutRefs) {
            const modelName = model.name.toLowerCase();
            console.log({
                type: model.type,
            });
            if (model.type !== "model" || existingModels.includes(modelName)) {
                continue;
            }

            createSQL += this.createModel(model);
        }

        this.addQuery(createSQL);

        if (modelsWithRefs.length > 0) {
            this.addQuery(this.createForeignKeyQuery(modelsWithRefs));
        }

        // run the query
        await this.runQuery();

        this.addLog(t("Tables created successfully"));
        console.log(`********* Tables created successfully *********`);

        // Create unique indexes and full text search indexes
        for (let model of modelsWithoutRefs) {
            if (model.type !== "model") continue;

            const queries = [
                await this.handleIndexes(model, true),
                await this.handleUniqueIndexes(model, true),
                await this.handleFullTextSearchIndexes(model, true),
            ].join("\n");

            this.addQuery(queries);
        }
        // run the query
        await this.runQuery();

        this.addLog(t("Tables' indexes created successfully"));
        console.log(`********* Tables' indexes created successfully *********`);
    }

    async redeploy() {
        const changedModels = this.getChangedModels();
        // console.log("changedModels", JSON.stringify(changedModels, null, 4));
        if (!changedModels) return;

        const existingModels = await this.getExistingModels();

        let createSQL = "";

        const { modelsWithRefs, modelsWithoutRefs } = this.getConfiguredModels(
            changedModels?.added
        );

        // Create tables and regular indexes
        // TODO refactor it later
        for (const model of modelsWithoutRefs) {
            const modelName = model.name.toLowerCase();
            if (model.type !== "model" || existingModels.includes(modelName)) {
                continue;
            }
            createSQL += this.createModel(model);
        }

        this.addQuery(createSQL);

        this.addQuery(this.createForeignKeyQuery(modelsWithRefs));
        console.log("after createForeignKeyQuery");
        await this.runQuery();

        for (let updatedModel of changedModels?.updated) {
            // if the model is existing, update its name
            if (existingModels.includes(updatedModel?.oldName)) {
                await this.handleRenameModel(updatedModel);
            }

            // if the model is existing, update it
            if (existingModels.includes(updatedModel?.name)) {
                this.setQuery(
                    [
                        await this.handleAddFields(updatedModel, true),
                        await this.handleRenameField(updatedModel, true),
                        await this.handleIndexes(updatedModel, true),
                        await this.handleUniqueIndexes(updatedModel, true),
                        await this.handleFullTextSearchIndexes(
                            updatedModel,
                            true
                        ),
                    ].join("\n")
                );
                console.log({
                    1: await this.handleAddFields(updatedModel, true),
                    2: await this.handleRenameField(updatedModel, true),
                    3: await this.handleIndexes(updatedModel, true),
                    4: await this.handleUniqueIndexes(updatedModel, true),
                    5: await this.handleFullTextSearchIndexes(
                        updatedModel,
                        true
                    ),
                });

                // Adding foreign Keys
                await this.runQuery();
            }
        }

        await this.handleModelsDrop(changedModels?.deleted);
        await this.handleDropFields(changedModels?.updated);
    }

    /**
     * Manage the models
     * @return {Promise<void>}
     */
    async manageModels() {
        console.log(
            `\n--------------- ${this.getType()} started ---------------\n`
        );

        if (this.getType() === "redeploy") {
            console.log("...Redeploying...");
            this.isCreatingTable = false;
            await this.redeploy();
        } else {
            console.log("...Deploying...");
            this.isCreatingTable = true;
            await this.deploy();
        }

        console.log(
            `\n--------------- ${this.getType()} ended ---------------\n`
        );
    }

    /**
     *
     * @param {{name: string, fieldChanges: {updated:[]}}} model
     * @param returnQuery
     * @return {Promise<string>}
     */
    async handleRenameField(model, returnQuery = false) {
        console.log("handleRenameField");
        let SQL = "";

        for (const field of model.fieldChanges.updated) {
            if (!field.isNameChanged) continue;

            const query = await this.renameField(
                model.name,
                field.oldName,
                field.name,
                returnQuery
            );

            if (returnQuery) SQL += query + "\n";
        }

        if (returnQuery) return SQL;
    }

    /**
     * Returns models with and without references
     * @param {array| null} models
     * @return {{modelsWithoutRefs: object[], modelsWithRefs: object[]}}
     */
    getConfiguredModels(models = null) {
        const modelsWithRefs = [];
        const _models = models ?? this.getModels();
        const modelsWithoutRefs = _models.reduce((acc, curr) => {
            const withReferences = curr.fields
                .filter((field) => field.type === "reference")
                .map((field) => {
                    field.reference.modelName = this.getModelNameByIid(
                        field?.reference?.iid
                    );
                    return field;
                });

            const nonReferences = curr.fields.filter(
                (field) => field.type !== "reference"
            );

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
     * Delete fields from tables
     * @param {object[]} models - model object
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleDropFields(models, returnQuery = false) {
        let SQL = "";

        for (const model of models) {
            for (const field of model.fieldChanges.deleted) {
                const query = await this.dropField(
                    model.name,
                    field.name,
                    true
                );
                SQL += query + "\n";
            }
        }
        console.log(SQL);
        if (returnQuery) return SQL;

        this.setQuery(SQL);
        return this.runQuery();
    }

    async handleAddFields(model, returnQuery = false) {
        console.log("handleAddFields");
        let SQL = "";

        if (model.fieldChanges.added.length === 0)
            if (returnQuery) return SQL;
            else return;

        const fields = model.fieldChanges.added
            .filter((field) => field.type !== "reference")
            .map((field) => {
                const FieldClass = fieldMap.get(field.type);

                if (!FieldClass) {
                    throw new AgnostError(
                        t(`Field type '${field.type}' is not supported`)
                    );
                }

                return new FieldClass(field);
            });

        SQL = await this.createField(model.name, fields, returnQuery);

        const modelToCreate = structuredClone(model);
        modelToCreate.fields = model.fieldChanges.added
            .filter((field) => field.type === "reference")
            .map((field) => {
                field.reference.modelName = this.getModelNameByIid(
                    field.reference.iid
                );
                return field;
            });

        SQL += this.createForeignKeyQuery([modelToCreate]);

        if (returnQuery) return SQL;
    }

    /**
     * Delete models from database
     * @param {object[]} deletedModels
     * @return {Promise<void>}
     */
    async handleModelsDrop(deletedModels) {
        for (const model of deletedModels) {
            await this.dropModel(model);
        }
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
        console.log("handleIndexes");
        let SQL = "";

        for (const field of model.fields) {
            let query = "";

            if (field.indexed) {
                query =
                    (await this.addIndex(model.name, field.name, returnQuery)) +
                    "\n";
            } else if (!this.isCreatingTable) {
                query =
                    (await this.dropIndex(
                        model.name,
                        field.name,
                        returnQuery
                    )) + "\n";
            }

            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
    }

    /**
     * Add or drop unique constraint from fields
     * @param {object} model
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleUniqueIndexes(model, returnQuery = false) {
        console.log("handleUniqueIndexes");
        let SQL = "";

        for (const field of model.fields) {
            let query = "";

            if (field.unique) {
                query =
                    "\n" +
                    (await this.addUniqueConstraint(
                        model.name,
                        field.name,
                        returnQuery
                    )) +
                    "\n";
            } else if (!this.isCreatingTable) {
                query =
                    "\n" +
                    (await this.dropUniqueConstraint(
                        model.name,
                        field.name,
                        returnQuery
                    )) +
                    "\n";
            }

            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
    }

    /**
     * Add or drop full text search indexes from the table
     * @param {object} model
     * @param {boolean} returnQuery - return query or not
     * @return {Promise<void> | string}
     */
    async handleFullTextSearchIndexes(model, returnQuery = false) {
        console.log("handleFullTextSearchIndexes");
        let SQL = "";

        for (const field of model.fields) {
            let query = "";
            if (field?.text?.searchable || field?.richText?.searchable) {
                query =
                    (await this.addFullTextIndex(
                        model.name,
                        field.name,
                        returnQuery
                    )) + "\n";
            } else if (!this.isCreatingTable) {
                query =
                    (await this.dropFullTextIndex(
                        model.name,
                        field.name,
                        returnQuery
                    )) + "\n";
            }

            if (returnQuery) SQL += query;
        }

        if (returnQuery) return SQL;
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
                throw new AgnostError(
                    t(`Field type '${field.type}' is not supported`)
                );
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
    async renameField(
        modelName,
        fieldOldName,
        fieldNewName,
        returnQuery = false
    ) {
        const SQL = `ALTER TABLE ${modelName} RENAME COLUMN ${fieldOldName} TO ${fieldNewName};`;
        if (returnQuery) return SQL;
        this.setQuery(SQL);
        return this.runQuery();
    }

    /**
     * Drop the field from the table
     * @param {string} modelName - name of the table
     * @param {string} fieldName - name of the field
     * @param {boolean} returnQuery - return the query or run it
     * @return {Promise<Object|[]> | string}
     */
    async dropField(modelName, fieldName, returnQuery = false) {
        const SQL = `ALTER TABLE ${modelName} DROP COLUMN ${fieldName};`;
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
        this.sql += query;
    }

    /**
     * Reset the query
     */
    resetQuery() {
        this.setQuery("");
    }

    /**
     * Set the query
     * @param {string} query
     */
    setQuery(query) {
        this.sql = query;
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
        return this.sql;
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
     * @return {Promise<void>}
     */
    async dropModel(model) {}

    /**
     *
     * @param {object} baseModel - the model object
     * @return {*[]}
     */
    getForeignKeyField(baseModel) {
        const models = this.getPrevModels();
        const foreignKeys = [];

        for (let model of models) {
            for (let field of model.fields) {
                console.log({ field });
                if (
                    field.type === "reference" &&
                    field?.reference?.iid === baseModel.iid
                ) {
                    field.belongsTo = model.name;
                    foreignKeys.push(field);
                }
            }
        }

        return foreignKeys;
    }
}
