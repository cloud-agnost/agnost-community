export class SchedulerBase {
	constructor() {}
	async disconnect() {}

	/**
	 * Adds the listerer to listen messages for the provided taskId
	 * @param  {string} queueId The iid of the queue
	 */
	async listenMessages(taskId) {}

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
		// If we have a debug channel then send the final message and turn off debug logging
		if (debugChannel) {
			if (status === 200)
				console.info(
					t(
						`'${
							task.name
						}' has completed processing the cron job successfully in ${
							Math.round(duration * 10) / 10
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
			`TASK: ${task.name} (${status}) ${Math.round(duration * 10) / 10}ms`
		);

		// Calculate size of the request and response body, if they are larger than certain size we do not log their content
		const conn = getDBClient();
		const timestamp = new Date();
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
		};

		// Save log to the database
		conn
			.db(META.getEnvId())
			.collection("cronjob_logs")
			.insertOne(log, { writeConcern: { w: 0 } });

		// Also update the message info record
		this.endProcessingTask(trackingId, timestamp, errors);
	}
}

export default new SchedulerBase();
