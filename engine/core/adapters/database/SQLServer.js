import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to SQLServer
 */
export class SQLServer extends DatabaseBase {
	constructor(driver) {
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.close();
		} catch (err) {}
	}
}
