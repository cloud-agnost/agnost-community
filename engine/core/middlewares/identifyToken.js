import { getKey } from "../init/cache.js";
import { processRedirect } from "../util/authHelper.js";
import ERROR_CODES from "../config/errorCodes.js";

export const identifyToken = async function (req, res, next) {
	const key = req.query.key;
	if (!key) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingAccessToken,
					t("Cannot identify the access token")
				)
			);
	}

	const tokenObj = await getKey(`tokens.${META.getEnvId()}.${key}`);

	// We could not find the token object, meaning it is invalid or expired
	if (!tokenObj) {
		return processRedirect(req, res, req.query.redirect, {
			action: req.query.action,
			code: ERROR_CODES.invalidAccessToken,
			error: t("Invalid or expired access token"),
			status: 400,
			redirectURL: redirectURL,
		});
	}

	//Set token object
	req.token = {
		key: key,
		obj: tokenObj,
	};

	next();
};
