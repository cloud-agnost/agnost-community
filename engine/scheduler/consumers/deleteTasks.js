import { TaskManager } from "../handlers/taskManager.js";

/**
 * Deletes all tasks of the app version. The message object only includes the environment and vesion information.
 */
export const deleteTasksHandler = (connection, queue) => {
	connection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		channel.assertQueue(queue, {
			durable: true,
		});

		//Tells RabbitMQ not to give more than one message to a worker at a time. Or, in other words,
		//don't dispatch a new message to a worker until it has processed and acknowledged the previous one.
		//Instead, it will dispatch it to the next worker that is not still busy
		channel.prefetch(1);

		logger.info("Listening messages from <" + queue + "> queue");

		channel.consume(
			queue,
			async function (msg) {
				let msgObj = JSON.parse(msg.content.toString());
				logger.info(
					t(
						"Started cancelling the cron jobs of app '%s' version '%s' environment '%s'",
						msgObj.app.name,
						msgObj.env.version.name,
						msgObj.env.name
					)
				);
				// Create the deployment manager and deploy the version
				let manager = new TaskManager(msgObj);
				let result = await manager.deleteTasks();

				if (result.success) {
					channel.ack(msg);
					logger.info(
						t(
							"Completed cancelling the cron jobs of app '%s' version '%s' environment '%s'",
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
							"Cannot complete cancelling the cron jobs of app '%s' version '%s' environment '%s'",
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
				noAck: false,
			}
		);
	});
};
