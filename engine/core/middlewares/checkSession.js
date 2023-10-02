import jwt from "jsonwebtoken";
import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

// Middleware to check whether a valid session token provided or not
export const checkSession =
	(sessionRequired = true) =>
	async (req, res, next) => {
		if (!sessionRequired) {
			next();
			return;
		}

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

		// Ok it seems we have a session token, first dedoce it to verify it
		jwt.verify(sessionToken, process.env.JWT_SECRET, async (error, decoded) => {
			if (error) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidSessionToken,
							t("The Session token was not authorized or has expired")
						)
					);
			} else {
				//Check to see if this token is a valid token, valid tokens should be stored in redis cache
				const session = await getKey(
					`sessions.${META.getEnvId()}.${decoded.key}`
				);

				if (!session) {
					return res
						.status(401)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.invalidSessionToken,
								t("The session token was not authorized or has expired")
							)
						);
				}

				//Ok we have a valid session, store it in req object
				req.sessionObj = session;
				next();
			}
		});
	};
