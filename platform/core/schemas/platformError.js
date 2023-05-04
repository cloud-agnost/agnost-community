import mongoose from "mongoose";
import helper from "../util/helper.js";
import ERROR_CODES from "../config/errorCodes.js";

/**
 * Keeps track of the internal platform errors
 */
export const PlatformErrorModel = mongoose.model(
	"platform_error",
	new mongoose.Schema({
		// e.g., platform-core, platform-worker
		source: {
			type: String,
			index: true,
		},
		// Error name (fetched from error exception)
		name: {
			type: String,
		},
		// Error message (fetched from error exception)
		message: {
			type: String,
		},
		// Longer error messsage
		details: {
			type: String,
		},
		// For errors originated from express routes
		baseUrl: {
			type: String,
			index: true,
		},
		// For errors originated from express routes
		originalUrl: {
			type: String,
		},
		// Error code
		code: {
			type: String,
			index: true,
		},
		// Error stack (fetched from error exception)
		stack: {
			type: String,
		},
		// Input parameters that caused the error
		payload: {
			type: mongoose.Schema.Types.Mixed,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
			immutable: true,
			//expire records after 1 month
			expires: helper.constants["1month"],
		},
		__v: {
			type: Number,
			select: false,
		},
	})
);

// Handle exceptions in route handlers
export const handleError = (req, res, error) => {
	let entry = {
		code: ERROR_CODES.internalServerError,
		name: error.name,
		message: error.message,
		stack: error.stack,
	};

	if (error.name === "CastError") {
		entry.error = t("Not Found");
		entry.details = t("The object identifier is not recognized.");
		res.status(400).json(entry);
	} else {
		entry.error = t("Internal Server Error");
		entry.details = t(
			"The server has encountered a situation it does not know how to handle."
		);
		res.status(500).json(entry);
	}

	// Log also the error message in console
	logger.info(JSON.stringify(entry, null, 2));

	// Save the error to the errors collection, do not wait for the save operation to complete and write it fast
	new PlatformErrorModel({
		...entry,
		source: "platform-core",
		payload: { body: req.body, query: req.query, params: req.params },
		baseUrl: req.baseUrl,
		originalUrl: req.originalUrl,
	}).save({ w: 0 });
};

// Handle overall exceptions
export const handleException = (error, details, name, message, stack) => {
	let entry = {
		code: ERROR_CODES.internalServerError,
		source: "platform-core",
		error,
		details,
		name,
		message,
		stack,
	};

	// Log also the error message in console
	logger.info(JSON.stringify(entry, null, 2));

	// Save the error to the errors collection, do not wait for the save operation to complete and write it fast
	new PlatformErrorModel(entry).save({ w: 0 });
};
