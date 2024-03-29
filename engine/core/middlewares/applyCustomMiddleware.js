import ERROR_CODES from "../config/errorCodes.js";

// Custom middlewares added to the endpoint
export const applyCustomMiddleware =
	(endpoint, middleware, loaderQuery = null) =>
	async (req, res, next) => {
		let middlewareModule = null;
		if (console.stdlog)
			console.log("Applying custom middleware:", middleware.name);

		try {
			// Dynamicly import the
			middlewareModule = await import(
				`../meta/middlewares/${middleware.name.replaceAll(" ", "_")}.js${
					loaderQuery ? "?" + loaderQuery : ""
				}`
			);

			const middlewareFunction = middlewareModule.default;
			// Check the middleware module has a default exprot or not
			if (!middlewareFunction) {
				return returnError(
					res,
					middleware,
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.missingDefaultExport,
						t(
							"The middleware '%s' code does not have a default exported function.",
							middleware.name
						)
					)
				);
			}

			// Check the default exported entitity is a callable function or not
			if (
				!(
					(middlewareFunction &&
						typeof middlewareFunction === "function" &&
						(middlewareFunction.constructor ||
							middlewareFunction.call ||
							middlewareFunction.apply)) ||
					(Array.isArray(middlewareFunction) &&
						middlewareFunction.every(
							(entry) =>
								entry &&
								typeof entry === "function" &&
								(entry.constructor || entry.call || entry.apply)
						))
				)
			) {
				return returnError(
					res,
					middleware,
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.invalidFunction,
						t(
							"Function specified in middleware '%s' is not valid. A callable function is required.",
							middleware.name
						)
					)
				);
			}

			try {
				// Run the function(s)
				if (Array.isArray(middlewareFunction)) {
					for (let i = 0; i < middlewareFunction.length; i++) {
						let nextCalled = false;
						if (i == middlewareFunction.length - 1)
							await middlewareFunction[i](req, res, next);
						else
							await middlewareFunction[i](req, res, () => {
								nextCalled = true;
							});

						if (!nextCalled) break;
					}
				} else {
					await middlewareFunction(req, res, next);
				}
			} catch (error) {
				return returnError(
					res,
					middleware,
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.middlewareExecutionError,
						t(
							"An error occurred while executing the '%s' middleware in '%s' endpoint. %s",
							middleware.name,
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
				res,
				middleware,
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.middlewareImportError,
					t(
						"An error occurred while importing the '%s' middleware module in '%s' endpoint. %s",
						middleware.name,
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
 * @param  {Object} middleware The middleware object
 * @param  {Object} errorObj The error object
 * @param  {Number} status The HTTP response status code
 */
function returnError(res, middleware, errorObj, status = 400) {
	console.error(
		t(
			`'${middleware.name}' had errors during execution.\n %s`,
			JSON.stringify(errorObj, null, 2)
		)
	);

	return res.status(status).json(errorObj);
}
