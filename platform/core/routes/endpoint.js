import express from "express";
import deployCtrl from "../controllers/deployment.js";
import auditCtrl from "../controllers/audit.js";
import epCtrl from "../controllers/endpoint.js";
import versionCtrl from "../controllers/version.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import {
	validateEndpoint,
	loadMiddlewares,
} from "../middlewares/validateEndpoint.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/endpoint.js";
import { validate } from "../middlewares/validate.js";
import { defaultEndpointCode } from "../config/constants.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get endpoints of the app version. This does not return the logic (e.g., code or flow) of the endpoint
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.endpoint.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { page, size, search, sortBy, sortDir, start, end } = req.query;

			let query = { versionId: version._id };
			if (search) {
				query.$or = [
					{
						name: { $regex: helper.escapeStringRegexp(search), $options: "i" },
					},
					{
						path: { $regex: helper.escapeStringRegexp(search), $options: "i" },
					},
				];
			}
			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let eps = await epCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				// projection: "-logic",
			});

			res.json(eps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep/iid
@method     POST
@desc       Get the list of endpoints identified by their iid
@access     private
*/
router.post(
	"/iid",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.endpoint.view"),
	applyRules("view-iid"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { iids } = req.body;

			let eps = await epCtrl.getManyByQuery({
				versionId: version._id,
				iid: { $in: iids },
			});

			res.json(eps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep/:epId
@method     GET
@desc       Get a specific endpoint, which also returns the logic (e.g., code or flow)
@access     private
*/
router.get(
	"/:epId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEndpoint,
	authorizeAppAction("app.endpoint.view"),
	async (req, res) => {
		try {
			const { ep } = req;
			res.json(ep);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep
@method     POST
@desc       Creates a new endpoint
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	loadMiddlewares,
	authorizeAppAction("app.endpoint.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const {
				name,
				method,
				path,
				fingerprint,
				timeout,
				apiKeyRequired,
				sessionRequired,
				logExecution,
				rateLimits,
				middlewares,
			} = req.body;

			// Create the endpoint
			let epId = helper.generateId();
			let epiid = helper.generateSlug("ep");

			let ep = await epCtrl.create(
				{
					_id: epId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: epiid,
					name,
					method,
					path,
					fingerprint,
					timeout,
					apiKeyRequired,
					sessionRequired,
					logExecution,
					type: "code",
					logic: defaultEndpointCode,
					rateLimits,
					middlewares,
					createdBy: user._id,
				},
				{ cacheKey: epId }
			);

			res.json(ep);

			// Deploy endpoint updates to environments if auto-deployment is enabled
			await deployCtrl.updateEndpoints(app, version, user, [ep], "add");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.endpoint",
				"create",
				t("Created a new endpoint '%s' %s - %s", name, method, path),
				ep,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					endpointId: ep._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep/:epId
@method     PUT
@desc      	Updates endpoint properties
@access     private
*/
router.put(
	"/:epId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEndpoint,
	loadMiddlewares,
	authorizeAppAction("app.endpoint.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, ep } = req;
			const {
				name,
				method,
				path,
				fingerprint,
				timeout,
				apiKeyRequired,
				sessionRequired,
				logExecution,
				rateLimits,
				middlewares,
			} = req.body;

			let unset = {};
			if (timeout === undefined) {
				unset.timeout = "";
			}

			let updatedEp = await epCtrl.updateOneById(
				ep._id,
				{
					name,
					method,
					path,
					fingerprint,
					timeout,
					apiKeyRequired,
					sessionRequired,
					logExecution,
					rateLimits,
					middlewares,
					updatedBy: user._id,
				},
				unset,
				{ cacheKey: ep._id }
			);

			res.json(updatedEp);

			// Deploy endpoint updates to environments if auto-deployment is enabled
			await deployCtrl.updateEndpoints(
				app,
				version,
				user,
				[updatedEp],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.endpoint",
				"update",
				t(
					"Updated the properties of endpoint '%s' '%s:%s'",
					updatedEp.name,
					updatedEp.method,
					updatedEp.path
				),
				updatedEp,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					endpointId: ep._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep/:epId/logic
@method     PUT
@desc       Saves the logic (e.g., code) of the endpoint
@access     private
*/
router.put(
	"/:epId/logic",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEndpoint,
	authorizeAppAction("app.endpoint.update"),
	applyRules("save-logic"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, ep } = req;
			const { logic } = req.body;

			// Update the endpoing logic/code
			const updatedEp = await epCtrl.updateOneById(
				ep._id,
				{ logic, updatedBy: user._id },
				{},
				{ cacheKey: ep._id }
			);

			res.json(updatedEp);

			// Deploy endpoint updates to environments if auto-deployment is enabled
			await deployCtrl.updateEndpoints(
				app,
				version,
				user,
				[updatedEp],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.endpoint",
				"update",
				t(
					"Updated the handler of endpoint '%s' '%s:%s'",
					updatedEp.name,
					updatedEp.method,
					updatedEp.path
				),
				updatedEp,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					endpointId: ep._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep/delete-multi
@method     DELETE
@desc       Deletes multiple endpoints
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.endpoint.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await epCtrl.startSession();
		try {
			const { org, user, app, version } = req;
			const { endpointIds } = req.body;

			// Get the list of endpoints that will be deleted
			let eps = await epCtrl.getManyByQuery({
				_id: { $in: endpointIds },
				versionId: version._id,
			});

			if (eps.length === 0) return res.json();

			// Iterate through all apikeys of the version to remove the endpoints from allowed and excludedEndpoints endpoints list
			let updatedVersion;
			let versionNeesUpdate = false;
			let apiKeys = [];
			let timestamp = Date.now();
			for (let i = 0; i < version.apiKeys.length; i++) {
				const apiKey = version.apiKeys[i];
				if (
					apiKey.allowedEndpoints.some((entry) =>
						eps.find((entry2) => entry2.iid === entry)
					)
				) {
					versionNeesUpdate = true;
					apiKey.allowedEndpoints = apiKey.allowedEndpoints.filter(
						(entry) => !eps.find((entry2) => entry2.iid === entry)
					);
					apiKey.updatedAt = timestamp;
					apiKey.updatedBy = user._id;
				}

				if (
					apiKey.excludedEndpoints.some((entry) =>
						eps.find((entry2) => entry2.iid === entry)
					)
				) {
					versionNeesUpdate = true;
					apiKey.excludedEndpoints = apiKey.excludedEndpoints.filter(
						(entry) => !eps.find((entry2) => entry2.iid === entry)
					);
					apiKey.updatedAt = timestamp;
					apiKey.updatedBy = user._id;
				}

				apiKeys.push(apiKey);
			}

			// Delete the endpoints
			let ids = eps.map((entry) => entry._id);
			await epCtrl.deleteManyByQuery(
				{ _id: { $in: ids } },
				{ cacheKey: ids, session }
			);

			if (versionNeesUpdate) {
				updatedVersion = await versionCtrl.updateOneById(
					version._id,
					{ apiKeys, updatedBy: user._id },
					{},
					{ cacheKey: version._id, session }
				);
			}

			await epCtrl.commit(session);
			res.json();

			// Deploy endpoint updates to environments if auto-deployment is enabled
			await deployCtrl.updateEndpoints(app, version, user, eps, "delete");

			eps.forEach((ep) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.endpoint",
					"delete",
					t("Deleted endpoint '%s' '%s:%s'", ep.name, ep.method, ep.path),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						endpointId: ep._id,
					}
				);
			});
			if (updatedVersion) {
				// Log action
				auditCtrl.logAndNotify(
					app._id,
					user,
					"org.app.version",
					"update",
					t(
						"Updated app version '%s' API keys due to deletion of endpoints",
						updatedVersion.name
					),
					updatedVersion,
					{ orgId: org._id, appId: app._id, versionId: updatedVersion._id }
				);
			}
		} catch (err) {
			await epCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/ep/:epId
@method     DELETE
@desc       Delete a specific endpoint
@access     private
*/
router.delete(
	"/:epId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateEndpoint,
	authorizeAppAction("app.endpoint.delete"),
	async (req, res) => {
		const session = await epCtrl.startSession();
		try {
			const { org, user, app, version, ep } = req;

			// Iterate through all apikeys of the version to remove the endpoint from allowed and excludedEndpoints endpoints list
			let updatedVersion;
			let versionNeesUpdate = false;
			let apiKeys = [];
			let timestamp = Date.now();
			for (let i = 0; i < version.apiKeys.length; i++) {
				const apiKey = version.apiKeys[i];
				if (apiKey.allowedEndpoints.includes(ep.iid)) {
					versionNeesUpdate = true;
					apiKey.allowedEndpoints = apiKey.allowedEndpoints.filter(
						(entry) => entry !== ep.iid
					);
					apiKey.updatedAt = timestamp;
					apiKey.updatedBy = user._id;
				}

				if (apiKey.excludedEndpoints.includes(ep.iid)) {
					versionNeesUpdate = true;
					apiKey.excludedEndpoints = apiKey.excludedEndpoints.filter(
						(entry) => entry !== ep.iid
					);
					apiKey.updatedAt = timestamp;
					apiKey.updatedBy = user._id;
				}

				apiKeys.push(apiKey);
			}

			// Delete the endpoint
			await epCtrl.deleteOneById(ep._id, { cacheKey: ep._id, session });

			if (versionNeesUpdate) {
				updatedVersion = await versionCtrl.updateOneById(
					version._id,
					{ apiKeys, updatedBy: user._id },
					{},
					{ cacheKey: version._id, session }
				);
			}

			await epCtrl.commit(session);
			res.json();

			// Deploy endpoint updates to environments if auto-deployment is enabled
			await deployCtrl.updateEndpoints(app, version, user, [ep], "delete");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.endpoint",
				"delete",
				t("Deleted endpoint '%s' '%s:%s'", ep.name, ep.method, ep.path),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					endpointId: ep._id,
				}
			);

			if (updatedVersion) {
				// Log action
				auditCtrl.logAndNotify(
					app._id,
					user,
					"org.app.version",
					"update",
					t(
						"Updated app version '%s' API keys due to deletion of endpoint '%s' '%s:%s'",
						updatedVersion.name,
						ep.name,
						ep.method,
						ep.path
					),
					updatedVersion,
					{ orgId: org._id, appId: app._id, versionId: updatedVersion._id }
				);
			}
		} catch (err) {
			await epCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
