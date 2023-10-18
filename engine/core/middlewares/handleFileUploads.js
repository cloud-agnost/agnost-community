import multer from "multer";
import config from "config";
import ERROR_CODES from "../config/errorCodes.js";

const upload = multer({
	storage: multer.diskStorage({
		destination: config.get("general.fileStorageFolder"),
		filename: function (req, file, cb) {
			cb(null, `${helper.generateFileName()}-${file.originalname}`);
		},
	}),
}).any();

// Multer is required to process file uploads and make them available via req.files
export const handleFileUploads = (req, res, next) => {
	upload(req, res, function (err) {
		if (console.stdlog) console.log("Checking file uploads");
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
