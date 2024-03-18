import express from "express";
import responseTime from "response-time";
import bcrypt from "bcrypt";
import { agnost } from "@agnost/server";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import { checkAPIKey } from "../middlewares/checkAPIKey.js";
import { checkSession } from "../middlewares/checkSession.js";
import { checkAuthUserModel } from "../middlewares/checkAuthUserModel.js";
import {
	identifyToken,
	identifyToken2,
	identifyCode,
} from "../middlewares/identifyToken.js";
import {
	isValidRedirectURL,
	createEmailToken,
	sendTemplatedEmail,
	createSession,
	getUserAgentString,
	processRedirect,
	clearToken,
	createAccessToken,
	sendRealtimeUserEvent,
	verifySessionToken,
	getSessionKey,
	createPhoneToken,
	sendTemplatedSMS,
} from "../util/authHelper.js";
import { applyRules, validate } from "../util/authRules.js";
import { deleteKey, setKey, getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /auth/signup-email
@method     POST
@desc       Creates a new user of the app using email-password authentication method
@access     public
*/
router.post(
	"/signup-email",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("signup-email"),
	validate,
	async (req, res) => {
		const { userDb, userModel } = req;
		const version = META.getVersion();
		const { authentication } = version;
		let createdUser = null;
		try {
			if (!authentication.email.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Email authentication is not enabled in your app version settings."
							)
						)
					);
			}

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ email: req.body.email }, { useReadReplica: true });

			// Check if there is already a user with the given email
			if (existingUser) {
				return res.status(400).json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.emailNotUnique,
						t("A user with the provided email already exists."),
						{
							value: req.body.email,
							param: "email",
						}
					)
				);
			}

			// Create new user in database
			const date = new Date();
			let userData = {
				provider: "agnost",
				email: req.body.email,
				password: req.body.password,
				signUpAt: date,
				emailVerified: false,
			};

			if (
				req.body.userData &&
				typeof req.body.userData === "object" &&
				!Array.isArray(req.body.userData)
			) {
				userData = {
					...req.body.userData,
					...userData,
				};
				// Delete phone related data in email-sign up
				delete userData.phoneVerified;
				// Bypass email validation if specified
				if (req.body.userData.emailVerified === true)
					userData.emailVerified = true;
			}

			// If no email verification is needed then set the last login date
			if (
				!(authentication.email.confirmEmail && userData.emailVerified === false)
			)
				userData.lastLoginAt = date;

			// Create the new user in the database
			const newUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.createOne(userData);
			// Do not return back the password value in response
			delete newUser.password;
			// Assign create user value, if we cannot send the verification email for some reason then we need to delete this user form the database
			createdUser = newUser;

			// If email validation required then check the redirect URL. We need to make this check before creating the user object in the database to ensure transactional integrity.
			if (
				authentication.email.confirmEmail &&
				userData.emailVerified === false
			) {
				if (!req.body.redirectURL) {
					return res
						.status(400)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.redirectURLMissing,
								t(
									"Redirect URL is missing. Email validation requires a redirect URL where the user will be redirected after successful email validation."
								)
							)
						);
				}

				if (!isValidRedirectURL(version, req.body.redirectURL)) {
					return res
						.status(400)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.invalidRedirectURL,
								t(
									"Invalid redirect URL. Redirect URL '%s' is not configured in version's authentication settings.",
									req.body.redirectURL
								)
							)
						);
				}

				const token = createEmailToken(
					userDb.type === "MongoDB" ? newUser._id.toString() : newUser.id,
					newUser.email,
					"email-confirm",
					authentication.email.expiresIn,
					req.body.baseURL,
					req.body.redirectURL
				);

				await sendTemplatedEmail("confirm_email", {
					user: newUser,
					token: token,
				});

				// Return only the user info
				res.status(200).json({
					user: newUser,
					session: null,
				});
			} else {
				// No email verification is required, create session and return user and session data back
				const session = await createSession(
					userDb.type === "MongoDB" ? newUser._id.toString() : newUser.id,
					getUserAgentString(req),
					newUser
				);

				res
					.status(200)
					.cookie("session_token", session.token, {
						expires: new Date(
							Date.now() + config.get("general.cookieExpiryDays") * 24 * 3600000
						),
						domain: "",
						path: "/",
						sameSite: "None",
						secure: true,
						httpOnly: true,
					})
					.json({
						user: newUser,
						session: session,
					});
			}
		} catch (err) {
			// Sign up unsuccessful if use created then delete it
			if (createdUser) {
				await agnost
					.db(userDb.name)
					.model(userModel.name)
					.deleteById(
						userDb.type === "MongoDB"
							? createdUser._id.toString()
							: createdUser.id
					);
			}
			helper.handleError(req, res, err);
		}
	}
);

