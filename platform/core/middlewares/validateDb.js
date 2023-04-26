import dbCtrl from "../controllers/database.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateDb = async (req, res, next) => {
	try {
		const { dbId } = req.params;

		// Get the database object
		let db = await dbCtrl.getOneById(dbId, { cacheKey: dbId });

		if (!db) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("No such database with the provided id '%s' exists.", dbId),
				code: ERROR_CODES.notFound,
			});
		}

		if (db.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a database with the provided id '%s'",
					dbId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign database data
		req.db = db;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
