import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations on the AWS S3 storage
 */
export class GCPStorage extends StorageBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}
}
