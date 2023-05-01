import express from "express";
import bcrypt from "bcrypt";
import authCtrl from "../controllers/auth.js";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import { applyRules } from "../schemas/user.js";
import { handleError } from "../schemas/platformError.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validate } from "../middlewares/validate.js";
import { authClusterToken } from "../middlewares/authClusterToken.js";
import { authSession } from "../middlewares/authSession.js";
import { authRefreshToken } from "../middlewares/authRefreshToken.js";
import { checkClusterSetupStatus } from "../middlewares/checkClusterSetupStatus.js";
import { sendMessage } from "../init/queue.js";
import ERROR_CODES from "../config/errorCodes.js";
import { notificationTypes } from "../config/constants.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/auth/initialize
@method     POST
@desc       Initializes the cluster set-up. Signs up the cluster owner using email/password verification. Sends a verification code to the email address.
			By default also creates a top level new account for the user and assigns the contact email to the login profile email
@access     public
*/
router.post(
	"/initialize",
	checkContentType,
	authClusterToken,
	checkClusterSetupStatus,
	applyRules("initiate-cluster-setup"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await userCtrl.startSession();
		try {
			let userId = helper.generateId();
			let { email, password, name } = req.body;

			// Encrypt user password
			const salt = await bcrypt.genSalt(10);
			password = await bcrypt.hash(password, salt);

			// Save user to the database
			const userObj = await userCtrl.create(
				{
					_id: userId,
					iid: helper.generateSlug("usr"),
					name: name,
					color: helper.generateColor("dark"),
					contactEmail: email,
					status: "Pending",
					canCreateOrg: true,
					isClusterOwner: true,
					loginProfiles: [
						{
							provider: "agnost",
							id: userId,
							password,
							email,
							emailVerified: false,
						},
					],
					notifications: notificationTypes,
				},
				{ session }
			);

			// Create the 6-digit email validation code
			let code = await authCtrl.createValidationCode(email);
			sendMessage("send-validation-code", {
				to: email,
				code1: code.substring(0, 3),
				code2: code.substring(3, 6),
			});
			// Commit transaction
			await userCtrl.commit(session);

			// Remove password field value from returned object
			delete userObj.loginProfiles[0].password;
			res.json(userObj);

			// Log action
			auditCtrl.log(
				userObj,
				"user",
				"initiate-cluster-setup",
				t("Initiated cluster setup")
			);
		} catch (error) {
			await userCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/auth/resend-code
@method     POST
@desc       Resends the email validation code
@access     public
*/
router.post(
	"/resend-code",
	checkContentType,
	applyRules("resend-code"),
	validate,
	async (req, res) => {
		try {
			const { email } = req.body;
			// Create the 6-digit email validation code
			let code = await authCtrl.createValidationCode(email);
			sendMessage("send-validation-code", {
				to: email,
				code1: code.substring(0, 3),
				code2: code.substring(3, 6),
			});
			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/auth/validate-email
@method     POST
@desc       Validates the users email address using the validation code sent in email during sign-up
@access     public
*/
router.post(
	"/validate-email",
	checkContentType,
	applyRules("validate-email"),
	validate,
	async (req, res) => {
		try {
			const { email, code } = req.body;
			let storedCode = await authCtrl.getValidationCode(email);

			//Codes match validate user email and create session
			if (code?.toString() === storedCode?.toString()) {
				let user = await userCtrl.updateOneByQuery(
					{
						"loginProfiles.provider": "agnost",
						"loginProfiles.email": email,
					},
					{
						status: "Active",
						lastLoginAt: Date.now(),
						lastLoginProvider: "agnost",
						"loginProfiles.$.emailVerified": true,
					},
					{}
				);

				// Delete email validation code
				authCtrl.deleteValidationCode(email);

				// Create new session
				let tokens = await authCtrl.createSession(
					user._id,
					helper.getIP(req),
					req.headers["user-agent"],
					"agnost"
				);

				// Remove password field value from returned object
				delete user.loginProfiles[0].password;
				res.json({ ...user, ...tokens });

				// Log action
				auditCtrl.log(
					user,
					"user",
					"validate-email",
					t("Validated account email")
				);
			} else {
				return res.status(401).json({
					error: t("Invalid Credentials"),
					details: t("The validation code provided is invalid or has expired."),
					code: ERROR_CODES.invalidValidationCode,
				});
			}
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/auth/login
@method     POST
@desc       Login with email and password
@access     public
*/
router.post(
	"/login",
	checkContentType,
	applyRules("login"),
	validate,
	async (req, res) => {
		try {
			const { email, password } = req.body;

			// Get user record
			let user = await userCtrl.getOneByQuery(
				{
					"loginProfiles.provider": "agnost",
					"loginProfiles.email": email,
				},
				{ projection: "+loginProfiles.password" }
			);

			if (!user) {
				return res.status(401).json({
					error: t("Invalid Credentials"),
					code: ERROR_CODES.invalidCredentials,
					details: t(
						"Invalid credentials. Email or password provided is invalid."
					),
				});
			}

			// Get email based login profile
			let profile = user.loginProfiles.find(
				(entry) => entry.provider === "agnost"
			);

			// Check account status and email verification
			if (!profile || !profile.emailVerified || user.status === "Pending") {
				return res.status(403).json({
					error: t("Pending account"),
					code: ERROR_CODES.pendingAccount,
					details: t("Your email address has not been confirmed yet."),
				});
			}

			// It seems this is a valid user, we can check the password match
			const isMatch = await bcrypt.compare(
				password.toString(),
				profile.password
			);

			if (!isMatch) {
				return res.status(401).json({
					error: t("Invalid Credentials"),
					code: ERROR_CODES.invalidCredentials,
					details: t(
						"Invalid credentials. Email or password provided is invalid."
					),
				});
			}

			// Update user's last login information
			user = await userCtrl.updateOneById(user._id, {
				lastLoginAt: Date.now(),
				lastLoginProvider: "agnost",
			});

			// Success, create the session token and return user information and do not return the password field value
			// Remove password field value from returned object
			delete user.loginProfiles[0].password;
			let tokens = await authCtrl.createSession(
				user._id,
				helper.getIP(req),
				req.headers["user-agent"],
				"agnost"
			);

			res.json({ ...user, ...tokens });

			// Log action
			auditCtrl.log(
				user,
				"user",
				"login",
				t("Logged in using email & password credentials")
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/auth/logout
@method     POST
@desc       Logout from current session
@access     private
*/
router.post("/logout", authSession, async (req, res) => {
	try {
		// Delete the session token and also the associated refresh token
		await authCtrl.deleteSession(req.session);
		res.json();
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/auth/renew
@method     POST
@desc       Renews access and refresh tokens. Uses the refresh token to create the new access and refresh tokens
@access     private
*/
router.post("/renew", authRefreshToken, async (req, res) => {
	try {
		// First delete existing access and refresh tokens
		await authCtrl.deleteSession(req.tokens);

		// Create new session
		let tokens = await authCtrl.createSession(
			req.tokens.userId,
			helper.getIP(req),
			req.headers["user-agent"]
		);

		res.json(tokens);
	} catch (error) {
		handleError(req, res, error);
	}
});

export default router;
