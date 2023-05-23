export class StorageBase {
	constructor() {}
	async disconnect() {}
	/**
	 * Sets up the storage bucket if it does not exist
	 * @param  {string} bucketName Name of the bucket, this should be the iid of the storage design element
	 */
	async ensureStorage(bucketName) {}
}

export default new StorageBase();
