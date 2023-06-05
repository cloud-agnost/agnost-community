import express from "express";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import envCtrl from "../controllers/environment.js";
import auditCtrl from "../controllers/audit.js";
import deployCtrl from "../controllers/deployment.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateDb } from "../middlewares/validateDb.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/database.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db
@method     GET
@desc       Get databases of the app version, sorted by name ascending order
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.db.view"),
	async (req, res) => {
		try {
			let dbs = await dbCtrl.getManyByQuery(
				{ versionId: req.version._id },
				{ sort: { name: 1 } }
			);
			res.json(dbs);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db
@method     POST
@desc       Creates a new database
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.db.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		const session = await dbCtrl.startSession();
		try {
			const { org, user, app, version, resource } = req;
			const { name, type, managed } = req.body;

			// Create the database
			let dbId = helper.generateId();
			let dbiid = helper.generateSlug("db");
			let db = await dbCtrl.create(
				{
					_id: dbId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: dbiid,
					name,
					type,
					managed,
					createdBy: user._id,
				},
				{ cacheKey: dbId, session }
			);

			// Add mapping to the environment
			const env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			await envCtrl.pushObjectById(
				env._id,
				"mappings",
				{
					design: {
						iid: dbiid,
						type: "database",
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

			await dbCtrl.commit(session);
			res.json(db);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "create-db");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db",
				"create",
				t("Created a new '%s' database '%s'", type, name),
				db,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			await dbCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId
@method     GET
@desc       Get a specific database of the app
@access     private
*/
router.get(
	"/:dbId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.db.view"),
	async (req, res) => {
		try {
			res.json(req.db);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId
@method     PUT
@desc       Upadate database properties
@access     private
*/
router.put(
	"/:dbId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.db.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		const session = await dbCtrl.startSession();
		try {
			const { org, user, app, version, db } = req;
			const { name } = req.body;

			// Update database name
			let updatedDb = await dbCtrl.updateOneById(
				db._id,
				{ name, updatedBy: user._id },
				{},
				{ cacheKey: db._id }
			);

			// Update the resouce mapping name info in environments if there is any
			let environments = await envCtrl.getManyByQuery(
				{
					orgId: org._id,
					appId: app._id,
					"mappings.design.iid": db.iid,
				},
				{ session }
			);

			for (let i = 0; i < environments.length; i++) {
				const env = environments[i];
				await envCtrl.updateOneByQuery(
					{
						_id: env._id,
						"mappings.design.iid": db.iid,
					},
					{ "mappings.$.design.name": name },
					{},
					{ cacheKey: env._id, session }
				);
			}

			// Commit the database transaction
			await dbCtrl.commit(session);

			res.json(updatedDb);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db",
				"update",
				t(
					"Update the name of the '%s' database from '%s' to '%s'",
					db.type,
					db.name,
					name
				),
				updatedDb,
				{ orgId: org._id, appId: app._id, versionId: version._id, dbId: db._id }
			);
		} catch (err) {
			await dbCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId
@method     DELETE
@desc       Delete the database
@access     private
*/
router.delete(
	"/:dbId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.db.delete"),
	async (req, res) => {
		const session = await dbCtrl.startSession();
		try {
			const { org, user, app, version, db } = req;

			// Get the list of environments that are using this database
			let environments = await envCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
				"mappings.design.iid": db.iid,
			});

			// Delete the resource mapping from impacted environments
			for (let i = 0; i < environments.length; i++) {
				const env = environments[i];
				await envCtrl.pullObjectByQuery(
					env._id,
					"mappings",
					{ "design.iid": db.iid },
					{ updatedBy: user._id },
					{ cacheKey: env._id, session }
				);
			}

			// Delete the models associated with the database, we do no clear cache since it will eventually expire
			await modelCtrl.deleteManyByQuery({ dbId: db._id }, { session });

			// Delete the database
			await dbCtrl.deleteOneById(db._id, { cacheKey: db._id, session });

			// Commit the database transaction
			await dbCtrl.commit(session);
			res.json();

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db",
				"delete",
				t("Deleted the '%s' database '%s'", db.type, db.name),
				{},
				{ orgId: org._id, appId: app._id, versionId: version._id, dbId: db._id }
			);
		} catch (err) {
			await dbCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
