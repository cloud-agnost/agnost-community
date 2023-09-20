import taskCtrl from "../controllers/task.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateTask = async (req, res, next) => {
	try {
		const { taskId } = req.params;

		// Get the task object
		let task = await taskCtrl.getOneById(taskId, { cacheKey: taskId });

		if (!task) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such cron job with the provided id '%s' exists.",
					taskId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (task.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a cron job with the provided id '%s'",
					taskId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign task data
		req.task = task;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
