import { CacheBase } from "./CacheBase.js";

/**
 * Manages read and write operations to Redis
 */
export class Redis extends CacheBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	async disconnect() {
		try {
			this.driver.quit();
		} catch (err) {}
	}
}
