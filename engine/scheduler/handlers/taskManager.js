import axios from "axios";
import { deployTask, undeployTask, undeployTasks } from "../init/agenda.js";

export class TaskManager {
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
	 * Returns the tasks of the app version
	 */
	getTasks() {
		return this.msgObj.tasks;
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
		if (!this.msgObj.schedulerCallback) return;

		try {
			// Update the environment log object
			await axios.post(
				this.msgObj.schedulerCallback,
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
	 * Schedules the application version tasks (cron jobs)
	 */
	async deployTasks() {
		try {
			this.addLog(t("Started scheduling cron jobs"));
			let tasks = this.getTasks();

			// Deploy each task one by one
			for (let i = 0; i < tasks.length; i++) {
				const task = tasks[i];
				await deployTask(this.getEnvObj(), task);
			}

			// Update status of environment in engine cluster
			this.addLog(t("Completed cron job scheduling successfully"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");

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

	/**
	 * Reschedules the application version tasks (cron jobs)
	 */
	async redeployTasks() {
		try {
			this.addLog(t("Started rescheduling cron jobs"));
			let tasks = this.getTasks();

			// Undeploy and redeploy tasks
			for (let i = 0; i < tasks.length; i++) {
				const task = tasks[i];

				await undeployTask(this.getEnvId(), task.iid);
				await deployTask(this.getEnvObj(), task);
			}

			// Update status of environment in engine cluster
			this.addLog(t("Completed cron job rescheduling successfully"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");

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

	/**
	 * Cancels the application schedule of tasks
	 */
	async undeployTasks() {
		try {
			this.addLog(t("Started cancelling cron jobs"));
			let tasks = this.getTasks();

			// Undeploy and redeploy tasks
			for (let i = 0; i < tasks.length; i++) {
				const task = tasks[i];
				await undeployTask(this.getEnvId(), task.iid);
			}

			// Update status of environment in engine cluster
			this.addLog(t("Completed cron job cancellation successfully"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");

			return { success: true };
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("Cron job cancellation failed"),
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

	/**
	 * Cancels the application schedule of all tasks of application version
	 */
	async deleteTasks() {
		try {
			this.addLog(t("Started cancelling all cron jobs"));

			await undeployTasks(this.getEnvId());

			// Update status of environment in engine cluster
			this.addLog(t("Completed cancellation of all cron jobs successfully"));

			return { success: true };
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("All cron jobs cancellation failed"),
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
