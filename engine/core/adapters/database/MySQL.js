import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to MySQL
 */
export class MySQL extends DatabaseBase {
	constructor(driver) {
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.end();
		} catch (err) {}
	}
}
