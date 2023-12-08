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
		try {
			console.log("test queue", req.body);
			const { queueiid, delay, payload, debugChannel } = req.body;
			const queue = await META.getQueue(queueiid);
			console.log("test queue2", queue);

			if (queue) {
				console.log("test queue3");

				const adapterObj = adapterManager.getQueueAdapter(queue.name);
				console.log("test queue4");

				await adapterObj.sendMessage(queue, payload, delay, debugChannel);
				console.log("test queue5");
			}
			console.log("test queue6");

			res.json();
		} catch (err) {
			helper.handleError(req, res, err);
		}
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
		try {
			const { taskiid, debugChannel } = req.body;
			const task = await META.getTask(taskiid);
			if (task) {
				const adapterObj = adapterManager.getTaskAdapter(task.name);
				await adapterObj.triggerCronJob(task, debugChannel);
			}

			res.json();
		} catch (err) {
			helper.handleError(req, res, err);
		}
	}
);

export default router;
