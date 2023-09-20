/**
 * Runs the customer helper functions
 */
export class FunctionAdapter {
	constructor() {}

	/**
	 * Runs the custom helper function identified by the name
	 * @param  {string} functionName The name of the function to run
	 */
	async run(functionName, ...params) {
		let functionModule = null;

		// Dynamicly import the
		functionModule = await import(`../../meta/functions/${functionName}.js`);

		const funcHandler = functionModule.default;
		// Check the function module has a default exprot or not
		if (!funcHandler) {
			throw new Error(
				t(
					"The helper function '%s' code does not have a default exported function.",
					functionName
				)
			);
		}

		// Check the default exported entitity is a callable function or not
		if (
			!(
				funcHandler &&
				typeof funcHandler === "function" &&
				(funcHandler.constructor || funcHandler.call || funcHandler.apply)
			)
		) {
			throw new Error(
				t(
					"Function specified in helper function '%s' is not valid. A callable function is required.",
					functionName
				)
			);
		}

		try {
			// Run the function
			return await funcHandler(...params);
		} catch (error) {
			throw new Error(
				t(
					"An error occurred while running the '%s' helper function. %s",
					functionName,
					error.message
				)
			);
		}
	}
}
