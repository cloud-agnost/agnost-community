import funcCtrl from "../controllers/function.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateFunction = async (req, res, next) => {
	try {
		const { funcId } = req.params;

		// Get the function object
		let func = await funcCtrl.getOneById(funcId, { cacheKey: funcId });

		if (!func) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such helper function with the provided id '%s' exists.",
					funcId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (func.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a helper function with the provided id '%s'",
					funcId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign function data
		req.func = func;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
