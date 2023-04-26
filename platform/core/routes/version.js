import express from "express";
import versionCtrl from "../controllers/version.js";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import deployCtrl from "../controllers/deployment.js";
import auditCtrl from "../controllers/audit.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import {
	validateVersion,
	validateVersionParam,
	validateVersionLimit,
} from "../middlewares/validateVersion.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/version.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
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
@desc       Creates a new version. By default when we create a new version we also create an associated environment.
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

			// Create the new version
			let versionId = helper.generateId();
			let version = await versionCtrl.create(
				{
					_id: versionId,
					orgId: org._id,
					appId: app._id,
					iid: helper.generateSlug("ver"),
					name,
					private: req.body.private,
					readOnly,
					master: false,
					createdBy: user._id,
				},
				{ cacheKey: versionId }
			);

			// Create the environment of the version
			let mappings = [];
			let envId = helper.generateId();
			// If it is a development environment then add the default engince cluster mapping
			if (["development"].includes(process.env.NODE_ENV)) {
				mappings.push({
					design: {
						iid: "asdasd",
						type: "sfsdfsf",
						name: "weqwe",
					},
					resource: {
						id: "dasda",
						name: "sdasd",
						type: "sdssdasd",
						instance: "asasdasd",
					},
				});
			}
			await envCtrl.create(
				{
					_id: envId,
					orgId: org._id,
					appId: app._id,
					versionId: versionId,
					iid: helper.generateSlug("env"),
					name: t("Default Environment"),
					autoDeploy: true,
					createdBy: user._id,
				},
				{ session, cacheKey: envId }
			);

			// Commit transaction
			await versionCtrl.commit(session);
			res.json(version);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"create",
				t("Created a new app version '%s'", name),
				version,
				{ orgId: org._id, appId: app._id, versionId: versionId }
			);
		} catch (err) {
			await versionCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId
@method     PUT
@desc       Update the version information name, private, readOnly
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
			const { name, readOnly } = req.body;

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
				{ name, private: req.body.private, readOnly },
				{},
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

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
			const { org, user, app, version } = req;

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

			// Delete the databases, we do no clear cache since it will eventually expire
			await dbCtrl.deleteManyByQuery({ versionId: version._id }, { session });
			// Delete the models, we do no clear cache since it will eventually expire
			await modelCtrl.deleteManyByQuery(
				{ versionId: version._id },
				{ session }
			);

			// Get the list of environments of the version that have active deloyments, active deployment means that the environment has a deploymtnDtm
			let environments = await envCtrl.getManyByQuery({
				versionId: version._id,
				deploymentDtm: { $exists: true },
			});

			// If there are active environments then delete those environments at engine cluster
			if (environments.length > 0) {
				for (let i = 0; i < environments.length; i++) {
					const env = environments[i];
					await deployCtrl.delete(null, app, version, env, user);
				}
			}

			// Delete the environments, we do not clear cache since it will eventually expire
			await envCtrl.deleteManyByQuery({ versionId: version._id }, { session });
			// Delete the environment logs
			await envLogCtrl.deleteManyByQuery(
				{ versionId: version._id },
				{ session }
			);

			// Delete the app version
			await versionCtrl.deleteOneById(version._id, {
				cacheKey: version._id,
				session,
			});

			// Commit the database transaction
			await versionCtrl.commit(session);
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
@desc       Create a new paramerter.
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
		try {
			const { org, app, user, limit, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"limits",
				limit._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			res.json(updatedVersion);

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
			handleError(req, res, err);
		}
	}
);

export default router;
