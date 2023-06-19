import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations on the AWS S3 storage
 */
export class AWSStorage extends StorageBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	/**
	 * Makes sure that the bucket of the environment exists
	 * @param  {string} bucketName Name of the bucket, this should be the iid of the storage design element
	 */
	async ensureStorage(bucketName) {
		try {
			await this.driver.headBucket({ Bucket: bucketName }).promise();
		} catch (err) {
			if (err.code === "NotFound") {
				try {
					await this.driver.createBucket({ Bucket: bucketName }).promise();
				} catch (err) {}
			}
		}
	}
}
