import ERROR_CODES from "../config/errorCodes.js";

// Endpoint handler function
export const runHandler = (endpoint) => async (req, res) => {
	let handlerModule = null;
	try {
		// Dynamicly import the
		handlerModule = await import(`../meta/endpoints/${endpoint.name}.js`);

		const handlerFunction = handlerModule.default;
		// Check the endpoint module has a default exprot or not
		if (!handlerFunction) {
			return returnError(
				res,
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
				res,
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
		} catch (error) {
			return returnError(
				res,
				endpoint,
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.endpointExecutionError,
					t(
						"An error occurred while executing the '%s' endpoint handler function.",
						endpoint.name
					),
					{
						name: error.name,
						code: error.code,
						message: error.message,
						specifics: error.specifics,
						stack: error.stack,
					}
				)
			);
		}
	} catch (error) {
		return returnError(
			res,
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
 * @param  {Object} res The express response object
 * @param  {Object} endpoint The endpoint object
 * @param  {Object} errorObj The error object
 * @param  {Number} status The HTTP response status code
 */
function returnError(res, endpoint, errorObj, status = 400) {
	console.error(
		t(
			`'${endpoint.name}' had errors while processsing the request.\n %s`,
			JSON.stringify(errorObj, null, 2)
		)
	);

	return res.status(status).json(errorObj);
}
