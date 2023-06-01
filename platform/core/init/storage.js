import fs from "fs";

class Storage {
	constructor() {}

	/**
	 * Checks if a file exists in file storage or not
	 * @param  {string} filePath The file path
	 */
	fileExists(filePath) {
		try {
			fs.accessSync(filePath);
			return true; // File exists
		} catch (error) {
			return false; // File does not exist
		}
	}

	/**
	 * Checks if a folder exists or not. If not creates the folder
	 * @param  {string} folderPath The folder path
	 */
	ensureFolder(folderPath) {
		// Create the directory if it doesn't exist
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}
	}

	/**
	 * Saves the contents of the file to the file path
	 * @param  {string} filePath The file path
	 * @param  {Buffer} contents The contents of the file
	 */
	saveFile(filePath, contents) {
		// Write the image to the disk
		fs.writeFileSync(filePath, contents);
	}

	/**
	 * Deletes the file at file path
	 * @param  {string} filePath The file path
	 */
	deleteFile(filePath) {
		if (!filePath) return;

		try {
			fs.unlinkSync(filePath);
		} catch (error) {}
	}
}

// Create the GCP storage instance
export const storage = new Storage();
