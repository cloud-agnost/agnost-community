import mongoose from "mongoose";
import { body, param, query } from "express-validator";
import {
	providerTypes,
	notificationTypes,
	userStatus,
	appRoles,
} from "../config/constants.js";
import userCtrl from "../controllers/user.js";

/**
 * Models the user information. Users will be associated with organizations and apps. App users will be part of the organization
 * where the app is created.
 * A user can have many login accounts connected to his profile, these are modelled loginProfiles in user schama
 */
export const UserModel = mongoose.model(
	"user",
	new mongoose.Schema(
		{
			iid: {
				// Internal identifier
				type: String,
				required: true,
				index: true,
				immutable: true,
			},
			name: {
				type: String,
				index: true,
			},
			pictureUrl: {
				type: String,
			},
			color: {
				// If no picture provided then this will be the avatar background color of the user
				type: String,
			},
			contactEmail: {
				// Independent of the provider we store the email address of the user
				type: String,
				index: true,
			},
			lastLoginAt: {
				type: Date,
				index: true,
			},
			lastLoginProvider: {
				type: String,
				index: true,
			},
			"2fa": {
				type: Boolean,
				default: false,
			},
			canCreateOrg: {
				type: Boolean,
				default: false,
			},
			isClusterOwner: {
				type: Boolean,
				default: false,
			},
			loginProfiles: [
				{
					provider: {
						// Type of the login profile such as agnost, github, bitbucket, gitlab etc. The provider name should be all lowercase letters.
						type: String,
						required: true,
						index: true,
						enum: providerTypes,
					},
					id: {
						// The unique identifier of the user associated with this login profile.
						// In case of agnost this field will hold the email address of the user
						// In case of other providers such as github, this field will hold the github identifer of the user
						type: String,
						required: true,
						index: true,
					},
					password: {
						// This field will only be populated if a user has an email login connection
						type: String,
					},
					email: {
						// Independent of the provider we store the email address of the user
						type: String,
						required: true,
						index: true,
					},
					emailVerified: {
						type: Boolean,
						required: true,
						default: false,
					},
				},
			],
			notifications: {
				type: [String],
				enum: notificationTypes,
			},
			status: {
				type: String,
				required: true,
				default: "Pending",
				enum: userStatus,
			},
			__v: {
				type: Number,
				select: false,
			},
		},
		{ timestamps: true }
	)
);

