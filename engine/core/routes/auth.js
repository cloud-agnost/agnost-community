import express from "express";
import responseTime from "response-time";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import { checkAPIKey } from "../middlewares/checkAPIKey.js";
import { checkAuthUserModel } from "../middlewares/checkAuthUserModel.js";
import { identifyToken } from "../middlewares/identifyToken.js";
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
} from "../util/authHelper.js";
import { applyRules, validate } from "../util/authRules.js";
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
				lastLoginAt: date,
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
				// Delete phone related data in emai-sign up
				delete userData.phoneVerified;
				// Bypass email validation if specified
				if (req.body.userData.emailVerified === true)
					userData.emailVerified = true;
			}

			// Create the new user in the database
			const newUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.createOne(userData);
			// Do not return back the password value in response
			delete newUser.password;

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
					userDb.type === "MongoDB"
						? newUser._id.toString()
						: newUser.id.toString(),
					getUserAgentString(req)
				);

				console.log("***session", session);

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
			helper.handleError(req, res, err);
		}
	}
);

responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	checkAuthUserModel,
	applyRules("signup-email"),
	validate,
	/*
@route      /auth/verify?key={key}
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
		checkAPIKey(null),
		checkAuthUserModel,
		identifyToken,
		async (req, res) => {
			try {
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
					await agnost
						.db(userDb.name)
						.model(userModel.name)
						.updateById(req.token.obj.userId, { email: req.token.obj.email });

					// Update user's email
					await updateEmail(
						result.data._id,
						req.env.obj,
						req.userModel,
						req.token.obj.email,
						req.sessionObj
					);

					sendRealtimeUserEvent(
						"user:emailchange",
						req.token.obj.userId,
						req.sessionObj
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

export default router;
