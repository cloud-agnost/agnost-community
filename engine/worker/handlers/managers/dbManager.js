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
		return this.prevDbConfig ? true : false;
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
	 * Returns the database resource access settings
	 */
	getResourceAccessSettings() {
		return this.dbConfig.resource.access;
	}

	/**
	 * Returns the list of database models (e.g., tables or collections)
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
			this.conn = await connManager.getConn(
				this.getDbId(),
				this.getDbType(),
				this.getResourceAccessSettings()
			);
		}

		return this.conn;
	}

	async beginSession() {}
	async endSession() {}
	async createDatabase() {}
	async dropDatabase() {}
	async manageModels() {}
	async createModel() {}
	async dropModel() {}
	async renameModel() {}
	async createField() {}
	async dropField() {}
	async updateField() {}
}
