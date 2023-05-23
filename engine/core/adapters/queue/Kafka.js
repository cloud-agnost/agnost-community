import { QueueBase } from "./QueueBase.js";

/**
 * Manages message listen and dispatch operations in Kafka
 */
export class Kafka extends QueueBase {
	constructor(driver) {
		this.driver = driver;
	}

	async disconnect() {
		try {
			await this.driver.close();
		} catch (err) {}
	}
}
