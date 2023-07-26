import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations to the MinIO cluster storage
 */
export class MinIOStorage extends StorageBase {
	constructor(driver) {
		super();
		this.driver = driver;
	}

	/**
	 * Creates a new bucket in storage.
	 *
	 * @param {string} name The name of the bucket to create (case sensitive).
	 */
	async createBucketUsingDriver(name) {
		// Create the bucket in MinIO. We use the id of the bucket instead of its name to create it.
		await this.driver.makeBucket(name);
	}

	/**
	 * Deletes the bucket and all objects (e.g., files) inside the bucket.
	 *
	 * @param {string} name The bucket name
	 */
	async deleteBucketUsingDriver(name) {
		// Delete bucket storage and all its associated files
		await this.driver.removeBucket(name);
	}

	/**
	 * Empties the contents of a bucket in storage.
	 *
	 * @param {object} bucketObj The bucket object metadata.
	 */
	async emptyBucketUsingDriver(bucketName) {
		const objectsToDelete = [];
		const stream = this.driver.listObjectsV2(bucketName, "", true);

		// Collect object names for deletion
		for await (const obj of stream) {
			objectsToDelete.push(obj.name);
		}

		// Delete objects in batches
		const batchSize = config.get("general.batchBucketFileDeleteSize");
		const numBatches = Math.ceil(objectsToDelete.length / batchSize);

		for (let i = 0; i < numBatches; i++) {
			const batch = objectsToDelete.splice(0, batchSize);
			await this.driver.removeObjects(bucketName, batch);
		}
	}

	/**
	 * Uploads a file to an existing bucket.
	 *
	 * @param {string} bucketName The name of the bucket to upload the file (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 * @param {Readable} readableStream The contents of the file to upload
	 * @param {string} contentType The content-type of the file
	 */
	async uploadFileUsingDriver(bucketName, path, readableStream, contentType) {
		await this.driver.putObject(bucketName, path, readableStream, undefined, {
			"Content-Type": contentType,
		});
	}

	/**
	 * Returns a read stream to read the contents of the file.
	 *
	 * @param {string} bucketName The name of the bucket to upload the file (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async createFileReadStreamUsingDriver(bucketName, path) {
		return await this.driver.getObject(bucketName, path);
	}

	/**
	 * Deletes the file stored in the bucket.
	 *
	 * @param {string} bucketName The name of the bucket (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async deleteFileUsingDriver(bucketName, path) {
		await this.driver.removeObject(bucketName, path);
	}

	/**
	 * Creates a copy of the file
	 *
	 * @param {string} sourceBucketName Source bucket
	 * @param {string} sourceFilePath Source file path
	 * @param {string} destinationBucketName Destination bucket
	 * @param {string} destinationFilePath Destination file path
	 */
	async copyFileUsingDriver(
		sourceBucketName,
		sourceFilePath,
		destinationBucketName,
		destinationFilePath
	) {
		await this.driver.copyObject(
			destinationBucketName,
			destinationFilePath,
			`/${sourceBucketName}/${sourceFilePath}`
		);
	}
}
