import amqp from "amqplib/callback_api.js";

var amqpConnection = null;
var isConnecting = false;
var retryCount = 0;

// There is no default connection retry mechanism in the RabbitMQ client library for this reason we implement it
export const connectToQueue = () => {
	if (isConnecting) return;
	isConnecting = true;
	retryCount++;
	amqp.connect(process.env.QUEUE_URL, (error, connection) => {
		isConnecting = false;
		if (error) {
			if (retryCount < config.get("queue.retryCount")) {
				return setTimeout(
					connectToQueue,
					config.get("queue.reconnectInterval")
				);
			} else {
				logger.error(
					"Cannot connect to the message queue, retry attempts exhausted",
					{
						details: error,
					}
				);
				process.exit(1);
			}
		}

		connection.on("error", (error) => {
			if (error.message !== "Connection closing") {
				logger.error(`Cannot connect to the message queue`, {
					details: error,
				});
			}

			if (retryCount < config.get("queue.retryCount")) {
				return setTimeout(
					connectToQueue,
					config.get("queue.reconnectInterval")
				);
			}
		});

		connection.on("close", function (error) {
			// If this is not a user initiated close then reconnect to the message queue
			if (error && retryCount < config.get("queue.retryCount")) {
				return setTimeout(
					connectToQueue,
					config.get("queue.reconnectInterval")
				);
			}
		});

		retryCount = 0;
		amqpConnection = connection;

		logger.info(
			`Connected to the message queue @${config.get(
				"queue.hostname"
			)}:${config.get("queue.port")}`
		);
	});
};

export const disconnectFromQueue = () => {
	amqpConnection.close();
	logger.info("Disconnected from the message queue");
};

export const getMQClient = () => {
	return amqpConnection;
};

export const submitTask = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.taskProcessQueueCount")
		);

		channel.assertQueue(
			`process-task-${payload.envId}-${randNumber}${config.get(
				"queue.developmentSuffix"
			)}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`process-task-${payload.envId}-${randNumber}${config.get(
				"queue.developmentSuffix"
			)}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};
