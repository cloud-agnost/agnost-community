import express from "express";
import axios from "axios";
import passport from "passport";
import responseTime from "response-time";
import { agnost } from "@agnost/server";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as AppleStrategy } from "passport-apple";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import { checkAuthUserModel } from "../middlewares/checkAuthUserModel.js";
import { checkOAuthProvider } from "../middlewares/checkOAuthProvider.js";
import { processRedirect, createAccessToken } from "../util/authHelper.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

function getBaseURL(req) {
	if (req.query.base) return req.query.base;
	else return `${req.protocol}://${req.hostname}/${META.getEnvId()}`;
}

const loginOauthProvider = async (req, res, next) => {
	let origin = req.header("origin");
	if (!origin) {
		origin = req.header("x-forwarded-host");
		if (origin) {
			let port = req.header("x-forwarded-port");
			if (port === "80" || port === "443")
				origin = `${req.header("x-forwarded-proto")}://${origin}`;
			else origin = `${req.header("x-forwarded-proto")}://${origin}:${port}`;
		} else {
			let host = req.get("host");
			if (host && req.protocol) origin = req.protocol + "://" + host;
		}
	}

	console.log("***origin", origin);

	console.log("***req.params", req.params);
	console.log("***req.query", req.query);
	console.log("***req.headers", req.headers);
	console.log("***getBaseURL", getBaseURL(req));

	let strategy = createStrategy(
		req.provider,
		`${getBaseURL(req)}/agnost/oauth/${req.provider.name}/callback`,
		req
	);

	let scope = undefined;
	switch (req.provider.name) {
		case "google":
			scope = ["profile", "email"];
			break;
		case "facebook":
			scope = ["public_profile", "email"];
			break;
		case "github":
			scope = ["user:email"];
			break;
		case "discord":
			scope = ["identify", "email"];
			break;
		case "apple":
			scope = ["name", "email"];
			break;
		default:
			break;
	}

	// If not already set then set the redirect session parameter. Twitter does not support state parameter that is why we need to store it in session
	console.log("***req.session.redirect", req?.query?.redirect);

	if (!req.session.redirect) req.session.redirect = req.query.redirect;
	passport.authenticate(
		strategy,
		{
			scope: scope,
			// We need to store the redirect URL in state or session
			state: req.query.redirect,
		},
		// Custom error and success handling
		function (err, user, info) {
			console.log("***rcallback", err, user, info);
			console.log("***req.query.state", req.query?.state);
			console.log("***req.query.redirect", req.query?.redirect);

			if (err || !user) {
				return processRedirect(
					req,
					res,
					req.query.state ?? req.query.redirect,
					{
						status: err?.status ?? 401,
						code: err?.code ?? ERROR_CODES.permissionDenied,
						action: "oauth-signin",
						error: t(
							"User cannot be authenticated through %s OAuth flow. %s",
							req.provider.name,
							err?.message ?? info?.message ?? ""
						),
					}
				);
			} else {
				next();
			}
		}
	)(req, res, next);
};

function createStrategy(provider, callbackURL, req) {
	switch (provider.name) {
		case "google":
			return new GoogleStrategy(
				{
					clientID: provider.settings.key,
					clientSecret: provider.settings.secret,
					callbackURL: callbackURL,
				},
				verifyCallback(req)
			);
		case "facebook":
			return new FacebookStrategy(
				{
					clientID: provider.settings.key,
					clientSecret: provider.settings.secret,
					callbackURL: callbackURL,
					profileFields: ["id", "displayName", "photos", "emails", "name"],
				},
				verifyCallback(req)
			);
		case "twitter":
			return new TwitterStrategy(
				{
					consumerKey: provider.settings.key,
					consumerSecret: provider.settings.secret,
					callbackURL: callbackURL,
					includeEmail: true,
				},
				verifyCallback(req)
			);
		case "github":
			return new GitHubStrategy(
				{
					clientID: provider.settings.key,
					clientSecret: provider.settings.secret,
					callbackURL: callbackURL,
				},
				verifyCallback(req)
			);
		case "discord":
			return new DiscordStrategy(
				{
					clientID: provider.settings.key,
					clientSecret: provider.settings.secret,
					callbackURL: callbackURL,
				},
				verifyCallback(req)
			);
		case "apple":
			return new AppleStrategy(
				{
					teamID: provider.settings.teamId,
					clientID: provider.settings.serviceId,
					keyID: provider.settings.keyId,
					privateKeyString: provider.settings.privateKey,
					callbackURL: callbackURL,
				},
				verifyAppleCallback
			);
		default:
			return null;
	}
}

