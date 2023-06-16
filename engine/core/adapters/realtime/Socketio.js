import { RealtimeBase } from "./RealtimeBase.js";

/**
 * Manages message listen and dispatch operations in Socket.io
 */
export class Socketio extends RealtimeBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	async disconnect() {
		try {
			this.driver.disconnect();
		} catch (err) {}
	}
}
