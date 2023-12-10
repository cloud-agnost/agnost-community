import axios from "axios";
import { getKey, setKey } from "../init/cache.js";
import { DeploymentManager } from "../handlers/managers/deploymentManager.js";

export const deployVersionHandler = (connection, queue) => {
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

                // Check the environment status if it is in a deployment state then do not acknowledge the message unless it is timed out
                let envStatus = await getKey(`${msgObj.env.iid}.status`);
                if (["Deploying", "Redeploying"].includes(envStatus)) {
                    // Check timestamp of the message
                    const now = Date.now();
                    const date = new Date(Date.parse(msgObj.env.timestamp));
                    const millisecondsFromEpoch = date.getTime();

                    // If the message was wating more than the max message wait duration, acknowledge the mesage and set environment status to Error
                    if (now - millisecondsFromEpoch >= config.get("general.maxMessageWaitMinues") * 60 * 1000) {
                        // Set environment status
                        await setKey(`${msgObj.env.iid}.status`, "Error");

                        // Update the environment log object
                        axios
                            .post(
                                msgObj.callback,
                                {
                                    status: "Error",
                                    logs: [
                                        {
                                            startedAt: new Date(now).toISOString(),
                                            duration: Date.now() - now,
                                            status: "Error",
                                            message: t(
                                                "App version deployment timed out due to waiting too long for the deployment to complete"
                                            ),
                                        },
                                    ],
                                    type: "db",
                                },
                                {
                                    headers: {
                                        Authorization: process.env.MASTER_TOKEN,
                                        "Content-Type": "application/json",
                                    },
                                }
                            )
                            .catch((error) => {});

                        logger.info(
                            t(
                                "Deployment timed out for app '%s' version '%s' to environment '%s'",
                                msgObj.app.name,
                                msgObj.env.version.name,
                                msgObj.env.name
                            )
                        );

                        channel.ack(msg);
                    } else {
                        // Message has not timed out yet, it might be still being processed
                        channel.nack(msg);
                    }
                    return;
                } else if (envStatus === "Deleting") {
                    // If the environment is being deleted then do not process deployment messages
                    channel.ack(msg);
                    return;
                }

                logger.info(
                    t(
                        "Started deploying app '%s' version '%s' to environment '%s'",
                        msgObj.app.name,
                        msgObj.env.version.name,
                        msgObj.env.name
                    )
                );
                // Create the deployment manager and deploy the version
                let manager = new DeploymentManager(msgObj);
                let result = await manager.deployVersion();
                if (result.success) {
                    channel.ack(msg);
                    logger.info(
                        t(
                            "Completed deploying app '%s' version '%s' to environment '%s' successfully",
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
                            "Cannot deploy app '%s' version '%s' to environment '%s'",
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
