import express from "express";
import responseTime from "response-time";
import { logRequestToConsole } from "../middlewares/logRequest.js";

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
			}:${process.env.RELEASE_NUMBER}`
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

export default router;
