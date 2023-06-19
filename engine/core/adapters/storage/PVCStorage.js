import fs from "fs";
import fsPromises from "fs/promises";

import { StorageBase } from "./StorageBase.js";

/**
 * Manages read and write operations on the mounted PVC of the API server pod
 */
export class PVCStorage extends StorageBase {
	/**
	 * For PVC storage under the mounth path we will create folders for each environment of the app identified by the environment iid
	 */
	constructor(mountPath) {
		super();
		this.mountPath = mountPath;
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
	 * Makes sure that the folder of the environment exists
	 * @param  {string} bucketName Name of the bucket, this should be the iid of the storage design element
	 */
	async ensureStorage(bucketName) {
		// Check if the mounth path exists, if not, do nothing
		if (this.forderExists(mountPath)) {
			// Check if environment folder exists, if yes do nothing, otherwise create the environment folder
			if (folderExists(`${mounthPath}/${bucketName}`)) return;
			else {
				try {
					await fsPromises.mkdir(`${mounthPath}/${bucketName}`, {
						recursive: true,
					});
				} catch (err) {}
			}
		}
	}
}
