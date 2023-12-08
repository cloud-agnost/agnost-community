import { QueueBase } from "./QueueBase.js";
import ERROR_CODES from "../../config/errorCodes.js";

/**
 * Manages message listen and dispatch operations in RabbitMQ
 */
export class RabbitMQ extends QueueBase {
	constructor(driver, manager, config) {
		super();
		this.driver = driver;
		this.manager = manager;
		this.config = config;
		this.consumeChannel = null;
		this.publishChannel = null;
	}

	async disconnect() {
		try {
			await this.driver.close();
		} catch (err) {}
	}

	/**
	 * In order to correctly and effectively update the child process resources we need to close the old channels
	 */
	async closeChannels() {
		try {
			if (this.consumeChannel) await this.consumeChannel.close();
		} catch (err) {}

		this.consumeChannel = null;
	}

	/**
	 * Adds the listerer to listen messages for the provided queue
	 * @param  {Object} queue The queue object
	 */
	async listenMessages(queue) {
		const envId = META.getEnvId();
		const queueCount = config.get("general.messageProcessQueueCount");
		const exchangeCount = config.get("general.delayedMessageExchangeCount");

		// Listen for messages
		for (let i = 1; i <= queueCount; i++) {
			await this.processMessage(
				queue,
				`process-message-${envId}-${queue.name}-${i}`
			);
		}

		// Check if the message broker supports delayed messages or not
		if (!this.config?.delayedMessages) return;
		// Listen for delayed messages
		for (let i = 1; i <= exchangeCount; i++) {
			await this.processMessage(
				queue,
				`process-delayed-message-${envId}-${queue.name}-${i}`,
				`process-delayed-message-exchange-${envId}-${queue.name}-${i}`
			);
		}
	}

