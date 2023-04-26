import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

export const authRefreshToken = async (req, res, next) => {
	// Get token
	let token = req.header("Authorization") ?? req.query.token;

	// Check if there is token
	if (!token) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("No refresh token was found in 'Authorization' header."),
			code: ERROR_CODES.missingRefreshToken,
		});
	}

	// Check if token is still valid or not
	let refreshToken = await getKey(token);
	if (!refreshToken) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("The refresh token was not authorized or has expired."),
			code: ERROR_CODES.invalidRefreshToken,
		});
	}

	req.tokens = { ...refreshToken, rt: token };
	next();
};
