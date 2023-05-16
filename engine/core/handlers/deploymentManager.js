import axios from "axios";

export class DeploymentManager {
	constructor(msgObj) {
		// Set the message object
		this.msgObj = msgObj;
		// Set the environment object
		this.envObj = null;
		// Deployment operation logs
		this.logs = [];
	}

	/**
	 * Returns the environment object
	 */
	setEnvObj(envObj) {
		this.envObj = envObj;
	}

	/**
	 * Returns the environment object
	 */
	getEnvObj() {
		return this.envObj ?? this.msgObj.env;
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
		return this.getVersion().npmPackages;
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
		if (!this.msgObj?.engineCallback) return;

		try {
			// Update the environment log object
			await axios.post(
				this.msgObj.engineCallback,
				{
					status,
					logs: this.logs,
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
}
