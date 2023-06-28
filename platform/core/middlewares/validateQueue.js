import queueCtrl from "../controllers/middleware.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateQueue = async (req, res, next) => {
	try {
		const { queueId } = req.params;

		// Get the database object
		let queue = await queueCtrl.getOneById(queueId, { cacheKey: queueId });

		if (!queue) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("No such queue with the provided id '%s' exists.", queueId),
				code: ERROR_CODES.notFound,
			});
		}

		if (queue.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a queue with the provided id '%s'",
					queueId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign queue data
		req.queue = queue;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
