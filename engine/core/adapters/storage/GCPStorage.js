import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations on the AWS S3 storage
 */
export class GCPStorage extends StorageBase {
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
		// Create the bucket in GCP Storage. We use the id of the bucket instead of its name to create it.
		const bucket = this.driver.bucket(name);
		const exists = (await bucket.exists())[0];
		if (!exists) {
			await bucket.create({
				multiRegional: true,
				standard: true,
			});
		}
	}

	/**
	 * Deletes the bucket and all objects (e.g., files) inside the bucket.
	 *
	 * @param {string} name The bucket name
	 */
	async deleteBucketUsingDriver(name) {
		const bucket = this.driver.bucket(name);
		const exists = (await bucket.exists())[0];
		if (exists) {
			await bucket.deleteFiles({ force: true });
			await bucket.delete({ ignoreNotFound: true });
		}
	}

	/**
	 * Empties the contents of a bucket in storage.
	 *
	 * @param {string} name The bucket name
	 */
	async emptyBucketUsingDriver(name) {
		const bucket = this.driver.bucket(name);
		const exists = (await bucket.exists())[0];
		if (exists) {
			await bucket.deleteFiles({ force: true });
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
		return new Promise(async (resolve, reject) => {
			const gcpFile = this.driver.bucket(bucketName).file(path);

			//If file already exists this rewrites to the file, if file does not exists creates the file
			readableStream
				.pipe(
					gcpFile.createWriteStream({
						metadata: {
							contentType: contentType,
						},
					})
				)
				.on("error", function (err) {
					reject(err);
				})
				.on("finish", async () => {
					resolve();
				});
		});
	}

	/**
	 * Returns a read stream to read the contents of the file.
	 *
	 * @param {string} bucketName The name of the bucket to upload the file (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async createFileReadStreamUsingDriver(bucketName, path) {
		const gcpFile = this.driver.bucket(bucketName).file(path);
		return gcpFile.createReadStream();
	}

	/**
	 * Deletes the file stored in the bucket.
	 *
	 * @param {string} bucketName The name of the bucket (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async deleteFileUsingDriver(bucketName, path) {
		const gcpFile = this.driver.bucket(bucketName).file(path);
		await gcpFile.delete({ ignoreNotFound: true });
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
		const gcpSourceFile = this.driver
			.bucket(sourceBucketName)
			.file(sourceFilePath);
		const gcpDestFile = this.driver
			.bucket(destinationBucketName)
			.file(destinationFilePath);
		await gcpSourceFile.copy(gcpDestFile);
	}
}
