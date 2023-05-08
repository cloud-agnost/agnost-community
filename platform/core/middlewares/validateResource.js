import resourceCtrl from "../controllers/resource.js";
import resLogCtrl from "../controllers/resourceLog.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateResource = async (req, res, next) => {
	try {
		const { resourceId } = req.params;

		// Get the resource object
		let resource = await resourceCtrl.getOneById(resourceId, {
			cacheKey: resourceId,
		});

		if (!resource) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such resource with the provided id '%s' exists.",
					resourceId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (resource.orgId.toString() !== req.org._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"Organization does not have a resource with the provided id '%s'",
					resourceId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign resource data
		req.resource = resource;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateResourceLog = async (req, res, next) => {
	try {
		const { logId } = req.params;

		// Get the environment object
		let log = await resLogCtrl.getOneById(logId);

		if (!log) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such resource log with the provided id '%s' exists.",
					logId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (req.resource._id.toString() !== log.resourceId.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"Resource does not have a log with the provided id '%s'",
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
