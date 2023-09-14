import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to SQLServer
 */
export class SQLServer extends DatabaseBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.close();
		} catch (err) {}
	}

	/**
	 * Returns the database driver
	 */
	getDriver() {
		return this.driver;
	}
}
