import { getDBClient } from "../../init/db.js";

export class SchedulerBase {
	constructor() {}
	async disconnect() {}

	/**
	 * Adds the listerer to listen messages for the provided taskId
	 * @param  {object} task The task object
	 */
	async listenMessages(task) {}

	/**
	 * Trigger the execution of the cron job
	 * @param  {object} task The task object
	 * @param  {string} debugChannel The debugChannel id
	 */
	async triggerCronJob(task, debugChannel = null) {}

	/**
	 * Gets the cron job task tracking record information
	 * @param  {string} trackingId The tracking id of the task
	 */
	async getTaskTrackingRecord(cronJobId, trackingId) {
		if (!helper.isValidId(trackingId))
			throw new AgnostError(
				t("Not a valid tracking identifier '%s'", trackingId ?? "")
			);

		const conn = getDBClient();
		let db = conn.db(META.getEnvId());
		return await db
			.collection("cronjobs")
			.findOne(
				{ cronJobId, trackingId: helper.generateId(trackingId) },
				{ projection: { _id: 0 } }
			);
	}

	/**
	 * Adds a new cron job tracking record to the database and returns the created tracking record
	 * @param  {Object} trackingRecord The tracking record to add to the database
	 */
	async createCronJobTrackingRecord(trackingRecord) {
		const conn = getDBClient();
		let db = conn.db(META.getEnvId());
		const result = await db.collection("cronjobs").insertOne(trackingRecord);
		if (result?.insertedId) {
			return await db
				.collection("cronjobs")
				.findOne({ _id: result?.insertedId }, { projection: { _id: 0 } });
		}
		return null;
	}

	/**
	 * Updates the task info record
	 * @param  {string} trackingId The tracking id of the task
	 * @param  {Object} startDtm The start date-time of the task
	 */
	async startProcessingTask(trackingId, startDtm) {
		const conn = getDBClient();
		let db = conn.db(META.getEnvId());
		await db
			.collection("cronjobs")
			.findOneAndUpdate(
				{ trackingId: helper.objectId(trackingId) },
				{ $set: { startedAt: startDtm, status: "processing" } }
			);
	}

	/**
	 * Updates the task info record
	 * @param  {string} trackingId The tracking id of the task
	 * @param  {Object} endDtm The end date-time of the task
	 * @param  {Object} errors The errors object if any
	 */
	async endProcessingTask(trackingId, endDtm, errors = null) {
		const conn = getDBClient();
		let db = conn.db(META.getEnvId());
		let status = "completed";
		if (errors) status = "errors";

		if (errors) {
			await db
				.collection("cronjobs")
				.findOneAndUpdate(
					{ trackingId: helper.objectId(trackingId) },
					{ $set: { completedAt: endDtm, status: status, errors: errors } }
				);
		} else {
			await db
				.collection("cronjobs")
				.findOneAndUpdate(
					{ trackingId: helper.objectId(trackingId) },
					{ $set: { completedAt: endDtm, status: status } }
				);
		}
	}

	/**
	 * Logs the task processing
	 * @param  {string} debugChannel If the task is processed in debug mode then this parameter holds the realtime debug channel unique identifier
	 * @param  {string} trackingId The tracking id of the task
	 * @param  {Object} task The task object
	 * @param  {Number} status The task processing status 400 - error, 200 - success
	 * @param  {Number} time The duration of execution in milliseconds
	 * @param  {Object} errors The errors object if any
	 */
	logTaskProcessing(debugChannel, trackingId, task, status, time, errors) {
		const timestamp = new Date();
		// If we have a debug channel then send the final message and turn off debug logging
		if (debugChannel) {
			if (status === 200)
				console.info(
					t(
						`'${
							task.name
						}' has completed processing the cron job successfully in ${
							Math.round(time * 10) / 10
						}ms`
					)
				);
			else
				console.error(
					t(
						`'${task.name}' had errors while processsing the cron job.\n %s`,
						JSON.stringify(errors, null, 2)
					)
				);

			helper.turnOffLogging();
		}

		logger.info(
			`TASK: ${task.name} (${status}) ${Math.round(time * 10) / 10}ms`
		);

		// Also update the cronjob info record
		this.endProcessingTask(trackingId, timestamp, errors);

		// If queue logs enabled then add the log entry to the database
		if (task.logExecution) {
			// Calculate size of the request and response body, if they are larger than certain size we do not log their content
			const conn = getDBClient();
			const log = {
				timestamp: timestamp,
				name: task.name,
				status: status === 400 ? "error" : "success", // 200 or 400
				duration: time,
				orgId: task.orgId,
				appId: task.appId,
				versionId: task.versionId,
				envId: META.getEnvObj()._id,
				taskId: task._id,
				errors: errors,
				debug: debugChannel ? true : false,
			};

			// Save log to the database
			conn
				.db(META.getEnvId())
				.collection("cronjob_logs")
				.insertOne(log, { writeConcern: { w: 0 } });
		}
	}
}

export default new SchedulerBase();
