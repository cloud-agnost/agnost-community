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
	 * Creates a new bucket in storage.
	 *
	 * @param {string} name The name of the bucket to create (case sensitive).
	 */
	async createBucketUsingDriver(name) {
		// Get a reference to a container
		const containerClient = this.driver.getContainerClient(name);
		// Create the container
		await containerClient.create();
	}

	/**
	 * Deletes the bucket and all objects (e.g., files) inside the bucket.
	 *
	 * @param {string} name The bucket name
	 */
	async deleteBucketUsingDriver(name) {
		// Get a reference to a container
		const containerClient = this.driver.getContainerClient(name);
		// Delete the container
		await containerClient.delete();
	}

	/**
	 * Empties the contents of a bucket in storage.
	 *
	 * @param {string} name The bucket name
	 */
	async emptyBucketUsingDriver(name) {
		// Create a BlobBatchClient to perform batch operations
		const batchClient = this.driver.getBlobBatchClient();
		// Get a reference to the container
		const containerClient = this.driver.getContainerClient(name);
		// Delete blobs in batches of 1000
		const batchSize = config.get("general.batchBucketFileDeleteSize");

		// List blobs in batches
		for await (const blobList of containerClient.listBlobsFlat().byPage({
			maxPageSize: batchSize,
		})) {
			// Get the blob names from the current batch
			const blobsToDelete = blobList.segment.blobItems.map((blob) =>
				containerClient.getBlockBlobClient(blob.name)
			);

			if (blobsToDelete.length > 0) {
				// Submit the batch to execute the deletions
				await batchClient.deleteBlobs(blobsToDelete);
			}
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
		// Get a reference to the container
		const containerClient = this.driver.getContainerClient(bucketName);
		// Get a block blob client
		const blockBlobClient = containerClient.getBlockBlobClient(path);

		// Upload the file using the readable stream and set the content type
		await blockBlobClient.uploadStream(readableStream, undefined, undefined, {
			blobHTTPHeaders: { blobContentType: contentType },
		});
	}

	/**
	 * Returns a read stream to read the contents of the file.
	 *
	 * @param {string} bucketName The name of the bucket to upload the file (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async createFileReadStreamUsingDriver(bucketName, path) {
		// Get a reference to the container
		const containerClient = this.driver.getContainerClient(bucketName);
		// Get a block blob client
		const blockBlobClient = containerClient.getBlockBlobClient(path);

		// Download the file as a buffer, data returns in a Readable stream readableStreamBody
		const downloadResponse = await blockBlobClient.download(0);
		return downloadResponse.readableStreamBody;
	}

	/**
	 * Deletes the file stored in the bucket.
	 *
	 * @param {string} bucketName The name of the bucket (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async deleteFileUsingDriver(bucketName, path) {
		// Get a reference to the container
		const containerClient = this.driver.getContainerClient(bucketName);
		// Get a block blob client
		const blockBlobClient = containerClient.getBlockBlobClient(path);
		// Delete the file (blob)
		await blockBlobClient.delete();
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
		// Get a reference to the container
		const containerClient = this.driver.getContainerClient(sourceBucketName);
		// Get a block blob client
		const sourceBlockBlobClient =
			containerClient.getBlockBlobClient(sourceFilePath);

		// Get a block blob client for the destination file
		const destinationBlockBlobClient =
			containerClient.getBlockBlobClient(destinationFilePath);

		// Start the copy operation
		await destinationBlockBlobClient.startCopyFromURL(
			sourceBlockBlobClient.url
		);
	}
}