/*
@route      /auth/verify?key={key}&redirect={URL}
@method     GET
@desc       Verifies the key and takes the appropriate action
@access     public
*/
router.get(
	"/verify",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAuthUserModel,
	identifyToken,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.email.enabled) {
				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 401,
					code: ERROR_CODES.emailAuthDisabled,
					action: req.token.obj.actionType,
					error: t(
						"Email authentication is not enabled in your app version settings."
					),
				});
			}

			if (req.token.obj.type !== "email") {
				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 400,
					code: ERROR_CODES.invalidToken,
					action: req.token.obj.actionType,
					error: t("Not a valid token type to verify an email address"),
				});
			}

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.token.obj.userId, { useReadReplica: true });

			if (!existingUser) {
				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 404,
					code: ERROR_CODES.userNotFound,
					action: req.token.obj.actionType,
					error: t("The user associated with the token does not exist."),
				});
			}

			if (
				existingUser.email !== req.token.obj.email &&
				req.token.obj.actionType !== "change-email"
			) {
				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 401,
					code: ERROR_CODES.invalidAccessToken,
					action: req.token.obj.actionType,
					error: t(
						"The email of the user and the email associated with the token does not match."
					),
				});
			}

			// Everthing looks fine, we can perform the required action
			if (req.token.obj.actionType === "email-confirm") {
				if (existingUser.emailVerified) {
					clearToken(req.token.key);

					return processRedirect(req, res, req.token.obj.redirectURL, {
						status: 401,
						code: ERROR_CODES.emailAlreadyVerified,
						action: req.token.obj.actionType,
						error: t("The email of the user has already been verified."),
					});
				}

				// Set email as verified and clear email token
				await agnost
					.db(userDb.name)
					.model(userModel.name)
					.updateById(req.token.obj.userId, { emailVerified: true });

				clearToken(req.token.key);

				// Create a new access token and redirect user
				const accessToken = createAccessToken(
					req.token.obj.userId,
					"email-signin"
				);

				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 200,
					access_token: accessToken.key,
					action: req.token.obj.actionType,
				});
			} else if (req.token.obj.actionType === "magic-link") {
				if (!existingUser.emailVerified) {
					clearToken(req.token.key);

					return processRedirect(req, res, req.token.obj.redirectURL, {
						status: 401,
						code: ERROR_CODES.emailNotVerified,
						action: req.token.obj.actionType,
						error: t("The email of the user has not been verified yet."),
					});
				}

				// Clear magic-link token
				clearToken(req.token.key);
				// Create a new access token and redirect user
				const accessToken = createAccessToken(
					req.token.obj.userId,
					"magic-link"
				);

				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 200,
					access_token: accessToken.key,
					action: req.token.obj.actionType,
				});
			} else if (req.token.obj.actionType === "reset-pwd") {
				if (!existingUser.emailVerified) {
					clearToken(req.token.key);

					return processRedirect(req, res, req.token.obj.redirectURL, {
						status: 401,
						code: ERROR_CODES.emailNotVerified,
						action: req.token.obj.actionType,
						error: t("The email of the user has not been verified yet."),
					});
				}

				// Clear reset-pwd token
				clearToken(req.token.key);
				//Create a new access token and redirect user
				const accessToken = createAccessToken(
					req.token.obj.userId,
					"reset-pwd"
				);

				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 200,
					access_token: accessToken.key,
					action: req.token.obj.actionType,
				});
			} else if (req.token.obj.actionType === "change-email") {
				if (!existingUser.emailVerified) {
					clearToken(req.token.key);

					return processRedirect(req, res, req.token.obj.redirectURL, {
						status: 401,
						code: ERROR_CODES.emailNotVerified,
						action: req.token.obj.actionType,
						error: t("The email of the user has not been verified yet."),
					});
				}

				const userWithEmail = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.findOne({ email: req.token.obj.email }, { useReadReplica: true });

				// Check if there is already a user with the given email
				if (userWithEmail) {
					clearToken(req.token.key);

					return processRedirect(req, res, req.token.obj.redirectURL, {
						status: 401,
						code: ERROR_CODES.emailAlreadyExists,
						action: req.token.obj.actionType,
						error: t("A user with the provided email already exists."),
					});
				}

				// Clear change-email token
				clearToken(req.token.key);

				// Update user's email
				const updatedUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.updateById(req.token.obj.userId, { email: req.token.obj.email });

				// Delete password field
				delete updatedUser.password;

				sendRealtimeUserEvent(
					"user:emailchange",
					req.token.obj.userId,
					req.sessionObj,
					updatedUser
				);

				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 200,
					action: req.token.obj.actionType,
				});
			} else {
				return processRedirect(req, res, req.token.obj.redirectURL, {
					status: 400,
					code: ERROR_CODES.invalidActionType,
					action: req.token.obj.actionType,
					error: t("Cannot identify the action type"),
				});
			}
		} catch (error) {
			logger.error("Server Error", {
				details: {
					action: "clientlib",
					source: "engine-express",
					url: req.url,
					originalUrl: req.originalUrl,
					name: error.name,
					message: error.message,
					stack: error.stack,
				},
			});

			res.status(200).end();
		}
	}
);

