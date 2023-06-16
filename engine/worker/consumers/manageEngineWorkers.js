import connManager from "../init/connManager.js";

export const manageEngineWorkersHandler = (connection, exchange) => {
	connection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		const queue = `manage-engine-worker-${helper.generateSlug()}`;

		channel.assertExchange(exchange, "fanout", {
			durable: true,
			autoDelete: true,
		});

		channel.assertQueue(queue, {
			durable: true,
		});

		channel.bindQueue(queue, exchange, "");

		logger.info("Listening messages from <" + queue + "> queue");

		channel.consume(
			queue,
			async function (msg) {
				channel.ack(msg);
				let msgObj = JSON.parse(msg.content.toString());

				switch (msgObj.subAction) {
					case "update-resource-access":
						{
							const { env, updatedResource } = msgObj;
							const mappings = env.mappings.filter(
								(entry) => entry.resource.iid === updatedResource.iid
							);
							// For each design element, meaning that they are databases, update the connection pool
							for (let i = 0; i < mappings.length; i++) {
								const mapping = mappings[i];
								await connManager.removeConnection(
									mapping.design.iid,
									updatedResource.instance
								);
							}
						}
						break;
					default:
						break;
				}

				logger.info(
					t(
						"Updated the engine-worker instance due to action '%s'",
						msgObj.subAction
					)
				);
			},
			{
				noAck: false,
			}
		);
	});
};
