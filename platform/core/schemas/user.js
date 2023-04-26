import mongoose from "mongoose";
import { body, param, query } from "express-validator";

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
				default: true,
			},
			loginProfiles: [
				{
					provider: {
						// Type of the login profile such as agnost, github, bitbucket, gitlab etc. The provider name should be all lowercase letters.
						type: String,
						required: true,
						index: true,
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
						select: false,
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
			status: {
				type: String,
				required: true,
				default: "Pending",
				enum: ["Pending", "Active", "Suspended"],
			},
			suspensionReason: {
				type: String,
			},
			suspensionDtm: {
				type: Date,
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
		case "signup":
		case "add-profile":
			return [
				body("provider")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(["agnost", "github", "bitbucket", "gitlab"])
					.withMessage(t("Unsupported sign-up provider"))
					.bail()
					.if(() => type === "add-profile")
					.isIn(["github", "bitbucket", "gitlab"])
					.withMessage(
						t("Only oAuth providers can be added as a login profile")
					),
				body("id")
					.if(body("provider").isIn(["github", "bitbucket", "gitlab"]))
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						// Check whether email is unique or not
						let user = await UserModel.findOne({
							"loginProfiles.provider": {
								$in: ["github", "bitbucket", "gitlab"],
							},
							"loginProfiles.id": value,
						}).lean();

						if (user) {
							throw new AgnostError(
								type === "sign-up"
									? t("User has already signed up with the selected provider")
									: t(
											"The login provider '%s' has already been added to a user account",
											req.body.provider
									  )
							);
						}
						return true;
					}),
				body("email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false })
					.if(body("provider").isIn(["agnost"]))
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
					.if(body("provider").isIn(["agnost"]))
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
					.optional()
					.trim()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					),
				body("pictureUrl")
					.optional()
					.trim()
					.isURL()
					.withMessage(t("Profile picture is not a valid URL")),
				body("accountRole")
					.optional()
					.trim()
					.isIn(["Admin", "App Admin", "Billing Admin", "Read-only", "Member"])
					.withMessage(t("Unsupported account role")),
			];
		case "delete-profile":
			return [
				param("provider")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(["agnost", "github", "bitbucket", "gitlab"])
					.withMessage(t("Unsupported login profile")),
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
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
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
		case "change-contact-email":
		case "reset-password-init":
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
		default:
			return [];
	}
};
