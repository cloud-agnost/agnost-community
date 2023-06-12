export const manageAPIServerHandler = (connection, envId) => {
	connection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		const exchange = envId;
		const queue = `manage-apiserver-${envId}-${helper.generateSlug()}`;

		channel.assertExchange(exchange, "fanout", {
			durable: true,
			autoDelete: true,
		});

		channel.assertQueue(queue, {
			durable: true,
			autoDelete: true,
		});

		channel.bindQueue(queue, exchange, "");

		logger.info("Listening messages from <" + queue + "> queue");

		channel.consume(
			queue,
			async function (msg) {
				// Acknowledge the message
				channel.ack(msg);
				// Restart the process throught pm2
				process.exit(0);
			},
			{
				noAck: false,
			}
		);
	});
};
