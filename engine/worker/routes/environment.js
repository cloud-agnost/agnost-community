import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import {
	deployVersion,
	redeployVersion,
	undeployVersion,
	deleteEnvironment,
} from "../init/queue.js";

const router = express.Router({ mergeParams: true });

/*
@route      /env/deploy
@method     POST
@desc       Deploy version to the environment
@access     public
*/
router.post("/deploy", checkContentType, authAccessToken, async (req, res) => {
	try {
		deployVersion(req.body);
		res.json();
	} catch (error) {
		helper.handleError(req, res, error);
	}
});

/*
@route      /env/redeploy
@method     POST
@desc       Redeploy version to the environment
@access     public
*/
router.post(
	"/redeploy",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			redeployVersion(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/undeploy
@method     POST
@desc       Undeploy version from the environment
@access     public
*/
router.post(
	"/undeploy",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			undeployVersion(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/delete
@method     POST
@desc       Delete the environment
@access     public
*/
router.post("/delete", checkContentType, authAccessToken, async (req, res) => {
	try {
		deleteEnvironment(req.body);
		res.json();
	} catch (error) {
		helper.handleError(req, res, error);
	}
});

/*
@route      /env/update
@method     POST
@desc       Updates the environment data
@access     public
*/
router.post("/update", checkContentType, authAccessToken, async (req, res) => {
	try {
		//deleteEnvironment(req.body);
		res.json();
	} catch (error) {
		helper.handleError(req, res, error);
	}
});

export default router;
