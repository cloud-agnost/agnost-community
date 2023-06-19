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
	 * Makes sure that the container (bucket) of the environment exists
	 * @param  {string} bucketName Name of the bucket, this should be the iid of the storage design element
	 */
	async ensureStorage(bucketName) {
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
