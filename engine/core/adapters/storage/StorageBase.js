export class StorageBase {
	constructor() {}
	async disconnect() {}
	/**
	 * Creates the storage bucket if it does not exist
	 * @param  {string} bucketName Name of the bucket
	 */
	async ensureBucket(bucketName) {}
}

export default new StorageBase();
