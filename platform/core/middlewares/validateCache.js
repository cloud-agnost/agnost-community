import cacheCtrl from "../controllers/cache.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateCache = async (req, res, next) => {
	try {
		const { cacheId } = req.params;

		// Get the cache object
		let cache = await cacheCtrl.getOneById(cacheId, {
			cacheKey: cacheId,
		});

		if (!cache) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("No such cache with the provided id '%s' exists.", cacheId),
				code: ERROR_CODES.notFound,
			});
		}

		if (cache.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a cache with the provided id '%s'",
					cacheId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign cache data
		req.cache = cache;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
