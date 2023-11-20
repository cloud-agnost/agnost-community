import express from "express";
import deployCtrl from "../controllers/deployment.js";
import auditCtrl from "../controllers/audit.js";
import mwCtrl from "../controllers/middleware.js";
import epCtrl from "../controllers/endpoint.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateMiddleware } from "../middlewares/validateMiddleware.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/middleware.js";
import { validate } from "../middlewares/validate.js";
import { defaultMiddlewareCode } from "../config/constants.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/mw?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get middlewares of the app version. This does not return the logic (e.g., code or flow) of the middlewares
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.middleware.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { page, size, search, sortBy, sortDir, start, end } = req.query;

			let query = { versionId: version._id };
			if (search) {
				query.name = { $regex: search, $options: "i" };
			}
			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let eps = await mwCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				projection: "-logic",
			});

			res.json(eps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/mw/:mwId
@method     GET
@desc       Get a specific middleware, which also returns the logic (e.g., code or flow)
@access     private
*/
router.get(
	"/:mwId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateMiddleware,
	authorizeAppAction("app.middleware.view"),
	async (req, res) => {
		try {
			const { mw } = req;
			res.json(mw);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/mw
@method     POST
@desc       Creates a new middleware
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.middleware.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const { name } = req.body;

			// Create the middleware
			let mwId = helper.generateId();
			let mwiid = helper.generateSlug("mw");

			let mw = await mwCtrl.create(
				{
					_id: mwId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: mwiid,
					name,
					type: "code",
					logic: defaultMiddlewareCode,
					createdBy: user._id,
				},
				{ cacheKey: mwId }
			);

			res.json(mw);

			// Deploy middleware updates to environments if auto-deployment is enabled
			await deployCtrl.updateMiddlewares(app, version, user, [mw], "add");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.middleware",
				"create",
				t("Created a new middleware '%s'", name),
				mw,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					middlewareId: mw._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/mw/:mwId
@method     PUT
@desc      	Updates middleware properties
@access     private
*/
router.put(
	"/:mwId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateMiddleware,
	authorizeAppAction("app.middleware.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, mw } = req;
			const { name } = req.body;

			let updatedMw = await mwCtrl.updateOneById(
				mw._id,
				{
					name,

					updatedBy: user._id,
				},
				{},
				{ cacheKey: mw._id }
			);

			res.json(updatedMw);

			// Deploy middleware updates to environments if auto-deployment is enabled
			await deployCtrl.updateMiddlewares(
				app,
				version,
				user,
				[updatedMw],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.middleware",
				"update",
				t("Updated the properties of middleware '%s'", updatedMw.name),
				updatedMw,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					middlewareId: mw._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/mw/:mwId/logic
@method     PUT
@desc       Saves the logic (e.g., code) of the middleware
@access     private
*/
router.put(
	"/:mwId/logic",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateMiddleware,
	authorizeAppAction("app.middleware.update"),
	applyRules("save-logic"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, mw } = req;
			const { logic } = req.body;

			// Update the endpoing logic/code
			const updatedMw = await mwCtrl.updateOneById(
				mw._id,
				{ logic, updatedBy: user._id },
				{},
				{ cacheKey: mw._id }
			);

			res.json(updatedMw);

			// Deploy middleware updates to environments if auto-deployment is enabled
			await deployCtrl.updateMiddlewares(
				app,
				version,
				user,
				[updatedMw],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.middleware",
				"update",
				t("Updated the handler of middleware '%s'", updatedMw.name),
				updatedMw,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					middlewareId: mw._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/mw/delete-multi
@method     DELETE
@desc       Deletes multiple middlewares
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.middleware.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await mwCtrl.startSession();
		try {
			const { org, user, app, version } = req;
			const { middlewareIds } = req.body;

			// Get the list of middlewares that will be deleted
			let mws = await mwCtrl.getManyByQuery({
				_id: { $in: middlewareIds },
				versionId: version._id,
			});

			if (mws.length === 0) return res.json();

			// Delete the middlewares
			let ids = mws.map((entry) => entry._id);
			await mwCtrl.deleteManyByQuery(
				{ _id: { $in: ids } },
				{ cacheKey: ids, session }
			);

			// Update impacted endpoints that are using the deleted middleware
			await epCtrl.removeMiddlewares(session, version, mws, user);

			await mwCtrl.commit(session);
			res.json();

			// Deploy middleware updates to environments if auto-deployment is enabled
			await deployCtrl.updateMiddlewares(app, version, user, mws, "delete");

			mws.forEach((mw) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.middleware",
					"delete",
					t("Deleted middleware '%s'", mw.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						middlewareId: mw._id,
					}
				);
			});
		} catch (err) {
			await mwCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/mw/:mwId
@method     DELETE
@desc       Delete a specific middleware
@access     private
*/
router.delete(
	"/:mwId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateMiddleware,
	authorizeAppAction("app.middleware.delete"),
	async (req, res) => {
		const session = await mwCtrl.startSession();
		try {
			const { org, user, app, version, mw } = req;

			// Delete the middleware
			await mwCtrl.deleteOneById(mw._id, { cacheKey: mw._id, session });
			// Update impacted endpoints that are using the deleted middleware
			await epCtrl.removeMiddlewares(session, version, [mw], user);

			await mwCtrl.commit(session);
			res.json();

			// Deploy middleware updates to environments if auto-deployment is enabled
			await deployCtrl.updateMiddlewares(app, version, user, [mw], "delete");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.middleware",
				"delete",
				t("Deleted middleware '%s'", mw.name),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					middlewareId: mw._id,
				}
			);
		} catch (err) {
			await mwCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
