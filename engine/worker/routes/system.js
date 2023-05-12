import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { manageAPIServers } from "../init/queue.js";

const router = express.Router({ mergeParams: true });

/*
@route      /health
@method     GET
@desc       Checks liveliness of engine worker
@access     public
*/
router.get("/health", (req, res) => {
	res
		.status(200)
		.send(new Date().toISOString() + " - Healthy engine worker server");
});

/*
@route      /ping
@method     GET
@desc       Checks liveliness of engine worker
@access     public
*/
router.get("/ping", (req, res) => {
	res.status(200).send(new Date().toISOString() + " - Pong!");
});

/*
@route      /validate
@method     GET
@desc       Checks access token
@access     public
*/
router.get("/validate", authAccessToken, (req, res) => {
	res.status(200).send(new Date().toISOString() + " - Access token validated");
});

router.get("/redeploy", (req, res) => {
	manageAPIServers("env-7eqm41n7nsul", {});
	res.status(200).send("Sent message");
});

export default router;
