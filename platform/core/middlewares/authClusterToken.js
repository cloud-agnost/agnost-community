import ERROR_CODES from "../config/errorCodes.js";

export const authClusterToken = async (req, res, next) => {
	// Get token
	let token = req.header("Authorization") ?? req.query.token;

	// Check if there is token
	if (!token) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t(
				"No cluster access token was found in 'Authorization' header."
			),
			code: ERROR_CODES.missingAccessToken,
		});
	}

	// Check if token is valid or not
	if (token !== process.env.CLUSTER_ACCESS_TOKEN) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("The cluster access token was not authorized or has expired."),
			code: ERROR_CODES.invalidAccessToken,
		});
	}

	next();
};
