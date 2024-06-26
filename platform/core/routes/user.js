import express from "express";
import bcrypt from "bcrypt";
import sharp from "sharp";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import orgInvitationCtrl from "../controllers/orgInvitation.js";
import appInvitationCtrl from "../controllers/appInvitation.js";
import prjInvitationCtrl from "../controllers/projectInvitation.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import appCtrl from "../controllers/app.js";
import prjCtrl from "../controllers/project.js";
import authCtrl from "../controllers/auth.js";
import orgCtrl from "../controllers/organization.js";
import deployCtrl from "../controllers/deployment.js";
import versionCtrl from "../controllers/version.js";
import { applyRules } from "../schemas/user.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validate } from "../middlewares/validate.js";
import { fileUploadMiddleware } from "../middlewares/handleFile.js";
import { sendMessage } from "../init/queue.js";
import { storage } from "../init/storage.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";
import { notificationTypes } from "../config/constants.js";
import { sendMessage as sendNotification } from "../init/sync.js";
import { deleteKey } from "../init/cache.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/user/me
@method     GET
@desc       Returns the user information associated with the access token
@access     private
*/
router.get("/me", authSession, async (req, res) => {
	try {
		// Remove password before returning the user object
		req.user.loginProfiles = req.user.loginProfiles.map((entry) => {
			if (entry.provider === "agnost") return { ...entry, password: undefined };
			else return entry;
		});
		res.json(req.user);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/user
@method     DELETE
@desc       Deletes (anonymizes) the user account, removes also the user from organization and app memberships
@access     private
*/
router.delete("/", authSession, async (req, res) => {
	// Start new database transaction session
	const session = await userCtrl.startSession();
	try {
		const { user } = req;
		if (user.isClusterOwner) {
			return res.status(400).json({
				error: t("Not Allowed"),
				code: ERROR_CODES.notAllowed,
				details: t(
					"You are the owner of the cluster. If you would like to delete your account, you first need to transfer cluster ownership to another user of the cluster."
				),
			});
		}

		await userCtrl.updateOneById(
			user._id,
			{
				name: "Anonymous",
				contactEmail: "Anonymous",
				status: "Deleted",
				color: helper.generateColor("dark"),
				"loginProfiles.$[].email": "Anonymous",
			},
			{ pictureUrl: 1, "loginProfiles.$[].password": 1, notifications: 1 },
			{ session }
		);

		// Clear the cache of the user
		await deleteKey(user._id);

		// Get organization memberships of the user
		let orgMemberships = await orgMemberCtrl.getManyByQuery(
			{
				userId: user._id,
			},
			{
				session,
			}
		);

		// Remove user from organization teams
		for (let i = 0; i < orgMemberships.length; i++) {
			const orgMembership = orgMemberships[i];
			// Leave the organization team
			await orgMemberCtrl.deleteOneByQuery(
				{ orgId: orgMembership.orgId, userId: user._id },
				{
					cacheKey: `${orgMembership.orgId}.${user._id}`,
					session,
				}
			);
		}

		// Delete organization invitations
		await orgInvitationCtrl.deleteManyByQuery(
			{ email: user.contactEmail },
			{ session }
		);

		// Check to see if the user has app team memberships.
		let apps = await appCtrl.getManyByQuery(
			{
				"team.userId": user._id,
			},
			{ session }
		);

		// Remove user from app teams
		for (let i = 0; i < apps.length; i++) {
			const app = apps[i];
			await appCtrl.pullObjectByQuery(
				app._id,
				"team",
				{ userId: user._id },
				{},
				{ cacheKey: app._id, session }
			);
		}

		// Delete app invitations
		await appInvitationCtrl.deleteManyByQuery(
			{ email: user.contactEmail },
			{ session }
		);

		// Commit transaction
		await userCtrl.commit(session);
		// Clear the session of the user
		await authCtrl.deleteSession(req.session, true);

		res.json();

		if (orgMemberships.length > 0) {
			orgMemberships.forEach((orgMembership) => {
				// Send realtime notifications for updated organizations
				sendNotification(orgMembership.orgId, {
					actor: {
						userId: user._id,
						name: user.name,
						pictureUrl: user.pictureUrl,
						color: user.color,
						contactEmail: user.contactEmail,
						loginEmail: user.loginProfiles[0].email,
					},
					action: "delete",
					object: "org.member",
					description: t(
						"User '%s' (%s) has left the organization team",
						user.name,
						user.contactEmail
					),
					timestamp: Date.now(),
					data: {
						_id: user._id,
						iid: user.iid,
						color: user.color,
						contactEmail: user.contactEmail,
						name: user.name,
						pictureUrl: user.pictureUrl,
						loginEmail: user.loginProfiles[0].email,
					},
					identifiers: { orgId: orgMembership.orgId },
				});
			});
		}
	} catch (error) {
		await userCtrl.rollback(session);
		handleError(req, res, error);
	}
});

/*
@route      /v1/user/list?page=0&size=10&search&sortBy=name&sortDir=asc
@method     GET
@desc       Gets (searches) all active users in a cluster, excludes the user that is making the request. By default returns users sorted by name ascending order.
@access     private
*/
router.get(
	"/list",
	authSession,
	applyRules("search"),
	validate,
	async (req, res) => {
		try {
			const { user } = req;
			const { page, size, search, sortBy, sortDir } = req.query;

			let query = { _id: { $ne: user._id }, status: "Active" };
			if (search && search !== "null") {
				query.$or = [
					{
						name: { $regex: helper.escapeStringRegexp(search), $options: "i" },
					},
					{
						contactEmail: {
							$regex: helper.escapeStringRegexp(search),
							$options: "i",
						},
					},
					{
						"loginProfiles.email": {
							$regex: helper.escapeStringRegexp(search),
							$options: "i",
						},
					},
				];
			}

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { name: "asc" };

			let users = await userCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(users);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/user/name
@method     PUT
@desc       Updates the name of the user
@access     private
*/
router.put(
	"/name",
	checkContentType,
	authSession,
	applyRules("update-name"),
	validate,
	async (req, res) => {
		try {
			let userObj = await userCtrl.updateOneById(
				req.user._id,
				{
					name: req.body.name,
				},
				{},
				{ cacheKey: req.user._id }
			);

			// Remove password field value from returned object
			delete userObj.loginProfiles[0].password;
			res.json(userObj);

			// Log action
			auditCtrl.logAndNotify(
				userObj._id,
				userObj,
				"user",
				"update",
				t("Updated name to '%s'", req.body.name),
				userObj
			);

			auditCtrl.updateActorName(userObj._id, req.body.name);
			orgInvitationCtrl.updateHostName(userObj._id, req.body.name);
			appInvitationCtrl.updateHostName(userObj._id, req.body.name);
			prjInvitationCtrl.updateHostName(userObj._id, req.body.name);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/password
@method     PUT
@desc       Updates the password of the user
@access     private
*/
router.put(
	"/password",
	checkContentType,
	authSession,
	applyRules("update-password"),
	validate,
	async (req, res) => {
		try {
			let { password, newPassword } = req.body;
			const { loginProfiles } = req.user;

			// Get email/password login profile
			let profile = loginProfiles.find((entry) => entry.provider === "agnost");
			if (!profile) {
				return res.status(400).json({
					error: t("Not Allowed"),
					code: ERROR_CODES.notAllowed,
					details: t(
						"User does not have any email/password based login profile. Password can only be changed for email/password based login profiles."
					),
				});
			}

			// Check current password
			const isMatch = await bcrypt.compare(password, profile.password);
			if (!isMatch) {
				return res.status(401).json({
					error: t("Invalid Credentials"),
					details: t("The current password is invalid."),
					code: ERROR_CODES.invalidCredentials,
				});
			}

			// Encrypt user password
			const salt = await bcrypt.genSalt(10);
			let encryptedPwd = await bcrypt.hash(newPassword.toString(), salt);

			// Update the password in the database
			await userCtrl.updateOneByQuery(
				{
					"loginProfiles.provider": "agnost",
					"loginProfiles.email": profile.email,
				},
				{
					"loginProfiles.$.password": encryptedPwd,
				},
				{},
				{ cacheKey: req.user._id }
			);

			res.json();

			// Log action
			auditCtrl.log(req.user, "user", "update", t("Updated login password"));
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/picture?width=128&height=128
@method     PUT
@desc       Updates the profile image of the user. A picture with the name 'picture' needs to be uploaded in the body of the request.
@access     private
*/
router.put(
	"/picture",
	fileUploadMiddleware,
	authSession,
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

			// Resize image if width and height specified and if the image is not in svg format
			if (req.file.mimetype !== "image/svg+xml")
				buffer = await sharp(req.file.buffer).resize(width, height).toBuffer();

			// Specify the directory where you want to store the image
			const uploadBucket = config.get("general.storageBucket");
			// Ensure file storage folder exists
			await storage.ensureBucket(uploadBucket);
			// Delete existing file if it exists
			await storage.deleteFile(uploadBucket, req.user.pictureUrl);
			// Save the new file
			const filePath = `storage/avatars/${helper.generateSlug("img", 6)}-${
				req.file.originalname
			}`;

			const metaData = {
				"Content-Type": req.file.mimetype,
			};
			await storage.saveFile(uploadBucket, filePath, buffer, metaData);

			// Update user with the new profile image url
			let userObj = await userCtrl.updateOneById(
				req.user._id,
				{
					pictureUrl: filePath,
				},
				{},
				{ cacheKey: req.user._id }
			);

			// Remove password field value from returned object
			delete userObj.loginProfiles[0].password;
			res.json(userObj);

			// Log action
			auditCtrl.logAndNotify(
				userObj._id,
				userObj,
				"user",
				"update",
				t("Updated profile picture"),
				userObj
			);

			auditCtrl.updateActorPicture(userObj._id, filePath);
			orgInvitationCtrl.updateHostPicture(userObj._id, filePath);
			appInvitationCtrl.updateHostPicture(userObj._id, filePath);
			prjInvitationCtrl.updateHostPicture(userObj._id, filePath);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/picture
@method     DELETE
@desc       Removes the profile picture of the user.
@access     private
*/
router.delete("/picture", authSession, async (req, res) => {
	try {
		// Delete existing file if it exists
		storage.deleteFile(req.user.pictureUrl);

		// Update user with the new profile image url
		let userObj = await userCtrl.updateOneById(
			req.user._id,
			{},
			{ pictureUrl: 1 },
			{ cacheKey: req.user._id }
		);

		// Remove password field value from returned object
		delete userObj.loginProfiles[0].password;
		res.json(userObj);

		// Log action
		auditCtrl.logAndNotify(
			userObj._id,
			userObj,
			"user",
			"update",
			t("Removed profile picture"),
			userObj
		);
		auditCtrl.removeActorPicture(userObj._id);
		orgInvitationCtrl.removeHostPicture(userObj._id);
		appInvitationCtrl.removeHostPicture(userObj._id);
		prjInvitationCtrl.removeHostPicture(userObj._id);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/user/notifications
@method     PUT
@desc       Updates the notification settings of the user. The full notifications list is needed, it directly sets the new value
@access     private
*/
router.put(
	"/notifications",
	checkContentType,
	authSession,
	applyRules("update-notifications"),
	validate,
	async (req, res) => {
		try {
			let userObj = await userCtrl.updateOneById(
				req.user._id,
				{
					notifications: req.body.notifications,
				},
				{},
				{ cacheKey: req.user._id }
			);

			// Remove password field value from returned object
			delete userObj.loginProfiles[0].password;
			res.json(userObj);

			// Log action
			auditCtrl.logAndNotify(
				userObj._id,
				userObj,
				"user",
				"update",
				t("Updated notification settings"),
				userObj
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/editor
@method     PUT
@desc       Updates the code editor settings of the user.
@access     private
*/
router.put("/editor", checkContentType, authSession, async (req, res) => {
	try {
		let userObj = await userCtrl.updateOneById(
			req.user._id,
			{
				editorSettings: req.body,
			},
			{},
			{ cacheKey: req.user._id }
		);

		// Remove password field value from returned object
		delete userObj.loginProfiles[0].password;
		res.json(userObj);

		// Log action
		auditCtrl.logAndNotify(
			userObj._id,
			userObj,
			"user",
			"update",
			t("Updated code editor settings"),
			userObj
		);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/user/contact-email
@method     POST
@desc       Initiates the update for contact email change. A confirmation email is sent to the new email address.
			Until the email is verified, the contact email is not changed
@access     private
*/
router.post(
	"/contact-email",
	checkContentType,
	authSession,
	applyRules("change-contact-email"),
	validate,
	async (req, res) => {
		try {
			let { email, uiBaseURL } = req.body;

			// Craate the contact email validation token
			let token = await userCtrl.createChangeEmailToken(
				req.user._id,
				email,
				helper.constants["1day"]
			);

			// Send the contact email verification link to the new email address
			sendMessage("send-contact-email-token", {
				to: email,
				url: `${uiBaseURL}/studio/v1/user/contact-email/${token}`,
			});

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/contact-email/:token
@method     POST
@desc       Verifies the new contact email address
@access     public
*/
router.post(
	"/contact-email/:token",
	checkContentType,
	applyRules("verify-token"),
	validate,
	async (req, res) => {
		try {
			let { token } = req.params;
			let info = await userCtrl.getChangeEmailTokenInfo(token);

			if (!info) {
				return res.status(401).json({
					error: t("Unauthorized"),
					details: t(
						"The change contact email token was not authorized or has expired"
					),
					code: ERROR_CODES.invalidToken,
				});
			}

			// Change the contact email of the user
			let userObj = await userCtrl.updateOneById(
				info.userId,
				{
					contactEmail: info.email,
				},
				{},
				{ cacheKey: info.userId }
			);
			// Token has been used, delete it
			await userCtrl.deleteChangeEmailTokenInfo(token);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				userObj._id,
				userObj,
				"user",
				"update",
				t("Updated contact email to '%s'", info.email),
				userObj
			);
			auditCtrl.updateActorContactEmail(userObj._id, info.email);
			orgInvitationCtrl.updateHostContactEmail(userObj._id, info.email);
			appInvitationCtrl.updateHostContactEmail(userObj._id, info.email);
			prjInvitationCtrl.updateHostContactEmail(userObj._id, info.email);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/login-email
@method     POST
@desc       Initiates the update for login email change. A confirmation email is sent to the new email address.
			Until the email is verified, the login email is not changed
@access     private
*/
router.post(
	"/login-email",
	checkContentType,
	authSession,
	applyRules("change-login-email"),
	validate,
	async (req, res) => {
		try {
			const { loginProfiles } = req.user;
			let { email, password, uiBaseURL } = req.body;

			// Get email/password login profile
			let profile = loginProfiles.find((entry) => entry.provider === "agnost");
			if (!profile) {
				return res.status(400).json({
					error: t("Not Allowed"),
					code: ERROR_CODES.notAllowed,
					details: t(
						"User does not have any email/password based login profile. Login email can only be changed for email/password based login profiles."
					),
				});
			}

			// Check if the new email address is already in use
			const existingUser = await userCtrl.getOneByQuery({
				loginProfiles: { $elemMatch: { email } },
				_id: { $ne: req.user._id },
			});

			if (existingUser) {
				return res.status(400).json({
					error: t("Not Allowed"),
					code: ERROR_CODES.notAllowed,
					details: t(
						"A user account with the provided email '%s' already exists.",
						email
					),
				});
			}

			// Check current password
			const isMatch = await bcrypt.compare(
				password.toString(),
				profile.password
			);
			if (!isMatch) {
				return res.status(401).json({
					error: t("Invalid Credentials"),
					details: t("The current password is invalid."),
					code: ERROR_CODES.invalidCredentials,
				});
			}

			// Create the login email validation token
			let token = await userCtrl.createChangeEmailToken(
				req.user._id,
				email,
				helper.constants["2hours"]
			);

			// Send the login email verification link to the new email address
			sendMessage("send-login-email-token", {
				to: email,
				url: `${uiBaseURL}/studio/redirect-handle?token=${token}&type=change-email`,
			});

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/login-email/:token
@method     POST
@desc       Verifies the new login email address
@access     public
*/
router.post(
	"/login-email/:token",
	checkContentType,
	applyRules("verify-token"),
	validate,
	async (req, res) => {
		try {
			let { token } = req.params;
			let info = await userCtrl.getChangeEmailTokenInfo(token);

			if (!info) {
				return res.status(401).json({
					error: t("Unauthorized"),
					details: t(
						"The change login email token was not authorized or has expired."
					),
					code: ERROR_CODES.invalidToken,
				});
			}

			// Get the user information
			let user = await userCtrl.getOneById(info.userId);
			if (!user) {
				return res.status(401).json({
					error: t("User not Found"),
					details: t(
						"The user information associated with the login email change token cannot be found."
					),
					code: ERROR_CODES.invalidToken,
				});
			}

			// Get email/password login profile
			let profile = user.loginProfiles.find(
				(entry) => entry.provider === "agnost"
			);
			if (!profile) {
				return res.status(400).json({
					error: t("Not Allowed"),
					code: ERROR_CODES.notAllowed,
					details: t(
						"User does not have any email/password based login profile. Login email can only be changed for email/password based login profiles."
					),
				});
			}

			// All set we can update the email of the user login profile and also contact email
			let userObj = await userCtrl.updateOneByQuery(
				{
					"loginProfiles.provider": "agnost",
					"loginProfiles.email": profile.email,
				},
				{
					contactEmail: info.email,
					"loginProfiles.$.email": info.email,
				},
				{},
				{ cacheKey: info.userId }
			);
			// Token has been used, delete it
			await userCtrl.deleteChangeEmailTokenInfo(token);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				userObj._id,
				userObj,
				"user",
				"update",
				t("Updated login email to '%s'", info.email),
				userObj
			);
			auditCtrl.updateActorLoginEmail(userObj._id, info.email);
			orgInvitationCtrl.updateHostLoginEmail(userObj._id, info.email);
			appInvitationCtrl.updateHostLoginEmail(userObj._id, info.email);
			prjInvitationCtrl.updateHostLoginEmail(userObj._id, info.email);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/reset-pwd
@method     POST
@desc       Initiates the reset password process. An email is sent to the email address of the user.
			The email includes a link directing to the UI of the app with a token in query string parameter.
@access     public
*/
router.post(
	"/reset-pwd",
	checkContentType,
	applyRules("reset-password-init"),
	validate,
	async (req, res) => {
		try {
			let { email, uiBaseURL } = req.body;

			let userObj = await userCtrl.getOneByQuery({
				"loginProfiles.provider": "agnost",
				"loginProfiles.email": email,
			});

			if (!userObj) {
				return res.status(401).json({
					error: t("Invalid Credentials"),
					details: t("No such login profile exists with the provided email."),
					code: ERROR_CODES.invalidCredentials,
				});
			}

			// Craate and send the reset password validation token
			let token = await userCtrl.createResetPwdToken(
				userObj._id,
				email,
				helper.constants["2hours"]
			);

			// Send the forgot password change link link to the email address
			sendMessage("send-reset-pwd-token", {
				to: email,
				url: `${uiBaseURL}/studio/redirect-handle?token=${token}&type=reset-pwd`,
			});

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/reset-pwd/:token
@method     POST
@desc       Resets the password of the user
@access     public
*/
router.post(
	"/reset-pwd/:token",
	checkContentType,
	applyRules("verify-token"),
	validate,
	applyRules("reset-password-finalize"),
	validate,
	async (req, res) => {
		try {
			let { token } = req.params;
			let { newPassword } = req.body;
			let info = await userCtrl.getResetPwdTokenInfo(token);

			if (!info) {
				return res.status(401).json({
					error: t("Unauthorized"),
					details: t(
						"The reset password token was not authorized or has expired"
					),
					code: ERROR_CODES.invalidToken,
				});
			}

			// Encrypt user password
			const salt = await bcrypt.genSalt(10);
			let encryptedPwd = await bcrypt.hash(newPassword.toString(), salt);

			// Update the password in the database
			let userObj = await userCtrl.updateOneByQuery(
				{
					"loginProfiles.provider": "agnost",
					"loginProfiles.email": info.email,
				},
				{
					"loginProfiles.$.password": encryptedPwd,
				},
				{},
				{ cacheKey: info.userId }
			);

			// Token has been used, delete it
			await userCtrl.deleteResetPwdTokenInfo(token);

			res.json();

			// Log action
			auditCtrl.log(
				userObj,
				"user",
				"update",
				t("Reset login profile password")
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/org-invite
@method     GET
@desc       Get pending organization invitations of user
@access     private
*/
router.get("/org-invite", authSession, async (req, res) => {
	try {
		const { user } = req;
		let emails = user.loginProfiles.map((entry) => entry.email);
		let invites = await orgInvitationCtrl.getManyByQuery(
			{
				email: { $in: emails },
				status: "Pending",
			},
			{ lookup: "orgId" }
		);

		res.json(invites);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/user/app-invite
@method     GET
@desc       Get pending app invitations of user
@access     private
*/
router.get("/app-invite", authSession, async (req, res) => {
	try {
		const { user } = req;
		let emails = user.loginProfiles.map((entry) => entry.email);
		let invites = await appInvitationCtrl.getManyByQuery(
			{
				email: { $in: emails },
				status: "Pending",
			},
			{ lookup: "appId" }
		);

		res.json(invites);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/user/project-invite
@method     GET
@desc       Get pending project invitations of user
@access     private
*/
router.get("/project-invite", authSession, async (req, res) => {
	try {
		const { user } = req;
		let emails = user.loginProfiles.map((entry) => entry.email);
		let invites = await prjInvitationCtrl.getManyByQuery(
			{
				email: { $in: emails },
				status: "Pending",
			},
			{ lookup: "projectId" }
		);

		res.json(invites);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/user/org-invite-accept?token
@method     POST
@desc       Accept organization invitation
@access     private
*/
router.post(
	"/org-invite-accept",
	checkContentType,
	applyRules("accept-org-invite"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await userCtrl.startSession();
		try {
			const { token } = req.query;

			let invite = await orgInvitationCtrl.getOneByQuery(
				{ token },
				{ lookup: "orgId" }
			);

			if (!invite || !invite.orgId) {
				await userCtrl.endSession(session);
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists for the organization."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				await userCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Invitations only in 'pending' status can be accepted. It seems you have already accepted/rejected this invitation."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the user is already a cluster user
			let user = await userCtrl.getOneByQuery({
				"loginProfiles.email": invite.email,
			});

			if (user) {
				// Check whether the user is already a member of the organization or not
				let member = await orgMemberCtrl.getOneByQuery(
					{
						orgId: invite.orgId._id,
						userId: user._id,
					},
					{ cacheKey: `${invite.orgId._id}.${user._id}` }
				);

				if (member) {
					await userCtrl.endSession(session);
					return res.status(422).json({
						error: t("Already Member"),
						details: t(
							"You are already a member of the organization '%s' team.",
							invite.orgId.name
						),
						code: ERROR_CODES.notAllowed,
					});
				}
			} else {
				// Create a new cluster user
				let userId = helper.generateId();
				user = await userCtrl.create(
					{
						_id: userId,
						iid: helper.generateSlug("usr"),
						color: helper.generateColor("dark"),
						contactEmail: invite.email,
						status: "Pending",
						canCreateOrg: invite.role === "Admin" ? true : false,
						isClusterOwner: false,
						loginProfiles: [
							{
								provider: "agnost",
								id: userId,
								email: invite.email,
								emailVerified: true,
							},
						],
						notifications: notificationTypes,
					},
					{ session }
				);
			}

			// Accept invitation
			await orgInvitationCtrl.updateOneById(
				invite._id,
				{ status: "Accepted" },
				{},
				{ session }
			);

			// Add user to the organization as a member
			await orgMemberCtrl.create(
				{
					orgId: invite.orgId._id,
					userId: user._id,
					role: invite.role,
				},
				{ session, cacheKey: `${invite.orgId._id}.${user._id}` }
			);

			// Commit transaction
			await userCtrl.commit(session);

			// Return the organization object the user is added as a mamber
			res.json({ org: invite.orgId, role: invite.role, user });

			// Log action
			auditCtrl.logAndNotify(
				invite.orgId._id,
				user,
				"org",
				"accept",
				t("Accepted the invitation to join to the organization"),
				{ ...invite.orgId, role: invite.role, user },
				{ orgId: invite.orgId._id }
			);
		} catch (error) {
			await userCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/app-invite-accept?token
@method     POST
@desc       Accept app invitation
@access     private
*/
router.post(
	"/app-invite-accept",
	checkContentType,
	applyRules("accept-app-invite"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await userCtrl.startSession();
		try {
			const { token } = req.query;

			let invite = await appInvitationCtrl.getOneByQuery(
				{ token },
				{ lookup: "appId" }
			);

			if (!invite || !invite.appId) {
				await userCtrl.endSession(session);
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists for the app."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				await userCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Invitations only in 'pending' status can be accepted. It seems you have already accepted/rejected this invitation."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the user is already a cluster user
			let user = await userCtrl.getOneByQuery({
				"loginProfiles.email": invite.email,
			});

			if (user) {
				// Check whether the user is already a member of the app team or not
				let appMember = invite.appId.team.find(
					(entry) => entry.userId.toString() === user._id.toString()
				);

				if (appMember) {
					await userCtrl.endSession(session);
					return res.status(422).json({
						error: t("Already Member"),
						details: t(
							"You are already a member of the app '%s' team.",
							invite.appId.name
						),
						code: ERROR_CODES.notAllowed,
					});
				}

				// Check whether the user is already a member of the organization or not
				let orgMember = await orgMemberCtrl.getOneByQuery(
					{
						orgId: invite.orgId,
						userId: user._id,
					},
					{ cacheKey: `${invite.orgId}.${user._id}` }
				);

				if (!orgMember) {
					// Add user to the organization as a member
					await orgMemberCtrl.create(
						{
							orgId: invite.orgId,
							userId: user._id,
							role: invite.orgRole,
						},
						{ session, cacheKey: `${invite.orgId}.${user._id}` }
					);
				}
			} else {
				// Create a new cluster user
				let userId = helper.generateId();
				user = await userCtrl.create(
					{
						_id: userId,
						iid: helper.generateSlug("usr"),
						color: helper.generateColor("dark"),
						contactEmail: invite.email,
						status: "Pending",
						canCreateOrg: invite.orgRole === "Admin" ? true : false,
						isClusterOwner: false,
						loginProfiles: [
							{
								provider: "agnost",
								id: userId,
								email: invite.email,
								emailVerified: true,
							},
						],
						notifications: notificationTypes,
					},
					{ session }
				);

				// Add user to the organization as a member
				await orgMemberCtrl.create(
					{
						orgId: invite.orgId,
						userId: user._id,
						role: invite.orgRole,
					},
					{ session, cacheKey: `${invite.orgId}.${user._id}` }
				);
			}

			// Add user to the app team
			const updatedApp = await appCtrl.pushObjectById(
				invite.appId._id,
				"team",
				{
					userId: user._id,
					role: invite.role,
				},
				{},
				{ session, cacheKey: `${invite.appId._id}` }
			);

			// Accept invitation
			await appInvitationCtrl.updateOneById(
				invite._id,
				{ status: "Accepted" },
				{},
				{ session }
			);

			let appWithTeam = await appCtrl.getOneById(invite.appId._id, {
				lookup: {
					path: "team.userId",
					select: "-loginProfiles -notifications",
				},
				session,
			});

			// Commit transaction
			await userCtrl.commit(session);

			// Return the app object the user is added as a mamber
			res.json({ app: appWithTeam, role: invite.role, user });

			// Log action
			auditCtrl.logAndNotify(
				invite.appId._id,
				user,
				"org.app",
				"accept",
				t("Accepted the invitation to join to the app"),
				appWithTeam,
				{ orgId: invite.orgId, appId: invite.appId._id }
			);

			// Get application versions
			const versions = await versionCtrl.getManyByQuery({
				appId: invite.appId._id,
			});
			for (const version of versions) {
				// Deploy version updates to environments if auto-deployment is enabled
				await deployCtrl.updateVersionInfo(
					updatedApp,
					version,
					user,
					"update-version"
				);
			}
		} catch (error) {
			await userCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/project-invite-accept?token
@method     POST
@desc       Accept project invitation
@access     private
*/
router.post(
	"/project-invite-accept",
	checkContentType,
	applyRules("accept-project-invite"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await userCtrl.startSession();
		try {
			const { token } = req.query;

			let invite = await prjInvitationCtrl.getOneByQuery(
				{ token },
				{ lookup: "projectId" }
			);

			if (!invite || !invite.projectId) {
				await userCtrl.endSession(session);
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists for the project."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				await userCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Invitations only in 'pending' status can be accepted. It seems you have already accepted/rejected this invitation."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the user is already a cluster user
			let user = await userCtrl.getOneByQuery({
				"loginProfiles.email": invite.email,
			});

			if (user) {
				// Check whether the user is already a member of the app team or not
				let projectMember = invite.projectId.team.find(
					(entry) => entry.userId.toString() === user._id.toString()
				);

				if (projectMember) {
					await userCtrl.endSession(session);
					return res.status(422).json({
						error: t("Already Member"),
						details: t(
							"You are already a member of the project '%s' team.",
							invite.projectId.name
						),
						code: ERROR_CODES.notAllowed,
					});
				}

				// Check whether the user is already a member of the organization or not
				let orgMember = await orgMemberCtrl.getOneByQuery(
					{
						orgId: invite.orgId,
						userId: user._id,
					},
					{ cacheKey: `${invite.orgId}.${user._id}` }
				);

				if (!orgMember) {
					// Add user to the organization as a member
					await orgMemberCtrl.create(
						{
							orgId: invite.orgId,
							userId: user._id,
							role: invite.orgRole,
						},
						{ session, cacheKey: `${invite.orgId}.${user._id}` }
					);
				}
			} else {
				// Create a new cluster user
				let userId = helper.generateId();
				user = await userCtrl.create(
					{
						_id: userId,
						iid: helper.generateSlug("usr"),
						color: helper.generateColor("dark"),
						contactEmail: invite.email,
						status: "Pending",
						canCreateOrg: invite.orgRole === "Admin" ? true : false,
						isClusterOwner: false,
						loginProfiles: [
							{
								provider: "agnost",
								id: userId,
								email: invite.email,
								emailVerified: true,
							},
						],
						notifications: notificationTypes,
					},
					{ session }
				);

				// Add user to the organization as a member
				await orgMemberCtrl.create(
					{
						orgId: invite.orgId,
						userId: user._id,
						role: invite.orgRole,
					},
					{ session, cacheKey: `${invite.orgId}.${user._id}` }
				);
			}

			// Add user to the project team
			const updatedProject = await prjCtrl.pushObjectById(
				invite.projectId._id,
				"team",
				{
					userId: user._id,
					role: invite.role,
				},
				{},
				{ session, cacheKey: `${invite.projectId._id}` }
			);

			// Accept invitation
			await prjInvitationCtrl.updateOneById(
				invite._id,
				{ status: "Accepted" },
				{},
				{ session }
			);

			let projectWithTeam = await prjCtrl.getOneById(invite.projectId._id, {
				lookup: {
					path: "team.userId",
					select: "-loginProfiles -notifications",
				},
				session,
			});

			// Commit transaction
			await userCtrl.commit(session);

			// Return the project object the user is added as a mamber
			res.json({ project: projectWithTeam, role: invite.role, user });

			// Log action
			auditCtrl.logAndNotify(
				invite.projectId._id,
				user,
				"org.project",
				"accept",
				t("Accepted the invitation to join to the project"),
				projectWithTeam,
				{ orgId: invite.orgId, projectId: invite.projectId._id }
			);
		} catch (error) {
			await userCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/org-invite-reject?token
@method     POST
@desc       Reject organization invitation
@access     private
*/
router.post(
	"/org-invite-reject",
	checkContentType,
	applyRules("reject-org-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;

			// Make sure that the invitation token is associated with the email of the user
			let invite = await orgInvitationCtrl.getOneByQuery(
				{ token },
				{ lookup: "orgId" }
			);

			if (!invite || !invite.orgId) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists for the organization."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Invitations only in 'pending' status can be rejected."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Reject invitation
			await orgInvitationCtrl.updateOneById(invite._id, { status: "Rejected" });

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/app-invite-reject?token
@method     POST
@desc       Reject app invitation
@access     private
*/
router.post(
	"/app-invite-reject",
	checkContentType,
	applyRules("reject-app-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;

			// Make sure that the invitation token is associated with the email of the user
			let invite = await appInvitationCtrl.getOneByQuery({ token });

			if (!invite || !invite.appId) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists for the app."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Invitations only in 'pending' status can be rejected."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Reject invitation
			await appInvitationCtrl.updateOneById(invite._id, { status: "Rejected" });

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/project-invite-reject?token
@method     POST
@desc       Reject project invitation
@access     private
*/
router.post(
	"/project-invite-reject",
	checkContentType,
	applyRules("reject-project-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;

			// Make sure that the invitation token is associated with the email of the user
			let invite = await prjInvitationCtrl.getOneByQuery({ token });

			if (!invite || !invite.projectId) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists for the project."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Invitations only in 'pending' status can be rejected."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Reject invitation
			await prjInvitationCtrl.updateOneById(invite._id, { status: "Rejected" });

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/user/transfer/:userId
@method     POST
@desc       Transfers the ownership of cluster to another cluster member
@access     private
*/
router.post(
	"/transfer/:userId",
	checkContentType,
	authSession,
	applyRules("transfer"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await userCtrl.startSession();
		try {
			if (!req.user.isClusterOwner) {
				return res.status(400).json({
					error: t("Not Allowed"),
					details: t(
						"Only a cluster owner can transfer the ownership to another 'Active' cluster user."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Get transferred user information
			let transferredUser = await userCtrl.getOneById(req.params.userId);

			// If the current owner and the trasferred users are the same then do nothing
			if (transferredUser._id.toString() === req.user._id.toString()) {
				await userCtrl.endSession(session);
				return res.json();
			}

			// Take ownership of cluster from existing user
			let originalUser = await userCtrl.updateOneById(
				req.user._id,
				{ isClusterOwner: false },
				{},
				{ session, cacheKey: req.user._id }
			);

			// Transfer cluster ownership to the new user
			transferredUser = await userCtrl.updateOneById(
				transferredUser._id,
				{ isClusterOwner: true },
				{},
				{ session, cacheKey: transferredUser._id }
			);

			// Update all existing organization memberships of the transferred user to Admin
			let orgMemberships = await orgMemberCtrl.getManyByQuery(
				{ userId: transferredUser._id },
				{ session }
			);

			for (let i = 0; i < orgMemberships.length; i++) {
				const orgMembership = orgMemberships[i];
				await orgMemberCtrl.updateOneById(
					orgMembership._id,
					{ role: "Admin" },
					{},
					{ session, cacheKey: `${orgMembership.orgId}.${transferredUser._id}` }
				);
			}

			// Update all existing app memberships of the transferred user to Admin
			let apps = await appCtrl.getManyByQuery(
				{ "team.userId": transferredUser._id },
				{ session }
			);

			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				await appCtrl.updateOneByQuery(
					{ _id: app._id, "team.userId": transferredUser._id },
					{ "team.$.role": "Admin" },
					{},
					{ session, cacheKey: `${app._id}` }
				);
			}

			// Commit transaction
			await userCtrl.commit(session);
			res.json();

			// Send realtime notifications
			for (let i = 0; i < orgMemberships.length; i++) {
				const orgMembership = orgMemberships[i];
				// Get organization information
				const orgInfo = await orgCtrl.getOneById(orgMembership.orgId, {
					cacheKey: orgMembership.orgId,
				});

				sendNotification(orgMembership.orgId, {
					actor: {
						userId: req.user._id,
						name: req.user.name,
						pictureUrl: req.user.pictureUrl,
						color: req.user.color,
						contactEmail: req.user.contactEmail,
						loginEmail: req.user.loginProfiles[0].email,
					},
					action: "update",
					object: "org.member",
					description: t(
						"Updated organization member role of user '%s' (%s) to 'Admin'",
						transferredUser.name,
						transferredUser.contactEmail
					),
					timestamp: Date.now(),
					data: {
						...orgMembership,
						member: {
							_id: transferredUser._id,
							iid: transferredUser.iid,
							color: transferredUser.color,
							contactEmail: transferredUser.contactEmail,
							name: transferredUser.name,
							pictureUrl: transferredUser.pictureUrl,
							loginEmail: transferredUser.loginProfiles[0].email,
							isOrgOwner:
								orgInfo.ownerUserId.toString() ===
								transferredUser._id.toString(),
						},
					},
					identifiers: { orgId: orgMembership.orgId },
				});
			}

			// Send realtime notifications
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				const appInfo = await appCtrl.getOneById(app._id, {
					cacheKey: app._id,
				});

				sendNotification(appInfo._id, {
					actor: {
						userId: req.user._id,
						name: req.user.name,
						pictureUrl: req.user.pictureUrl,
						color: req.user.color,
						contactEmail: req.user.contactEmail,
						loginEmail: req.user.loginProfiles[0].email,
					},
					action: "update",
					object: "org.app.team",
					description: t(
						"Updated application member role of user '%s' (%s) to 'Admin'",
						transferredUser.name,
						transferredUser.contactEmail
					),
					timestamp: Date.now(),
					data: appInfo,
					identifiers: { orgId: app.orgId, appId: app._id },
				});
			}
			// Log action
			auditCtrl.logAndNotify(
				originalUser._id,
				originalUser,
				"user",
				"update",
				t(
					"Transferred cluster ownership to user '%s' (%s)",
					transferredUser.name,
					transferredUser.contactEmail
				),
				originalUser
			);

			// Log action
			auditCtrl.logAndNotify(
				transferredUser._id,
				transferredUser,
				"user",
				"update",
				t("Became the new cluster owner"),
				transferredUser
			);
		} catch (error) {
			await userCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

export default router;
