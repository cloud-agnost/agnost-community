import axios from "axios";
import connManager from "../init/connManager.js";
import { getKey, setKey } from "../init/cache.js";

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

                // Check the environment status if it is in a deployment state then do not acknowledge the message unless it is timed out
                let envStatus = await getKey(`${msgObj.env.iid}.status`);
                if (["Deploying", "Redeploying", "Deleting"].includes(envStatus)) {
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
                                                "Resource access settings update timed out due to waiting too long for the deployment to complete"
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
                                "Resource access settings update timed out for app '%s' version '%s' to environment '%s'",
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
                }

                switch (msgObj.subAction) {
                    case "update-resource-access":
                        {
                            const { env, updatedResource } = msgObj;
                            const mappings = env.mappings.filter((entry) => entry.resource.iid === updatedResource.iid);
                            // For each design element, meaning that they are databases, update the connection pool
                            for (let i = 0; i < mappings.length; i++) {
                                const mapping = mappings[i];
                                await connManager.removeConnection(mapping.design.iid, updatedResource.instance);
                            }
                        }
                        break;
                    default:
                        break;
                }

                logger.info(t("Updated the engine-worker instance due to action '%s'", msgObj.subAction));
            },
            {
                noAck: false,
            }
        );
    });
};
