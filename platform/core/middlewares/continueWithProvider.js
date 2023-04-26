import axios from "axios";
import passport from "passport";
import GitHub from "passport-github2";
import GitLab from "passport-gitlab2";
import authCtrl from "../controllers/auth.js";
import userCtrl from "../controllers/user.js";
import ERROR_CODES from "../config/errorCodes.js";

export const continueWithProvider = async (req, res, next) => {
	let strategy = createStrategy(req.provider, req);

	passport.authenticate(
		strategy,
		{
			scope: getScope(req.provider.name),
		},
		// Custom error and success handling
		function (err, user, info) {
			if (err || !user) {
				return processRedirect(req, res, {
					action: err?.action ?? "oauth-continue",
					code: err?.code ?? ERROR_CODES.permissionDenied,
					error:
						err?.details ??
						t(
							"User cannot be authenticated through '%s' OAuth flow. %s",
							req.provider.name,
							err?.message ?? info?.message ?? ""
						),
					status: err?.status ?? 401,
				});
			} else {
				next();
			}
		}
	)(req, res, next);
};

/**
 * Reeturns the scope definiton for the provider
 * @param  {string} providerName The name of the oAuth provider
 */
function getScope(providerName) {
	let scope = undefined;
	switch (providerName) {
		case "github":
			scope = ["user:email"];
			break;
		case "gitlab":
			scope = ["read_user"];
			break;
		default:
			break;
	}

	return scope;
}

/**
 * Create the passport strategy for provider authentication
 * @param  {object} provider Provider configuration object
 * @param  {object} req The express request object
 */
function createStrategy(provider, req) {
	switch (provider.name) {
		case "github":
			return new GitHub.Strategy(
				{
					clientID: provider.clientId,
					clientSecret: provider.clientSecret,
					callbackURL: provider.callbackURL,
				},
				verifyCallbackForContinue(req)
			);
		case "gitlab":
			return new GitLab.Strategy(
				{
					clientID: provider.clientId,
					clientSecret: provider.clientSecret,
					callbackURL: provider.callbackURL,
				},
				verifyCallbackForContinue(req)
			);
		default:
			return null;
	}
}

/**
 * Redirects the user to the redirect url both for success and error cases
 * @param  {object} req The express request object
 * @param  {object} res The express response object
 * @param  {object} queryParams Key value pairs that will be appended to redirect url
 */
function processRedirect(req, res, queryParams) {
	return res.redirect(
		helper.appendQueryParams(config.get("oauth.redirectUrl"), queryParams)
	);
}

/**
 * Called when the oAuth process completes successfully. Mainly used to sign up or sign in the user to the platform.
 * This method is directly called from passport strategy
 * @param  {object} req The express request object
 */
const verifyCallbackForContinue = (req) => {
	return async (accessToken, refreshToken, profile, done) => {
		const { name } = req.provider;
		// Get normalized user data
		let normalizedUser = await getNormalizedUserData(
			name,
			profile,
			accessToken
		);

		// Check if there is already a user with the provided identifier
		let user = await userCtrl.getOneByQuery({
			"loginProfiles.provider": name,
			"loginProfiles.id": normalizedUser.providerUserId,
		});

		if (!user) {
			// No user account exists, create the new user in the database
			// Start new database transaction session
			req.authResult = {
				action: "oauth-signup",
				profile: {
					provider: name,
					id: normalizedUser.providerUserId,
					name: normalizedUser.name,
					email: normalizedUser.email,
					pictureUrl: normalizedUser.profilePicture,
				},
			};

			return done(null, req.authResult);
		} else {
			// There is already a user, check account status
			if (user.status === "Suspended") {
				return done({
					action: "oauth-signin",
					error: t("Account suspended"),
					code: ERROR_CODES.suspendedAccount,
					details: t(
						"Your account has been suspended on '%s' due to '%s'.",
						helper.getDateStr(user.suspensionDtm),
						user.suspensionReason
					),
					status: 401,
				});
			}

			// Update user's last login information
			user = await userCtrl.updateOneById(
				user._id,
				{
					lastLoginAt: Date.now(),
					lastLoginProvider: name,
				},
				{},
				{ cacheKey: user._id }
			);

			req.authResult = {
				user: user,
				action: "oauth-signin",
				tokens: await authCtrl.createSession(
					user._id,
					helper.getIP(req),
					req.headers["user-agent"],
					name
				),
			};

			return done(null, req.authResult);
		}
	};
};

/**
 * Normalizes the user information returned from different oAuth providers to a standard format
 * @param  {string} provider The provider name
 * @param  {object} profile The profile infro provided by oAuth provider
 * @param  {string} accessToken The access token providedby oAuth provider
 */
async function getNormalizedUserData(provider, profile, accessToken) {
	let normlizedProfile = {};
	switch (provider) {
		case "github":
			normlizedProfile.provider = provider;
			normlizedProfile.providerUserId = profile.id;
			normlizedProfile.name = profile.displayName;
			if (profile.emails && profile.emails[0])
				normlizedProfile.email = profile.emails[0].value;
			if (profile.photos && profile.photos[0])
				normlizedProfile.profilePicture = profile.photos[0].value;
			break;
		default:
			break;
	}

	// If github does not return the email address of the user, call the api endpoint to get it
	if (!normlizedProfile.email && provider === "github") {
		//Connect to platform server
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
