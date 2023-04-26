import axios from "axios";
import util from "util";
import { getMongoDBClient } from "../../init/db.js";
import {
	createPipeline,
	getKey,
	setKey,
	scanKeys,
	addToCache,
	removeFromCache,
} from "../../init/cache.js";
import { MongoDBManager } from "./mongoDBManager.js";
import { PostgresDBManager } from "./PostgresDBManager.js";
import { MySQLDBManager } from "./MySQLDBManager.js";
import { MsSQLDBManager } from "./MsSQLDBManager.js";
import { OracleDBManager } from "./OracleDBManager.js";
import { DATABASE } from "../../config/constants.js";

export class DeploymentManager {
	constructor(msgObj) {
		this.msgObj = msgObj;
		this.pipeline = null;
		this.conn = null; //MongoDB MongoClient connection
		this.envDB = null; //MongoDB DB object reference

		// Deployment operation logs
		this.logs = [];
	}

	/**
	 * Returns the database object pointing to the MongoDB database of the engine cluster, which is used to store environment configuration info
	 */
	getEnvDB() {
		if (!this.envDB) {
			if (!this.conn) {
				this.conn = getMongoDBClient();
			}
			this.envDB = this.conn.db(this.getEnvId());
		}

		return this.envDB;
	}

	/**
	 * Deletes the environment specific database
	 */
	async dropEnvDB() {
		const db = this.getEnvDB();
		await db.dropDatabase();
		this.addLog(t("Deleted internal environment configuration database"));
	}

	/**
	 * Returns the redis command pipeline if exists otherwise creates and returns a new one
	 */
	getPipeline() {
		if (this.pipeline) return this.pipeline;
		// Send multiple commands at once to redis and get back all the replies in array form in a single step
		this.pipeline = createPipeline();
		// Promisify pipleline exec method so that we can use await
		this.pipeline.exec = util.promisify(this.pipeline.exec);

		return this.pipeline;
	}

	/**
	 * Stores a value in cache using the key and redis command pipeline
	 * @param  {string} key Stored value key
	 * @param  {any} value Stored value, if object/array passed then stringifies the value
	 */
	addToCache(key, value) {
		const pipeline = this.getPipeline();
		addToCache(pipeline, key, value);
	}

	/**
	 * Execute all redis commands altogether
	 */
	async commitPipeline() {
		await this.getPipeline().exec();
	}

	/**
	 * Clear all the cached environment data
	 * @param  {string} pattern The cache keys scan/search pattern
	 */
	async clearCachedData(pattern) {
		//Get all environment related keys and create key deletion pipeline
		let keys = await scanKeys(pattern);
		keys.forEach((key) => {
			removeFromCache(this.getPipeline(), key);
		});
	}

	/**
	 * Returns the environment object
	 */
	getEnvObj() {
		return this.msgObj.env;
	}

	/**
	 * Returns the environment iid (internal identifier)
	 */
	getEnvId() {
		return this.getEnvObj().iid;
	}

	/**
	 * Returns the databases used by app version
	 */
	getDatabases() {
		return this.msgObj.databases || [];
	}

	/**
	 * Returns the database object identifier
	 * @param  {object} db The database json object
	 */
	getDbId(db) {
		return db.iid;
	}

	/**
	 * Only valid for undeploy operations, returns true if the user has selected to drop the data during undeployment
	 */
	isDataDropped() {
		return this.msgObj.dropData ?? true;
	}

	/**
	 * Adds a log message to track the progress of deployment operations
	 * @param  {string} message Logged message
	 * @param  {string} status Whether the operation has completed successfully or with errors
	 */
	addLog(message, status = "OK") {
		let dtm = new Date();
		let duration = 0;
		if (this.prevDtm) {
			duration = dtm - this.prevDtm;
		}

		this.logs.push({
			startedAt: dtm,
			duration: duration,
			status,
			message,
		});

		logger.info(`${message} (${duration}ms)`);
		this.prevDtm = dtm;
	}

