import path from "path";
import fs from "fs/promises";
import { readFileSync } from "fs";

export class MetaManager {
	constructor(envObj) {
		// Set the environment object and initialize other metadata objects
		this.envObj = envObj;
		this.databases = null;
		this.endpoints = null;
		this.middlewares = null;
		this.queues = null;
		this.tasks = null;
		this.storages = null;
		this.functions = null;
		this.caches = null;
	}

	/**
	 * Resets the cache of META manager
	 */
	reset(envObj) {
		this.envObj = envObj;
		this.databases = null;
		this.endpoints = null;
		this.middlewares = null;
		this.queues = null;
		this.tasks = null;
		this.storages = null;
		this.functions = null;
		this.caches = null;
	}

	/**
	 * Returns the environment object
	 */
	getEnvObj() {
		return this.envObj;
	}

	/**
	 * Returns the app object
	 */
	getAppObj() {
		return this.envObj.app;
	}

	/**
	 * Returns the app team members
	 */
	getAppTeam() {
		return this.envObj.app?.team;
	}

	/**
	 * Returns the environment iid (internal identifier)
	 */
	getEnvId() {
		return this.getEnvObj().iid;
	}

	/**
	 * Returns the version of the app
	 */
	getVersion() {
		return this.getEnvObj().version;
	}

	/**
	 * Returns the NPM packages of the version
	 */
	getPackages() {
		return this.getVersion().npmPackages ?? [];
	}

	/**
	 * Returns the params of the version
	 */
	getEnvironmentVariables() {
		return this.getVersion().params ?? [];
	}

	/**
	 * Returns the API keys of the version
	 */
	getAPIKeys() {
		return this.getVersion().apiKeys ?? [];
	}

	/**
	 * Returns the rate limits of the version
	 */
	getLimits() {
		return this.getVersion().limits ?? [];
	}

	/**
	 * Returns the default rate limits of the application
	 */
	getEndpointDefaultRateLimits() {
		return this.getVersion().defaultEndpointLimits ?? [];
	}

	/**
	 * Returns the environment resource mappings
	 */
	getResourceMappings() {
		return this.getEnvObj().mappings ?? [];
	}

	/**
	 * Returns the environment resource mappings
	 */
	getResources() {
		return this.getEnvObj().resources ?? [];
	}

	/**
	 * Returns whether the environment is suspended or not
	 */
	isSuspended() {
		return this.getEnvObj().suspended;
	}

	/**
	 * Returns the list of databases
	 */
	async getDatabases() {
		if (!this.databases)
			this.databases = await this.loadEntityConfigFile("databases");

		return this.databases;
	}

	/**
	 * Returns the list of databases
	 */
	getDatabasesSync() {
		if (!this.databases)
			this.databases = this.loadEntityConfigFileSync("databases");

		return this.databases;
	}

	/**
	 * Returns a specific database
	 */
	getDatabaseByName(name) {
		const databases = this.getDatabasesSync();
		return databases.find((entry) => entry.name === name);
	}

	/**
	 * Returns a specific database model
	 */
	getDatabaseModelByName(dbName, modelName) {
		const databases = this.getDatabasesSync();
		const db = databases.find((entry) => entry.name === dbName);

		if (!db) return null;
		return db.models.find((entry) => entry.name === modelName);
	}

	/**
	 * Returns a specific database model
	 */
	getDatabaseModelByIId(dbIId, modelIId) {
		const databases = this.getDatabasesSync();
		const db = databases.find((entry) => entry.iid === dbIId);

		if (!db) return { userDb: null, userModel: null };
		return {
			userDb: db,
			userModel: db.models.find((entry) => entry.iid === modelIId),
		};
	}

	/**
	 * Returns the list of endpoints
	 */
	async getEndpoints() {
		if (!this.endpoints)
			this.endpoints = await this.loadEntityConfigFile("endpoints");

		return this.endpoints;
	}

	/**
	 * Returns the list of middlewares
	 */
	async getMiddlewares() {
		if (!this.middlewares)
			this.middlewares = await this.loadEntityConfigFile("middlewares");

		return this.middlewares;
	}

	/**
	 * Returns the list of queues
	 */
	async getQueues() {
		if (!this.queues) this.queues = await this.loadEntityConfigFile("queues");

		return this.queues;
	}

	/**
	 * Returns the list of queues
	 */
	getQueuesSync() {
		if (!this.queues) this.queues = this.loadEntityConfigFileSync("queues");

		return this.queues;
	}

