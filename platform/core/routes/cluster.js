import axios from "axios";
import express from "express";
import nodemailer from "nodemailer";
import userCtrl from "../controllers/user.js";
import clsCtrl from "../controllers/cluster.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { authSession } from "../middlewares/authSession.js";
import { handleError } from "../schemas/platformError.js";
import { applyRules } from "../schemas/cluster.js";
import { validate } from "../middlewares/validate.js";
import { checkContentType } from "../middlewares/contentType.js";
import { clusterComponents } from "../config/constants.js";
import ERROR_CODES from "../config/errorCodes.js";

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
@route      /v1/cluster/info
@method     GET
@desc       Returns information about the cluster itself
@access     public
*/
router.get("/info", authSession, async (req, res) => {
	try {
		const { user } = req;
		if (!user.isClusterOwner) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"You are not authorized to view cluster information. Only the cluster owner can view and manage cluster info."
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Get cluster configuration
		let cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});

		res.json({ ...cluster, smtp: helper.decryptSensitiveData(cluster.smtp) });
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/release-info
@method     GET
@desc       Returns information about the current release of the cluster and the latest Agnost release
@access     public
*/
router.get("/release-info", authSession, async (req, res) => {
	try {
		// Get cluster configuration
		const { release } = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});

		if (!release) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("Release information not found."),
				code: ERROR_CODES.notFound,
			});
		}

		const latest = await axios.get(
			"https://raw.githubusercontent.com/cloud-agnost/agnost-community/master/releases/latest.json",
			{
				headers: {
					Accept: "application/vnd.github.v3+json",
				},
			}
		);

		const current = await axios.get(
			`https://raw.githubusercontent.com/cloud-agnost/agnost-community/master/releases/${release}.json`,
			{
				headers: {
					Accept: "application/vnd.github.v3+json",
				},
			}
		);

		res.json({ current: current.data, latest: latest.data });
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
@route      /v1/cluster/smtp
@method     PUT
@desc       Updates the smtp configuration of the cluster object
@access     public
*/
router.put(
	"/smtp",
	checkContentType,
	authSession,
	applyRules("update-smtp"),
	validate,
	async (req, res) => {
		try {
			const { user } = req;

			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to update cluster information. Only the cluster owner can view and manage cluster info."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			let transport = nodemailer.createTransport({
				host: req.body.host,
				port: req.body.port,
				secure: req.body.useTLS,
				auth: {
					user: req.body.user,
					pass: req.body.password,
				},
				pool: false,
			});

			try {
				await transport.verify();
			} catch (err) {
				return res.status(400).json({
					error: t("Connection Error"),
					details: t("Cannot connect to the SMTP server. %s", err.message),
					code: ERROR_CODES.connectionError,
				});
			}

			// Update cluster configuration
			let updatedCluster = await clsCtrl.updateOneByQuery(
				{
					clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
				},
				{ smtp: helper.encyrptSensitiveData(req.body) }
			);

			res.json({ ...updatedCluster, smtp: req.body });
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/components
@method     GET
@desc       Returns information about the cluster components, core, engine, studio etc.
@access     public
*/
router.get("/components", authSession, async (req, res) => {
	try {
		const { user } = req;
		if (!user.isClusterOwner) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"You are not authorized to view cluster components. Only the cluster owner can manage cluster core components."
				),
				code: ERROR_CODES.unauthorized,
			});
		}

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

/*
@route      /v1/cluster/components
@method     PUT
@desc       Updates a specific cluster component and its HPA
@access     public
*/
router.put(
	"/components",
	checkContentType,
	authSession,
	applyRules("update-component"),
	validate,
	async (req, res) => {
		try {
			const { user } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to manage cluster components. Only the cluster owner can manage cluster core components."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			const { deploymentName, hpaName } = req.body;
			const deploymentInfo = clusterComponents.find(
				(entry) => entry.deploymentName === deploymentName
			);

			if (deploymentInfo.hpaName !== hpaName) {
				return res.status(401).json({
					error: t("Not Allowed"),
					details: t(
						"The specified HPA name '%s' does not match with its deployment name '%s'.",
						hpaName,
						deploymentName
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			try {
				// Update cluster configuration. We are running this in catch since if engine-worker is upated the called worker can be terminated
				// resulting in socket hang up kind of errors
				await axios.post(
					config.get("general.workerUrl") + "/v1/resource/cluster-info",
					req.body,
					{
						headers: {
							Authorization: process.env.ACCESS_TOKEN,
							"Content-Type": "application/json",
						},
					}
				);
			} catch (err) {}

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
