import { ResourceManager } from "../handlers/resources/resourceManager.js";

export const manageResourceHandler = (connection, queue) => {
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
                let resourceObj = JSON.parse(msg.content.toString());

                // Create the deployment manager and deploy the version
                let manager = new ResourceManager(resourceObj);
                // If this is not a managed resource then no processing is needed
                if (!manager.isManaged()) {
                    channel.ack(msg);
                    return;
                }

                let result = null;
                switch (manager.getAction()) {
                    case "create":
                        result = await manager.creteResource();
                        break;
                    case "bind":
                        result = await manager.bindResource();
                        break;
                    case "update":
                        result = await manager.updateResource();
                        break;
                    case "delete":
                        result = await manager.deleteResource();
                        break;
                    case "restart":
                        result = await manager.restartAPIServer();
                        break;
                    default:
                        // Not a supported operation type
                        channel.ack(msg);
                        return;
                }

                if (result.success) {
                    channel.ack(msg);
                    logger.info(
                        t(
                            "Completed %s operation on '%s' (%s) resource '%s' successfully",
                            resourceObj.action,
                            resourceObj.type,
                            resourceObj.instance,
                            resourceObj.name
                        )
                    );
                } else {
                    // Error occurrred
                    channel.ack(msg);
                    logger.error(
                        t(
                            "Cannot %s '%s' (%s) resource named '%s'",
                            resourceObj.action,
                            resourceObj.type,
                            resourceObj.instance,
                            resourceObj.name
                        ),
                        {
                            details: {
                                orgId: resourceObj.orgId,
                                appId: resourceObj.appId,
                                name: result.error?.name,
                                message: result.error?.message,
                                stack: result.error?.stack,
                                payload: resourceObj,
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
