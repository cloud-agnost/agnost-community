import path from "path";
import fs from "fs/promises";

export class MetaManager {
	constructor(envObj) {
		// Set the environment object and initialize other metadata objects
		this.envObj = envObj;
		this.databases = null;
		this.endpoints = null;
		this.middlewares = null;
		this.queues = null;
		this.tasks = null;
	}

	/**
	 * Returns the environment object
	 */
	getEnvObj() {
		return this.envObj;
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
			this.databases = await await this.loadEntityConfigFile("databases");

		return this.databases;
	}

	/**
	 * Returns the list of endpoints
	 */
	async getEndpoints() {
		if (!this.endpoints)
			this.endpoints = await await this.loadEntityConfigFile("endpoints");

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
	 * Returns the list of tasks
	 */
	async getTasks() {
		if (!this.tasks) this.tasks = await this.loadEntityConfigFile("tasks");

		return this.tasks;
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
}
