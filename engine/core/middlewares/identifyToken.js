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
		});
	}

	// Set token object
	req.token = {
		key: key,
		obj: tokenObj,
	};

	next();
};

export const identifyToken2 = async function (req, res, next) {
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
		return res
			.status(403)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.invalidAccessToken,
					t("Invalid or expired access token")
				)
			);
	}

	//Set token object
	req.token = {
		key: key,
		obj: tokenObj,
	};

	next();
};

export const identifyCode = async function (req, res, next) {
	let phone = req.query.phone;
	let code = req.query.code;

	if (!phone) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingPhoneNumber,
					t("Cannot identify the phone number")
				)
			);
	}

	if (!code) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingSMSCode,
					t("Cannot identify the SMS code")
				)
			);
	}

	const tokenObj = await getKey(`tokens.${META.getEnvId()}.${phone}.${code}`);

	// We could not find the token object, meaning it is invalid or expired
	if (!tokenObj) {
		return res
			.status(403)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.invalidAccessToken,
					t("Invalid or expired SMS code")
				)
			);
	}

	// Set token object
	req.token = {
		key: `${phone}.${code}`,
		obj: tokenObj,
	};
	next();
};
