import express from "express";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import userCtrl from "../controllers/user.js";
import mappingCtrl from "../controllers/mapping.js";
import deployCtrl from "../controllers/deployment.js";
import auditCtrl from "../controllers/audit.js";
import { authSession } from "../middlewares/authSession.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import {
	validateEnv,
	validateEnvLog,
	validateMapping,
} from "../middlewares/validateEnv.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/environment.js";
import { applyRules as applyLogRules } from "../schemas/environmentLog.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import { setKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId
@method     PUT
@desc       Update environment information
@access     private
*/
router.put(
	"/:envId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, env } = req;
			let { name, autoDeploy } = req.body;

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				{
					name,
					autoDeploy,
					updatedBy: req.user._id,
				},
				{},
				{ cacheKey: env._id }
			);

			// Update environemnt data in engine cluster
			await deployCtrl.update(app, version, updatedEnv, user);
			res.json(updatedEnv);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				t("Updated environment '%s' properties", name),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/suspend
@method     POST
@desc       Suspend environment
@access     private
*/
router.post(
	"/:envId/suspend",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.update"),
	async (req, res) => {
		try {
			const { org, user, app, version, env } = req;

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				{
					suspended: true,
					updatedBy: req.user._id,
				},
				{},
				{ cacheKey: env._id }
			);

			// Update environemnt data in engine cluster
			await deployCtrl.update(app, version, updatedEnv, user);
			res.json(updatedEnv);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				t("Suspended environment '%s'", env.name),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/activate
@method     POST
@desc       Activate environment
@access     private
*/
router.post(
	"/:envId/activate",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.update"),
	async (req, res) => {
		try {
			const { org, user, app, version, env } = req;

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				{
					suspended: false,
					updatedBy: req.user._id,
				},
				{},
				{ cacheKey: env._id }
			);

			// Update environemnt data in engine cluster
			await deployCtrl.update(app, version, updatedEnv, user);
			res.json(updatedEnv);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				t("Activated environment '%s'", env.name),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/redeploy
@method     POST
@desc       Start re-deploying app version to environment
@access     private
*/
router.post(
	"/:envId/redeploy",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.deploy"),
	async (req, res) => {
		const session = await envCtrl.startSession();
		try {
			const { org, user, app, version, env } = req;

			/* 			console.log("***here", env);
			if (
				[
					env.dbDeploymentStatus,
					env.engineDeploymentStatus,
					env.schedulerDeploymentStatus,
				].some((entry) =>
					[
						"Deploying",
						"Redeploying",
						"Undeploying",
						"Auto-deploying",
						"Deleting",
					].includes(entry)
				)
			) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is already a deployment operation running on this environment. You need to wait the completion of this operation."
					),
					code: ERROR_CODES.notAllowed,
				});
			} */

			if (!env.deploymentDtm) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is no app version deployed to this environment. You first need to deploy an app version to redeploy it again."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				{
					dbDeploymentStatus: "Redeploying",
					engineDeploymentStatus: "Redeploying",
					schedulerDeploymentStatus: "Redeploying",
					updatedBy: req.user._id,
				},
				{},
				{ cacheKey: env._id, session }
			);

			// Create environment logs entry, which will be updated when the deployment is completed
			let envLog = await envLogCtrl.create(
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
					action: "deploy",
					dbStatus: "Deploying",
					serverStatus: "Deploying",
					schedulerStatus: "Deploying",
					dbLogs: [],
					serverLogs: [],
					schedulerLogs: [],
					createdBy: user._id,
				},
				{ session }
			);

			// Redeploy application version to the environment
			await deployCtrl.redeploy(envLog, app, version, env, user);

			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine worker
			await setKey(env._id, updatedEnv, helper.constants["1month"]);

			await envCtrl.commit(session);
			res.json({ env: updatedEnv, envLog });

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"redeploy",
				t(
					"Started re-deploying app version '%s' to environment '%s'",
					version.name,
					env.name
				),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);
		} catch (error) {
			await envCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/log/:logId
@method     POST
@desc       Update deployment operation log and environment status
@access     private
*/
router.post(
	"/:envId/log/:logId",
	checkContentType,
	authMasterToken,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	validateEnvLog,
	applyLogRules("update"),
	validate,
	async (req, res) => {
		const session = await envCtrl.startSession();
		try {
			const { org, app, version, env, log } = req;
			const { status, logs, type } = req.body;

			// Get user information
			let user = await userCtrl.getOneById(log.createdBy, {
				cacheKey: log.createdBy,
			});

			let timestamp = Date.now();
			let dataSet = {
				updatedBy: user._id,
			};

			if (type === "db") {
				dataSet.dbStatus = status;
			} else if (type === "server") {
				dataSet.serverStatus = status;
			} else {
				dataSet.schedulerStatus = status;
			}
			// If deployment successfully completed then update deploymentDtm
			if (["deploy", "redeploy", "auto-deploy"].includes(log.action))
				dataSet.deploymentDtm = timestamp;

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				dataSet,
				{},
				{ cacheKey: env._id, session }
			);

			if (type === "db") {
				// Update environment log data
				await envLogCtrl.updateOneById(
					log._id,
					{
						dbStatus: status,
						dbLogs: logs,
						updatedAt: timestamp,
					},
					{},
					{ session }
				);
			} else if (type === "server") {
				// Update environment log data, we can have multiple engine pods so each of them will add their own logs
				await envLogCtrl.pushObjectById(
					log._id,
					"serverLogs",
					logs,
					{
						serverStatus: status,
						updatedAt: timestamp,
					},
					{ session }
				);
			} else {
				// Update environment log data
				await envLogCtrl.updateOneById(
					log._id,
					{
						schedulerStatus: status,
						schedulerLogs: logs,
						updatedAt: timestamp,
					},
					{},
					{ session }
				);
			}

			await envCtrl.commit(session);
			res.json(updatedEnv);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				log.action,
				t(
					status === "OK"
						? "Completed '%s' '%s' operation on environment '%s' successfully"
						: "Completed '%s' '%s' operation on environment '%s' with erorrs",

					log.action,
					type,
					env.name
				),
				{ updatedEnv },
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);
		} catch (error) {
			await envCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/mapping
@method     POST
@desc       Add resource mapping
@access     private
*/
router.post(
	"/:envId/mapping",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.update"),
	applyRules("add-mapping"),
	validate,
	async (req, res) => {
		const session = await envCtrl.startSession();
		try {
			const { user, org, app, version, env, designElement, resource } = req;
			const { type } = req.body;

			// Check if there is already a mapping for this design element
			let exists = env.mappings.find(
				(entry) =>
					entry.design.iid.toString() === designElement.iid.toString() &&
					entry.resource.id.toString() === resource._id.toString()
			);

			if (exists) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is already a design element to resouce mapping for '%s' design element '%s' and resource '%s'.",
						type,
						designElement.name,
						resource.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the design element and the resource types are the same
			let validMapping = mappingCtrl.isValidMapping(
				type,
				designElement,
				resource
			);

			if (validMapping.result === "error") {
				return res.status(422).json({
					error: t("Invalid Mapping"),
					details: validMapping.message,
					code: ERROR_CODES.notAllowed,
				});
			}

			// Add mapping to the environment
			let updatedEnv = await envCtrl.pushObjectById(
				env._id,
				"mappings",
				{
					design: {
						iid: designElement.iid,
						type: type,
						name: designElement.name,
					},
					resource: {
						id: resource._id,
						name: resource.name,
						type: type,
						instance: resource.instance,
					},
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await envCtrl.commit(session);
			// Update environment data in engine cluster
			await deployCtrl.update(app, version, updatedEnv, user);
			res.json(updatedEnv);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				type === "engine"
					? t(
							"Mapped  engine cluster of environment '%s' to '%s'",
							designElement.name,
							resource.name
					  )
					: t(
							"Mapped app %s design element '%s' to resource '%s'",
							type,
							designElement.name,
							resource.name
					  ),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);
		} catch (error) {
			await envCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/mapping/:mappingId
@method     POST
@desc       Delete resource mapping
@access     private
*/
router.delete(
	"/:envId/mapping/:mappingId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	validateMapping,
	authorizeAppAction("app.env.update"),
	async (req, res) => {
		const session = await envCtrl.startSession();
		try {
			const { user, org, app, version, env, mapping } = req;

			// Add mapping to the environment
			let updatedEnv = await envCtrl.pullObjectById(
				env._id,
				"mappings",
				mapping._id,
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await envCtrl.commit(session);
			// Update environment data in engine cluster
			await deployCtrl.update(app, version, updatedEnv, user);
			res.json(updatedEnv);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				mapping.design.type === "engine"
					? t(
							"Deleted the engine cluster mapping of environment '%s' to resource '%s'",
							mapping.design.name,
							mapping.resource.name
					  )
					: t(
							"Deleted design element '%s' to resource '%s' mapping",
							mapping.design.name,
							mapping.resource.name
					  ),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);
		} catch (error) {
			await envCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

export default router;
