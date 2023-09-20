import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

// Middleware to check whether a valid session token provided or not
export const checkSession = async (req, res, next) => {
	//First check the Session header whether there is a session token or not
	let sessionToken = req.header("Session");
	//If we do not have a session token in headers, then look for the Cookies
	if (!sessionToken && req.cookies && req.cookies.session_token)
		sessionToken = req.cookies.session_token;

	if (!sessionToken) {
		return res
			.status(401)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingSessionToken,
					t(
						"No valid session token provided in 'Session' header or in 'session_token' cookie."
					)
				)
			);
	}

	// Check to see if this token is a valid token, valid tokens should be stored in redis cache
	const sessionObj = await getKey(
		`sessions.${META.getEnvId()}.${sessionToken}`
	);
	if (!sessionObj) {
		return res
			.status(401)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.invalidSessionToken,
					t("The session token was not authorized or has expired.")
				)
			);
	}

	// Everthing looks good, set session object in request and proceed to next step
	req.session = sessionObj;
	next();
};