/*
@route      /auth/grant?key={key}
@method     GET
@desc       Grants authorization rights for a user
@access     public
*/
router.get(
	"/grant",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAuthUserModel,
	identifyToken2,
	async (req, res) => {
		const { userDb, userModel } = req;
		const version = META.getVersion();
		const { authentication } = version;

		if (!authentication.email.enabled) {
			return res
				.status(401)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.notAllowed,
						t(
							"Email authentication is not enabled in your app version settings."
						)
					)
				);
		}

		if (
			req.token.obj.type !== "access" ||
			(req.token.obj.actionType !== "magic-link" &&
				req.token.obj.actionType !== "email-signin" &&
				req.token.obj.actionType !== "oauth-signup" &&
				req.token.obj.actionType !== "oauth-signin")
		) {
			return res
				.status(401)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.invalidTokenType,
						t("Not a valid token type to get user authentication grants.")
					)
				);
		}

		try {
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.token.obj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t("The user associated with the access token does not exist.")
						)
					);
			}

			// Update user's lastLoginDtm information
			const updatedUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.updateById(req.token.obj.userId, { lastLoginAt: new Date() });

			// Clear the access token
			clearToken(req.token.key);

			// Do not return back the password value in response
			delete updatedUser.password;

			const session = await createSession(
				userDb.type === "MongoDB" ? updatedUser._id.toString() : updatedUser.id,
				getUserAgentString(req),
				updatedUser
			);

			res
				.status(200)
				.cookie("session_token", session.token, {
					expires: new Date(
						Date.now() + config.get("general.cookieExpiryDays") * 24 * 3600000
					),
					domain: "",
					path: "/",
					sameSite: "None",
					secure: true,
					httpOnly: true,
				})
				.json({
					user: updatedUser,
					session: session,
				});
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/signin-email
@method     POST
@desc       Logs in an existing user
@access     public
*/
router.post(
	"/signin-email",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("signin-email"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.email.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Email authentication is not enabled in your app version settings."
							)
						)
					);
			}

			// Get the user with the email address
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ email: req.body.email }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t("Invalid credentials. Email or password provided is invalid.")
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							existingUser.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot sign in with an email and password.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user."
								  )
						)
					);
			}

			// Check if the email of the user has been verified and whether email verification is enabled
			if (authentication.email.confirmEmail && !existingUser.emailVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailNotVerified,
							t("The email address has not been verified yet.")
						)
					);
			}

			// Check whether passwords match
			const isMatch = await bcrypt.compare(
				req.body.password,
				existingUser.password
			);

			if (!isMatch) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t("Invalid credentials. Email or password provided is invalid.")
						)
					);
			}

			// Update user's lastLoginDtm information
			const updatedUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.updateById(
					userDb.type === "MongoDB" ? existingUser._id : existingUser.id,
					{ lastLoginAt: new Date() }
				);

			// Do not return back the password value in response
			delete updatedUser.password;

			const session = await createSession(
				userDb.type === "MongoDB" ? updatedUser._id.toString() : updatedUser.id,
				getUserAgentString(req),
				updatedUser
			);

			res
				.status(200)
				.cookie("session_token", session.token, {
					expires: new Date(
						Date.now() + config.get("general.cookieExpiryDays") * 24 * 3600000
					),
					domain: "",
					path: "/",
					sameSite: "None",
					secure: true,
					httpOnly: true,
				})
				.json({
					user: updatedUser,
					session: session,
				});
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/resend
@method     POST
@desc       Resends the email verification email
@access     public
*/
router.post(
	"/resend",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("resend"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.email.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Email authentication is not enabled in your app version settings."
							)
						)
					);
			}

			// Get the user with the email address
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ email: req.body.email }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t(
								"Invalid credentials. No such account found with the provided email."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							existingUser.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot send a verification email.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user."
								  )
						)
					);
			}

			// Check if the email of the user has been verified and whether email verification is enabled
			if (existingUser.emailVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailAlreadyVerified,
							t("The email address has already been verified.")
						)
					);
			}

			// Check if email verification is enabled
			if (!authentication.email.confirmEmail) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailVerificationDisabled,
							t(
								"Email confirmation is disabled in your app version authentication settings."
							)
						)
					);
			}

			// Check redirect URL parameter
			if (!isValidRedirectURL(version, req.body.redirectURL)) {
				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidRedirectURL,
							t(
								"Invalid redirect URL. Redirect URL '%s' is not configured in version's authentication settings.",
								req.body.redirectURL
							)
						)
					);
			}

			const token = createEmailToken(
				userDb.type === "MongoDB"
					? existingUser._id.toString()
					: existingUser.id,
				existingUser.email,
				"email-confirm",
				authentication.email.expiresIn,
				req.body.baseURL,
				req.body.redirectURL
			);

			await sendTemplatedEmail("confirm_email", {
				user: existingUser,
				token: token,
			});

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/send-magic
@method     POST
@desc       Sends a magic link email
@access     public
*/
router.post(
	"/send-magic",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("send-magic"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.email.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Email authentication is not enabled in your app version settings."
							)
						)
					);
			}

			// Get the user with the email address
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ email: req.body.email }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t(
								"Invalid credentials. No such account found with the provided email."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							existingUser.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot send a magic link email.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user."
								  )
						)
					);
			}

			// Check if the email of the user has been verified or not. We can send magic link to verified emails
			if (!existingUser.emailVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailNotVerified,
							t("The email address has not been verified yet.")
						)
					);
			}

			// Check if email verification is enabled
			/* 			if (!authentication.email.confirmEmail) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailVerificationDisabled,
							t(
								"Email confirmation is disabled in your app version authentication settings."
							)
						)
					);
			} */

			// Check redirect URL parameter
			if (!isValidRedirectURL(version, req.body.redirectURL)) {
				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidRedirectURL,
							t(
								"Invalid redirect URL. Redirect URL '%s' is not configured in version's authentication settings.",
								req.body.redirectURL
							)
						)
					);
			}

			const token = createEmailToken(
				userDb.type === "MongoDB"
					? existingUser._id.toString()
					: existingUser.id,
				existingUser.email,
				"magic-link",
				authentication.email.expiresIn,
				req.body.baseURL,
				req.body.redirectURL
			);

			await sendTemplatedEmail("magic_link", {
				user: existingUser,
				token: token,
			});

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/send-reset
@method     POST
@desc       Sends a reset password email
@access     public
*/
router.post(
	"/send-reset",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("send-reset"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.email.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Email authentication is not enabled in your app version settings."
							)
						)
					);
			}

			// Get the user with the email address
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ email: req.body.email }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t(
								"Invalid credentials. No such account found with the provided email."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							existingUser.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot send a reset password email.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user."
								  )
						)
					);
			}

			// Check if the email of the user has been verified or not. We can send magic link to verified emails
			if (!existingUser.emailVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailNotVerified,
							t("The email address has not been verified yet.")
						)
					);
			}

			// Check if email verification is enabled
			/* 			if (!authentication.email.confirmEmail) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailVerificationDisabled,
							t(
								"Email confirmation is disabled in your app version authentication settings."
							)
						)
					);
			} */

			// Check redirect URL parameter
			if (!isValidRedirectURL(version, req.body.redirectURL)) {
				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidRedirectURL,
							t(
								"Invalid redirect URL. Redirect URL '%s' is not configured in version's authentication settings.",
								req.body.redirectURL
							)
						)
					);
			}

			const token = createEmailToken(
				userDb.type === "MongoDB"
					? existingUser._id.toString()
					: existingUser.id,
				existingUser.email,
				"reset-pwd",
				authentication.email.expiresIn,
				req.body.baseURL,
				req.body.redirectURL
			);

			await sendTemplatedEmail("reset_password", {
				user: existingUser,
				token: token,
			});

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/reset-pwd
@method     POST
@desc       Resets the password of the user
@access     public
*/
router.post(
	"/reset-pwd",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	identifyToken2,
	applyRules("reset-pwd"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.email.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Email authentication is not enabled in your app version settings."
							)
						)
					);
			}

			if (
				req.token.obj.type !== "access" &&
				req.token.obj.actionType !== "reset-pwd"
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidTokenType,
							t("Not a valid token type to reset user password.")
						)
					);
			}

			// Get the user with the email address
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.token.obj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t("The user associated with the access token does not exist.")
						)
					);
			}

			// Update user's password, server side library will handle the encryption
			const updatedUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.updateById(req.token.obj.userId, { password: req.body.newPassword });

			// Delete password info
			delete updatedUser.password;

			sendRealtimeUserEvent(
				"user:pwdchange",
				req.token.obj.userId,
				req.sessionObj,
				updatedUser
			);

			// Clear the access token
			clearToken(req.token.key);

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/signout
@method     POST
@desc       Logs out from a session
@access     private
*/
router.post(
	"/signout",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	checkAuthUserModel,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();

			//By default we start with the current user session
			let token = req.body.token ? req.body.token : req.sessionObj.token;
			//If we have token in request body then get the associated session
			let decoded = verifySessionToken(token);
			let session = req.sessionObj;

			if (decoded) {
				//Check to see if this token is a valid token, valid tokens should be stored in redis cache
				const temp = await getKey(`sessions.${META.getEnvId()}.${decoded.key}`);
				//If token does not have an associated session then just return
				if (!temp) return res.status(200).json();

				//Assign the session associated with the input token
				session = temp;
			} else {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidSessionToken,
							t(
								"Invalid session token. The session token has expired or is not valid at all."
							)
						)
					);
			}

			if (req.sessionObj.userId !== session.userId) {
				return res
					.status(403)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidSessionToken,
							t(
								"Invalid session token. The session that you are trying to sign out is not your session."
							)
						)
					);
			}

			// Clear session entries in Redis cache
			await deleteKey(`sessions.${META.getEnvId()}.${decoded.key}`);

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(session.userId, { useReadReplica: true });

			// Delete password field
			delete existingUser?.password;

			// Trigger user:signout notification event
			sendRealtimeUserEvent(
				"user:signout",
				session.userId,
				session,
				existingUser
			);

			// Update user sessions cache
			let userSessions = await getKey(
				`sessions.${META.getEnvId()}.${session.userId}`
			);

			if (userSessions && userSessions.length > 0) {
				if (userSessions.length === 1)
					await deleteKey(`sessions.${META.getEnvId()}.${session.userId}`);
				else {
					let udpdatedSessions = userSessions.filter(
						(session) => session.token !== token
					);
					await setKey(
						`sessions.${META.getEnvId()}.${session.userId}`,
						udpdatedSessions
					);
				}
			}

			//Success
			res
				.status(200)
				.cookie("session_token", "", {
					maxAge: -1,
					domain: "",
					path: "/",
					sameSite: "None",
					secure: true,
					httpOnly: true,
				})
				.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/signout-all
