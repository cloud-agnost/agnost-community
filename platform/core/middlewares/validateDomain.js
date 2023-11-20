import dmnCtrl from "../controllers/domain.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateDomain = async (req, res, next) => {
	try {
		const { domainId } = req.params;

		// Get the domain object
		let domain = await dmnCtrl.getOneById(domainId, {
			cacheKey: domainId,
		});

		if (!domain) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such domain entry with the provided id '%s' exists.",
					domainId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (domain.versionId.toString() !== req.version._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App version does not have a domain entry with the provided id '%s'",
					domainId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign domain data
		req.domain = domain;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
