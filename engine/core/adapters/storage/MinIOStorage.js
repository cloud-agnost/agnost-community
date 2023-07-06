import fs from "fs";
import fsPromises from "fs/promises";

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
	 * Checks whether a folder exists or not
	 * @param  {string} path Folder path
	 */
	forderExists(path) {
		try {
			fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Creates the storage bucket if it does not exist
	 * @param  {string} bucketName Name of the bucket
	 */
	async ensureBucket(bucketName) {
		const exists = await this.driver.bucketExists(bucketName);
		if (!exists) {
			await this.minioClient.makeBucket(bucketName);
		}
	}
}
