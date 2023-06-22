import mwCtrl from "../controllers/middleware.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateMiddleware = async (req, res, next) => {
	try {
		const { mwId } = req.params;

		// Get the database object
		let mw = await mwCtrl.getOneById(mwId, { cacheKey: mwId });

		if (!mw) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such middleware with the provided id '%s' exists.",
					mwId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (mw.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a middleware with the provided id '%s'",
					mwId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign middleware data
		req.mw = mw;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
