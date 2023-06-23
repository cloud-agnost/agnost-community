import express from "express";
import responseTime from "response-time";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { authAccessToken } from "../middlewares/authAccessToken.js";

const router = express.Router({ mergeParams: true });

/*
@route      /health
@method     GET
@desc       Checks liveliness of engine core
@access     public
*/
router.get("/health", responseTime(logRequestToConsole), (req, res) => {
	res
		.status(200)
		.send(
			`${new Date().toISOString()} - Healthy API server ${
				process.env.AGNOST_ENVIRONMENT_ID
			}`
		);
});

/*
@route      /ping
@method     GET
@desc       Checks liveliness of engine core
@access     public
*/
router.get("/ping", responseTime(logRequestToConsole), (req, res) => {
	res.status(200).send(new Date().toISOString() + " - Pong!");
});

/*
@route      /test/queue
@method     POST
@desc       For testing purposes sends the input message to the queue. The request body should have the queueiid and payload.
@access     public
*/
router.post(
	"/test/queue",
	authAccessToken,
	responseTime(logRequestToConsole),
	(req, res) => {
		res.status(200).send("Hello queue tester");
	}
);

export default router;
