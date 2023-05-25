import axios from "axios";
import express from "express";
import versionCtrl from "../controllers/version.js";
import envCtrl from "../controllers/environment.js";
import deployCtrl from "../controllers/deployment.js";
import resourceCtrl from "../controllers/resource.js";
import auditCtrl from "../controllers/audit.js";
import epCtrl from "../controllers/endpoint.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import {
	validateVersion,
	validateVersionParam,
	validateVersionLimit,
	validateVersionKey,
	validateVersionPackage,
	validateVersionOSRedirect,
} from "../middlewares/validateVersion.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/version.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import { setKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version?page=0&size=10&name=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get all app versions that are visible to the user
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { app, appMember } = req;
			const { page, size, name, sortBy, sortDir, start, end } = req.query;

			let query = { appId: app._id };
			if (appMember.role !== "Admin")
				query.$or = [
					{ private: false },
					{ $and: [{ private: true }, { createdBy: req.user._id }] },
				];
			if (name && name !== "null") query.name = { $regex: name, $options: "i" };

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let versions = await versionCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(versions);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/mine?page=0&size=10&name=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get the app versions creted by the user
@access     private
*/
router.get(
	"/mine",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { app } = req;
			const { page, size, name, sortBy, sortDir, start, end } = req.query;

			let query = { appId: app._id, createdBy: req.user._id };
			if (name && name !== "null") query.name = { $regex: name, $options: "i" };

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let versions = await versionCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(versions);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version
@method     POST
@desc       Creates a new blank version. By default when we create a new version we also create an associated environment.
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await versionCtrl.startSession();
		try {
			const { org, user, app } = req;
			const { name, readOnly } = req.body;

			// Create the new version and associated environment and api server resource
			const { version, resource, resLog, env, envLog } =
				await versionCtrl.createVersion(session, user, org, app, {
					name,
					isPrivate: req.body.private,
					readOnly,
					master: false,
				});

			// Commit transaction
			await versionCtrl.commit(session);
			res.json({
				version,
				resource,
				resLog,
				env,
				envLog,
			});

			// Deploy application version to the environment
			await deployCtrl.deploy(envLog, app, version, env, user);

			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, env, helper.constants["1month"]);

			// We first deploy the app then create the resources. The environment data needs to be cached before the api-server pod starts up.
			// Create the engine deployment (API server), associated HPA, service and ingress rule
			await resourceCtrl.manageClusterResources([{ resource, log: resLog }]);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"create",
				t("Created a new blank app version '%s'", name),
				{ version, resource, env },
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (error) {
			await versionCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/copy
@method     POST
@desc       Creates a copy of an existing version.
@access     private
*/
router.post(
	"/copy",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.create"),
	applyRules("create-copy"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await versionCtrl.startSession();
		try {
			const { org, user, app } = req;
			const { name, readOnly } = req.body;

			// Create the new version and associated environment and api server resource
			const { version, resource, resLog, env, envLog } =
				await versionCtrl.createVersionCopy(session, user, org, app, {
					name,
					isPrivate: req.body.private,
					readOnly,
					master: false,
					parentVersion: req.parentVersion,
				});

			// Commit transaction
			await versionCtrl.commit(session);
			res.json({
				version,
				resource,
				resLog,
				env,
				envLog,
			});

			// Deploy application version to the environment
			await deployCtrl.deploy(envLog, app, version, env, user);

			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, env, helper.constants["1month"]);

			// We first deploy the app then create the resources. The environment data needs to be cached before the api-server pod starts up.
			// Create the engine deployment (API server), associated HPA, service and ingress rule
			await resourceCtrl.manageClusterResources([{ resource, log: resLog }]);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"create",
				t(
					"Created a new app version '%s' copied from version '%s'",
					name,
					req.parentVersion.name
				),
				{ version, resource, env },
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (error) {
			await versionCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId
@method     PUT
@desc       Update the version information name, private, readOnly and default endpoint limits
@access     private
*/
router.put(
	"/:versionId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const { name, readOnly, defaultEndpointLimits } = req.body;
			const defaultLimits = defaultEndpointLimits || [];

			if (version.master && req.body.private) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Master app version '%s' cannot be marked as private.",
						version.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					name,
					private: req.body.private,
					readOnly,
					defaultEndpointLimits: defaultLimits,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"update",
				t("Updated app version '%s' properties", name),
				version,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId
@method     DELETE
@desc       Delete the version
@access     private
*/
router.delete(
	"/:versionId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.delete"),
	async (req, res) => {
		const session = await versionCtrl.startSession();
		try {
			const { org, user, app, version, appMember } = req;

			if (version.master) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Master app version '%s' cannot be deleted.",
						version.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			if (
				version.createdBy.toString() !== req.user._id.toString() &&
				appMember.role !== "Admin"
			) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to delete version '%s'. Only the creator of the version or app team members with 'Admin' role can delete it.",
						version.name
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// First get all app resources, environments and versions
			const resources = await resourceCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			const envs = await envCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Delete all version related data
			await versionCtrl.deleteVersion(session, org, app, version);
			// Commit the database transaction
			await versionCtrl.commit(session);

			// Iterate through all environments and delete them
			for (let i = 0; i < envs.length; i++) {
				const env = envs[i];
				deployCtrl.delete(app, version, env, user);
			}

			// Iterate through all resources and delete them if they are managed
			const managedResources = resources.filter(
				(entry) => entry.managed === true
			);

			// Delete managed organization resources
			resourceCtrl.deleteClusterResources(managedResources);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"delete",
				t("Deleted app version '%s'", version.name),
				{},
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			await versionCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params
@method     POST
@desc       Creates a new paramerter
@access     private
*/
router.post(
	"/:versionId/params",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.param.create"),
	applyRules("create-param"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { name, value } = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"params",
				{
					name,
					value,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"create",
				t("Added a new parameter '%s'", name, app.name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params/:paramId
@method     PUT
@desc       Update value of parameter
@access     private
*/
router.put(
	"/:versionId/params/:paramId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionParam,
	authorizeAppAction("app.version.param.update"),
	applyRules("update-param"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, param, version } = req;
			const { name, value } = req.body;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "params._id": param._id },
				{
					"params.$.name": name,
					"params.$.value": value,
					"params.$.updatedAt": Date.now(),
					"params.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"update",
				t("Updated parameter '%s'", name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params/:paramId
@method     DELETE
@desc       Delete parameter
@access     private
*/
router.delete(
	"/:versionId/params/:paramId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionParam,
	authorizeAppAction("app.version.param.delete"),
	async (req, res) => {
		try {
			const { org, app, user, param, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"params",
				param._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"delete",
				t("Deleted parameter '%s'", param.name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params
@method     DELETE
@desc       Delete multiple parameters
@access     private
*/
router.delete(
	"/:versionId/params",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.param.delete"),
	applyRules("delete-multi-params"),
	validate,
	async (req, res) => {
		try {
			const { paramIds } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"params",
				{ _id: { $in: paramIds } },
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"delete",
				t("Deleted '%s' app parameter(s)", paramIds.length),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits
@method     POST
@desc       Create a new rate limiter.
@access     private
*/
router.post(
	"/:versionId/limits",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.limit.create"),
	applyRules("create-limit"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { name, rate, duration, errorMessage } = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"limits",
				{
					iid: helper.generateSlug("lmt"),
					name,
					rate,
					duration,
					errorMessage,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"create",
				t(
					"Added a new rate limiter '%s', max '%s' requests per '%s' seconds",
					name,
					rate,
					duration
				),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits/:limitId
@method     PUT
@desc       Update rate limiter
@access     private
*/
router.put(
	"/:versionId/limits/:limitId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionLimit,
	authorizeAppAction("app.version.limit.update"),
	applyRules("update-limit"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, limit, version } = req;
			const { name, rate, duration, errorMessage } = req.body;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "limits._id": limit._id },
				{
					"limits.$.name": name,
					"limits.$.rate": rate,
					"limits.$.duration": duration,
					"limits.$.errorMessage": errorMessage,
					"limits.$.updatedAt": Date.now(),
					"limits.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"update",
				t("Updated rate limiter '%s'", name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits/:limitId
@method     DELETE
@desc       Delete rate limiter
@access     private
*/
router.delete(
	"/:versionId/limits/:limitId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionLimit,
	authorizeAppAction("app.version.limit.delete"),
	async (req, res) => {
		const session = await versionCtrl.startSession();
		try {
			const { org, app, user, limit, version } = req;

			// If the deleted rate limiter is used in default endpoint limits or realtime limiters then we also need to udpate them in any case
			const defaultEndpointLimits = version.defaultEndpointLimits.filter(
				(entry) => entry !== limit.iid
			);
			const realtimeLimits = version.realtime.rateLimits.filter(
				(entry) => entry !== limit.iid
			);

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"limits",
				limit._id,
				{
					updatedBy: user._id,
					defaultEndpointLimits,
					"realtime.rateLimits": realtimeLimits,
				},
				{ cacheKey: version._id }
			);

			// Update also all the endpoints that use the deleted rate limiter object
			await epCtrl.removeRateLimiters(session, version, [limit], user);

			// Commit updates
			await versionCtrl.commit(session);
			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"delete",
				t("Deleted rate limiter '%s'", limit.name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			versionCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits
@method     DELETE
@desc       Delete multiple rate limiters
@access     private
*/
router.delete(
	"/:versionId/limits",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.limit.delete"),
	applyRules("delete-multi-limits"),
	validate,
	async (req, res) => {
		const session = await versionCtrl.startSession();
		try {
			const { limitIds } = req.body;
			const { org, app, user, version } = req;

			// If the deleted rate limiters are used in default endpoint limits or realtime limiters then we also need to udpate them in any case
			const limits = version.limits.filter((entry) =>
				limitIds.includes(entry._id.toString())
			);

			const defaultEndpointLimits = version.defaultEndpointLimits.filter(
				(entry) => {
					let limitObj = limits.find((item) => item.iid === entry);
					return limitObj ? false : true;
				}
			);
			const realtimeLimits = version.realtime.rateLimits.filter((entry) => {
				let limitObj = limits.find((item) => item.iid === entry);
				return limitObj ? false : true;
			});

			// Update also all the endpoints that use the deleted rate limiter objects
			await epCtrl.removeRateLimiters(session, version, limits, user);

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"limits",
				{ _id: { $in: limitIds } },
				{
					updatedBy: user._id,
					defaultEndpointLimits,
					"realtime.rateLimits": realtimeLimits,
				},
				{ cacheKey: version._id, session }
			);

			// Commit updates
			await versionCtrl.commit(session);
			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"delete",
				t("Deleted '%s' rate limiter(s)", limitIds.length),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			versionCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/realtime
@method     PUT
@desc       Update the realtime settings of the version
@access     private
*/
router.put(
	"/:versionId/realtime",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.update"),
	applyRules("update-realtime"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const { enabled, apiKeyRequired, sessionRequired, rateLimits } = req.body;
			const realtimeLimits = rateLimits || [];

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"realtime.enabled": enabled,
					"realtime.apiKeyRequired": apiKeyRequired,
					"realtime.sessionRequired": sessionRequired,
					"realtime.rateLimits": realtimeLimits,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"update",
				t("Updated app version '%s' realtime properties", version.name),
				version,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys
@method     POST
@desc       Create a new API key
@access     private
*/
router.post(
	"/:versionId/keys",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.key.create"),
	applyRules("create-key"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const {
				name,
				expiryDate,
				allowRealtime,
				type,
				allowedEndpoints,
				excludedEndpoints,
				domainAuthorization,
				authorizedDomains,
				IPAuthorization,
				authorizedIPs,
			} = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"apiKeys",
				{
					name,
					key: helper.generateSlug("ak", 36),
					expiryDate,
					allowRealtime,
					type,
					allowedEndpoints,
					excludedEndpoints,
					domainAuthorization,
					authorizedDomains,
					IPAuthorization,
					authorizedIPs,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"create",
				t("Added a new API key '%s'", name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys/:keyId
@method     PUT
@desc       Update an API key
@access     private
*/
router.put(
	"/:versionId/keys/:keyId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionKey,
	authorizeAppAction("app.version.key.update"),
	applyRules("update-key"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, key, version } = req;
			const {
				name,
				expiryDate,
				allowRealtime,
				type,
				allowedEndpoints,
				excludedEndpoints,
				domainAuthorization,
				authorizedDomains,
				IPAuthorization,
				authorizedIPs,
			} = req.body;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "apiKeys._id": key._id },
				{
					"apiKeys.$.name": name,
					"apiKeys.$.expiryDate": expiryDate,
					"apiKeys.$.allowRealtime": allowRealtime,
					"apiKeys.$.type": type,
					"apiKeys.$.allowedEndpoints": allowedEndpoints,
					"apiKeys.$.excludedEndpoints": excludedEndpoints,
					"apiKeys.$.domainAuthorization": domainAuthorization,
					"apiKeys.$.authorizedDomains": authorizedDomains,
					"apiKeys.$.IPAuthorization": IPAuthorization,
					"apiKeys.$.authorizedIPs": authorizedIPs,
					"apiKeys.$.updatedAt": Date.now(),
					"apiKeys.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"update",
				t("Updated API key '%s'", name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys/:keyId
@method     DELETE
@desc       Delete API key
@access     private
*/
router.delete(
	"/:versionId/keys/:keyId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionKey,
	authorizeAppAction("app.version.key.delete"),
	async (req, res) => {
		try {
			const { org, app, user, key, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"apiKeys",
				key._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t("Deleted API key '%s'", key.name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys
@method     DELETE
@desc       Delete multiple API keys
@access     private
*/
router.delete(
	"/:versionId/keys",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.key.delete"),
	applyRules("delete-multi-keys"),
	validate,
	async (req, res) => {
		try {
			const { keyIds } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"apiKeys",
				{ _id: { $in: keyIds } },
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t("Deleted '%s' API key(s)", keyIds.length),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/npm-search?package=&page=&size=
@method     GET
@desc       Searches the NPM packages
@access     private
*/
router.get(
	"/:versionId/npm-search",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.update"),
	applyRules("npm-search"),
	validate,
	async (req, res) => {
		try {
			const { page, size, sortBy } = req.query;
			const url = `https://registry.npmjs.org/-/v1/search?text=${
				req.query.package
			}&size=${size}&from=${page * size}&sort=${sortBy}`;

			const response = await axios.get(url);
			res.json(
				response.data.objects.map((entry) => {
					return {
						package: entry.package.name,
						version: entry.package.version,
						description: entry.package.description,
					};
				})
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages
@method     POST
@desc       Add a new NPM package
@access     private
*/
router.post(
	"/:versionId/packages",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.package.create"),
	applyRules("add-npm-package"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { name, description } = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"npmPackages",
				{
					name,
					version: req.body.version,
					description,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.packages",
				"create",
				t("Added a new NPM package '%s@%s'", name, req.body.version),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages/:packageId
@method     PUT
@desc       Update NPM package version
@access     private
*/
router.put(
	"/:versionId/packages/:packageId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionPackage,
	authorizeAppAction("app.version.package.update"),
	applyRules("update-npm-package"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, key, version, npmPackage } = req;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "npmPackages._id": key._id },
				{
					"npmPackages.$.version": req.body.version,
					"npmPackages.$.updatedAt": Date.now(),
					"npmPackages.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.packages",
				"update",
				t(
					"Updated version of NPM package '%s' from '%s' to '%s'",
					npmPackage.name,
					npmPackage.version,
					req.body.version
				),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages/:packageId
@method     DELETE
@desc       Remove NPM package
@access     private
*/
router.delete(
	"/:versionId/packages/:packageId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionPackage,
	authorizeAppAction("app.version.package.delete"),
	async (req, res) => {
		try {
			const { org, app, user, npmPackage, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"npmPackages",
				npmPackage._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.packages",
				"delete",
				t("Removed NPM package '%s'", npmPackage.name),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages
@method     DELETE
@desc       Remove multiple NPM packages
@access     private
*/
router.delete(
	"/:versionId/packages",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.package.delete"),
	applyRules("remove-multi-packages"),
	validate,
	async (req, res) => {
		try {
			const { packageIds } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"npmPackages",
				{ _id: { $in: packageIds } },
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t("Removed '%s' NPM package(s)", packageIds.length),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/save-model
@method     POST
@desc       Saves the user data model database and model info
@access     private
*/
router.post(
	"/:versionId/auth/save-model",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("save-model"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version, database, model } = req;

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.userDataModel.database": database.iid,
					"authentication.userDataModel.model": model.iid,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t(
					"Set authentication user data model to '%s.%s'",
					database.name,
					model.name
				),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/add-fields
@method     POST
@desc       Adds the missing user data model fields required for authentication
@access     private
*/
router.post(
	"/:versionId/auth/add-fields",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("add-fields"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version, model } = req;
			const { fields } = req.body;

			// TO BE COMPLETED

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, version, user);

			// Log action
			/* 			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t(
					"Set authentication user data model to '%s.%s'",
					database.name,
					model.name
				),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			); */
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/save-redirect
@method     POST
@desc       Sets the default redirect URL
@access     private
*/
router.post(
	"/:versionId/auth/save-redirect",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("save-redirect"),
	validate,
	async (req, res) => {
		try {
			const { defaultRedirect } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.defaultRedirect": defaultRedirect,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t("Set default redirect URL to '%s'", defaultRedirect),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/osredirects
@method     POST
@desc       Create a new OS specific redirect configuration.
@access     private
*/
router.post(
	"/:versionId/osredirects",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("create-osredirect"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { os, primary, secondary } = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"authentication.osRedirects",
				{
					os,
					primary,
					secondary,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"create",
				t("Added ' %s' redirect URL configuration", os),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/osredirects/:redirectId
@method     PUT
@desc       Update redirect URLs of a specific OS
@access     private
*/
router.put(
	"/:versionId/osredirects/:redirectId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionOSRedirect,
	authorizeAppAction("app.version.auth.update"),
	applyRules("update-osredirect"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, osRedirect, version } = req;
			const { primary, secondary } = req.body;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "authentication.osRedirects._id": osRedirect._id },
				{
					"authentication.osRedirects.$.primary": primary,
					"authentication.osRedirects.$.secondary": secondary,
					"authentication.osRedirects.$.updatedAt": Date.now(),
					"authentication.osRedirects.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"update",
				t("Updated '%s' redirect URL configuration", osRedirect.os),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/osredirects/:redirectId
@method     DELETE
@desc       Delete a specific OS redirect configuration
@access     private
*/
router.delete(
	"/:versionId/osredirects/:redirectId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionOSRedirect,
	authorizeAppAction("app.version.auth.update"),
	async (req, res) => {
		try {
			const { org, app, user, osRedirect, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"authentication.osRedirects",
				osRedirect._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"delete",
				t("Deleted '%s' redirect URL configuration", osRedirect.os),
				updatedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

export default router;
