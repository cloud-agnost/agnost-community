import ERROR_CODES from "../config/errorCodes.js";

export const authMasterToken = async (req, res, next) => {
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

	// Check if token is valid or not
	if (token !== config.get("general.masterToken")) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("The access token was not authorized or has expired."),
			code: ERROR_CODES.invalidSession,
		});
	}

	next();
};
