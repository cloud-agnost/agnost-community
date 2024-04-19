import express from "express";
import deployCtrl from "../controllers/deployment.js";
import envCtrl from "../controllers/environment.js";
import auditCtrl from "../controllers/audit.js";
import cacheCtrl from "../controllers/cache.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateCache } from "../middlewares/validateCache.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/cache.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import { refreshTypings } from "../util/typings.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/cache?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get caches of the app version.
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.cache.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { page, size, search, sortBy, sortDir, start, end } = req.query;

			let query = { versionId: version._id };
			if (search) {
				query.name = {
					$regex: helper.escapeStringRegexp(search),
					$options: "i",
				};
			}
			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let eps = await cacheCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(eps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/cache/:cacheId
@method     GET
@desc       Get a specific cache, which also returns the logic (e.g., code or flow)
@access     private
*/
router.get(
	"/:cacheId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateCache,
	authorizeAppAction("app.cache.view"),
	async (req, res) => {
		try {
			const { cache } = req;
			res.json(cache);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/cache
@method     POST
@desc       Creates a new cache
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.cache.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		const session = await cacheCtrl.startSession();
		try {
			const { org, user, app, version, resource } = req;
			const { name, assignUniqueName } = req.body;

			// Create the cache
			let cacheId = helper.generateId();
			let cacheiid = helper.generateSlug("ch");

			let cache = await cacheCtrl.create(
				{
					_id: cacheId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: cacheiid,
					name,
					assignUniqueName,
					createdBy: user._id,
				},
				{ cacheKey: cacheId, session }
			);

			// Add mapping to the environment
			const env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			const updatedEnv = await envCtrl.pushObjectById(
				env._id,
				"mappings",
				{
					design: {
						iid: cacheiid,
						type: "cache",
						name: name,
					},
					resource: {
						iid: resource.iid,
						name: resource.name,
						type: resource.type,
						instance: resource.instance,
					},
				},
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await cacheCtrl.commit(session);
			res.json(cache);

			// Deploy cache updates to environments if auto-deployment is enabled
			await deployCtrl.updateCaches(app, version, user, [cache], "add");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.cache",
				"create",
				t("Created a new cache '%s'", name),
				cache,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					cacheId: cache._id,
				}
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				t("Added the cache '%s' resource mapping to the environment", name),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await cacheCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/cache/:cacheId
@method     PUT
@desc      	Updates cache properties
@access     private
*/
router.put(
	"/:cacheId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateCache,
	authorizeAppAction("app.cache.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		const session = await cacheCtrl.startSession();
		try {
			const { org, user, app, version, cache } = req;
			const { name } = req.body;

			let updatedCache = await cacheCtrl.updateOneById(
				cache._id,
				{
					name,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: cache._id, session }
			);

			if (cache.name !== name) {
				// Update the resource mapping name info in environments if there is any
				let env = await envCtrl.getOneByQuery(
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
					},
					{ session }
				);

				await envCtrl.updateOneByQuery(
					{
						_id: env._id,
						"mappings.design.iid": cache.iid,
					},
					{ "mappings.$.design.name": name },
					{},
					{ cacheKey: env._id, session }
				);
			}

			await cacheCtrl.commit(session);
			res.json(updatedCache);

			// Deploy cache updates to environments if auto-deployment is enabled
			await deployCtrl.updateCaches(
				app,
				version,
				user,
				[updatedCache],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.cache",
				"update",
				t("Updated the properties of cache '%s'", updatedCache.name),
				updatedCache,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					cacheId: cache._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await cacheCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/cache/delete-multi
@method     DELETE
@desc       Deletes multiple caches
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.cache.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await cacheCtrl.startSession();
		try {
			const { org, user, app, version } = req;
			const { cacheIds } = req.body;

			// Get the list of caches that will be deleted
			let caches = await cacheCtrl.getManyByQuery({
				_id: { $in: cacheIds },
				versionId: version._id,
			});

			if (caches.length === 0) return res.json();

			// Delete the caches
			let ids = caches.map((entry) => entry._id);
			let iids = caches.map((entry) => entry.iid);
			await cacheCtrl.deleteManyByQuery(
				{ _id: { $in: ids } },
				{ cacheKey: ids, session }
			);

			// Get the environment
			let env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Remove the resource mapping from the environment
			await envCtrl.pullObjectByQuery(
				env._id,
				"mappings",
				{ "design.iid": { $in: iids } },
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await cacheCtrl.commit(session);
			res.json();

			// Deploy cache updates to environments if auto-deployment is enabled
			await deployCtrl.updateCaches(app, version, user, caches, "delete");

			caches.forEach((cache) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.cache",
					"delete",
					t("Deleted cache '%s'", cache.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						cacheId: cache._id,
					}
				);
			});

			refreshTypings(user, version);
		} catch (err) {
			await cacheCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/cache/:cacheId
@method     DELETE
@desc       Delete a specific cache
@access     private
*/
router.delete(
	"/:cacheId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateCache,
	authorizeAppAction("app.cache.delete"),
	async (req, res) => {
		const session = await cacheCtrl.startSession();
		try {
			const { org, user, app, version, cache } = req;

			// Delete the cache
			await cacheCtrl.deleteOneById(cache._id, {
				cacheKey: cache._id,
				session,
			});

			// Get the environment
			let env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Remove the resource mapping from the environment
			await envCtrl.pullObjectByQuery(
				env._id,
				"mappings",
				{ "design.iid": cache.iid },
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await cacheCtrl.commit(session);
			res.json();

			// Deploy cache updates to environments if auto-deployment is enabled
			await deployCtrl.updateCaches(app, version, user, [cache], "delete");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.cache",
				"delete",
				t("Deleted cache '%s'", cache.name),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					cacheId: cache._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await cacheCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
