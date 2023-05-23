import ERROR_CODES from "../config/errorCodes.js";

// Custom middlewares added to the endpoint
export const applyCustomMiddleware =
	async (endpoint, middleware) => async (req, res, next) => {
		let middlewareModule = null;
		try {
			// Dynamicly import the
			middlewareModule = await import(
				`../meta/middlewares/${middleware.iid}.js`
			);

			const middlewareFunction = middlewareModule.default;
			// Check the middleware module has a default exprot or not
			if (!middlewareFunction) {
				return res
					.status(400)
					.json(
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
					middlewareFunction &&
					typeof middlewareFunction === "function" &&
					(middlewareFunction.constructor ||
						middlewareFunction.call ||
						middlewareFunction.apply)
				)
			) {
				return res
					.status(400)
					.json(
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
				// Run the function
				await middlewareFunction(req, res, next);
			} catch (error) {
				return res.status(400).json(
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
			return res.status(400).json(
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
