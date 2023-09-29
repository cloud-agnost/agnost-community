import axios from "axios";
import { getKey } from "../init/cache.js";
import { DeploymentManager } from "../handlers/managers/deploymentManager.js";

export const deleteEnvironmentHandler = (connection, queue) => {
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

                // Check the environment status if it is in a deployment state
                let envStatus = await getKey(`${msgObj.env.iid}.status`);
                if (["Deploying", "Redeploying"].includes(envStatus)) {
                    // Check timestamp of the message
                    const now = Date.now();
                    const date = new Date(Date.parse(msgObj.timestamp));
                    const millisecondsFromEpoch = date.getTime();

                    // If processing has not timed out do not acknowledge message and return
                    if (now - millisecondsFromEpoch < config.get("general.maxMessageWaitMinues") * 60 * 1000) {
                        // Message has not timed out yet, it might be still being processed
                        channel.nack(msg);
                        return;
                    }
                }

                logger.info(
                    t(
                        "Started deleting app '%s' version '%s' environment '%s'",
                        msgObj.app.name,
                        msgObj.env.version.name,
                        msgObj.env.name
                    )
                );
                // Create the deployment manager and deploy the version
                let manager = new DeploymentManager(msgObj);
                let result = await manager.deleteEnvironment();
                if (result.success) {
                    channel.ack(msg);
                    logger.info(
                        t(
                            "Completed deleting app '%s' version '%s' environment '%s' successfully",
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
                            "Cannot delete app '%s' version '%s' environment '%s'",
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
