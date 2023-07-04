import ERROR_CODES from "../config/errorCodes.js";

// Middleware to handle server status
export const checkServerStatus = (req, res, next) => {
	if (SERVER_STATUS !== "running") {
		return res.status(403).json(
			helper.createErrorMessage(
				ERROR_CODES.clientError,
				ERROR_CODES.serverNotReady,
				t(
					"The API server is in '%' status and is not ready to accept incoming requests.",
					SERVER_STATUS
				),
				{
					method: req.method,
					path: req.path,
					url: req.url,
				}
			)
		);
	}

	// Check whether environment is suspeneded or not
	if (META.isSuspended()) {
		return res
			.status(403)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.suspendedEnvironment,
					t(
						"Access to API server has been suspended, no operation can be executed until suspension has been revoked"
					)
				)
			);
	}

	next();
};
