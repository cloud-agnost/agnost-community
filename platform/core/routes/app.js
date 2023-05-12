import express from "express";
import sharp from "sharp";
import appCtrl from "../controllers/app.js";
import versionCtrl from "../controllers/version.js";
import envCtrl from "../controllers/environment.js";
import deployCtrl from "../controllers/deployment.js";
import auditCtrl from "../controllers/audit.js";
import userCtrl from "../controllers/user.js";
import resourceCtrl from "../controllers/resource.js";
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
import { setKey } from "../init/cache.js";
import { handleFile } from "../middlewares/handleFile.js";
import { storage } from "../init/storage.js";
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
			While creating the new version we also create the engine deployment for it and trigger the initial deployment.
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

			// Create the new app and associated master version, environment and engine API server
			const {
				app,
				version,
				resource,
				resLog,
				env,
				dbLog,
				engineLog,
				schedulerLog,
			} = await appCtrl.createApp(session, user, org, name);

			await appCtrl.commit(session);
			res.json({
				app,
				version,
				resource,
				resLog,
				env,
				dbLog,
				engineLog,
				schedulerLog,
			});

			// Create the engine deployment (API server), associated HPA, service and ingress rule
			await resourceCtrl.manageClusterResources([{ resource, log: resLog }]);

			// Deploy application version to the environment
			await deployCtrl.deploy(
				{ dbLog, engineLog, schedulerLog },
				app,
				version,
				env,
				user
			);

			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, env, helper.constants["1month"]);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.app",
				"create",
				t("Created new app '%s'", name),
				{ app, version, resource, env },
				{ orgId: org._id, appId: app._id }
			);
		} catch (err) {
			console.log("***err", err);
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
			let apps = [];

			// Cluster owner is by default Admin member of all apps
			if (user.isClusterOwner) {
				apps = await appCtrl.getManyByQuery({ orgId: org._id });
			} else {
				apps = await appCtrl.getManyByQuery({
					orgId: org._id,
					"team.userId": user._id,
				});
			}

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
				t("Updated the name of app from '%s' to '%s' ", app.name, name),
				updatedApp,
				{ orgId: org._id, appId: app._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/picture?width=128&height=128
@method     PUT
@desc       Updates the profile image of the app. A picture with the name 'picture' needs to be uploaded in body of the request.
@access     private
*/
router.put(
	"/:appId/picture",
	handleFile.single("picture"),
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.update"),
	applyRules("upload-picture"),
	validate,
	async (req, res) => {
		try {
			let buffer = req.file?.buffer;
			let { width, height } = req.query;
			if (!width) width = config.get("general.profileImgSizePx");
			if (!height) height = config.get("general.profileImgSizePx");

			if (!req.file) {
				return res.status(422).json({
					error: t("Missing Upload File"),
					details: t("Missing file, no file uploaded."),
					code: ERROR_CODES.fileUploadError,
				});
			}

			// Resize image if width and height specifiec
			buffer = await sharp(req.file.buffer).resize(width, height).toBuffer();

			// A bucket is a container for objects (files)
			const bucket = storage.bucket(config.get("storage.appImagesBucket"));
			// Create a new blob in the bucket and upload the file data
			let blob = bucket.file(
				`${helper.generateSlug("img", 6)}-${req.file.originalname}`
			);

			// Delete the porfile picture if exists from storages
			if (req.app.pictureUrl) {
				try {
					// Get the file name
					let filename = req.app.pictureUrl.substring(
						req.user.pictureUrl.lastIndexOf("/") + 1
					);
					let oldFile = bucket.file(filename);
					let exists = await oldFile.exists();
					if (exists[0]) await oldFile.delete();
				} catch (err) {}
			}

			// Make sure to set the contentType metadata for the browser to be able to render the image instead of downloading the file (default behavior)
			const blobStream = blob
				.createWriteStream({
					metadata: {
						contentType: req.file.mimetype,
						metadata: {
							uploadDtm: Date.now(),
						},
					},
				})
				.on("error", (err) => {
					return res.status(400).json({
						error: t("Upload Failed"),
						details: t(
							"An error occured while uploading the app image. %s",
							err.message
						),
						code: ERROR_CODES.fileUploadError,
					});
				})
				.on("finish", () => {
					// The public URL can be used to directly access the file via HTTP.
					const pictureUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

					// Make the image public to the web
					blob.makePublic().then(async () => {
						// Update user with the new profile image url
						let appObj = await appCtrl.updateOneById(
							req.app._id,
							{
								pictureUrl,
								updatedBy: req.user._id,
							},
							{},
							{ cacheKey: req.app._id }
						);

						res.json(appObj);

						// Log action
						auditCtrl.logAndNotify(
							req.app._id,
							req.user,
							"org.app",
							"update",
							t("Updated application picture"),
							appObj,
							{ orgId: req.org._id, appId: req.app._id }
						);
					});
				});

			blobStream.end(buffer);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/picture
@method     DELETE
@desc       Removes the profile picture of the organization.
@access     private
*/
router.delete(
	"/:appId/picture",
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.update"),
	validate,
	async (req, res) => {
		try {
			// A bucket is a container for objects (files)
			const bucket = storage.bucket(config.get("storage.appImagesBucket"));
			// Delete the porfile picture if exists from storages
			if (req.app.pictureUrl) {
				try {
					// Get the file name
					let filename = req.app.pictureUrl.substring(
						req.user.pictureUrl.lastIndexOf("/") + 1
					);
					let oldFile = bucket.file(filename);
					let exists = await oldFile.exists();
					if (exists[0]) await oldFile.delete();
				} catch (err) {}
			}

			// Update user with the new profile image url
			let appObj = await appCtrl.updateOneById(
				req.app._id,
				{ updatedBy: req.user._id },
				{ pictureUrl: 1 },
				{ cacheKey: req.app._id }
			);

			res.json(appObj);

			// Log action
			auditCtrl.logAndNotify(
				req.app._id,
				req.user,
				"org.app",
				"update",
				t("Removed application picture"),
				appObj,
				{ orgId: req.org._id, appId: req.app._id }
			);
		} catch (error) {
			handleError(req, res, error);
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
@desc       Delete specific application of a user whom is a member of. Only app creators or cluster owner can delete the app.
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
			if (
				app.ownerUserId.toString() !== req.user._id.toString() &&
				!req.user.isClusterOwner
			) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to delete app '%s'. Only the creator of the app or cluster owner can delete it.",
						app.name
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// First get all app resources, environments and versions
			const resources = await resourceCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
			});
			const envs = await envCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
			});
			const versions = await versionCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
			});

			// Delete all app related data
			await appCtrl.deleteApp(session, org, app);
			// Commit transaction
			await appCtrl.commit(session);

			// Iterate through all environments and delete them
			for (let i = 0; i < envs.length; i++) {
				const env = envs[i];
				deployCtrl.delete(
					app,
					versions.find(
						(entry) => env.versionId.toString() === entry._id.toString()
					),
					env,
					user
				);
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
				{ ownerUserId: req.params.userId, updatedBy: user._id },
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
				t(
					"Transferred app ownership to '%s' (%s)",
					transferredUser.name,
					transferredUser.contactEmail
				),
				updatedApp,
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
