import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to MySQL
 */
export class MySQL extends DatabaseBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.end();
		} catch (err) {}
	}

	/**
	 * Returns the database driver
	 */
	getDriver() {
		return this.driver;
	}
}
