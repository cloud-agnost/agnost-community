import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations on the AWS S3 storage
 */
export class AzureStorage extends StorageBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	/**
	 * Creates the storage bucket if it does not exist
	 * @param  {string} bucketName Name of the bucket
	 */
	async ensureBucket(bucketName) {
		let containerClient = null;
		try {
			containerClient = this.driver.getContainerClient(bucketName);
			await containerClient.getProperties();
		} catch (err) {
			if (err.statusCode === 404) {
				await containerClient?.create();
			}
		}
	}
}
