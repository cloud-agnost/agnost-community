import cluster from "cluster";
import { getKey } from "../init/cache.js";
import { PrimaryProcessDeploymentManager } from "../handlers/primaryProcessManager.js";
import e from "express";

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
						const hasDBPoolSizeChange = await manager.hasDBPoolSizeChange();

						// Get the worker process ids
						const workerPid = Object.values(cluster.workers).map(
							(e) => e.process.pid
						);

						if (
							hasResourceChange ||
							hasDBPoolSizeChange ||
							msgObj.subAction === "deploy" ||
							msgObj.subAction === "redeploy" ||
							msgObj.subAction === "save-email-auth" ||
							updateCount >= config.get("general.maxUpdatesBeforeRestart")
						) {
							await waitUntilChildProcessIsReady();

							// Stop child process
							for (const pid of workerPid) {
								process.kill(pid, "SIGSTOP");
							}

							await manager.initializeCore();

							// Resume child process
							for (const pid of workerPid) {
								process.kill(pid, "SIGCONT");
							}

							// Restart worker(s)
							for (const worker of Object.values(cluster.workers)) {
								worker.kill("SIGINT");
							}

							// Reset update count
							updateCount = 0;
						} else {
							await waitUntilChildProcessIsReady();

							// Stop child process
							for (const pid of workerPid) {
								process.kill(pid, "SIGSTOP");
							}

							await manager.initializeCore();

							// Resume child process
							for (const pid of workerPid) {
								process.kill(pid, "SIGCONT");
							}

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

async function waitUntilChildProcessIsReady() {
	return new Promise(async (resolve, reject) => {
		if (childProcessStatus === "ready") {
			return resolve();
		}

		const start = Date.now();
		const sleepInterval = config.get(
			"general.childReadinessWaitSleepInternalMs"
		);

		while (
			Date.now() - start <
			config.get("general.childProcessReadyTimeoutSeconds") * 1000
		) {
			if (childProcessStatus === "ready") return resolve();
			await helper.sleep(sleepInterval);
		}

		resolve();
	});
}
