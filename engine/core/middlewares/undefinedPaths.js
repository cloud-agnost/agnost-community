import ERROR_CODES from "../config/errorCodes.js";

// Middleware to handle undefined paths
export const handleUndefinedPaths = (req, res) => {
	return res.status(404).json(
		helper.createErrorMessage(
			ERROR_CODES.clientError,
			ERROR_CODES.resourceNotFound,
			t("The API server can not find the requested resource."),
			{
				method: req.method,
				path: req.path,
				url: req.url,
			}
		)
	);
};
