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
	validateParam,
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
@route      /v1/org/:orgId/app/:appId/version/:versionId/env?page=0&size=10&name=&sortBy=email&sortDir=asc
@method     GET
@desc       Get all app version environments that are visible to the user
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.env.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { app, appMember, version } = req;
			const { page, size, name, sortBy, sortDir, tag } = req.query;

			let query = { appId: app._id, versionId: version._id };
			if (appMember.role !== "Admin") query.createdBy = req.user._id;
			if (name && name !== "null") query.name = { $regex: name, $options: "i" };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let envs = await envCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(envs);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/mine?page=0&size=10&name=&sortBy=email&sortDir=asc
@method     GET
@desc       Get the app version environments created by the user
@access     private
*/
router.get(
	"/mine",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.env.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { app, version } = req;
			const { page, size, name, sortBy, sortDir, tag } = req.query;

			let query = {
				appId: app._id,
				versionId: version._id,
				createdBy: req.user._id,
			};
			if (name && name !== "null") query.name = { $regex: name, $options: "i" };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let envs = await envCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(envs);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/all?page=0&size=10&name=&sortBy=email&sortDir=asc
@method     GET
@desc       Get the all app version environments
@access     private
*/
router.get(
	"/mine",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.env.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { app, version } = req;
			const { page, size, name, sortBy, sortDir, tag } = req.query;

			let query = {
				appId: app._id,
				versionId: version._id,
			};

			if (name && name !== "null") query.name = { $regex: name, $options: "i" };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let envs = await envCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(envs);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env
@method     POST
@desc       Create a new environment
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.env.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			let { name, autoDeploy } = req.body;

			// Create the new environment object
			let envId = helper.generateId();
			let envObj = await envCtrl.create(
				{
					_id: envId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: helper.generateSlug("env"),
					name,
					autoDeploy,
					createdBy: req.user._id,
				},
				{ cacheKey: envId }
			);

			res.json(envObj);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"create",
				t("Created a new environment named '%s'", name),
				envObj,
				{ orgId: org._id, appId: app._id, versionId: version._id, envId }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

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
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId
@method     DELETE
@desc       Delete environment
@access     private
*/
router.delete(
	"/:envId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.delete"),
	async (req, res) => {
		const session = await envCtrl.startSession();
		try {
			const { org, user, app, version, env } = req;

			if (
				[
					"Deploying",
					"Redeploying",
					"Undeploying",
					"Auto-deploying",
					"Deleting",
				].includes(env.telemetry.status)
			) {
				await envCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is already a deployment operation running on this environment. You need to wait the completion of this operation."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// If there is no version deployment to the environment then directly delete the environment and associcated logs
			if (!env.deploymentDtm) {
				// Delete environment
				await envCtrl.deleteOneById(env._id, {
					cacheKey: env._id,
					session,
				});

				// Delete environment logs
				await envLogCtrl.deleteManyByQuery({
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				});

				await envCtrl.commit(session);
				res.json();

				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.environment",
					"delete",
					t("Deleted environment '%s'", env.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						envId: env._id,
					}
				);
			} else {
				// Update environment data
				let updatedEnv = await envCtrl.updateOneById(
					env._id,
					{
						"telemetry.status": "Deleting",
						"telemetry.logs": [],
						"telemetry.updatedAt": Date.now(),
						updatedBy: req.user._id,
					},
					{},
					{ cacheKey: env._id, session }
				);

				// Create environment logs entry, which will be updated when the operation is completed
				let log = await envLogCtrl.create(
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						envId: env._id,
						action: "delete",
						status: "Deleting",
						logs: [],
						createdBy: user._id,
					},
					{ session }
				);

				// Redeploy application version to the environment
				await deployCtrl.delete(log, app, version, env, user);
				// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
				await setKey(env._id, updatedEnv, helper.constants["1month"]);

				await envCtrl.commit(session);
				res.json({ env: updatedEnv, log });

				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.environment",
					"delete",
					t("Started deleting environment '%s'", env.name),
					updatedEnv,
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						envId: env._id,
					}
				);
			}
		} catch (error) {
			await envCtrl.rollback(session);
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
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/deploy
@method     POST
@desc       Start deploying app version to environment
@access     private
*/
router.post(
	"/:envId/deploy",
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

			if (
				[
					"Deploying",
					"Redeploying",
					"Undeploying",
					"Auto-deploying",
					"Deleting",
				].includes(env.telemetry.status)
			) {
				await envCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is already a deployment operation running on this environment. You need to wait the completion of this operation."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			if (env.deploymentDtm) {
				await envCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The app version is already deployed to this envivonment. If you want to deploy this version again either re-deploy it or undeploy this version first and then deploy it again."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Create environment logs entry, which will be updated when the deployment is completed
			let log = await envLogCtrl.create(
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
					action: "deploy",
					status: "Deploying",
					logs: [],
					createdBy: user._id,
				},
				{ session }
			);

			// Update environment data, we do not update the cache value yet, we update it after the deployment
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				{
					"telemetry.status": "Deploying",
					"telemetry.logs": [],
					"telemetry.updatedAt": Date.now(),
					updatedBy: req.user._id,
				},
				{},
				{ session }
			);

			await envCtrl.commit(session);
			res.json({ env: updatedEnv, log });

			// Deploy application version to the environment
			await deployCtrl.deploy(log, app, version, env, user);
			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, updatedEnv, helper.constants["1month"]);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"deploy",
				t(
					"Started deploying app version '%s' to environment '%s'",
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

			if (
				[
					"Deploying",
					"Redeploying",
					"Undeploying",
					"Auto-deploying",
					"Deleting",
				].includes(env.telemetry.status)
			) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is already a deployment operation running on this environment. You need to wait the completion of this operation."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

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
					"telemetry.status": "Redeploying",
					"telemetry.logs": [],
					"telemetry.updatedAt": Date.now(),
					updatedBy: req.user._id,
				},
				{},
				{ cacheKey: env._id, session }
			);

			// Create environment logs entry, which will be updated when the deployment is completed
			let log = await envLogCtrl.create(
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
					action: "redeploy",
					status: "Redeploying",
					logs: [],
					createdBy: user._id,
				},
				{ session }
			);

			// Redeploy application version to the environment
			await deployCtrl.redeploy(log, app, version, env, user);
			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, updatedEnv, helper.constants["1month"]);

			await envCtrl.commit(session);
			res.json({ env: updatedEnv, log });

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
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/undeploy
@method     POST
@desc       Start undeploying app version from environment
@access     private
*/
router.post(
	"/:envId/undeploy",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.deploy"),
	applyRules("undeploy"),
	validate,
	async (req, res) => {
		const session = await envCtrl.startSession();
		try {
			const { org, user, app, version, env } = req;
			const { dropData } = req.body;

			if (
				[
					"Deploying",
					"Redeploying",
					"Undeploying",
					"Auto-deploying",
					"Deleting",
				].includes(env.telemetry.status)
			) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is already a deployment operation running on this environment. You need to wait the completion of this operation."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			if (!env.deploymentDtm) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is no app version deployed to this environment. You first need to deploy an app version to undeploy it later."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				{
					"telemetry.status": "Undeploying",
					"telemetry.logs": [],
					"telemetry.updatedAt": Date.now(),
					updatedBy: req.user._id,
				},
				{
					deploymentDtm: 1,
				},
				{ cacheKey: env._id, session }
			);

			// Create environment logs entry, which will be updated when the deployment is completed
			let log = await envLogCtrl.create(
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
					action: "undeploy",
					status: "Undeploying",
					logs: [],
					createdBy: user._id,
				},
				{ session }
			);

			// Redeploy application version to the environment
			await deployCtrl.undeploy(log, app, version, env, user, dropData);
			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, updatedEnv, helper.constants["1month"]);

			await envCtrl.commit(session);
			res.json({ env: updatedEnv, log });

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"undeploy",
				t(
					"Started undeploying app version '%s' from environment '%s'",
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
			const { status, logs } = req.body;

			// Get user information
			let user = await userCtrl.getOneById(log.createdBy, {
				cacheKey: log.createdBy,
			});

			// If the environemnt is successfully deleted then delete it and its logs from the database
			if (log.action === "delete" && status === "OK") {
				// Delete environment
				await envCtrl.deleteOneById(env._id, {
					cacheKey: env._id,
					session,
				});

				// Delete environment logs
				await envLogCtrl.deleteManyByQuery({
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				});

				await envCtrl.commit(session);
				res.json();
			} else {
				let timestamp = Date.now();
				let dataSet = {
					status: status,
					updatedBy: user._id,
				};

				// If deployment successfully completed then update deploymentDtm
				if (
					["deploy", "redeploy", "auto-deploy"].includes(log.action) &&
					status === "OK"
				)
					dataSet.deploymentDtm = timestamp;

				// If undeployment is successful then unset versionId and deploymentDtm
				let dataUnset = {};
				if (log.action === "undeploy" && status === "OK") {
					dataSet["status"] = "Idle";
					dataUnset.deploymentDtm = 1;
				}

				// Update environment data
				let updatedEnv = await envCtrl.updateOneById(
					env._id,
					dataSet,
					dataUnset,
					{ cacheKey: env._id, session }
				);

				// Update environment log data
				await envLogCtrl.updateOneById(
					log._id,
					{
						status: status,
						logs: logs,
						updatedAt: timestamp,
					},
					{},
					{ session }
				);

				await envCtrl.commit(session);
				res.json(updatedEnv);
			}

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				log.action,
				t(
					status === "OK"
						? "Completed '%s' operation on environment '%s' successfully"
						: "Completed '%s' operation on environment '%s' with erors",

					log.action,
					env.name
				),
				{},
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
