import * as Minio from "minio";

class Storage {
	constructor() {
		this.minioClient = new Minio.Client({
			endPoint: process.env.MINIO_ENDPOINT, // Kubernetes service name for MinIO
			port: parseInt(process.env.MINIO_PORT, 10), // MinIO service port (default: 9000)
			useSSL: false, // Whether to use SSL (default: false)
			accessKey: process.env.MINIO_ACCESS_KEY, // MinIO access key
			secretKey: process.env.MINIO_SECRET_KEY, // MinIO secret key
		});
	}

	/**
	 * Checks if a bucket exists or not. If not creates the bucket.
	 * @param  {string} bucketName The bucket name
	 */
	async ensureBucket(bucketName) {
		const exists = await this.minioClient.bucketExists(bucketName);
		if (!exists) {
			await this.minioClient.makeBucket(bucketName);
		}
	}

	/**
	 * Saves the contents of the file to the file path
	 * @param  {string} bucketName The bucket name
	 * @param  {string} fileName The file name
	 * @param  {Buffer} contents The contents of the file
	 */
	async saveFile(bucketName, fileName, contents) {
		try {
			await this.minioClient.putObject(bucketName, fileName, contents);
		} catch (err) {}
	}

	/**
	 * Deletes the file stored in bucket
	 * @param  {string} bucketName The bucket name
	 * @param  {string} fileName The file name
	 */
	async deleteFile(bucketName, fileName) {
		if (!bucketName || !fileName) return;

		try {
			await this.minioClient.removeObject(bucketName, fileName);
		} catch (error) {}
	}
}

// Create the GCP storage instance
export const storage = new Storage();
