import axios from "axios";

export class DeploymentManager {
	constructor(msgObj) {
		this.msgObj = msgObj;

		// Deployment operation logs
		this.logs = [];
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
		if (!this.msgObj.engineCallback) return;

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

	/**
	 * Updates the API server (engine) of the environment
	 */
	async manageAPIServer() {
		try {
			this.addLog(t("Started updating API server"));

			// Update status of environment in engine cluster
			this.addLog(t("Completed API server updates successfully"));
			// Send the deployment telemetry information to the platform
			//await this.sendEnvironmentLogs("OK");

			return { success: true };
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("Cron job scheduling failed"),
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
