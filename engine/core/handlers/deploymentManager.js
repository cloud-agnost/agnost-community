import axios from "axios";
import path from "path";
import fs from "fs/promises";

export class DeploymentManager {
	constructor(msgObj, envObj) {
		this.msgObj = msgObj;
		// Set the environment object
		this.envObj = envObj;
		// Deployment operation logs
		this.logs = [];
	}

	/**
	 * Clear logs
	 */
	clearLogs() {
		this.logs = [];
	}

	/**
	 * Set the environment object of the deployment manager
	 * @param  {Object} envObj Environment object json
	 */
	setEnvObj(envObj) {
		this.envObj = envObj;
	}

	/**
	 * Returns the environment object
	 */
	getEnvObj() {
		return this.envObj || this.msgObj?.env;
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
			pod: process.env.HOSTNAME,
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
		if (!this.msgObj?.callback && !this.envObj.callback) return;

		try {
			// Update the environment log object
			await axios.post(
				this.msgObj?.callback || this.envObj.callback,
				{
					status: status,
					logs: this.logs,
					type: "server",
					pod: process.env.HOSTNAME,
				},
				{
					headers: {
						Authorization: process.env.MASTER_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);
		} catch (err) {}
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
