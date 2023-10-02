import axios from "axios";
import express from "express";
import userCtrl from "../controllers/user.js";
import clsCtrl from "../controllers/cluster.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/cluster/setup-status
@method     GET
@desc       Returns true if cluster set-up is complete otherwiser returns false
@access     public
*/
router.get("/setup-status", async (req, res) => {
	try {
		// Get cluster owner
		let user = await userCtrl.getOneByQuery({ isClusterOwner: true });
		res.status(200).json({ status: user ? true : false });
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/smtp-status
@method     GET
@desc       Checks whether the cluster can send emails or not
@access     public
*/
router.get("/smtp-status", async (req, res) => {
	try {
		// Get cluster configuration
		let cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});
		if (cluster?.smtp) {
			res.json({ status: true });
		} else res.json({ status: false });
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/smtp
@method     GET
@desc       Returns the smtp configuration of the cluster object
@access     public
*/
router.get("/smtp", authMasterToken, async (req, res) => {
	try {
		// Get cluster configuration
		let cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});
		if (cluster?.smtp) {
			res.json(helper.decryptSensitiveData(cluster.smtp));
		} else res.json();
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/components
@method     GET
@desc       Returns information about the cluster components, core, engine, studio etc.
@access     public
*/
router.get("/components", async (req, res) => {
	try {
		// Get cluster configuration
		const info = await axios.get(
			config.get("general.workerUrl") + "/v1/resource/cluster-info",
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);

		res.json(info.data);
	} catch (error) {
		handleError(req, res, error);
	}
});

export default router;