const verifyCallback = (req) => {
	return async (accessToken, refreshToken, profile, done) => {
		console.log("***verifyCallback", accessToken, refreshToken, profile);

		const { userDb, userModel } = req;
		// Get normalized user data
		const userData = await getNormalizedUserData(
			req.provider.name,
			profile,
			accessToken
		);

		console.log("***getNormalizedUserData", userData);

		// Check if there is already an account with the provided email reqistered
		if (userData.email) {
			const userWithEmail = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.findOne({ email: userData.email }, { useReadReplica: true });

			if (
				(userWithEmail &&
					userWithEmail.provider &&
					userWithEmail.provider.toLowerCase() !== req.provider.name) ||
				(userWithEmail && !userWithEmail.provider)
			) {
				return done({
					message: t(
						"An account with the same email (%s) already exists. You need to use the credentials of that account for authorization.",
						userData.email
					),
					code: ERROR_CODES.emailNotUnique,
				});
			}
		}

		// Check if the user already exists in the database or not, if yes then return the user data do nothing
		const userWithProviderId = await agnost
			.db(userDb.name)
			.model(userModel.name)
			.findOne(
				{ providerUserId: userData.providerUserId },
				{ useReadReplica: true }
			);

		if (userWithProviderId) {
			console.log("***userWithProviderId", true);

			// User data already exists in the database, return success, no need to create user data in the database
			req.authResult = {
				user: userWithProviderId,
				action: "oauth-signin",
				accessToken: createAccessToken(
					userDb.type === "MongoDB"
						? userWithProviderId._id.toString()
						: userWithProviderId.id,
					"oauth-signin"
				),
				providerAT: accessToken,
				providerRT: refreshToken,
			};

			return done(null, req.authResult);
		} else {
			console.log("***userWithProviderId", false);

			// Create user authentication data in the database
			userData.signUpAt = new Date();

			// Create the new user in the database
			const newUser = await agnost
				.db(userDb.name)
				.model(userModel.name)
				.createOne(userData);

			req.authResult = {
				user: newUser,
				action: "oauth-signup",
				accessToken: createAccessToken(
					userDb.type === "MongoDB" ? newUser._id.toString() : newUser.id,
					"oauth-signup"
				),
				providerAT: accessToken,
				providerRT: refreshToken,
			};

			return done(null, req.authResult);
		}
	};
};

const verifyAppleCallback = async (
	req,
	accessToken,
	refreshToken,
	idToken,
	profile,
	done
) => verifyCallback(req)(accessToken, refreshToken, idToken, done);

async function getNormalizedUserData(provider, profile, accessToken) {
	let normlizedProfile = {};
	switch (provider) {
		case "google":
		case "facebook":
		case "twitter":
		case "github":
			normlizedProfile.provider = provider;
			normlizedProfile.providerUserId = profile.id;
			normlizedProfile.name = profile.displayName;
			if (profile.emails && profile.emails[0])
				normlizedProfile.email = profile.emails[0].value;
			if (profile.photos && profile.photos[0])
				normlizedProfile.profilePicture = profile.photos[0].value;
			break;
		case "discord":
			normlizedProfile.provider = provider;
			normlizedProfile.providerUserId = profile.id;
			normlizedProfile.name = profile.username;
			if (profile.email) normlizedProfile.email = profile.email;
			if (profile.photos && profile.photos[0])
				normlizedProfile.profilePicture = profile.photos[0].value;
			break;
		case "apple":
			{
				let decoded = jwt.decode(profile);
				normlizedProfile.provider = provider;
				normlizedProfile.providerUserId = decoded.sub;
				if (decoded.name) normlizedProfile.name = decoded.name;
				if (decoded.email) normlizedProfile.email = decoded.email;
			}
			break;
	}

	// If github does not return the email address of the user call the api endpoint to get it
	if (!normlizedProfile.email && provider === "github") {
		try {
			let result = await axios.get("https://api.github.com/user/emails", {
				headers: {
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "OAuth App",
					Authorization: `token ${accessToken}`,
				},
			});

			if (result.data) {
				for (let i = 0; i < result.data.length; i++) {
					const emeilEntry = result.data[i];
					if (emeilEntry && emeilEntry.primary && emeilEntry.email)
						normlizedProfile.email = emeilEntry.email;
				}
			}
		} catch (err) {}
	}

	return normlizedProfile;
}

/*
@route      /oauth/:provider
@method     GET
@desc       Sign up/in using provider credentials
@access     private
*/
router.get(
	"/:provider",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkAuthUserModel,
	checkOAuthProvider,
	loginOauthProvider
);

/*
@route      /oauth/:provider/callback
@method     GET
@desc       Sign up/in using provider credentials
@access     private
*/
router.get(
	"/:provider/callback",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkAuthUserModel,
	checkOAuthProvider,
	loginOauthProvider,
	(req, res) => {
		console.log(
			"***u/oauth/:provider/callback",
			req.query.state,
			req.session?.redirect,
			req.authResult
		);

		return processRedirect(req, res, req.query.state ?? req.session.redirect, {
			access_token: req.authResult.accessToken.key,
			action: req.authResult.action,
			status: 200,
		});
	}
);

/*
@route      /oauth/:provider/callback
@method     POST
@desc       Sign up/in using provider credentials - Apple redirects with a POST
@access     private
*/
router.post(
	"/:provider/callback",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkAuthUserModel,
	checkOAuthProvider,
	loginOauthProvider,
	(req, res) => {
		return processRedirect(req, res, req.query.state ?? req.session.redirect, {
			access_token: req.authResult.accessToken.key,
			action: req.authResult.action,
			status: 200,
		});
	}
);

export default router;
