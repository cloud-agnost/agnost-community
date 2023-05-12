import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";

const router = express.Router({ mergeParams: true });

/*
@route      /health
@method     GET
@desc       Checks liveliness of engine core
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
@desc       Checks liveliness of engine core
@access     public
*/
router.get("/ping", (req, res) => {
	res.status(200).send(new Date().toISOString() + " - Pong!");
});

export default router;
