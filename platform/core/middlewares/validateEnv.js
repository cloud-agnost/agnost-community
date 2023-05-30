import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

// Middleare the create the error message for failed request input validations
export const validateEnv = async (req, res, next) => {
	try {
		const { envId } = req.params;

		// Get the environment object
		let env = await envCtrl.getOneById(envId, {
			cacheKey: envId,
		});

		if (!env) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such environment with the provided id '%s' exists.",
					envId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (req.version._id.toString() !== env.versionId.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have an environment with the provided id '%s'",
					envId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Typically users can only manage their own environments, if the app member is in Admin role then they can manage all environments
		// User check is added since if the endpoing is called using a master token we do not have the user information
		if (
			req.user &&
			env.createdBy.toString() !== req.user._id.toString() &&
			req.appMember.role !== "Admin"
		) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"You do not have the authorization to work on an environment with the provided id '%s'",
					envId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign environment data
		req.env = env;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateEnvLog = async (req, res, next) => {
	try {
		const { logId } = req.params;

		// Get the environment object
		let log = await envLogCtrl.getOneById(logId);

		if (!log) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such environment log with the provided id '%s' exists.",
					logId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (req.env._id.toString() !== log.envId.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"Environment does not have a log with the provided id '%s'",
					logId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign environment log data
		req.log = log;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
