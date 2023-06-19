import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to Oracle
 */
export class Oracle extends DatabaseBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	async disconnect() {
		try {
		} catch (err) {}
	}
}
