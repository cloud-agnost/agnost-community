import onHeaders from "on-headers";
import fs from "fs";
import path from "path";

// This middleware is called after the response headers are set. Deletes the uploaded temporary files.
export const clearTemporaryFileStorage = (req, res, next) => {
	try {
		onHeaders(res, function onHeaders() {
			if (req.files?.length > 0) {
				const directoryPath = config.get("general.fileStorageFolder");
				const deleteFilesOlderThanMs =
					config.get("general.deleteFilesOlderThanMinues") * 60 * 1000;
				const thresholdTimestamp = Date.now() - deleteFilesOlderThanMs;

				fs.readdir(directoryPath, (err, files) => {
					if (err) {
						console.error("Error reading directory:", err);
						return;
					}

					// Process each file
					files.forEach((file) => {
						const filePath = path.join(directoryPath, file);
						// Use the `fs.stat` function to get file information
						fs.stat(filePath, (err, stats) => {
							if (err) {
								console.error("Error getting file stats:", err);
								return;
							}
							// Check if the file was last modified more than 1 day ago
							if (stats.mtimeMs < thresholdTimestamp) {
								// Delete the file
								fs.unlink(filePath, (err) => {});
							}
						});
					});
				});
			}
		});

		next();
	} catch (err) {}
};
