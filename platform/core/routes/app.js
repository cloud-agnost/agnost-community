import express from "express";
import appCtrl from "../controllers/app.js";
import versionCtrl from "../controllers/version.js";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import deployCtrl from "../controllers/deployment.js";
import auditCtrl from "../controllers/audit.js";
import userCtrl from "../controllers/user.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { authorizeOrgAction } from "../middlewares/authorizeOrgAction.js";
import {
	authorizeAppAction,
	appAuthorization,
} from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/app.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/roles
@method     GET
@desc       Get organization role definitions
@access     private
*/
router.get("/roles", checkContentType, authSession, async (req, res) => {
	try {
		res.json(appAuthorization);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/org/:orgId/app
@method     POST
@desc       Creates a new app. When creating the app a new master version is also created and the app creator is added as 'Manager' to app team.
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.app.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await appCtrl.startSession();
		try {
			const { org, user } = req;
			const { name } = req.body;

			// Create the app
			let appId = helper.generateId();
			let app = await appCtrl.create(
				{
					_id: appId,
					orgId: org._id,
					iid: helper.generateSlug("app"),
					name,
					team: [{ userId: user._id, role: "Admin" }],
					createdBy: user._id,
				},
				{ session, cacheKey: appId }
			);

			// Create the master app version
			let versionId = helper.generateId();
			let version = await versionCtrl.create(
				{
					_id: versionId,
					orgId: org._id,
					appId,
					iid: helper.generateSlug("ver"),
					name: "master",
					private: false,
					readOnly: true,
					master: true,
					createdBy: user._id,
				},
				{ session, cacheKey: versionId }
			);

			await appCtrl.commit(session);
			res.json({ app, version });

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.app",
				"create",
				t("Created new app '%s'", name),
				{ app, version },
				{ orgId: org._id, appId }
			);
		} catch (err) {
			await appCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app
@method     GET
@desc       Get applications where a user is member of
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.app.view"),
	async (req, res) => {
		try {
			const { org, user } = req;

			let apps = await appCtrl.getManyByQuery({
				orgId: org._id,
				"team.userId": user._id,
			});

			res.json(apps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/all
@method     GET
@desc       Get all organization apps
@access     private
*/
router.get(
	"/all",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.app.viewAll"),
	async (req, res) => {
		try {
			const { org } = req;

			let apps = await appCtrl.getManyByQuery({
				orgId: org._id,
			});

			res.json(apps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId
@method     PUT
@desc       Upadate application name
@access     private
*/
router.put(
	"/:appId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app } = req;
			const { name } = req.body;

			// Update app name
			let updatedApp = await appCtrl.updateOneById(
				app._id,
				{ name, updatedBy: user._id },
				{},
				{ cacheKey: app._id }
			);

			res.json(updatedApp);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app",
				"update",
				t("Update the name of app from '%s' to '%s' ", app.name, name),
				updatedApp,
				{ orgId: org._id, appId: app._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId
@method     GET
@desc       Get specific application of a user whom is a member of
@access     private
*/
router.get(
	"/:appId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.view"),
	async (req, res) => {
		try {
			const { app } = req;
			res.json(app);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId
@method     DELETE
@desc       Delete specific application of a user whom is a member of. Only app creators can delete the app.
@access     private
*/
router.delete(
	"/:appId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.delete"),
	async (req, res) => {
		const session = await appCtrl.startSession();

		try {
			const { org, app, user } = req;
			if (app.createdBy.toString() !== req.user._id.toString()) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to delete app '%s'. Only the creator of the app can delete it.",
						app.name
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// Delete the databases, we do no clear cache since it will eventually expire
			await dbCtrl.deleteManyByQuery({ appId: app._id }, { session });
			// Delete the models, we do no clear cache since it will eventually expire
			await modelCtrl.deleteManyByQuery({ appId: app._id }, { session });

			// Get the list of environments of the version that have active deloyments, active deployment means that the environment has a deploymtnDtm
			let environments = await envCtrl.getManyByQuery({
				appId: app._id,
				deploymentDtm: { $exists: true },
			});

			// If there are active environments then delete those environments at engine cluster
			if (environments.length > 0) {
				for (let i = 0; i < environments.length; i++) {
					const env = environments[i];
					await deployCtrl.delete(null, app, null, env, user);
				}
			}

			// Delete the environments, we do not clear cache since it will eventually expire
			await envCtrl.deleteManyByQuery({ appId: app._id }, { session });
			// Delete the environment logs
			await envLogCtrl.deleteManyByQuery({ appId: app._id }, { session });

			// Delete the app version
			await versionCtrl.deleteManyByQuery(
				{ appId: app._id },
				{
					session,
				}
			);

			// Delete the application
			await appCtrl.deleteOneById(app._id, { cacheKey: app._id });

			// Commit the database transaction
			await appCtrl.commit(session);
			res.json();

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app",
				"delete",
				t("Deleted app '%s'", app.name),
				{},
				{ orgId: org._id, appId: app._id }
			);
		} catch (err) {
			await appCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/transfer/:userId
@method     POST
@desc       Transfers app ownership to an existing app member.
@access     private
*/
router.post(
	"/:appId/transfer/:userId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.transfer"),
	applyRules("transfer"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app } = req;

			// Get transferred user information
			let transferredUser = await userCtrl.getOneById(req.params.userId);

			// Update app name
			let updatedApp = await appCtrl.updateOneById(
				app._id,
				{ createdBy: req.params.userId, updatedBy: user._id },
				{},
				{ cacheKey: app._id }
			);

			res.json(updatedApp);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app",
				"transfer",
				t("Transferred app ownership to '%s'", transferredUser.contactEmail),
				updatedApp,
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
