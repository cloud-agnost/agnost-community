import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to PostgreSQL
 */
export class PostgreSQL extends DatabaseBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.end();
		} catch (err) {}
	}
}
