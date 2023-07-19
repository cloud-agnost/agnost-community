import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations to the MinIO cluster storage
 */
export class MinIOStorage extends StorageBase {
	/**
	 * For PVC storage under the mounth path we will create folders for each environment of the app identified by the environment iid
	 */
	constructor(driver) {
		super();
		this.driver = driver;
	}

	/**
	 * Creates a new bucket in storage and returns the created bucket metadata.
	 * @param {object} storage The storage object metadata
	 * @param {string} name The name of the bucket to create (case sensitive).
	 * @param {boolean} isPublic The default privacy setting that will be applied to the files uploaded to this bucket.
	 * @param {object} tags JSON object (key-value pairs) that will be added to the bucket metadata.
	 * @param {string} userId The unique identifier of the user who created the bucket.

	 */
	async createBucket(storage, name, isPublic = true, tags = {}, userId = null) {
		// First get whether there is already a bucket with the provided name
		const bucketInfo = await this.getBucketMetadata(storage.iid, name);
		if (bucketInfo) {
			throw new AgnostError(
				t("A bucket with the provided name '%s' already exists.", name)
			);
		}

		const dtm = new Date();
		const id = helper.generateSlug("bck");
		const metadata = {
			id,
			storageId: storage.iid,
			name,
			isPublic,
			createdAt: dtm,
			updatedAt: dtm,
			tags: tags ?? undefined,
			userId: userId ?? undefined,
		};

		// Create the bucket in MinIO
		await await this.driver.makeBucket(name);
		// Create the bucket metada entry in the database
		await this.saveBucketMetadata(metadata);

		return metadata;
	}
}
