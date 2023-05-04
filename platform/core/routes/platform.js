import express from "express";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { PlatformErrorModel, handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/platform/error
@method     POST
@desc       Logs the error message occurred in the platform part of an Agnost cluster
@access     public
*/
router.post("/error", checkContentType, authMasterToken, async (req, res) => {
	try {
		// Save the error to the errors collection, do not wait for the save operation to complete and write it fast
		new PlatformErrorModel(req.body).save({ w: 0 });

		res
			.status(200)
			.send(new Date().toISOString() + " - Logged platform error message");
	} catch (error) {
		handleError(req, res, error);
	}
});

export default router;
