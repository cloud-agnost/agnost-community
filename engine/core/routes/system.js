import express from "express";

const router = express.Router({ mergeParams: true });

/*
@route      /agnost
@method     GET
@desc       Checks liveliness of engine core
@access     public
*/
router.get("/health", (req, res) => {
	res
		.status(200)
		.send(new Date().toISOString() + " - Healthy engine core server");
});

/*
@route      /agnost/ping
@method     GET
@desc       Checks liveliness of engine core
@access     public
*/
router.get("/ping", (req, res) => {
	res.status(200).send(new Date().toISOString() + " - Pong!");
});

export default router;
