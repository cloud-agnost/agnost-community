import express from "express";
import bcrypt from "bcrypt";
import sharp from "sharp";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import orgInvitationCtrl from "../controllers/orgInvitation.js";
import appInvitationCtrl from "../controllers/appInvitation.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import appCtrl from "../controllers/app.js";
import { applyRules } from "../schemas/user.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validate } from "../middlewares/validate.js";
import { handleFile } from "../middlewares/handleFile.js";
import { sendMessage } from "../init/queue.js";
import { storage } from "../init/storage.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

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
@route      /v1/user/list
@method     GET
@desc       Gets (searches) all users in a cluster
@access     private
*/
router.get(
	"/list",
	checkContentType,
	authSession,
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { user } = req;
			const { page, size, search, sortBy, sortDir, start, end } = req.query;

			let query = { _id: { $ne: user._id }, status: "Active" };
			if (search && search !== "null") {
				query.$or = [
					{ name: { $regex: search, $options: "i" } },
					{ contactEmail: { $regex: search, $options: "i" } },
					{ "loginProfiles.email": { $regex: search, $options: "i" } },
				];
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

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
			auditCtrl.log(
				userObj,
				"user",
				"update",
				t("Updated name to '%s'", req.body.name)
			);
			auditCtrl.updateActorName(userObj._id, req.body.name);
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
	handleFile.single("picture"),
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

			// Resize image if width and height specifiec
			buffer = await sharp(req.file.buffer).resize(width, height).toBuffer();

			// A bucket is a container for objects (files)
			const bucket = storage.bucket(config.get("storage.profileImagesBucket"));
			// Create a new blob in the bucket and upload the file data
			let blob = bucket.file(
				`${helper.generateSlug("img", 6)}-${req.file.originalname}`
			);

			// Delete old porfile picture if exists
			if (req.user.pictureUrl) {
				try {
					// Get the file name
					let filename = req.user.pictureUrl.substring(
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
							"An error occured while uploading the profile image. %s",
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
						let userObj = await userCtrl.updateOneById(
							req.user._id,
							{
								pictureUrl,
							},
							{},
							{ cacheKey: req.user._id }
						);

						// Remove password field value from returned object
						delete userObj.loginProfiles[0].password;
						res.json(userObj);

						// Log action
						auditCtrl.log(
							userObj,
							"user",
							"update",
							t("Updated profile picture")
						);
						auditCtrl.updateActorPicture(userObj._id, pictureUrl);
					});
				});

			blobStream.end(buffer);
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
		// A bucket is a container for objects (files)
		const bucket = storage.bucket(config.get("storage.profileImagesBucket"));
		// Delete the porfile picture if exists from storages
		if (req.user.pictureUrl) {
			try {
				// Get the file name
				let filename = req.user.pictureUrl.substring(
					req.user.pictureUrl.lastIndexOf("/") + 1
				);
				let oldFile = bucket.file(filename);
				let exists = await oldFile.exists();
				if (exists[0]) await oldFile.delete();
			} catch (err) {}
		}

		// Update user with the new profile image url
		let userObj = await userCtrl.updateOneById(
			req.user._id,
			{},
			{ pictureUrl: 1 },
			{ cacheKey: req.user._id }
		);

		res.json(userObj);

		// Log action
		auditCtrl.log(userObj, "user", "update", t("Removed profile picture"));
		auditCtrl.removeActorPicture(userObj._id);
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
			auditCtrl.log(
				userObj,
				"user",
				"update",
				t("Updated notification settings")
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

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
			let { email } = req.body;

			// Craate the contact email validation token
			let token = await userCtrl.createChangeEmailToken(
				req.user._id,
				email,
				helper.constants["1day"]
			);

			// Send the contact email verification link to the new email address
			sendMessage("send-contact-email-token", {
				to: email,
				url: `${process.env.UI_BASE_URL}/v1/user/contact-email/${token}`,
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
			auditCtrl.log(
				userObj,
				"user",
				"update",
				t("Updated contact email to '%s'", info.email)
			);
			auditCtrl.updateActorEmail(userObj._id, info.email);
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
			let { email, password } = req.body;

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
				url: `${process.env.UI_BASE_URL}/v1/user/login-email/${token}`,
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

			// All set we can update the email of the user login profile
			let userObj = await userCtrl.updateOneByQuery(
				{
					"loginProfiles.provider": "agnost",
					"loginProfiles.email": profile.email,
				},
				{
					"loginProfiles.$.email": info.email,
				},
				{},
				{ cacheKey: info.userId }
			);
			// Token has been used, delete it
			await userCtrl.deleteChangeEmailTokenInfo(token);

			res.json();

			// Log action
			auditCtrl.log(
				userObj,
				"user",
				"update",
				t("Updated login email to '%s'", info.email)
			);
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
			let { email } = req.body;

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
				url: `${process.env.UI_BASE_URL}/v1/user/reset-pwd/${token}`,
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
router.get("/org-invite", checkContentType, authSession, async (req, res) => {
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

		res.json(
			invites.map((entry) => {
				return { ...entry, orgName: entry.orgId?.name, orgId: undefined };
			})
		);
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
router.get("/app-invite", checkContentType, authSession, async (req, res) => {
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

		res.json(
			invites.map((entry) => {
				return {
					...entry,
					appName: entry.appId?.name,
					appId: entry.appId?._id,
				};
			})
		);
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
	authSession,
	applyRules("accept-org-invite"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await userCtrl.startSession();
		try {
			const { token } = req.query;
			const { user } = req;

			// Make sure that the invitation token is associated with the email of the user
			let emails = user.loginProfiles.map((entry) => entry.email);
			let invite = await orgInvitationCtrl.getOneByQuery(
				{ token, email: { $in: emails } },
				{ lookup: "orgId" }
			);

			if (!invite || !invite.orgId) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Invitations only in 'pending' status can be accepted."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check whether the user is already a member of the organization or not
			let member = await orgMemberCtrl.getOneByQuery(
				{
					orgId: invite.orgId._id,
					userId: user._id,
				},
				{ cacheKey: `${invite.orgId._id}.${user._id}` }
			);

			if (member) {
				return res.status(422).json({
					error: t("Already Member"),
					details: t(
						"You are already a member of the organization '%s'.",
						invite.orgId.name
					),
					code: ERROR_CODES.notAllowed,
				});
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
			res.json({ ...invite.orgId, role: invite.role });

			// Log action
			auditCtrl.logAndNotify(
				invite.orgId._id,
				user,
				"org",
				"accept",
				t("Accepted the invitation to join to the organization"),
				{ ...invite.orgId, role: invite.role },
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
	authSession,
	applyRules("accept-app-invite"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await userCtrl.startSession();
		try {
			const { token } = req.query;
			const { user } = req;

			// Make sure that the invitation token is associated with the email of the user
			let emails = user.loginProfiles.map((entry) => entry.email);
			let invite = await appInvitationCtrl.getOneByQuery(
				{ token, email: { $in: emails } },
				{ lookup: "appId" }
			);

			if (!invite || !invite.appId) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such app invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Invitations only in 'pending' status can be accepted."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check whether the user is already a member of the app team or not
			let appMember = invite.appId.team.find(
				(entry) => entry.userId.toString() === user._id.toString()
			);

			if (appMember) {
				return res.status(422).json({
					error: t("Already Member"),
					details: t(
						"You are already a member of the app '%s'.",
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

			// Add user to the app team
			let updatedApp = await appCtrl.pushObjectById(
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

			// Commit transaction
			await userCtrl.commit(session);

			// Return the app object the user is added as a mamber
			res.json(updatedApp);

			// Log action
			auditCtrl.logAndNotify(
				invite.appId._id,
				user,
				"app",
				"accept",
				t("Accepted the invitation to join to the app"),
				updatedApp,
				{ orgId: invite.orgId, appId: invite.appId._id }
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
	authSession,
	applyRules("reject-org-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;
			const { user } = req;

			// Make sure that the invitation token is associated with the email of the user
			let emails = user.loginProfiles.map((entry) => entry.email);
			let invite = await orgInvitationCtrl.getOneByQuery(
				{ token, email: { $in: emails } },
				{ lookup: "orgId" }
			);

			if (!invite || !invite.orgId) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists."),
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

			// Log action
			auditCtrl.logAndNotify(
				invite.orgId._id,
				user,
				"org",
				"reject",
				t("Rejected the invitation to join to the organization"),
				{ ...invite.orgId, role: invite.role },
				{ orgId: invite.orgId._id }
			);
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
	authSession,
	applyRules("reject-app-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;
			const { user } = req;

			// Make sure that the invitation token is associated with the email of the user
			let emails = user.loginProfiles.map((entry) => entry.email);
			let invite = await appInvitationCtrl.getOneByQuery(
				{ token, email: { $in: emails } },
				{ lookup: "appId" }
			);

			if (!invite || !invite.appId) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such app invitation exists."),
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

			// Log action
			auditCtrl.logAndNotify(
				invite.appId._id,
				user,
				"app",
				"reject",
				t("Rejected the invitation to join to the app"),
				{ ...invite.appId },
				{ orgId: invite.orgId, appId: invite.appId._id }
			);
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
			// Get transferred user information
			let transferredUser = await userCtrl.getOneById(req.params.userId);

			// If the current owner and the trasferred users are the same then do nothing
			if (transferredUser._id.toString() === req.user._id.toString()) {
				await userCtrl.endSession(session);
				return res.json();
			}

			// Take ownership of cluster from existing user
			await userCtrl.updateOneById(
				req.user._id,
				{ isClusterOwner: false },
				{},
				{ session, cacheKey: req.user._id }
			);

			// Transfer cluster ownership to the new user
			await userCtrl.updateOneById(
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
		} catch (error) {
			await userCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

export default router;
