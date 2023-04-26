import userCtrl from "../controllers/user.js";
import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

export const authSession = async (req, res, next) => {
	// Get token
	let token = req.header("Authorization") ?? req.query.token;

	// Check if there is token
	if (!token) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("No access token was found in 'Authorization' header."),
			code: ERROR_CODES.missingAccessToken,
		});
	}

	// Check if token is still valid or not
	let session = await getKey(token);
	if (!session) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("The access token was not authorized or has expired."),
			code: ERROR_CODES.invalidSession,
		});
	}

	// Get the user information associated with the session
	let user = await userCtrl.getOneById(session.userId, {
		projection: "+loginProfiles.password",
		cacheKey: session.userId,
	});

	if (!user || user.status !== "Active") {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t(
				"No such user exists or user account is not active with the provided access token."
			),
			code: ERROR_CODES.invalidUser,
		});
	}

	req.user = user;
	req.session = { ...session, at: token };
	next();
};
