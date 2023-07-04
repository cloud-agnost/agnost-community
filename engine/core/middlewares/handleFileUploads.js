import multer from "multer";
import ERROR_CODES from "../config/errorCodes.js";

// Multer is required to process file uploads and make them available via req.files
export const handleFileUploads = (req, res, next) => {
	const upload = multer({
		storage: multer.diskStorage({
			destination: config.get("general.fileStorageFolder"),
			filename: function (req, file, cb) {
				cb(null, `${helper.generateFileName()}-${file.originalname}`);
			},
		}),
	}).any();

	upload(req, res, function (err) {
		if (err) {
			return res
				.status(400)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.fileUploadError,
						t("Cannot upload file. %s", err.message)
					)
				);
		}
		next();
	});
};
