import amqp from "amqplib/callback_api.js";
import { sendEmail } from "../consumer/sendEmail.js";

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

		logger.info(`Connected to the message queue @${amqpHost}`);

		// Register message consumers
		sendEmail(amqpConnection, "send-validation-code", "code");
		sendEmail(amqpConnection, "send-contact-email-token", "contact-email");
		sendEmail(amqpConnection, "send-login-email-token", "login-email");
		sendEmail(amqpConnection, "send-reset-pwd-token", "reset-pwd");
		sendEmail(amqpConnection, "send-organization-inivation", "org-invite");
		sendEmail(amqpConnection, "send-app-inivation", "app-invite");
		sendEmail(amqpConnection, "send-project-inivation", "project-invite");
	});
};

export const disconnectFromQueue = () => {
	amqpConnection.close();
	logger.info("Disconnected from the message queue");
};

export const getMQClient = () => {
	return amqpConnection;
};

export const sendMessage = (queue, message) => {
	amqpConnection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		channel.assertQueue(queue, {
			durable: true,
		});

		channel.sendToQueue(queue, message, {
			persistent: true,
		});

		channel.close();
	});
};
