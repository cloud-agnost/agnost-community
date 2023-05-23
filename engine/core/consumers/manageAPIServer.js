import cluster from "cluster";
import { getKey } from "../init/cache.js";
import { PrimaryProcessDeploymentManager } from "../handlers/primaryProcessManager.js";

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
				// Acknowledge the message
				channel.ack(msg);
				let msgObj = JSON.parse(msg.content.toString());

				switch (msgObj.action) {
					case "deploy":
						// Do nothing, we have already initialized the engine when it start up
						break;
					default:
						// Get the environment information
						let envObj = await getKey(
							`${process.env.AGNOST_ENVIRONMENT_ID}.object`
						);
						// Create the primary process deployment manager and set up the engine core (API Sever)
						const manager = new PrimaryProcessDeploymentManager(envObj);
						await manager.initializeCore();
						// Restart worker(s)
						for (const worker of Object.values(cluster.workers)) {
							worker.kill("SIGINT");
						}
						break;
				}

				return;
			},
			{
				noAck: false,
			}
		);
	});
};
