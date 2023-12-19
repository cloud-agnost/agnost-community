import epCtrl from "../controllers/endpoint.js";
import mwCtrl from "../controllers/middleware.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateEndpoint = async (req, res, next) => {
	try {
		const { epId } = req.params;

		// Get the endpoint object
		let ep = await epCtrl.getOneById(epId, { cacheKey: epId });

		if (!ep) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("No such endpoint with the provided id '%s' exists.", epId),
				code: ERROR_CODES.notFound,
			});
		}

		if (ep.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have an endpoint with the provided id '%s'",
					epId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign middleware data
		req.ep = ep;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const loadMiddlewares = async (req, res, next) => {
	try {
		// Get the database object
		let mws = await mwCtrl.getManyByQuery(
			{ versionId: req.version._id }
			// { projection: "-logic" }
		);

		// Assign middlewares data
		req.mws = mws;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
