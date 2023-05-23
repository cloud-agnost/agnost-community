import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to MongoDB
 */
export class MongoDB extends DatabaseBase {
	constructor(driver) {
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.close();
		} catch (err) {}
	}
}
