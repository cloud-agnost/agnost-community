import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

export const authAccessToken = async (req, res, next) => {
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

	// Check if token is valid or not for development environments
	if (
		process.env.NODE_ENV === "development" &&
		token !== config.get("general.accessToken")
	) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("The access token was not authorized or has expired."),
			code: ERROR_CODES.invalidCredentials,
		});
	}

	// Check if token is valid or not for production environments
	if (["production", "clouddev"].includes(process.env.NODE_ENV)) {
		let storedToken = await getKey(token);
		if (!storedToken) {
			return res.status(401).json({
				error: t("Unauthorized"),
				details: t("The access token was not authorized or has expired."),
				code: ERROR_CODES.invalidCredentials,
			});
		}
	}

	next();
};
