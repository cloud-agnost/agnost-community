import multer, { memoryStorage } from "multer";

// Multer is required to process file uploads and make them available via req.files.
export const handleFile = multer({
	storage: memoryStorage(),
	limits: {
		fileSize: config.get("general.maxImageSizeMB") * 1000 * 1000,
	},
});
