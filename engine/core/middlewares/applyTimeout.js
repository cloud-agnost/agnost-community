import ERROR_CODES from "../config/errorCodes.js";

// Middleware to apply the endpoint execution duration timeout
export const applyTimeout = (endpoint) => (req, res, next) => {
	if (console.stdlog)
		console.log("Applying handler execution timeout:", endpoint.timeout);
	const timeoutHandler = setTimeout(() => {
		// Check whether the response has been sent or not
		if (!res.headersSent) {
			res
				.status(504)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.serverError,
						ERROR_CODES.requestTimedOut,
						t(
							"The request has timed out. API server could not complete the request within the specified timeout duration (%s ms)",
							endpoint.timeout
						)
					)
				);
		} else res.status(504).end();

		// Restart the process
		process.exit(1);
	}, endpoint.timeout);

	// Function to clear the timeout
	req.clearTimeout = () => {
		clearTimeout(timeoutHandler);
	};

	next();
};
