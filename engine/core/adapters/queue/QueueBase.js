import { getDBClient } from "../../init/db.js";

export class QueueBase {
	constructor() {}
	async disconnect() {}

	/**
	 * Adds the listerer to listen messages for the provided queueId
	 * @param  {Object} queue The queue object
	 */
	async listenMessages(queue) {}

	/**
	 * Sends a message to the specified queue
	 * @param  {Object} queue The queue object
	 * @param  {Object} payload The message payload
	 * @param  {Number} delayMs The delay duration (in milliseconds) of the message before distpatched to the queue
	 * @param  {string} debugChannel The realtime debug unique channel id
	 */
	async sendMessage(queue, payload, delayMs = 0, debugChannel = null) {}

	/**
	 * Adds a new message tracking record to the database
	 * @param  {Object} trackingRecord The tracking record to add to the database
	 */
	async createMessageTrackingRecord(trackingRecord) {
		const conn = getDBClient();
		let db = conn.db(META.getEnvId());
		await db.collection("messages").insertOne(trackingRecord);
	}

	/**
	 * Updates the message info record
	 * @param  {string} trackingId The tracking id of the message
	 * @param  {Object} startDtm The start date-time of the message
	 */
	async startProcessingMessage(trackingId, startDtm) {
		const conn = getDBClient();
		let db = conn.db(META.getEnvId());
		await db
			.collection("messages")
			.findOneAndUpdate(
				{ trackingId: helper.objectId(trackingId) },
				{ $set: { startedAt: startDtm, status: "processing" } }
			);
	}

	/**
	 * Updates the message info record
	 * @param  {string} trackingId The tracking id of the message
	 * @param  {Object} endDtm The end date-time of the message
	 * @param  {Object} errors The errors object if any
	 */
	async endProcessingMessage(trackingId, endDtm, errors = null) {
		const conn = getDBClient();
		let db = conn.db(META.getEnvId());
		let status = "completed";
		if (errors) status = "errors";

		if (errors) {
			await db
				.collection("messages")
				.findOneAndUpdate(
					{ trackingId: helper.objectId(trackingId) },
					{ $set: { completedAt: endDtm, status: status, errors: errors } }
				);
		} else {
			await db
				.collection("messages")
				.findOneAndUpdate(
					{ trackingId: helper.objectId(trackingId) },
					{ $set: { completedAt: endDtm, status: status } }
				);
		}
	}

	/**
	 * Logs the message processing
	 * @param  {string} debugChannel If the message is processed in debug mode then this parameter holds the realtime debug channel unique identifier
	 * @param  {string} trackingId The tracking id of the message
	 * @param  {Object} queue The queue object
	 * @param  {Object} payload The message itself
	 * @param  {Number} status The message status 400 - error, 200 - success
	 * @param  {Number} time The duration of execution in milliseconds
	 * @param  {Object} errors The errors object if any
	 */
	logMessageProcessing(
		debugChannel,
		trackingId,
		queue,
		payload,
		status,
		time,
		errors
	) {
		// If we have a debug channel then send the final message and turn off debug logging
		if (debugChannel) {
			if (status === 200)
				console.info(
					t(
						`'${
							queue.name
						}' has completed processing the input message successfully in ${
							Math.round(duration * 10) / 10
						}ms`
					)
				);
			else
				console.error(
					t(
						`'${queue.name}' had errors while processsing the input message.\n %s`,
						JSON.stringify(errors, null, 2)
					)
				);

			helper.turnOffLogging();
		}

		logger.info(
			`QUEUE: ${queue.name} (${status}) ${Math.round(duration * 10) / 10}ms`
		);

		// Update the message info record
		this.endProcessingMessage(trackingId, timestamp, errors);

		// If queue logs enabled then add the log entry to the database
		if (queue.logExecution) {
			// Calculate size of the request and response body, if they are larger than certain size we do not log their content
			const conn = getDBClient();
			const messageSize = Buffer.byteLength(JSON.stringify(payload));

			const timestamp = new Date();
			const log = {
				timestamp: timestamp,
				name: queue.name,
				status: status === 400 ? "error" : "success", // 200 or 400
				duration: time,
				orgId: queue.orgId,
				appId: queue.appId,
				versionId: queue.versionId,
				envId: META.getEnvObj()._id,
				queueId: queue._id,
				message:
					messageSize > config.get("general.maxLogPayloadSizeKB") * 1024
						? t("Message too large to store")
						: payload,
				errors: errors,
			};

			// Save log to the database
			conn
				.db(META.getEnvId())
				.collection("queue_logs")
				.insertOne(log, { writeConcern: { w: 0 } });
		}
	}
}

export default new QueueBase();