	/**
	 * Updates the environment status and logs in platform
	 * @param  {string} status Final environment status
	 */
	async sendEnvironmentLogs(status = "OK") {
		// If there is no callback just return
		if (!this.msgObj.callback) return;

		// Update the environment log object
		await axios.post(
			this.msgObj.callback,
			{
				status,
				logs: this.logs,
			},
			{
				headers: {
					Authorization: config.get("general.masterToken"),
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Sets the environment status while the deployment operation is running
	 * @param  {string} status New environment status
	 */
	async setStatus(status) {
		await setKey(`${this.getEnvId()}.status`, status);
	}

	/**
	 * Loads application databases to the cache
	 */
	async loadDatabases() {
		const databases = this.getDatabases();
		for (let i = 0; i < databases.length; i++) {
			const db = databases[i];
			await this.processModels(db);

			// Add databases and its associated models to the cache
			this.addToCache(`${this.getEnvId()}.db.${this.getDbId(db)}`, db);
			this.addLog(
				t(
					"Loaded and cached '%s' database '%s' and its associated models",
					db.type,
					db.name
				)
			);
		}
	}

	/**
	 * Processes the database models before caching them in Redis
	 * @param  {object} db The databae object
	 */
	async processModels(db) {
		const models = db.models;
		for (let i = 0; i < models.length; i++) {
			const model = models[i];
			// Sort model fields by their order, system created fields have precedence, since we might need to access _id fields
			// during POST requests for parent object, we shoul have the _id values created before other fields not to face any issues
			model.fields.sort(function (a, b) {
				if (a.creator === "system" && b.creator === "user") return -1;
				else if (a.creator === "user" && b.creator === "system") return 1;
				else if (a.creator === "system" && b.creator === "system") return 0;
				else return a.order - b.order;
			});

			for (let j = 0; j < model.fields.length; j++) {
				const field = model.fields[j];
				// Sort the validation rules
				field.validationRules.sort(function (a, b) {
					return a.order - b.order;
				});
				// Create query path of the field starting from the topmost model
				field.queryPath = this.getFieldPath(models, model, field.name);
				// Unwinded query path is used to delete or rename fields deep in a document hierarchy with multiple levels of sub-object arrays
				field.unwindQueryPath = this.getUnwindFieldPath(
					models,
					model,
					field.name
				);
			}

			// This is valid mainly for no-sql databases, creates the parent hierarchy if any
			model.parentHierarchy = this.createParentHierarchy(models, model);
			// Create query path of model starting from the topmost model
			model.queryPath = this.getModelPath(models, model);
		}
	}

	/**
	 * Returns the model identified by its iid (internal identifier)
	 * @param  {array} models The list of database models
	 * @param  {string} modeliid The iid of the model to search for
	 */
	getModel(models, modeliid) {
		let length = models.length;
		for (let i = 0; i < length; i++) {
			const model = models[i];
			if (model.iid === modeliid) return model;
		}

		return null;
	}

	/**
	 * Builds the model path of the model starting either from the topmost model or from the cutOffModel
	 * @param  {array} models The list of database models
	 * @param  {object} model The model whose path will be built
	 * @param  {object} cutOffModel The top level model where the model path will be based on
	 */
	getModelPath(models, model, cutOffModel = null) {
		if (model.type === "model") return null;
		else if (cutOffModel && cutOffModel.iid === model.iid) return null;
		else {
			let parentModel = this.getModel(models, model.parentiid);
			let parentPath = this.getModelPath(models, parentModel, cutOffModel);
			if (parentPath) return parentPath + "." + model.name;
			else return model.name;
		}
	}

	/**
	 * Builds the model path of the model starting either from the topmost model or from the cutOffModel taking into consideration
	 * sub-object lists in the overall path. This path is many used to delete or rename fields deep in a document hierarchy
	 * @param  {array} models The list of database models
	 * @param  {object} model The model whose path will be built
	 * @param  {object} cutOffModel The top level model where the model path will be based on
	 */
	getUnwindModelPath(models, model, cutOffModel = null) {
		if (model.type === "model") return null;
		else if (cutOffModel && cutOffModel.iid === model.iid) return null;
		else {
			let parentModel = this.getModel(models, model.parentiid);
			let parentPath = this.getUnwindModelPath(
				models,
				parentModel,
				cutOffModel
			);
			if (parentPath) {
				if (model.type === "sub-model-list")
					return parentPath + "." + model.name + ".$[]";
				else return parentPath + "." + model.name;
			} else {
				if (model.type === "sub-model-list") return model.name + ".$[]";
				else return model.name;
			}
		}
	}

	/**
	 * Builds the field path of the field starting either from the topmost model or from the cutOffModel
	 * @param  {array} models The list of database models
	 * @param  {object} model The model of which holds the field
	 * @param  {string} fieldName The name of the field
	 * @param  {object} cutOffModel The top level model where the field path will be based on
	 */
	getFieldPath(models, model, fieldName, cutOffModel = null) {
		let modelPath = this.getModelPath(models, model, cutOffModel);
		if (modelPath) return modelPath + "." + fieldName;
		else return fieldName;
	}

	/**
	 * Builds the field path of the field starting either from the topmost model or from the cutOffModel taking into consideration
	 * sub-object lists in the overall path. This path is many used to delete or rename fields deep in a document hierarchy
	 * @param  {array} models The list of database models
	 * @param  {object} model The model of which holds the field
	 * @param  {string} fieldName The name of the field
	 * @param  {object} cutOffModel The top level model where the field path will be based on
	 */
	getUnwindFieldPath(models, model, fieldName, cutOffModel = null) {
		let modelPath = this.getUnwindModelPath(models, model, cutOffModel);
		if (modelPath) return modelPath + "." + fieldName;
		else return fieldName;
	}

	/**
	 * Builds the parent model hierarchy of the model
	 * @param  {array} models The list of database models
	 * @param  {object} model The model whose parent hierarchy will be built
	 * @param  {object} hierarchyList The hierarchy list array
	 */
	createParentHierarchy(models, model, hierarchyList = null) {
		if (hierarchyList === null) hierarchyList = [];

		hierarchyList.unshift({
			name: model.name,
			iid: model.iid,
			cname: this.getDbModelName(models, model),
			type: model.type,
			queryPath: this.getModelPath(models, model),
		});

		if (model.type === "model") return hierarchyList;

		let parentModel = this.getModel(models, model.parentiid);
		if (parentModel) {
			return this.createParentHierarchy(models, parentModel, hierarchyList);
		} else return hierarchyList;
	}

	/**
	 * Returns the table/collection name of the model that will be used to store the
	 * @param  {array} models The list of database models
	 * @param  {object} model The model whose table/collection name is returned
	 */
	getDbModelName(models, model) {
		if (model.type === "model") return model.name;
		else {
			let parentModel = this.getModel(models, model.parentiid);
			return this.getDbModelName(models, parentModel);
		}
	}

	/**
	 * Create application specific configuration and log collections
	 */
	async createInternalCollections() {
		const db = this.getEnvDB();
		const collections = await db.collections();

		await this.creteStorageInfoCollection(collections);
		await this.createMessageInfoCollection(collections);
		await this.createCronInfoCollection(collections);
		await this.createEndopintLogsCollection(collections);
		await this.createMessageQueueLogsCollection(collections);
		await this.createCronJobLogsCollection(collections);
	}

	/**
	 * Creates the environment specific app storage file and bucket metadata info collections
	 * @param  {array} collections The list of mongodb collections of the environment database
	 */
	async creteStorageInfoCollection(collections) {
		const db = this.getEnvDB();
		const length = collections.length;
		// Check for file storage info
		let collection = null;
		for (let i = 0; i < length; i++) {
			const item = collections[i];
			if (item.collectionName === "files") collection = item;
		}

		// Collection has not created yet let's create it
		if (!collection) {
			collection = await db.createCollection("files");
			// Create all required indices
			await collection.createIndexes([
				{
					key: { fileName: 1 },
				},
				{
					key: { bucketId: 1 },
				},
				{
					key: { isPublic: 1 },
				},
				{
					key: { size: 1 },
				},
				{
					key: { mimeType: 1 },
				},
				{
					key: { publicPath: 1 },
				},
				{
					key: { uploadedAt: 1 },
				},
				{
					key: { updatedAt: 1 },
				},
				{
					key: { userId: 1 },
				},
				{
					key: { tags: 1 },
				},
			]);

			this.addLog(t("Created file storage info collection"));
		}

		// Check for bucket info
		let collection2 = null;
		for (let i = 0; i < length; i++) {
			const item = collections[i];
			if (item.collectionName === "buckets") collection2 = item;
		}
		// Collection has not created yet let's create it
		if (!collection2) {
			collection2 = await db.createCollection("buckets");
			//Create all required indices
			await collection2.createIndexes([
				{
					key: { name: 1 },
				},
				{
					key: { isPublic: 1 },
				},
				{
					key: { createdAt: 1 },
				},
				{
					key: { updatedAt: 1 },
				},
				{
					key: { userId: 1 },
				},
				{
					key: { tags: 1 },
				},
			]);

			this.addLog(t("Created bucket storage info collection"));
		}
	}

	/**
	 * Creates the environment specific message metadata collection that are submitted to a queue
	 * @param  {array} collections The list of mongodb collections of the environment database
	 */
	async createMessageInfoCollection(collections) {
		const db = this.getEnvDB();
		const length = collections.length;
		let collection = null;
		for (let i = 0; i < length; i++) {
			const item = collections[i];
			if (item.collectionName === "messages") collection = item;
		}

		// Collection has not created yet let's create it
		if (!collection) {
			collection = await db.createCollection("messages");
			// Create all required indices
			await collection.createIndexes([
				{
					key: { messageId: 1 },
				},
				{
					key: { queueId: 1 },
				},
				{
					key: { status: 1 },
				},
				{
					key: { startedAt: 1 },
				},
				{
					key: { completedAt: 1 },
				},
				{
					key: { delay: 1 },
				},
			]);

			// Delete records after 1 week
			await collection.createIndex(
				{ submittedAt: 1 },
				{ expireAfterSeconds: helper.constants["1week"] }
			);

			this.addLog(t("Created message info collection"));
		}
	}

	/**
	 * Creates the environment specific cron job metadata collection that are triggered by a cron schedule
	 * @param  {array} collections The list of mongodb collections of the environment database
	 */
	async createCronInfoCollection(collections) {
		const db = this.getEnvDB();
		let length = collections.length;
		let collection = null;
		for (let i = 0; i < length; i++) {
			const item = collections[i];
			if (item.collectionName === "cronjobs") collection = item;
		}

		// Collection has not created yet let's create it
		if (!collection) {
			collection = await db.createCollection("cronjobs");
			//C reate all required indices
			await collection.createIndexes([
				{
					key: { jobId: 1 },
				},
				{
					key: { cronId: 1 },
				},
				{
					key: { status: 1 },
				},
				{
					key: { startedAt: 1 },
				},
				{
					key: { completedAt: 1 },
				},
			]);

			// Delete records after 1 week
			await collection.createIndex(
				{ triggeredAt: 1 },
				{ expireAfterSeconds: helper.constants["1week"] }
			);

			this.addLog(t("Created cron job info collection"));
		}
	}

	/**
	 * Creates the environment specific endpoint logs collection. Endpoint logs will include the following fields
	 * timestamp, endpointPath, method, status, duration, envId, orgId, appId, versionId, endpointId, params, query,
	 * body, headers, cookies, response
	 * @param  {array} collections The list of mongodb collections of the environment database
	 */
	async createEndopintLogsCollection(collections) {
		const db = this.getEnvDB();
		let length = collections.length;
		let collection = null;
		for (let i = 0; i < length; i++) {
			const item = collections[i];
			if (item.collectionName === "endpoint_logs") collection = item;
		}

		// Collection has not created yet let's create it
		if (!collection) {
			collection = await db.createCollection("endpoint_logs");
			//C reate all required indices
			await collection.createIndexes([
				{
					key: { endpointPath: 1 },
				},
				{
					key: { method: 1 },
				},
				{
					key: { status: 1 },
				},
				{
					key: { duration: 1 },
				},
				{
					key: { appId: 1 },
				},
				{
					key: { versionId: 1 },
				},
				{
					key: { envId: 1 },
				},
				{
					key: { endpointId: 1 },
				},
			]);

			// Delete records after 1 week
			await collection.createIndex(
				{ timestamp: 1 },
				{ expireAfterSeconds: helper.constants["6months"] }
			);

			this.addLog(t("Created endpoint execution logs collection"));
		}
	}

	/**
	 * Creates the environment specific message queue logs collection. Message queue logs will include the following fields
	 * timestamp, queue (name), status, duration, envId, orgId, appId, versionId, queueId, message (payload), result
	 * @param  {array} collections The list of mongodb collections of the environment database
	 */
	async createMessageQueueLogsCollection(collections) {
		const db = this.getEnvDB();
		let length = collections.length;
		let collection = null;
		for (let i = 0; i < length; i++) {
			const item = collections[i];
			if (item.collectionName === "queue_logs") collection = item;
		}

		// Collection has not created yet let's create it
		if (!collection) {
			collection = await db.createCollection("queue_logs");
			//C reate all required indices
			await collection.createIndexes([
				{
					key: { queue: 1 },
				},
				{
					key: { status: 1 },
				},
				{
					key: { duration: 1 },
				},
				{
					key: { appId: 1 },
				},
				{
					key: { versionId: 1 },
				},
				{
					key: { envId: 1 },
				},
				{
					key: { queueId: 1 },
				},
			]);

			// Delete records after 1 week
			await collection.createIndex(
				{ timestamp: 1 },
				{ expireAfterSeconds: helper.constants["6months"] }
			);

			this.addLog(t("Created message queue execution logs collection"));
		}
	}

	/**
	 * Creates the environment specific cron job logs collection. Cron job logs will include the following fields
	 * timestamp, task (name), status, duration, envId, orgId, appId, versionId, queueId, result
	 * @param  {array} collections The list of mongodb collections of the environment database
	 */
	async createCronJobLogsCollection(collections) {
		const db = this.getEnvDB();
		let length = collections.length;
		let collection = null;
		for (let i = 0; i < length; i++) {
			const item = collections[i];
			if (item.collectionName === "cronjob_logs") collection = item;
		}

		// Collection has not created yet let's create it
		if (!collection) {
			collection = await db.createCollection("cronjob_logs");
			//C reate all required indices
			await collection.createIndexes([
				{
					key: { task: 1 },
				},
				{
					key: { status: 1 },
				},
				{
					key: { duration: 1 },
				},
				{
					key: { appId: 1 },
				},
				{
					key: { versionId: 1 },
				},
				{
					key: { envId: 1 },
				},
				{
					key: { taskId: 1 },
				},
			]);

			// Delete records after 1 week
			await collection.createIndex(
				{ timestamp: 1 },
				{ expireAfterSeconds: helper.constants["6months"] }
			);

			this.addLog(t("Created cron job execution logs collection"));
		}
	}

	/**
	 * Creates or updates the database schema in the target database
	 */
	async prepareDatabases() {
		const databases = this.getDatabases();
		for (let i = 0; i < databases.length; i++) {
			const db = databases[i];
			// We only process databases managed by the platform
			if (!db.managed) continue;

			this.addLog(
				t(
					"Started preparing database schema for '%s' database '%s'",
					db.type,
					db.name
				)
			);
			// Load the previous database configuration if there is any
			let prevConfig = await this.getPrevDBDefinition(db);
			let dbManager = this.createDBManager(db, prevConfig);

			await dbManager.beginSession();
			await dbManager.createDatabase();
			await dbManager.manageModels();
			await dbManager.endSession();

			this.addLog(
				t(
					"Completed preparing '%s' database '%s' schema and its associated models",
					db.type,
					db.name
				)
			);
		}
	}

	/**
	 * Deletes all managed databases and data stored in these databases
	 */
	async dropDatabases() {
		const databases = await this.getPrevDBDefinitions();
		for (let i = 0; i < databases.length; i++) {
			const db = databases[i];
			// We only process databases managed by the platform
			if (!db.managed) continue;

			this.addLog(t("Started deleting %s database %s", db.type, db.name));
			let dbManager = this.createDBManager(db, db);

			await dbManager.beginSession();
			await dbManager.dropDatabase();
			await dbManager.endSession();

			this.addLog(t("Completed deleting '%s' database '%s'", db.type, db.name));
		}
	}

	/**
	 * Create a new database schema manager
	 * @param  {object} dbConfig The database json configuration object
	 * @param  {object} prevConfig The database json object for the previous configuration
	 */
	createDBManager(dbConfig, prevConfig) {
		switch (dbConfig.type) {
			case DATABASE.MongoDB:
				return new MongoDBManager(dbConfig, prevConfig, (message, status) =>
					this.addLog(message, status)
				);
			case DATABASE.PostgreSQL:
				return new PostgresDBManager(dbConfig, prevConfig, (message, status) =>
					this.addLog(message, status)
				);
			case DATABASE.MySQL:
				return new MySQLDBManager(dbConfig, prevConfig, (message, status) =>
					this.addLog(message, status)
				);
			case DATABASE.SQLServer:
				return new MsSQLDBManager(dbConfig, prevConfig, (message, status) =>
					this.addLog(message, status)
				);
			case DATABASE.Oracle:
				return new OracleDBManager(dbConfig, prevConfig, (message, status) =>
					this.addLog(message, status)
				);
			default:
				throw new AgnostError(
					t("Unsupported database type '%s'", dbConfig.type)
				);
		}
	}

	/**
	 * Gets the existing (previous) database information first from the cache if not exists loads it from the engine cluster database
	 * @param  {object} db The database json object
	 */
	async getPrevDBDefinition(dbJson) {
		// If there is already a database configuration load it from the cache first
		let db = await getKey(`${this.getEnvId()}.db.${this.getDbId(dbJson)}`);
		if (db) return db;

		// Database configuration is not in the cache, load it from the database
		const engineDb = this.getEnvDB();
		db = await engineDb.collection("databases").findOne({ iid: dbJson.iid });
		if (db) return db;

		return null;
	}

	/**
	 * Gets all existing database configurations from engine cluster database
	 */
	async getPrevDBDefinitions() {
		// Database configuration is not in the cache, load it from the database
		const engineDb = this.getEnvDB();
		const cursor = await engineDb.collection("databases").find({});
		const databases = await cursor.toArray();
		await cursor.close();

		return databases ?? [];
	}

	/**
	 * Save new deployment configuration to the engine cluster database
	 */
	async saveDeploymentConfig() {
		const engineDb = this.getEnvDB();
		// Delete old configuration
		await engineDb.collection("databases").deleteMany({});

		// We should have records to insert into database if not mongodb it raises an error
		if (this.getDatabases().length > 0)
			await engineDb.collection("databases").insertMany(this.getDatabases());

		this.addLog("Saved deployment configuration to database");
	}

	/**
	 * Deploys the application version to the engine cluster
	 */
	async deployVersion() {
		try {
			this.addLog(t("Started deployment"));
			// Set current status of environment in engine cluster
			await this.setStatus("Deploying");
			// First add environment object data to cache
			this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());

			// Load all data models and do deployment initializations
			await this.loadDatabases();
			// Create application specific configuration and log collections
			await this.createInternalCollections();
			// Create database structure for databases and models (e.g.,tables, collections, indices)
			await this.prepareDatabases();
			// Save updated deployment to database
			await this.saveDeploymentConfig();
			// Execute all redis commands altogether
			await this.commitPipeline();

			// Update status of environment in engine cluster
			this.addLog(t("Completed deployment successfully"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");
			// Update status of environment in engine cluster
			await this.setStatus("OK");
			return { success: true };
		} catch (error) {
			// Update status of environment in engine cluster
			await this.setStatus("Error");
			// Send the deployment telemetry information to the platform
			this.addLog(
				[t("Deployment failed"), error.name, error.message, error.stack].join(
					"\n"
				),
				"Error"
			);
			await this.sendEnvironmentLogs("Error");
			return { success: false, error };
		}
	}

	/**
	 * Redeploys the application version to the engine cluster
	 */
	async redeployVersion() {
		try {
			this.addLog(t("Started redeployment"));
			// Set current status of environment in engine cluster
			await this.setStatus("Deploying");

			// Clear the initially cached environment data
			await this.clearCachedData(`${this.getEnvId()}.*`);
			// Add environment object data to cache
			this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
			// Load all data models and do deployment initializations
			await this.loadDatabases();
			// Create application specific configuration and log collections
			await this.createInternalCollections();
			// Create database structure for databases and models (e.g.,tables, collections, indices)
			await this.prepareDatabases();
			// Save updated deployment to database
			await this.saveDeploymentConfig();
			// Execute all redis commands altogether
			await this.commitPipeline();

			// Update status of environment in engine cluster
			this.addLog(t("Completed redeployment successfully"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");
			// Update status of environment in engine cluster
			await this.setStatus("OK");
			return { success: true };
		} catch (error) {
			// Update status of environment in engine cluster
			await this.setStatus("Error");
			// Send the deployment telemetry information to the platform
			this.addLog(
				[t("Redeployment failed"), error.name, error.message, error.stack].join(
					"\n"
				),
				"Error"
			);
			await this.sendEnvironmentLogs("Error");
			return { success: false, error };
		}
	}

	/**
	 * Undeploys the application version from the engine cluster
	 */
	async undeployVersion() {
		try {
			this.addLog(t("Started undeployment"));
			// Set current status of environment in engine cluster
			await this.setStatus("Undeploying");

			// Clear the initially cached environment data
			await this.clearCachedData(`${this.getEnvId()}.*`);

			// Drop application specific data (e.g., cache, database, storage)
			if (this.isDataDropped()) {
				await this.clearCachedData(`sessions.${this.getEnvId()}.*`);
				await this.clearCachedData(`cache.${this.getEnvId()}.*`);
				await this.clearCachedData(`tokens.${this.getEnvId()}.*`);
				await this.dropDatabases();
			}

			// Delete environment configuration database
			await this.dropEnvDB();
			// Execute all redis commands altogether
			await this.commitPipeline();

			// Update status of environment in engine cluster
			this.addLog(t("Completed undeployment successfully"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");
			// Update status of environment in engine cluster
			await this.setStatus("OK");
			return { success: true };
		} catch (error) {
			// Update status of environment in engine cluster
			await this.setStatus("Error");
			// Send the deployment telemetry information to the platform
			this.addLog(
				[t("Undeployment failed"), error.name, error.message, error.stack].join(
					"\n"
				),
				"Error"
			);
			await this.sendEnvironmentLogs("Error");
			return { success: false, error };
		}
	}

	/**
	 * Deploys the application version to the engine cluster
	 */
	async deleteEnvironment() {
		try {
			this.addLog(t("Started environment deletion"));
			// Set current status of environment in engine cluster
			await this.setStatus("Deleting");

			// Clear the initially cached environment data
			await this.clearCachedData(`${this.getEnvId()}.*`);

			// Drop application specific data (e.g., cache, database, storage)
			await this.clearCachedData(`sessions.${this.getEnvId()}.*`);
			await this.clearCachedData(`cache.${this.getEnvId()}.*`);
			await this.clearCachedData(`tokens.${this.getEnvId()}.*`);
			await this.dropDatabases();

			// Delete environment configuration database
			await this.dropEnvDB();
			// Execute all redis commands altogether
			await this.commitPipeline();

			// Update status of environment in engine cluster
			this.addLog(t("Completed environment deletion successfully"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");
			// Update status of environment in engine cluster
			await this.setStatus("OK");
			return { success: true };
		} catch (error) {
			// Update status of environment in engine cluster
			await this.setStatus("Error");
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("Environment deletion failed"),
					error.name,
					error.message,
					error.stack,
				].join("\n"),
				"Error"
			);
			await this.sendEnvironmentLogs("Error");
			return { success: false, error };
		}
	}
}
