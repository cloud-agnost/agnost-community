import versionCtrl from "../controllers/version.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

// Middleare the create the error message for failed request input validations
export const validateVersion = async (req, res, next) => {
	try {
		const { versionId } = req.params;

		// Get the version object
		let version = await versionCtrl.getOneById(versionId, {
			cacheKey: versionId,
		});

		if (!version) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such version with the provided id '%s' exists.",
					versionId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (req.app._id.toString() !== version.appId.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App does not have a version with the provided id '%s'",
					versionId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// If this is a private version then only authorized people can view and update it
		if (version.private && req.user) {
			if (
				version.createdBy.toString() !== req.user._id.toString() &&
				req.appMember.role !== "Admin"
			) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You do not have the authorization to work on the private version '%s'",
						version.name
					),
					code: ERROR_CODES.unauthorized,
				});
			}
		}

		// If this is a readonly version then only authorized people can view and update it
		if (version.readOnly && req.user) {
			if (
				version.createdBy.toString() !== req.user._id.toString() &&
				req.appMember.role !== "Admin"
			) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You do not have the authorization to work on the read-only version '%s'",
						version.name
					),
					code: ERROR_CODES.unauthorized,
				});
			}
		}

		// Assign version data
		req.version = version;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateVersionParam = async (req, res, next) => {
	try {
		const { paramId } = req.params;

		// Get the param object
		let param = req.version.params.find(
			(entry) => entry._id.toString() === paramId.toString()
		);

		if (!param) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such parameter with the provided id '%s' exists.",
					paramId
				),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign the parameter data
		req.param = param;
		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateVersionLimit = async (req, res, next) => {
	try {
		const { limitId } = req.params;

		// Get the rate limit
		let limit = req.version.limits.find(
			(entry) => entry._id.toString() === limitId.toString()
		);

		if (!limit) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such rate limiter with the provided id '%s' exists.",
					limitId
				),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign the rate limiter data
		req.limit = limit;
		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateVersionKey = async (req, res, next) => {
	try {
		const { keyId } = req.params;

		// Get the API key object
		let key = req.version.apiKeys.find(
			(entry) => entry._id.toString() === keyId.toString()
		);

		if (!key) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("No such API key with the provided id '%s' exists.", keyId),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign the API key data
		req.key = key;
		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateVersionPackage = async (req, res, next) => {
	try {
		const { packageId } = req.params;

		// Get the NPM package object
		let npmPackage = req.version.npmPackages.find(
			(entry) => entry._id.toString() === packageId.toString()
		);

		if (!npmPackage) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such NPM package with the provided id '%s' exists.",
					packageId
				),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign the NPM package data
		req.npmPackage = npmPackage;
		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateVersionOauthProvider = async (req, res, next) => {
	try {
		const { providerId } = req.params;

		// Get the NPM package object
		let oauthProvider = req.version.authentication?.providers?.find(
			(entry) => entry._id.toString() === providerId.toString()
		);

		if (!oauthProvider) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such oAuth provider configuration with the provided id '%s' exists.",
					providerId
				),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign the os specific redirect configuration
		req.oauthProvider = oauthProvider;
		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
