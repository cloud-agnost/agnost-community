import cluster from "cluster";
import { getKey } from "../init/cache.js";
import { PrimaryProcessDeploymentManager } from "../handlers/primaryProcessManager.js";

var updateCount = 0;

export const manageAPIServerHandler = (connection, envId) => {
	connection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		const exchange = envId;
		const queue = `manage-apiserver-${envId}-${helper.generateSlug("", 5)}`;

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
					default:
						// Get the environment information
						let envObj = await getKey(
							`${process.env.AGNOST_ENVIRONMENT_ID}.object`
						);
						// Create the primary process deployment manager and set up the engine core (API Server)
						const manager = new PrimaryProcessDeploymentManager(msgObj, envObj);
						// Check to see if resources have changed or not and whether we are dedeploying the version, if not we can update the child process faster, no need to kill it
						const hasResourceChange = await manager.hasResourceChange();
						if (
							hasResourceChange ||
							msgObj.subAction === "deploy" ||
							msgObj.subAction === "redeploy" ||
							updateCount >= config.get("general.maxUpdatesBeforeRestart")
						) {
							await manager.initializeCore();
							// Restart worker(s)
							for (const worker of Object.values(cluster.workers)) {
								worker.kill("SIGINT");
							}

							// Reset update count
							updateCount = 0;
						} else {
							await manager.initializeCore();
							// Send a message from the master process to the worker.
							for (const worker of Object.values(cluster.workers)) {
								worker.send("restart");
							}

							// Increment update count
							updateCount++;
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
