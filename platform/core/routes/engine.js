import express from "express";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { handleEngineError } from "../schemas/engineError.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/engine/error
@method     POST
@desc       Logs the error message occurred in an engine cluster
@access     public
*/
router.post("/error", checkContentType, authMasterToken, async (req, res) => {
	try {
		handleEngineError(req.body);
		res.status(200).send(new Date().toISOString() + " - Logged error message");
	} catch (error) {
		handleError(req, res, error);
	}
});

export default router;
