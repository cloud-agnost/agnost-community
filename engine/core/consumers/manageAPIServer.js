import { DeploymentManager } from "../handlers/deploymentManager.js";

export const manageAPIServerHandler = (connection, envId) => {
	connection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		const exchange = envId;
		const queue = `manage-apiserver-${envId}-${helper.generateSlug()}.${config.get(
			"queue.developmentSuffix"
		)}`;

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
				let msgObj = JSON.parse(msg.content.toString());

				console.log("halding message", process.pid);
				return;

				// Create the deployment manager and manage the API server configuration
				let manager = new DeploymentManager(msgObj);
				let result = await manager.manageAPIServer();
				console.log("***result", result);
				if (result.success) {
					channel.ack(msg);
					logger.info(
						t(
							"Completed updating app '%s' version '%s' environment '%s' API server successfully",
							msgObj.app.name,
							msgObj.env.version.name,
							msgObj.env.name
						)
					);
				} else {
					// Error occurrred
					channel.ack(msg);
					logger.error(
						t(
							"Cannot update app '%s' version '%s' to environment '%s' API server",
							msgObj.app.name,
							msgObj.env.version.name,
							msgObj.env.name
						),
						{
							details: {
								orgId: msgObj.env.orgId,
								appId: msgObj.env.appId,
								versionId: msgObj.env.versionId,
								envId: msgObj.env._id,
								name: result.error?.name,
								message: result.error?.message,
								stack: result.error?.stack,
								payload: msgObj,
							},
						}
					);
				}
			},
			{
				// The broker will not expect an acknowledgement of messages delivered to this consumer
				// It will dequeue messages as soon as they’ve been sent down the wire
				noAck: true,
			}
		);
	});
};
