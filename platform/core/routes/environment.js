import axios from "axios";
import express from "express";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import userCtrl from "../controllers/user.js";
import deployCtrl from "../controllers/deployment.js";
import resourceCtrl from "../controllers/resource.js";
import resLogCtrl from "../controllers/resourceLog.js";
import auditCtrl from "../controllers/audit.js";
import { authSession } from "../middlewares/authSession.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateEnv, validateEnvLog } from "../middlewares/validateEnv.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/environment.js";
import { applyRules as applyLogRules } from "../schemas/environmentLog.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env
@method     GET
@desc       Returns app version environment
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.env.view"),
	async (req, res) => {
		try {
			const { version } = req;

			// Get the environemnt of the version
			let envObj = await envCtrl.getOneByQuery({ versionId: version._id });

			res.json(envObj);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId
@method     PUT
@desc       Turn on/off environment autodeploy
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
			let { autoDeploy } = req.body;
			let updatedEnv;
			// If auto deploy turned on then we need to do a redeployment
			if (env.autoDeploy === false && autoDeploy) {
				// Update environment data
				updatedEnv = await envCtrl.updateOneById(
					env._id,
					{
						autoDeploy,
						dbStatus: "Deploying",
						serverStatus: "Deploying",
						schedulerStatus: "Deploying",
						updatedBy: req.user._id,
					},
					{},
					{ cacheKey: env._id }
				);

				res.json(updatedEnv);

				// Create the environment log entry
				const envLog = await deployCtrl.createEnvLog(
					version,
					updatedEnv,
					user,
					"Deploying",
					"Deploying",
					"Deploying",
					t("Turing on/off auto-deploy")
				);
				// Update environemnt data in engine cluster
				await deployCtrl.redeploy(envLog, app, version, updatedEnv, user);
			} else {
				// Update environment data
				updatedEnv = await envCtrl.updateOneById(
					env._id,
					{
						autoDeploy,
						updatedBy: req.user._id,
					},
					{},
					{ cacheKey: env._id }
				);

				res.json(updatedEnv);
			}

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				autoDeploy ? t("Turned on auto-deploy") : t("Turned off auto-deploy"),
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

			res.json(updatedEnv);

			// Update environemnt data in engine cluster
			await deployCtrl.updateVersionInfo(
				app,
				version,
				user,
				"suspend-environment"
			);

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

			res.json(updatedEnv);
			// Update environemnt data in engine cluster
			await deployCtrl.updateVersionInfo(
				app,
				version,
				user,
				"suspend-environment"
			);

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

			if (
				[env.dbStatus, env.serverStatus, env.schedulerStatus].some((entry) =>
					["Deploying", "Redeploying", "Deleting"].includes(entry)
				)
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
					details: t("There is no app version deployed to this environment."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				{
					dbStatus: "Redeploying",
					serverStatus: "Deploying",
					schedulerStatus: "Redeploying",
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
					description: t("Redeploying app version"),
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

			await envCtrl.commit(session);
			res.json(updatedEnv);

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
				// If we have errors in database deployment then we need to update the server status to error
				if (status === "Error") dataSet.serverStatus = status;
			} else if (type === "server") {
				if (log.serverStatus !== "Error" && log.dbStatus !== "Error")
					dataSet.serverStatus = status;
				else dataSet.serverStatus = "Error";
			} else {
				dataSet.schedulerStatus = status;
			}

			dataSet.deploymentDtm = timestamp;

			// Update environment data
			let updatedEnv = await envCtrl.updateOneById(
				env._id,
				dataSet,
				{},
				{ cacheKey: env._id }
			);

			if (type === "db") {
				if (status === "Error") {
					// Update environment log data
					await envLogCtrl.updateOneById(
						log._id,
						{
							dbStatus: status,
							serverStatus: status,
							dbLogs: logs,
							updatedAt: timestamp,
						},
						{}
					);
				} else {
					// Update environment log data
					await envLogCtrl.updateOneById(
						log._id,
						{
							dbStatus: status,
							dbLogs: logs,
							updatedAt: timestamp,
						},
						{}
					);
				}
			} else if (type === "server") {
				let dataIncSet = {};
				if (status === "OK") {
					dataIncSet = { serverStatusOK: 1 };
				} else if (status === "Error") {
					dataIncSet = { serverStatusError: 1 };
				}
				// Update environment log data, append logs to the logs array
				await envLogCtrl.pushObjectById(
					log._id,
					"serverLogs",
					logs,
					{
						serverStatus: dataSet.serverStatus,
						updatedAt: timestamp,
					},
					{},
					dataIncSet
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
					{}
				);
			}

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
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/logs
@method     GET
@desc       Returns environment logs
@access     private
*/
router.get(
	"/:envId/logs",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.view"),
	applyRules("view-logs"),
	validate,
	async (req, res) => {
		try {
			const { org, app, version, env } = req;
			const { page, size, status, actor, sortBy, sortDir, start, end } =
				req.query;

			let query = {
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
				envId: env._id,
			};

			// Status filter
			if (status) {
				query.$or = [
					{ dbStatus: status },
					{ schedulerStatus: status },
					{ serverStatus: status },
				];
			}

			// Actor filter
			if (actor) {
				if (Array.isArray(action)) query["createdBy"] = { $in: actor };
				else query["createdBy"] = actor;
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let logs = await envLogCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				projection: { dbLogs: 0, serverLogs: 0, schedulerLogs: 0 },
			});

			res.json(logs);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/logs/:logId
@method     GET
@desc       Returns the specific environment log
@access     private
*/
router.get(
	"/:envId/logs/:logId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	validateEnvLog,
	authorizeAppAction("app.env.view"),
	async (req, res) => {
		try {
			res.json(req.log);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/resources
@method     GET
@desc       Returns environment resources
@access     private
*/
router.get(
	"/:envId/resources",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.view"),
	async (req, res) => {
		try {
			const { env } = req;

			// Filter out the duplicate resource entries
			const resourceiids = env.mappings
				.map((entry) => entry.resource.iid)
				.filter((value, index, self) => {
					return self.indexOf(value) === index;
				});

			const resources = await resourceCtrl.getManyByQuery(
				{
					iid: { $in: resourceiids },
				},
				{ projection: "-access -accessReadOnly" }
			);

			res.json(resources);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/apiserver
@method     GET
@desc       Returns information about environment's API server
@access     private
*/
router.get(
	"/:envId/apiserver",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.view"),
	async (req, res) => {
		try {
			const { env } = req;

			const apiInfo = await axios.get(
				helper.getWorkerUrl() + `/v1/resource/apiserver/${env.iid}`,
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			res.json(apiInfo.data);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/apiserver
@method     PUT
@desc       Updates the API server configuration
@access     private
*/
router.put(
	"/:envId/apiserver",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	authorizeAppAction("app.env.update"),
	applyRules("update-apiserver"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await resourceCtrl.startSession();
		try {
			const { version, env, org, app, user } = req;

			// Get the API server resource, the api server has the same iid of the environment
			const resource = await resourceCtrl.getOneByQuery(
				{
					iid: env.iid,
				},
				{ projection: "-access -accessReadOnly" }
			);

			const log = await resLogCtrl.create(
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					resourceId: resource._id,
					action: "update",
					status: "Updating",
					createdBy: user._id,
				},
				{ session }
			);

			const updatedConfig = { ...resource.config, ...req.body };
			const updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					config: updatedConfig,
				},
				{},
				{ session }
			);

			// Commit changes to the database
			await userCtrl.commit(session);
			res.json(updatedResource);

			// Apply changes to the API server
			await resourceCtrl.manageClusterResources([
				{ resource: updatedResource, log: log },
			]);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Started updating '%s' resource named '%s'",
					resource.instance,
					resource.name
				),
				updatedResource,
				{
					orgId: org._id,
					appId: updatedResource.appId,
					resourceId: resource._id,
				}
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/env/:envId/apiserver-restart
@method     POST
@desc       Restarts the API server
@access     private
*/
router.post(
	"/:envId/apiserver-restart",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEnv,
	async (req, res) => {
		// Start new database transaction session
		try {
			const { version, env, org, app, user } = req;

			// Get the API server resource, the api server has the same iid of the environment
			const resource = await resourceCtrl.getOneByQuery({
				iid: env.iid,
			});

			const log = await resLogCtrl.create({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
				resourceId: resource._id,
				action: "restart",
				status: "Updating",
				createdBy: user._id,
			});

			res.json();

			// Apply changes to the API server
			await resourceCtrl.manageClusterResources([
				{ resource: resource, log: log },
			]);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Restarting '%s' resource named '%s'",
					resource.instance,
					resource.name
				),
				resource,
				{
					orgId: org._id,
					appId: resource.appId,
					resourceId: resource._id,
				}
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
