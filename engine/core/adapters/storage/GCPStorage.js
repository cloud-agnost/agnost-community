import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations on the AWS S3 storage
 */
export class GCPStorage extends StorageBase {
	constructor(driver) {
		this.driver = driver;
	}

	/**
	 * Makes sure that the bucket of the environment exists
	 * @param  {string} bucketName Name of the bucket, this should be the iid of the storage design element
	 */
	async ensureStorage(bucketName) {
		let bucket = this.driver.bucket(bucketName);
		let exists = (await bucket.exists())[0];
		// If bucket already exists, then return
		if (exists) return;
		else {
			try {
				//There is no bucket created for this environment, create a new bucket
				await bucket.create({
					multiRegional: true,
					standard: true,
				});
			} catch (err) {}
		}
	}
}
