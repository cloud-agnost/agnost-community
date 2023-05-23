import { CacheBase } from "./CacheBase.js";

/**
 * Manages read and write operations to Redis
 */
export class Redis extends CacheBase {
	constructor(driver) {
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.quit();
		} catch (err) {}
	}
}
