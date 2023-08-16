import connManager from "../../init/connManager.js";
/**
 * Base class that is used the create and update the database schema (e.g., collections, tables, indices etc.)
 */
export class DBManager {
    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        this.conn = null;
        this.env = env;
        this.dbConfig = dbConfig;
        this.prevDbConfig = prevDbConfig;
        this.addLogFn = addLogFn;
    }

    /**
     * Adds a log message to track the progress of deployment operations
     * @param  {string} message Logged message
     * @param  {string} status Whether the operation has completed successfully or with errors
     */
    addLog(message, status = "OK") {
        if (!this.addLogFn) return;
        this.addLogFn(message, status);
    }

    hasPrevConfig() {
        return !!this.prevDbConfig;
    }

    /**
     * Returns the environment iid (internal identifier)
     */
    getEnvId() {
        return this.env.iid;
    }

    /**
     * Returns the database iid (internal identifier)
     */
    getDbId() {
        return this.dbConfig.iid;
    }

    /**
     * Returns the database type
     */
    getDbType() {
        return this.dbConfig.type;
    }

    /**
     * Returns the database type
     */
    getDbName() {
        return this.dbConfig.name;
    }

    /**
     * Returns the database resource access settings
     */
    getResourceAccessSettings() {
        return helper.decryptSensitiveData(this.dbConfig.resource.access);
    }

    /**
     * Returns the list of database models (e.g., tables or collections)
     * @return {object[]} List of database models
     */
    getModels() {
        return this.dbConfig.models;
    }

    /**
     * Returns a specific model identified by iid (internal id)
     * @param  {string} iid The internal identifier of the model
     */
    getModel(iid) {
        const models = this.getModels();
        return models.find((entry) => entry.iid === iid);
    }

    /**
     * Returns the list of database models (e.g., tables or collections) from the previous configuration
     */
    getPrevModels() {
        return this.prevDbConfig?.models || [];
    }

    /**
     * Returns a specific model in the previous database configuration
     * @param  {string} iid The internal identifier of the model
     */
    getPrevModel(iid) {
        if (!this.prevDbConfig) return null;

        const models = this.getPrevModels();
        return models.find((entry) => entry.iid === iid);
    }

    /**
     * Returns the field of a model identified by iid (internal id)
     * @param  {object} model The model json object
     * @param  {string} iid The internal identifier of the field
     */
    getField(model, iid) {
        if (!model) return null;

        let length = model.fields.length;
        for (let i = 0; i < length; i++) {
            let field = model.fields[i];
            if (field.iid === iid) return field;
        }

        return null;
    }

    /**
     * Returns a connection to the database resource
     */
    async getConn() {
        if (!this.conn) {
            this.conn = await connManager.getConn(this.getDbId(), this.getDbType(), this.getResourceAccessSettings());
        }

        return this.conn;
    }

    /**
     * @description Returns the list of models that have been changed in the current configuration
     * @return {{
     * 	added: object[],
     * 	updated: {
     * 		model: {
     * 			iid: string,
     * 			name: string,
     * 			fields: object[],
     * 			fieldChanges: {
     * 				added: [],
     * 				updated: {
     * 					field: {
     * 						iid: string,
     * 						name: string,
     * 						indexed: boolean,
     * 						unique: boolean,
     * 						text: {
     * 							searchable: boolean,
     * 						},
     * 						richText: {
     * 							searchable: boolean,
     * 						},
     * 					},
     * 				},
     * 				deleted: [],
     * 			},
     * 		},
     * 		isNameChanged: boolean,
     * 		oldName: string,
     * 	    isRefChanged: boolean,
     * 	    isActionChanged: boolean,
     * 	    isRequiredChanged: boolean,
     * 	    isIndexedChanged: boolean,
     * 	    isUniqueChanged: boolean,
     * 	    isSearchableChanged: boolean,
     * 	    oldIid: string,
     * 	}[],
     * 	deleted: object[],
     * } | null}
     */
    getChangedModels() {
        if (!this.hasPrevConfig()) return null;

        const changes = {
            added: [],
            updated: [],
            deleted: [],
        };

        const models = structuredClone(this.getModels());

        // find added and updated models
        for (const model of models) {
            const prevModel = this.getPrevModel(model.iid);

            // if model is not found in the previous configuration, it is added
            if (!prevModel) changes.added.push(model);

            if (Object.keys(model).length > 0 && prevModel?.updatedAt !== model?.updatedAt) {
                model.isNameChanged = prevModel?.name !== model?.name;
                model.oldName = prevModel?.name;
                model.fieldChanges = {
                    added: [],
                    updated: [],
                    deleted: [],
                };

                const prevFields = prevModel?.fields || [];
                const fields = model?.fields || [];

                // find added and updated fields
                for (const field of fields) {
                    const prevField = prevFields.find((prevField) => prevField.iid === field.iid);

                    if (!prevField) {
                        model.fieldChanges.added.push(field);
                    } else if (prevField.updatedAt !== field.updatedAt) {
                        field.isRequiredChanged = prevField.required !== field.required;
                        field.isNameChanged = prevField.name !== field.name;
                        field.isIndexedChanged = prevField.indexed !== field.indexed;
                        field.isUniqueChanged = prevField.unique !== field.unique;

                        if (field.isNameChanged) field.oldName = prevField.name;

                        if (field.type === "text")
                            field.isSearchableChanged = prevField.text.searchable !== field.text.searchable;

                        if (field.type === "rich-text")
                            field.isSearchableChanged = prevField.richText.searchable !== field.richText.searchable;

                        if (field.type === "reference") {
                            field.isRefChanged = prevField.reference.iid !== field.reference.iid;
                            field.isActionChanged = prevField.reference.action !== field.reference.action;
                            if (field.isRefChanged) field.oldIid = prevField.reference.iid;
                        }

                        model.fieldChanges.updated.push(field);
                    }
                }

                // find deleted fields
                for (const prevField of prevFields) {
                    const field = fields.find((field) => field.iid === prevField.iid);

                    if (!field) model.fieldChanges.deleted.push(prevField);
                }

                changes.updated.push(model);
            }
        }

        // find deleted models
        const prevModels = this.getPrevModels();
        for (let prevModel of prevModels) {
            const model = this.getModel(prevModel.iid);
            if (!model) {
                changes.deleted.push(prevModel);
            }
        }

        const hasNoChanges = Object.values(changes).every((value) => value.length === 0);

        return hasNoChanges ? null : changes;
    }

    async beginSession() {}
    async endSession() {}
    async createDatabase() {}
    async dropDatabase() {}
    async manageModels() {}
    async createModel() {}
    async dropModel() {}
    async renameModel() {}
    async renameField() {}
    async createField() {}
    async dropField() {}
    async updateField() {}
    setType() {}
}
