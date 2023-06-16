import { SchedulerBase } from "./SchedulerBase.js";

/**
 * Manages listening and processing the cron job triggered tasks
 */
export class Agenda extends SchedulerBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	async disconnect() {
		// We are using the default queue connection, do not disconnect
	}

	/**
	 * Adds the listerer to listen messages for the provided taskId
	 * @param  {string} taskId The iid of the task
	 */
	async listenMessages(taskId) {
		const envId = META.getEnvId();
		const queueCount = config.get("general.taskProcessQueueCount");

		// Listen for messages
		for (let i = 1; i <= queueCount; i++) {
			this.processTask(taskId, `process-task-${envId}-${taskId}-${i}`);
		}
	}

	/**
	 * Listens and processes tasks from the provided queue
	 * @param  {string} taskId The unique task iid
	 * @param  {string} queue The unique queue name
	 */
	processTask(taskId, queue) {
		this.driver.createChannel(function (error, channel) {
			if (error) {
				logger.error("Cannot create channel to message queue", {
					details: error,
				});

				return;
			}

			channel.assertQueue(queue, {
				durable: true,
				autoDelete: true,
			});

			logger.info("Listening messages from <" + queue + "> queue");

			//Tells RabbitMQ not to give more than one message to a worker at a time. Or, in other words,
			//don't dispatch a new message to a worker until it has processed and acknowledged the previous one.
			//Instead, it will dispatch it to the next worker that is not still busy
			channel.prefetch(1);

			channel.consume(
				queue,
				async function (messsage) {
					const taskObj = await META.getTask(taskId);
					//Start timer
					const start = Date.now();
					const messageObj = JSON.parse(messsage.content.toString());
					const { trackingId, debugChannel } = messageObj;

					// If we have a debug channel then turn on debug logging
					if (debugChannel) helper.turnOnLogging(debugChannel);

					// Mark the message as being processed
					await this.startProcessingTask(trackingId, new Date(start));

					// Check whether the environment is suspended or not
					if (META.isSuspended()) {
						// Log processing of the message
						await this.logTaskProcessing(
							debugChannel,
							trackingId,
							taskObj,
							400, // Error code
							Date.now() - start,
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.suspendedEnvironment,
								t(
									"Access to API server has been suspended, no operation can be executed until suspension has been revoked"
								)
							)
						);
						return;
					}

					// We can run the queue code
					const handlerModule = null;
					try {
						// Dynamicly import the
						handlerModule = await import(`../../meta/queues/${taskId}.js`);

						const handlerFunction = handlerModule.default;
						// Check the endpoint module has a default exprot or not
						if (!handlerFunction) {
							// Log processing of the message
							await this.logTaskProcessing(
								debugChannel,
								trackingId,
								taskObj,
								400, // Error code
								Date.now() - start,
								helper.createErrorMessage(
									ERROR_CODES.clientError,
									ERROR_CODES.missingDefaultExport,
									t(
										"The taskk '%s' code does not have a default exported function.",
										taskObj.name
									)
								)
							);
							return;
						}

						// Check the default exported entitity is a callable function or not
						if (
							!(
								handlerFunction &&
								typeof handlerFunction === "function" &&
								(handlerFunction.constructor ||
									handlerFunction.call ||
									handlerFunction.apply)
							)
						) {
							// Log processing of the message
							await this.logTaskProcessing(
								debugChannel,
								trackingId,
								taskObj,
								400, // Error code
								Date.now() - start,
								helper.createErrorMessage(
									ERROR_CODES.clientError,
									ERROR_CODES.invalidFunction,
									t(
										"Function specified in task '%s' is not valid. A callable function is required.",
										endpoint.name
									)
								)
							);
							return;
						}

						try {
							// Run the function
							await handlerFunction();
							// Log processing of the message
							await this.logTaskProcessing(
								debugChannel,
								trackingId,
								taskObj,
								200, // Success code
								Date.now() - start
							);
						} catch (error) {
							// Log processing of the message
							await this.logTaskProcessing(
								debugChannel,
								trackingId,
								taskObj,
								400, // Error code
								Date.now() - start,
								helper.createErrorMessage(
									ERROR_CODES.clientError,
									ERROR_CODES.queueExecutionError,
									t(
										"An error occurred while executing the '%s' task handler function. %s",
										taskObj.name,
										error.message
									),
									{
										name: error.name,
										message: error.message,
										stack: error.stack,
									}
								)
							);
							return;
						}
					} catch (error) {
						// Log processing of the message
						await this.logTaskProcessing(
							debugChannel,
							trackingId,
							taskObj,
							400, // Error code
							Date.now() - start,
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.queueImportError,
								t(
									"An error occurred while importing the '%s' task module. %s",
									taskObj.name,
									error.message
								),
								{
									name: error.name,
									message: error.message,
									stack: error.stack,
								}
							)
						);
						return;
					}
				},
				{
					// The broker will not expect an acknowledgement of messages delivered to this consumer
					// It will dequeue messages as soon as they’ve been sent down the wire
					noAck: true,
				}
			);
		});
	}
}
