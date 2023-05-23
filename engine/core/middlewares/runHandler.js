import ERROR_CODES from "../config/errorCodes.js";

// Endpoint handler function
export const runHandler = async (endpoint) => async (req, res) => {
	let handlerModule = null;
	const debugChannel = req.header("X-Debug-Session");
	// If we have a debug channel then turn on debug logging
	if (debugChannel) helper.turnOnLogging(debugChannel);
	try {
		// Dynamicly import the
		handlerModule = await import(`../meta/endpoints/${endpoint.iid}.js`);

		const handlerFunction = handlerModule.default;
		// Check the endpoint module has a default exprot or not
		if (!handlerFunction) {
			return returnError(
				debugChannel,
				endpoint,
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingDefaultExport,
					t(
						"The endpoint '%s' code does not have a default exported function.",
						endpoint.name
					)
				)
			);
		}

		// Check the default exported entitity is a callable function or not
		if (
			!(
				handlerFunction &&
				typeof handlerFunction === "function" &&
				(handlerFunction.constructor ||
					handlerFunction.call ||
					handlerFunction.apply)
			)
		) {
			return returnError(
				debugChannel,
				endpoint,
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.invalidFunction,
					t(
						"Function specified in endpoint '%s' is not valid. A callable function is required.",
						endpoint.name
					)
				)
			);
		}

		try {
			// Run the function
			await handlerFunction(req, res);
			// If we have a debug channel then turn off debug logging
			if (debugChannel) helper.turnOffLogging();
		} catch (error) {
			return returnError(
				debugChannel,
				endpoint,
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.endpointExecutionError,
					t(
						"An error occurred while executing the '%s' endpoint handler function. %s",
						endpoint.name,
						error.message
					),
					{
						name: error.name,
						message: error.message,
						stack: error.stack,
					}
				)
			);
		}
	} catch (error) {
		return returnError(
			debugChannel,
			endpoint,
			helper.createErrorMessage(
				ERROR_CODES.clientError,
				ERROR_CODES.endpointImportError,
				t(
					"An error occurred while importing the '%s' endpoint module. %s",
					endpoint.name,
					error.message
				),
				{
					name: error.name,
					message: error.message,
					stack: error.stack,
				}
			)
		);
	}
};

/**
 * Helper function to return error message
 * @param  {string} debugChannel The debug channel unique id for realtime messages
 * @param  {Object} endpoint The endpoint object
 * @param  {Object} errorObj The error object
 * @param  {Number} status The HTTP response status code
 */
function returnError(debugChannel, endpoint, errorObj, status = 400) {
	if (debugChannel) {
		console.error(
			t(
				`'${endpoint.name}' had errors while processsing the request.\n %s`,
				JSON.stringify(errorObj, null, 2)
			)
		);
		helper.turnOffLogging();
	}

	return res.status(status).json(errorObj);
}
