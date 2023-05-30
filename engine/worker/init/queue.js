import amqp from "amqplib/callback_api.js";
import { deployVersionHandler } from "../consumers/deployVersion.js";
import { redeployVersionHandler } from "../consumers/redeployVersion.js";
import { updateEnvironmentHandler } from "../consumers/updateEnvironment.js";
import { updateDatabaseHandler } from "../consumers/updateDatabase.js";
import { deleteEnvironmentHandler } from "../consumers/deleteEnvironment.js";
import { manageResourceHandler } from "../consumers/manageResource.js";

var amqpConnection = null;
var isConnecting = false;
var retryCount = 0;

// There is no default connection retry mechanism in the RabbitMQ client library for this reason we implement it
export const connectToQueue = () => {
	if (isConnecting) return;
	isConnecting = true;
	retryCount++;
	// Get the RabbitMQ connection credentials from environment variables
	const amqpUsername = process.env.QUEUE_USERNAME;
	const amqpPassword = process.env.QUEUE_PASSWORD;
	const amqpHost = process.env.QUEUE_HOST;
	// Construct the connection URL with the credentials
	const amqpServerUrl = `amqp://${amqpUsername}:${amqpPassword}@${amqpHost}`;

	amqp.connect(amqpServerUrl, (error, connection) => {
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

		// Register queue message handlers
		let queueCount = config.get("general.generalQueueCount");
		for (let i = 1; i <= queueCount; i++) {
			deployVersionHandler(
				connection,
				`deploy-version-${i}${config.get("queue.developmentSuffix")}`
			);
			redeployVersionHandler(
				connection,
				`redeploy-version-${i}${config.get("queue.developmentSuffix")}`
			);
			deleteEnvironmentHandler(
				connection,
				`delete-environment-${i}${config.get("queue.developmentSuffix")}`
			);
			updateEnvironmentHandler(
				connection,
				`update-environment-${i}${config.get("queue.developmentSuffix")}`
			);
			updateDatabaseHandler(
				connection,
				`update-db-${i}${config.get("queue.developmentSuffix")}`
			);
			manageResourceHandler(
				connection,
				`manage-resource-${i}${config.get("queue.developmentSuffix")}`
			);
		}
	});
};

export const disconnectFromQueue = () => {
	amqpConnection.close();
	logger.info("Disconnected from the message queue");
};

export const getMQClient = () => {
	return amqpConnection;
};

export const deployVersion = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`deploy-version-${randNumber}${config.get("queue.developmentSuffix")}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`deploy-version-${randNumber}${config.get("queue.developmentSuffix")}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};

export const redeployVersion = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`redeploy-version-${randNumber}${config.get("queue.developmentSuffix")}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`redeploy-version-${randNumber}${config.get("queue.developmentSuffix")}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};

export const deleteEnvironment = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`delete-environment-${randNumber}${config.get(
				"queue.developmentSuffix"
			)}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`delete-environment-${randNumber}${config.get(
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

export const updateEnvironment = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`update-environment-${randNumber}${config.get(
				"queue.developmentSuffix"
			)}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`update-environment-${randNumber}${config.get(
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

export const updateDatabase = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`update-db-${randNumber}${config.get("queue.developmentSuffix")}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`update-db-${randNumber}${config.get("queue.developmentSuffix")}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};

export const deployTasks = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`deploy-tasks-${randNumber}${config.get("queue.developmentSuffix")}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`deploy-tasks-${randNumber}${config.get("queue.developmentSuffix")}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};

export const redeployTasks = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`redeploy-tasks-${randNumber}${config.get("queue.developmentSuffix")}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`redeploy-tasks-${randNumber}${config.get("queue.developmentSuffix")}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};

export const deleteTasks = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`delete-tasks-${randNumber}${config.get("queue.developmentSuffix")}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`delete-tasks-${randNumber}${config.get("queue.developmentSuffix")}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};

export const manageResource = (payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		let randNumber = helper.randomInt(
			1,
			config.get("general.generalQueueCount")
		);

		channel.assertQueue(
			`manage-resource-${randNumber}${config.get("queue.developmentSuffix")}`,
			{
				durable: true,
			}
		);

		channel.sendToQueue(
			`manage-resource-${randNumber}${config.get("queue.developmentSuffix")}`,
			Buffer.from(JSON.stringify(payload)),
			{
				persistent: true,
				timestamp: Date.now(),
			}
		);

		channel.close();
	});
};

export const manageAPIServers = (envId, payload) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		channel.assertExchange(envId, "fanout", {
			durable: true,
			autoDelete: true,
		});

		channel.publish(envId, "", Buffer.from(JSON.stringify(payload)));

		channel.close();
	});
};
