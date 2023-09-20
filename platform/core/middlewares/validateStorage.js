import storageCtrl from "../controllers/cache.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateStorage = async (req, res, next) => {
	try {
		const { storageId } = req.params;

		// Get the storage object
		let storage = await storageCtrl.getOneById(storageId, {
			cacheKey: storageId,
		});

		if (!storage) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such storage with the provided id '%s' exists.",
					storageId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (storage.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a storage with the provided id '%s'",
					storageId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign storage data
		req.storage = storage;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