	/**
	 * Returns a specific queue
	 */
	getQueueByName(name) {
		const queues = this.getQueuesSync();
		return queues.find((entry) => entry.name === name);
	}

	/**
	 * Returns the list of tasks
	 */
	async getTasks() {
		if (!this.tasks) this.tasks = await this.loadEntityConfigFile("tasks");

		return this.tasks;
	}

	/**
	 * Returns the list of tasks
	 */
	getTasksSync() {
		if (!this.tasks) this.tasks = this.loadEntityConfigFileSync("tasks");

		return this.tasks;
	}

	/**
	 * Returns a specific task
	 */
	getTaskByName(name) {
		const tasks = this.getTasksSync();

		return tasks.find((entry) => entry.name === name);
	}

	/**
	 * Returns the list of storages
	 */
	async getStorages() {
		if (!this.storages)
			this.storages = await this.loadEntityConfigFile("storages");

		return this.storages;
	}

	/**
	 * Returns the list of storages
	 */
	getStoragesSync() {
		if (!this.storages)
			this.storages = this.loadEntityConfigFileSync("storages");

		return this.storages;
	}

	/**
	 * Returns a specific storage
	 */
	getStorageByName(name) {
		const storages = this.getStoragesSync();

		return storages.find((entry) => entry.name === name);
	}

	/**
	 * Returns the queue object identified byt is iid
	 * @param  {string} queueId The iid of the queue
	 */
	async getQueue(queueId) {
		if (!this.queues) this.queues = await this.loadEntityConfigFile("queues");

		return this.queues.find((entry) => entry.iid === queueId);
	}

	/**
	 * Returns the task object identified byt is iid
	 * @param  {string} taskId The iid of the task
	 */
	async getTask(taskId) {
		if (!this.tasks) this.tasks = await this.loadEntityConfigFile("tasks");

		return this.tasks.find((entry) => entry.iid === taskId);
	}

	/**
	 * Returns the list of functions
	 */
	async getFunctions() {
		if (!this.functions)
			this.functions = await this.loadEntityConfigFile("functions");

		return this.functions;
	}

	/**
	 * Returns the list of functions
	 */
	getFunctionsSync() {
		if (!this.functions)
			this.functions = this.loadEntityConfigFileSync("functions");

		return this.functions;
	}

	/**
	 * Returns a specific function
	 */
	getFunctionByName(name) {
		const functions = this.getFunctionsSync();

		return functions.find((entry) => entry.name === name);
	}

	/**
	 * Returns the list of caches
	 */
	async getCaches() {
		if (!this.caches) this.caches = await this.loadEntityConfigFile("caches");

		return this.caches;
	}

	/**
	 * Returns the list of caches
	 */
	getCachesSync() {
		if (!this.caches) this.caches = this.loadEntityConfigFileSync("caches");

		return this.caches;
	}

	/**
	 * Returns a specific cache
	 */
	getCacheByName(name) {
		const caches = this.getCachesSync();

		return caches.find((entry) => entry.name === name);
	}

	/**
	 * Loads the environment config file
	 */
	async loadEnvConfigFile() {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(
				`${appPath}/meta/config/environment.json`,
				"utf8"
			);
			return JSON.parse(fileContents);
		} catch (error) {
			return null;
		}
	}

	/**
	 * Loads the specific entity configuration file, if not config file exists it returns an empty array object
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 */
	async loadEntityConfigFile(contentType) {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(
				`${appPath}/meta/config/${contentType}.json`,
				"utf8"
			);
			return JSON.parse(fileContents);
		} catch (error) {
			return [];
		}
	}

	/**
	 * Loads the specific entity configuration file, if not config file exists it returns an empty array object
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 */
	loadEntityConfigFileSync(contentType) {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = readFileSync(
				`${appPath}/meta/config/${contentType}.json`,
				"utf8"
			);
			return JSON.parse(fileContents);
		} catch (error) {
			return [];
		}
	}

	/**
	 * Returns the message template that is used during authentication flow
	 * @param  {string} templateType The type of the template, can be one of the following:
	 * verify_sms_code
	 * confirm_email
	 * reset_password
	 * magic_link
	 * confirm_email_change
	 */
	getMessageTemplate(templateType) {
		const messageTemplates = this.getVersion().authentication.messages;
		return messageTemplates.find((entry) => entry.type === templateType);
	}
}
