import express from "express";
import deployCtrl from "../controllers/deployment.js";
import envCtrl from "../controllers/environment.js";
import auditCtrl from "../controllers/audit.js";
import storageCtrl from "../controllers/storage.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateStorage } from "../middlewares/validateStorage.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/appStorage.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import { refreshTypings } from "../util/typings.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/storage?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get storages of the app version.
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.storage.view"),
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

			let eps = await storageCtrl.getManyByQuery(query, {
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
@route      /v1/org/:orgId/app/:appId/version/:versionId/storage/:storageId
@method     GET
@desc       Get a specific storage, which also returns the logic (e.g., code or flow)
@access     private
*/
router.get(
	"/:storageId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateStorage,
	authorizeAppAction("app.storage.view"),
	async (req, res) => {
		try {
			const { storage } = req;
			res.json(storage);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/storage
@method     POST
@desc       Creates a new storage
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.storage.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		const session = await storageCtrl.startSession();
		try {
			const { org, user, app, version, resource } = req;
			const { name } = req.body;

			// Create the storage
			let storageId = helper.generateId();
			let storageiid = helper.generateSlug("str");

			let storage = await storageCtrl.create(
				{
					_id: storageId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: storageiid,
					name,
					createdBy: user._id,
				},
				{ cacheKey: storageId, session }
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
						iid: storageiid,
						type: "storage",
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

			await storageCtrl.commit(session);
			res.json(storage);

			// Deploy storage updates to environments if auto-deployment is enabled
			await deployCtrl.updateStorages(app, version, user, [storage], "add");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.storage",
				"create",
				t("Created a new storage '%s'", name),
				storage,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					storageId: storage._id,
				}
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				t("Added the storage '%s' resource mapping to the environment", name),
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
			await storageCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/storage/:storageId
@method     PUT
@desc      	Updates storage properties
@access     private
*/
router.put(
	"/:storageId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateStorage,
	authorizeAppAction("app.storage.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		const session = await storageCtrl.startSession();
		try {
			const { org, user, app, version, storage } = req;
			const { name } = req.body;

			let updatedStorage = await storageCtrl.updateOneById(
				storage._id,
				{
					name,

					updatedBy: user._id,
				},
				{},
				{ cacheKey: storage._id, session }
			);

			if (storage.name !== name) {
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
						"mappings.design.iid": storage.iid,
					},
					{ "mappings.$.design.name": name },
					{},
					{ cacheKey: env._id, session }
				);
			}

			await storageCtrl.commit(session);
			res.json(updatedStorage);

			// Deploy storage updates to environments if auto-deployment is enabled
			await deployCtrl.updateStorages(
				app,
				version,
				user,
				[updatedStorage],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.storage",
				"update",
				t("Updated the properties of storage '%s'", updatedStorage.name),
				updatedStorage,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					storageId: storage._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await storageCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/storage/delete-multi
@method     DELETE
@desc       Deletes multiple storages
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.storage.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await storageCtrl.startSession();
		try {
			const { org, user, app, version } = req;
			const { storageIds } = req.body;

			// Get the list of storages that will be deleted
			let storages = await storageCtrl.getManyByQuery({
				_id: { $in: storageIds },
				versionId: version._id,
			});

			if (storages.length === 0) return res.json();

			// Delete the storages
			let ids = storages.map((entry) => entry._id);
			let iids = storages.map((entry) => entry.iid);
			await storageCtrl.deleteManyByQuery(
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

			await storageCtrl.commit(session);
			res.json();

			// Deploy storage updates to environments if auto-deployment is enabled
			await deployCtrl.updateStorages(app, version, user, storages, "delete");

			storages.forEach((storage) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.storage",
					"delete",
					t("Deleted storage '%s'", storage.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						storageId: storage._id,
					}
				);
			});

			refreshTypings(user, version);
		} catch (err) {
			await storageCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/storage/:storageId
@method     DELETE
@desc       Delete a specific storage
@access     private
*/
router.delete(
	"/:storageId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateStorage,
	authorizeAppAction("app.storage.delete"),
	async (req, res) => {
		const session = await storageCtrl.startSession();
		try {
			const { org, user, app, version, storage } = req;

			// Delete the storage
			await storageCtrl.deleteOneById(storage._id, {
				cacheKey: storage._id,
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
				{ "design.iid": storage.iid },
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await storageCtrl.commit(session);
			res.json();

			// Deploy storage updates to environments if auto-deployment is enabled
			await deployCtrl.updateStorages(app, version, user, [storage], "delete");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.storage",
				"delete",
				t("Deleted storage '%s'", storage.name),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					storageId: storage._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await storageCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
