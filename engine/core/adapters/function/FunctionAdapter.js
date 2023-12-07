/**
 * Runs the customer helper functions
 */
export class FunctionAdapter {
	constructor(manager) {
		this.manager = manager;
	}

	/**
	 * Runs the custom helper function identified by the name
	 * @param  {string} functionName The name of the function to run
	 */
	async run(functionName, ...params) {
		let functionModule = null;

		try {
			// Dynamicly import the
			functionModule = await import(
				`../../meta/functions/${functionName}.js${
					this.manager.getModuleLoaderQuery()
						? "?" + this.manager.getModuleLoaderQuery()
						: ""
				}`
			);
		} catch (err) {
			throw new AgnostError(
				t(
					"An error occurred while importing the helper function '%s' module. %s",
					functionName,
					err.message
				)
			);
		}

		const funcHandler = functionModule.default;
		// Check the function module has a default exprot or not
		if (!funcHandler) {
			throw new AgnostError(
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
			throw new AgnostError(
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
			throw new AgnostError(
				t(
					"An error occurred while running the '%s' helper function. %s",
					functionName,
					error.message
				)
			);
		}
	}
}