	/**
	 * Sends a message to the specified queue
	 * @param  {Object} queue The queue object
	 * @param  {Object} payload The message payload
	 * @param  {Number} delayMs The delay duration (in milliseconds) of the message before distpatched to the queue
	 * @param  {string} debugChannel The realtime debug unique channel id
	 */
	async sendMessage(queue, payload, delayMs = 0, debugChannel = null) {
		// Add a tracking record to track progress of this message
		const trackingId = helper.generateId();
		const trackingRecord = await this.createMessageTrackingRecord({
			trackingId: trackingId,
			queueId: queue.iid,
			queueName: queue.name,
			submittedAt: new Date(),
			status: "pending",
			delay: delayMs,
		});

		try {
			if (!this.publishChannel) {
				this.publishChannel = await this.driver.createChannel();
			}

			this.publishChannel.on("error", (err) => {
				console.error("RabbitMQ channel error to send messages:", queue, err);
			});

			const envId = META.getEnvId();
			const message = {
				timestamp: new Date(),
				trackingId: trackingId,
				payload,
				debugChannel,
			};

			// Check if this is a delayed message or not
			if (delayMs && delayMs > 0 && this.config?.delayedMessages) {
				const exchangeNumber = helper.randomInt(
					1,
					config.get("general.delayedMessageExchangeCount")
				);
				const exchangeName = `process-delayed-message-exchange-${envId}-${queue.name}-${exchangeNumber}`;

				await this.publishChannel.assertExchange(
					exchangeName,
					"x-delayed-message",
					{
						durable: true,
						autoDelete: true,
						arguments: {
							"x-delayed-type": "direct",
						},
					}
				);

				//Since payload is string we do not stringify it
				await this.publishChannel.publish(
					exchangeName,
					"",
					Buffer.from(JSON.stringify(message)),
					{
						persistent: true,
						timestamp: Date.now(),
						headers: {
							"x-delay": delayMs,
						},
					}
				);
			} else {
				const queueNumber = helper.randomInt(
					1,
					config.get("general.messageProcessQueueCount")
				);
				const queueName = `process-message-${envId}-${queue.name}-${queueNumber}`;

				await this.publishChannel.assertQueue(queueName, {
					durable: true,
					autoDelete: true,
					arguments: {
						// With lazy queues, the messages go straight to disk, thereby minimizing the RAM usage, though throughput will be lower.
						"x-queue-mode": "lazy",
					},
				});

				await this.publishChannel.sendToQueue(
					queueName,
					Buffer.from(JSON.stringify(message)),
					{
						persistent: true,
						timestamp: Date.now(),
					}
				);
			}
		} catch (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});
		}

		return trackingRecord;
	}

	/**
	 * Listens and processes messages from the provided queue
	 * @param  {Object} queue The queue object
	 * @param  {string} queue The unique queue name
	 * @param  {string} exchange The unique exchange name (this is used to process delayed messages)
	 */
	async processMessage(queueObj, queue, exchange) {
		try {
			if (!this.consumeChannel) {
				this.consumeChannel = await this.driver.createChannel();
			}

			this.consumeChannel.on("error", (err) => {
				console.error(
					"RabbitMQ channel error to process messages:",
					queue,
					exchange,
					err
				);
			});

			// If this is a delayed message then we need to bind the queue to the exchange
			if (exchange) {
				await this.consumeChannel.assertExchange(
					exchange,
					"x-delayed-message",
					{
						durable: true,
						autoDelete: true,
						arguments: {
							"x-delayed-type": "direct",
						},
					}
				);

				await this.consumeChannel.assertQueue(queue, {
					durable: true,
					autoDelete: true,
					arguments: {
						// With lazy queues, the messages go straight to disk, thereby minimizing the RAM usage, though throughput will be lower.
						"x-queue-mode": "lazy",
					},
				});

				// Bind exchange to the queue
				await this.consumeChannel.bindQueue(queue, exchange, "");
				logger.info(
					"Listening delayed messages from <" +
						exchange +
						"->" +
						queue +
						"> queue"
				);
			} else {
				await this.consumeChannel.assertQueue(queue, {
					durable: true,
					autoDelete: true,
					arguments: {
						// With lazy queues, the messages go straight to disk, thereby minimizing the RAM usage, though throughput will be lower.
						"x-queue-mode": "lazy",
					},
				});

				logger.info("Listening messages from <" + queue + "> queue");
			}

			//Tells RabbitMQ not to give more than one message to a worker at a time. Or, in other words,
			//don't dispatch a new message to a worker until it has processed and acknowledged the previous one.
			//Instead, it will dispatch it to the next worker that is not still busy
			this.consumeChannel.prefetch(1);

			this.consumeChannel.consume(
				queue,
				async (messsage) => {
					//Start timer
					const start = Date.now();
					const messageObj = JSON.parse(messsage.content.toString());
					const { trackingId, payload, debugChannel } = messageObj;

					// If we have a debug channel then turn on debug logging
					if (debugChannel)
						helper.turnOnLogging(debugChannel, queueObj._id, "queue");

					// Mark the message as being processed
					await this.startProcessingMessage(trackingId, new Date(start));

					// Check whether the environment is suspended or not
					if (META.isSuspended()) {
						// Log processing of the message
						this.logMessageProcessing(
							debugChannel,
							trackingId,
							queueObj,
							payload,
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

					try {
						// Dynamicly import the
						const handlerModule = await import(
							`../../meta/queues/${queueObj.name}.js${
								this.manager.getModuleLoaderQuery()
									? "?" + this.manager.getModuleLoaderQuery()
									: ""
							}`
						);

						const handlerFunction = handlerModule.default;

						// Check the endpoint module has a default exprot or not
						if (!handlerFunction) {
							// Log processing of the message
							this.logMessageProcessing(
								debugChannel,
								trackingId,
								queueObj,
								payload,
								400, // Error code
								Date.now() - start,
								helper.createErrorMessage(
									ERROR_CODES.clientError,
									ERROR_CODES.missingDefaultExport,
									t(
										"The queue '%s' code does not have a default exported function.",
										queueObj.name
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
							this.logMessageProcessing(
								debugChannel,
								trackingId,
								queueObj,
								payload,
								400, // Error code
								Date.now() - start,
								helper.createErrorMessage(
									ERROR_CODES.clientError,
									ERROR_CODES.invalidFunction,
									t(
										"Function specified in queue '%s' is not valid. A callable function is required.",
										endpoint.name
									)
								)
							);
							return;
						}

						try {
							// Run the function
							await handlerFunction(payload);

							// Log processing of the message
							this.logMessageProcessing(
								debugChannel,
								trackingId,
								queueObj,
								payload,
								200, // Success code
								Date.now() - start
							);
						} catch (error) {
							// Log processing of the message
							this.logMessageProcessing(
								debugChannel,
								trackingId,
								queueObj,
								payload,
								400, // Error code
								Date.now() - start,
								helper.createErrorMessage(
									ERROR_CODES.clientError,
									ERROR_CODES.queueExecutionError,
									t(
										"An error occurred while executing the '%s' queue handler function.",
										queueObj.name
									),
									{
										name: error.name,
										code: error.code,
										message: error.message,
										specifics: error.specifics,
										stack: error.stack,
									}
								)
							);
							return;
						}
					} catch (error) {
						// Log processing of the message
						this.logMessageProcessing(
							debugChannel,
							trackingId,
							queueObj,
							payload,
							500, // Error code
							Date.now() - start,
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.queueImportError,
								t(
									"An error occurred while importing the '%s' queue module. %s",
									queueObj.name,
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
		} catch (error) {
			logger.error(
				`Cannot process queue '${queue}' exchange '${exchange}' message`,
				{
					details: error,
				}
			);

			return;
		}
	}
}