export const applyRules = (type) => {
	switch (type) {
		case "search":
			return [
				query("page")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
					})
					.withMessage(
						t("Page number needs to be a positive integer or 0 (zero)")
					)
					.toInt(),
				query("size")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: config.get("general.minPageSize"),
						max: config.get("general.maxPageSize"),
					})
					.withMessage(
						t(
							"Page size needs to be an integer, between %s and %s",
							config.get("general.minPageSize"),
							config.get("general.maxPageSize")
						)
					)
					.toInt(),
			];
		case "initiate-cluster-setup":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false })
					.custom(async (value) => {
						// Check whether email is unique or not
						let user = await UserModel.findOne({
							"loginProfiles.provider": "agnost",
							"loginProfiles.email": value,
						}).lean();

						if (user) {
							throw new AgnostError(
								t("User account with the provided email already exists")
							);
						}
						return true;
					}),
				body("password")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ min: config.get("general.minPwdLength") })
					.withMessage(
						t(
							"Password must be at least %s characters",
							config.get("general.minPwdLength")
						)
					),
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					),
			];
		case "finalize-cluster-setup":
			return [
				body("orgName")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					),
				body("appName")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					),
				body("uiBaseURL")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("smtp")
					.optional()
					.custom(async (value) => {
						if (!helper.isObject(value)) {
							throw new AgnostError(
								t("SMTP server configuration needs to be provides as an object")
							);
						}

						return true;
					}),
				body("smtp.host")
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("smtp.port")
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
						max: 65535,
					})
					.withMessage(t("Port number needs to be an integer between 0-65535"))
					.toInt(),
				body("smtp.useTLS")
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("smtp.user")
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("smtp.password")
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("appMembers")
					.optional()
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.isArray()
					.withMessage(t("App members list need to be an array of objects")),
				body("appMembers.*")
					.optional()
					.custom(async (value) => {
						if (!helper.isObject(value)) {
							throw new AgnostError(
								t("App member invitaion needs to be provides as an object")
							);
						}

						return true;
					}),
				body("appMembers.*.email")
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("appMembers.*.role")
					.if(
						(value, { req }) => req.body.smtp && helper.isObject(req.body.smtp)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported app member role")),
			];
		case "finalize-account-setup":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("password")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ min: config.get("general.minPwdLength") })
					.withMessage(
						t(
							"Password must be at least %s characters",
							config.get("general.minPwdLength")
						)
					),
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					),
			];
		case "resend-code":
		case "validate-email":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false })
					.custom(async (value) => {
						// Check whether email is unique or not
						let user = await UserModel.findOne({
							"loginProfiles.provider": "agnost",
							"loginProfiles.email": value,
						}).lean();

						if (!user) {
							throw new AgnostError(
								t("No such user account with provided email exists")
							);
						}

						let loginConnection = user.loginProfiles.find(
							(entry) => entry.provider === "agnost"
						);

						if (loginConnection.emailVerified)
							throw new AgnostError(t("This email has already been verified"));

						return true;
					}),
			];
		case "login":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("password")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "update-name":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					),
			];
		case "update-password":
			return [
				body("password")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("newPassword")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ min: config.get("general.minPwdLength") })
					.withMessage(
						t(
							"New password must be at least %s characters",
							config.get("general.minPwdLength")
						)
					),
			];
		case "update-notifications":
			return [
				body("notifications.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required value, cannot be left empty"))
					.bail()
					.isIn(notificationTypes)
					.withMessage(t("Unsupported notification type")),
			];
		case "reset-password-finalize":
			return [
				body("newPassword")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ min: config.get("general.minPwdLength") })
					.withMessage(
						t(
							"New password must be at least %s characters",
							config.get("general.minPwdLength")
						)
					),
			];
		case "init-account-setup":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
			];
		case "reset-password-init":
		case "change-contact-email":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("uiBaseURL")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];

		case "verify-token":
			return [
				param("token")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "change-login-email":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("password")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("uiBaseURL")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "upload-picture":
			return [
				query("width")
					.trim()
					.optional({ nullable: true })
					.isInt({ min: 1 })
					.withMessage(t("Width needs to be a positive integer"))
					.toInt(),
				query("height")
					.trim()
					.optional({ nullable: true })
					.isInt({ min: 1 })
					.withMessage(t("Height needs to be a positive integer"))
					.toInt(),
			];
		case "accept-org-invite":
		case "accept-app-invite":
		case "reject-org-invite":
		case "reject-app-invite":
			return [
				query("token")
					.trim()
					.notEmpty()
					.withMessage(t("Required parameter, cannot be left empty")),
			];
		case "transfer":
			return [
				param("userId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						let userObj = await userCtrl.getOneByQuery(
							{
								_id: value,
							},
							{ cacheKey: `${value}` }
						);

						if (!userObj) {
							throw new AgnostError(
								t(
									"The user identified with id '%s' is not a member the Agnost Cluster. Cluster ownership can only be transferred to an existing cluster member in 'Active' status.",
									value
								)
							);
						}

						if (userObj.status !== "Active") {
							throw new AgnostError(
								t(
									"Cluster ownership can only be transferred to an existing cluster member in 'Active' status."
								)
							);
						}

						return true;
					}),
			];
		case "complete-setup":
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("password")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ min: config.get("general.minPwdLength") })
					.withMessage(
						t(
							"Password must be at least %s characters",
							config.get("general.minPwdLength")
						)
					),
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					),
				body("token")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("inviteType")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(["org", "app"])
					.withMessage(t("Unsupported invitation type")),
			];
		default:
			return [];
	}
};
