import express from "express";
import responseTime from "response-time";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { adapterManager } from "../handlers/adapterManager.js";

const router = express.Router({ mergeParams: true });

/*
@route      /test/queue
@method     POST
@desc       For testing purposes sends the input message to the queue. The request body should have the queueiid, payload, delay and debugChannel info.
@access     private
*/
router.post(
	"/queue",
	responseTime(logRequestToConsole),
	checkContentType,
	authAccessToken,
	async (req, res) => {
		const { queueiid, delay, payload, debugChannel } = req.body;
		const queue = await META.getQueue(queueiid);

		if (queue) {
			const adapterObj = adapterManager.getQueueAdapter(queue.name);
			await adapterObj.sendMessage(queue, payload, delay, debugChannel);
		}

		res.json();
	}
);

/*
@route      /test/task
@method     POST
@desc       For testing purposes sends the input message to the queue. The request body should have the taskiid and debugChannel info.
@access     private
*/
router.post(
	"/task",
	responseTime(logRequestToConsole),
	checkContentType,
	authAccessToken,
	async (req, res) => {
		const { taskiid, debugChannel } = req.body;
		const task = await META.getTask(taskiid);
		if (task) {
			const adapterObj = adapterManager.getTaskAdapter(task.name);
			await adapterObj.triggerCronJob(task, debugChannel);
		}

		res.json();
	}
);

export default router;
