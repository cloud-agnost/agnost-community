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
	 * Creates the storage bucket if it does not exist
	 * @param  {string} bucketName Name of the bucket
	 */
	async ensureBucket(bucketName) {
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