@method     POST
@desc       Logs out from all active sessions
@access     private
*/
router.post(
	"/signout-all",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	async (req, res) => {
		try {
			let userSessions = await getKey(
				`sessions.${META.getEnvId()}.${req.sessionObj.userId}`
			);

			if (userSessions) {
				const existingUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.findById(userSessions[0].userId, { useReadReplica: true });

				// Delete password field
				delete existingUser?.password;

				for (let i = 0; i < userSessions.length; i++) {
					const session = userSessions[i];
					let key = getSessionKey(session.token);
					if (key) await deleteKey(`sessions.${META.getEnvId()}.${key}`);

					sendRealtimeUserEvent(
						"user:signout",
						session.userId,
						session,
						existingUser
					);
				}

				await deleteKey(`sessions.${META.getEnvId()}.${req.sessionObj.userId}`);
			}

			//Success
			res
				.status(200)
				.cookie("session_token", "", {
					maxAge: -1,
					domain: "",
					path: "/",
					sameSite: "None",
					secure: true,
					httpOnly: true,
				})
				.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/signout-all-except
@method     POST
@desc       Logs out from all active sessions except the current one
@access     private
*/
router.post(
	"/signout-all-except",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	async (req, res) => {
		try {
			let userSessions = await getKey(
				`sessions.${META.getEnvId()}.${req.sessionObj.userId}`
			);

			if (userSessions) {
				const existingUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.findById(userSessions[0].userId, { useReadReplica: true });

				// Delete password field
				delete existingUser?.password;

				for (let i = 0; i < userSessions.length; i++) {
					const session = userSessions[i];
					if (session.token !== req.sessionObj.token) {
						let key = getSessionKey(session.token);
						if (key) await deleteKey(`sessions.${META.getEnvId()}.${key}`);

						sendRealtimeUserEvent(
							"user:signout",
							session.userId,
							session,
							existingUser
						);
					}
				}
			}

			// Update sessions list cache
			await setKey(`sessions.${META.getEnvId()}.${req.sessionObj.userId}`, [
				req.sessionObj,
			]);

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/sessions
@method     GET
@desc       Returns all active sessions of a user
@access     private
*/
router.get(
	"/sessions",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	async (req, res) => {
		try {
			let userSessions = await getKey(
				`sessions.${META.getEnvId()}.${req.sessionObj.userId}`
			);
			userSessions = userSessions ? userSessions : [];

			res.status(200).json(userSessions);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/user
@method     GET
@desc       Returns the user information associated with the session
@access     private
*/
router.get(
	"/user",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	checkAuthUserModel,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.sessionObj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t(
								"The user record associated with the active session cannot be identified."
							)
						)
					);
			}

			// Do not return back the password value in response
			delete existingUser.password;
			res.status(200).json(existingUser);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/change-pwd
@method     POST
@desc       Changes the password of the user
@access     private
*/
router.post(
	"/change-pwd",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	checkAuthUserModel,
	applyRules("change-pwd"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.sessionObj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t(
								"The user record associated with the active session cannot be identified."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							existingUser.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot change the password of accounts that are authorized using Oauth2 providers.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user."
								  )
						)
					);
			}

			// Check whether passwords match
			const isMatch = await bcrypt.compare(
				req.body.oldPassword,
				existingUser.password
			);

			if (!isMatch) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t(
								"Invalid credentials. The current password provided is not valid."
							)
						)
					);
			}

			// Update user's password, server side library will handle the encryption
			const updatedUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.updateById(req.sessionObj.userId, { password: req.body.newPassword });

			// Delete password info
			delete updatedUser.password;

			sendRealtimeUserEvent(
				"user:pwdchange",
				existingUser._id,
				req.sessionObj,
				updatedUser
			);

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/change-email
@method     POST
@desc       Changes the email of a user
@access     public
*/
router.post(
	"/change-email",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	checkAuthUserModel,
	applyRules("change-email"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.email.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Email authentication is not enabled in your app version settings."
							)
						)
					);
			}

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.sessionObj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t(
								"The user record associated with the active session cannot be identified."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							existingUser.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot change the email of accounts that are authorized using Oauth2 providers.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user."
								  )
						)
					);
			}

			const userWithEmail = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ email: req.body.newEmail }, { useReadReplica: true });

			// Check if there is already a user with the given email
			if (userWithEmail) {
				return res.status(400).json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.emailNotUnique,
						t("A user with the provided email already exists."),
						{
							value: req.body.newEmail,
							param: "email",
						}
					)
				);
			}

			// Check whether passwords match
			const isMatch = await bcrypt.compare(
				req.body.currentPassword,
				existingUser.password
			);

			if (!isMatch) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t(
								"Invalid credentials. The current password provided is not valid."
							)
						)
					);
			}

			if (authentication.email.confirmEmail) {
				if (!req.body.redirectURL) {
					return res
						.status(400)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.redirectURLMissing,
								t(
									"Redirect URL is missing. Email validation requires a redirect URL where the user will be redirected after successful email validation."
								)
							)
						);
				}

				if (!isValidRedirectURL(version, req.body.redirectURL)) {
					return res
						.status(400)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.invalidRedirectURL,
								t(
									"Invalid redirect URL. Redirect URL '%s' is not configured in version's authentication settings.",
									req.body.redirectURL
								)
							)
						);
				}

				const token = createEmailToken(
					req.sessionObj.userId,
					req.body.newEmail,
					"change-email",
					authentication.email.expiresIn,
					req.body.baseURL,
					req.body.redirectURL
				);

				// Use the email address in token to send the email not the user's existing email
				await sendTemplatedEmail(
					"confirm_email_change",
					{
						user: existingUser,
						token: token,
					},
					true
				);

				// Return only the user info
				res.status(200).json(existingUser);
			} else {
				// No email confirmation needed, directly update user's email
				const updatedUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.updateById(req.sessionObj.userId, { email: req.body.newEmail });

				// Do not return back the password value in response
				delete updatedUser.password;

				sendRealtimeUserEvent(
					"user:emailchange",
					req.sessionObj.userId,
					req.sessionObj,
					updatedUser
				);

				res.status(200).json(updatedUser);
			}
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/signup-phone
@method     POST
@desc       Creates a new user of the app using phone-password authentication method
@access     public
*/
router.post(
	"/signup-phone",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("signup-phone"),
	validate,
	async (req, res) => {
		const { userDb, userModel } = req;
		const version = META.getVersion();
		const { authentication } = version;
		let createdUser = null;
		try {
			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ phone: req.body.phone }, { useReadReplica: true });

			// Check if there is already a user with the given phone number
			if (existingUser) {
				return res.status(404).json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.userNotFound,
						t("A user with the provided phone number already exists."),
						{
							value: req.body.phone,
							param: "phone",
						}
					)
				);
			}

			// Create new user in database
			const date = new Date();
			let userData = {
				provider: "agnost",
				phone: req.body.phone,
				password: req.body.password,
				signUpAt: date,
				phoneVerified: false,
			};

			if (
				req.body.userData &&
				typeof req.body.userData === "object" &&
				!Array.isArray(req.body.userData)
			) {
				userData = {
					...req.body.userData,
					...userData,
				};
				// Delete email related data in phone-sign up
				delete userData.emailVerified;
				// Bypass phone number validation if specified
				if (req.body.userData.phoneVerified === true)
					userData.phoneVerified = true;
			}

			// If no phone number verification is needed then set the last login date
			if (
				!(authentication.phone.confirmPhone && userData.phoneVerified === false)
			)
				userData.lastLoginAt = date;

			// Create the new user in the database
			const newUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.createOne(userData);
			// Do not return back the password value in response
			delete newUser.password;
			// Assign create user value, if we cannot send the SMS code for some reason then we need to delete this user form the database
			createdUser = newUser;

			if (
				authentication.phone.confirmPhone &&
				userData.phoneVerified === false
			) {
				let token = createPhoneToken(
					userDb.type === "MongoDB" ? newUser._id.toString() : newUser.id,
					newUser.phone,
					"phone-confirm",
					authentication.phone.expiresIn
				);

				await sendTemplatedSMS("verify_sms_code", {
					user: newUser,
					token: token,
				});

				// Return only the user info
				res.status(200).json({
					user: newUser,
					session: null,
				});
			} else {
				// No phone number verification is required, create session and return user and session data back
				const session = await createSession(
					userDb.type === "MongoDB" ? newUser._id.toString() : newUser.id,
					getUserAgentString(req),
					newUser
				);

				res
					.status(200)
					.cookie("session_token", session.token, {
						expires: new Date(
							Date.now() + config.get("general.cookieExpiryDays") * 24 * 3600000
						),
						domain: "",
						path: "/",
						sameSite: "None",
						secure: true,
						httpOnly: true,
					})
					.json({
						user: newUser,
						session: session,
					});
			}
		} catch (error) {
			// Sign up unsuccessful if use created then delete it
			if (createdUser) {
				await agnost
					.db(userDb.name)
					.model(userModel.name)
					.deleteById(
						userDb.type === "MongoDB"
							? createdUser._id.toString()
							: createdUser.id
					);
			}
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/verify-phone?phone={phone}&code={code}
@method     POST
@desc       Verifies the phone number
@access     public
*/
router.post(
	"/verify-phone",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	identifyCode,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			if (req.token.obj.type !== "phone") {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidTokenType,
							t("Not a valid token type to verify SMS code.")
						)
					);
			}

			// Get user info
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.token.obj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t("The user associated with the access token does not exist.")
						)
					);
			}

			if (
				existingUser.phone !== req.token.obj.phone &&
				req.token.obj.actionType !== "change-phone"
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.mismatchValues,
							t(
								"The phone number of the user and the phone number associated with the token does not match."
							)
						)
					);
			}

			// Everthing looks fine, we can perform the required action
			if (req.token.obj.actionType === "phone-confirm") {
				if (!authentication.phone.confirmPhone) {
					return res
						.status(401)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.phoneVerificationDisabled,
								t(
									"Phone number confirmation is disabled in your app version authentication settings."
								)
							)
						);
				}

				// If phone already verified then return an error
				if (existingUser.phoneVerified) {
					clearToken(req.token.key);

					return res
						.status(400)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.phoneAlreadyVerified,
								t("The phone number of the user has already been verified.")
							)
						);
				}

				// Set phone as verified and clear email token
				const updatedUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.updateById(req.token.obj.userId, {
						phoneVerified: true,
						lastLoginAt: new Date(),
					});

				// Delete password field
				delete updatedUser.password;

				sendRealtimeUserEvent(
					"user:phonechange",
					req.token.obj.userId,
					req.sessionObj,
					updatedUser
				);
				// Clear the token which is used
				clearToken(req.token.key);

				//Do not return back the password value in response
				delete updatedUser.password;

				// Create user session
				const session = await createSession(
					req.token.obj.userId,
					getUserAgentString(req),
					updatedUser
				);

				res
					.status(200)
					.cookie("session_token", session.token, {
						expires: new Date(
							Date.now() + config.get("general.cookieExpiryDays") * 24 * 3600000
						),
						domain: "",
						path: "/",
						sameSite: "None",
						secure: true,
						httpOnly: true,
					})
					.json({
						user: updatedUser,
						session: session,
					});
			} else if (req.token.obj.actionType === "change-phone") {
				if (!existingUser.phoneVerified && authentication.phone.confirmPhone) {
					clearToken(req.token.key);

					return res
						.status(401)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.phoneNotVerified,
								t(
									"The existing phone number of the user has not been verified yet."
								)
							)
						);
				}

				const userWithPhone = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.findOne({ phone: req.token.obj.phone }, { useReadReplica: true });

				// Check if there is already a user with the given phone number
				if (userWithPhone) {
					return res.status(400).json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.emailNotUnique,
							t("A user with the provided phone number already exists."),
							{
								value: req.token.obj.phone,
								param: "email",
							}
						)
					);
				}

				// Update user's phone number
				const updatedUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.updateById(req.token.obj.userId, { phone: req.token.obj.phone });

				// Clear the token which is used
				clearToken(req.token.key);

				//Do not return back the password value in response
				delete updatedUser.password;
				res.status(200).json({
					user: updatedUser,
					session: null,
				});
			} else {
				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidActionType,
							t(
								"Cannot identify the action type. The SMS code type is not valid for verifying phone numbers."
							)
						)
					);
			}
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/resend-code
@method     POST
@desc       Resends the phone number verification code
@access     public
*/
router.post(
	"/resend-code",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("resend-code"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			// Get user info
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ phone: req.query.phone }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t(
								"Invalid credentials. No such account found with the provided phone number."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							result.data.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot send phone verification SMS code.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user.",
										existingUser.provider
								  )
						)
					);
			}

			//Check if the phone number of the user has been verified and whether phone number verification is enabled
			if (existingUser.phoneVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.phoneAlreadyVerified,
							t("The phone number of the user has already been verified.")
						)
					);
			}

			// Check if phone verification number is enabled
			if (!authentication.phone.confirmPhone) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.phoneVerificationDisabled,
							t(
								"Phone number confirmation is disabled in your app version authentication settings."
							)
						)
					);
			}

			let token = createPhoneToken(
				userDb.type === "MongoDB"
					? existingUser._id.toString()
					: existingUser.id,
				existingUser.phone,
				"phone-confirm",
				authentication.phone.expiresIn
			);

			await sendTemplatedSMS("verify_sms_code", {
				user: existingUser,
				token: token,
			});

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/signin-phone
@method     POST
@desc       Logs in an existing user
@access     public
*/
router.post(
	"/signin-phone",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("signin-phone"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			// Get user info
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ phone: req.body.phone }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t("Invalid credentials. Phone or password provided is invalid.")
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							result.data.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot sign in with a phone number and password.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user.",
										existingUser.provider
								  )
						)
					);
			}

			//Check if the phone of the user has been verified and whether phone verification is enabled
			if (authentication.phone.confirmPhone && !existingUser.phoneVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.phoneNotVerified,
							t("The phone number has not been verified yet.")
						)
					);
			}

			//Check whether passwords match
			const isMatch = await bcrypt.compare(
				req.body.password,
				existingUser.password
			);

			if (!isMatch) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t(
								"Invalid credentials. Phone number or password provided is invalid."
							)
						)
					);
			}

			// Update user's lastLoginDtm information
			const updatedUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.updateById(
					userDb.type === "MongoDB" ? existingUser._id : existingUser.id,
					{ lastLoginAt: new Date() }
				);

			// Do not return back the password value in response
			delete updatedUser.password;

			const session = await createSession(
				userDb.type === "MongoDB" ? updatedUser._id.toString() : updatedUser.id,
				getUserAgentString(req),
				updatedUser
			);

			res
				.status(200)
				.cookie("session_token", session.token, {
					expires: new Date(
						Date.now() + config.get("general.cookieExpiryDays") * 24 * 3600000
					),
					domain: "",
					path: "/",
					sameSite: "None",
					secure: true,
					httpOnly: true,
				})
				.json({
					user: updatedUser,
					session: session,
				});
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/send-code
@method     POST
@desc       Sends a SMS code for sign up (similar to magic link in email based authentication)
@access     public
*/
router.post(
	"/send-code",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("send-code"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			// Get user info
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ phone: req.query.phone }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t(
								"Invalid credentials. No such account found with the provided phone number."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							result.data.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot send sign-in SMS code.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user.",
										existingUser.provider
								  )
						)
					);
			}

			// Check if the phone of the user has been verified and whether phone verification is enabled
			if (authentication.phone.confirmPhone && !existingUser.phoneVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.phoneNotVerified,
							t("The phone number has not been verified yet.")
						)
					);
			}

			// Check if sms code authentication is anabled
			if (!authentication.phone.allowCodeSignIn) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.smsAuthCodesDisabled,
							t(
								"Sign in using authorization codes sent in SMS is disabled in your app version authentication settings."
							)
						)
					);
			}

			let token = createPhoneToken(
				userDb.type === "MongoDB"
					? existingUser._id.toString()
					: existingUser.id,
				existingUser.phone,
				"signin-code",
				authentication.phone.expiresIn
			);

			await sendTemplatedSMS("verify_sms_code", {
				user: existingUser,
				token: token,
			});

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /signin-code?code={code}&phone={phone}
@method     POST
@desc       Logs in a user with phone and SMS code
@access     public
*/
router.post(
	"/signin-code",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	identifyCode,
	applyRules("signin-code"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			if (req.token.obj.type !== "phone") {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidTokenType,
							t("Not a valid token type to sign in with SMS code.")
						)
					);
			}

			// Get user associated with the doken
			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.token.obj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t("The user associated with the access token does not exist.")
						)
					);
			}

			if (
				existingUser.phone !== req.token.obj.phone &&
				req.token.obj.actionType !== "change-phone"
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.mismatchValues,
							t(
								"The phone number of the user and the phone number associated with the token does not match."
							)
						)
					);
			}

			// Everthing looks fine, we can perform the required action
			if (req.token.obj.actionType === "signin-code") {
				// Check if the phone of the user has been verified and whether phone verification is enabled
				if (authentication.phone.confirmPhone && !existingUser.phoneVerified) {
					return res
						.status(401)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.phoneNotVerified,
								t("The phone number has not been verified yet.")
							)
						);
				}

				// Check if sms code authentication is anabled
				if (!authentication.phone.allowCodeSignIn) {
					return res
						.status(401)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.smsAuthCodesDisabled,
								t(
									"Sign in using authorization codes sent in SMS is disabled in your app version authentication settings."
								)
							)
						);
				}

				// Update last login date
				const updatedUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.updateById(req.token.obj.userId, {
						lastLoginAt: new Date(),
					});
				// Clear the token which is used
				clearToken(req.token.key);

				//Do not return back the password value in response
				delete updatedUser.password;

				// Create user session
				const session = await createSession(
					req.token.obj.userId,
					getUserAgentString(req),
					updatedUser
				);

				res
					.status(200)
					.cookie("session_token", session.token, {
						expires: new Date(
							Date.now() + config.get("general.cookieExpiryDays") * 24 * 3600000
						),
						domain: "",
						path: "/",
						sameSite: "None",
						secure: true,
						httpOnly: true,
					})
					.json({
						user: updatedUser,
						session: session,
					});
			} else {
				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidActionType,
							t(
								"Cannot identify the action type. The SMS code type is not valid for verifying phone numbers."
							)
						)
					);
			}
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/change-phone
@method     POST
@desc       Changes the phone number of a user
@access     public
*/
router.post(
	"/change-phone",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkSession(true),
	checkAuthUserModel,
	applyRules("change-phone"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.sessionObj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t(
								"The user record associated with the active session cannot be identified."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							result.data.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot change the phone number for accounts that are authorized using Oauth2 providers.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user.",
										existingUser.provider
								  )
						)
					);
			}

			const userWithPhone = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ phone: req.body.newPhone }, { useReadReplica: true });

			// Check if there is already a user with the given phone number
			if (userWithPhone) {
				return res.status(400).json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.emailNotUnique,
						t("A user with the provided phone number already exists."),
						{
							value: req.body.newPhone,
							param: "email",
						}
					)
				);
			}

			// Check whether passwords match
			const isMatch = await bcrypt.compare(
				req.body.currentPassword,
				existingUser.password
			);

			if (!isMatch) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidCredentials,
							t(
								"Invalid credentials. The current password provided is not valid."
							)
						)
					);
			}

			if (authentication.phone.confirmPhone) {
				let token = createPhoneToken(
					userDb.type === "MongoDB"
						? existingUser._id.toString()
						: existingUser.id,
					req.body.newPhone,
					"change-phone",
					authentication.phone.expiresIn
				);

				await sendTemplatedSMS("verify_sms_code", {
					user: existingUser,
					token: token,
				});

				// Return only the user info
				res.status(200).json({
					user: existingUser,
					session: null,
				});
			} else {
				// No phone number confirmation needed, directly update user's phone number
				const updatedUser = await agnost
					.db(userDb.name)
					.model(userModel.name)
					.updateById(req.sessionObj.userId, { phone: req.body.newPhone });

				// Do not return back the password value in response
				delete updatedUser.password;

				sendRealtimeUserEvent(
					"user:phonechange",
					req.sessionObj.userId,
					req.sessionObj,
					updatedUser
				);

				res.status(200).json(updatedUser);
			}
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/send-reset-code
@method     POST
@desc       Sends a reset password SMS code
@access     public
*/
router.post(
	"/send-reset-code",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("send-reset-code"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ phone: req.query.phone }, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t(
								"Invalid credentials. No such account found with the provided phone number."
							)
						)
					);
			}

			if (
				(existingUser.provider &&
					existingUser.provider.toLowerCase() !== "agnost") ||
				!existingUser.password
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidProvider,
							result.data.provider
								? t(
										"Invalid credentials. You have signed up using your %s credentials. You cannot send a reset password SMS code.",
										existingUser.provider
								  )
								: t(
										"Invalid credentials. We cannot identify the authorization provider for this user.",
										existingUser.provider
								  )
						)
					);
			}

			//Check if the phone of the user has been verified and whether phone verification is enabled
			if (authentication.phone.confirmPhone && !existingUser.phoneVerified) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.phoneNotVerified,
							t("The phone number has not been verified yet.")
						)
					);
			}

			// Check if phone verification is enabled
			if (!authentication.phone.confirmPhone) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.phoneVerificationDisabled,
							t(
								"Phone number confirmation is disabled in your app version authentication settings."
							)
						)
					);
			}

			let token = createPhoneToken(
				userDb.type === "MongoDB"
					? existingUser._id.toString()
					: existingUser.id,
				existingUser.phone,
				"reset-pwd-code",
				authentication.phone.expiresIn
			);

			await sendTemplatedSMS("verify_sms_code", {
				user: existingUser,
				token: token,
			});

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /auth/reset-pwd-code
@method     POST
@desc       Resets the password of the user using the SMS code
@access     public
*/
router.post(
	"/reset-pwd-code",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	identifyCode,
	applyRules("reset-pwd-code"),
	validate,
	async (req, res) => {
		try {
			const { userDb, userModel } = req;
			const version = META.getVersion();
			const { authentication } = version;

			if (!authentication.phone.enabled) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notAllowed,
							t(
								"Phone number based authentication is not enabled in your app version settings."
							)
						)
					);
			}

			if (
				req.token.obj.type !== "phone" &&
				req.token.obj.actionType !== "reset-pwd-code"
			) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidTokenType,
							t(
								"Not a valid token type to reset user password using an SMS code."
							)
						)
					);
			}

			const existingUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findById(req.token.obj.userId, { useReadReplica: true });

			// If no user found return an error
			if (!existingUser) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.userNotFound,
							t("The user associated with the access token does not exist.")
						)
					);
			}

			// Update user's password, server side library will handle the encryption
			const updatedUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.updateById(req.token.obj.userId, { password: req.body.newPassword });

			// Delete password info
			delete updatedUser.password;

			//Clear the token
			clearToken(req.token.key);

			sendRealtimeUserEvent(
				"user:pwdchange",
				req.token.obj.userId,
				req.sessionObj,
				updatedUser
			);

			res.status(200).json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

export default router;
