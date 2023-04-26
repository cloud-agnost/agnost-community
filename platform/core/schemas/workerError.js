import mongoose from "mongoose";
import helper from "../util/helper.js";

/**
 * Keeps track of the internal engine worker errors
 */
export const WorkerErrorModel = mongoose.model(
	"worker_error",
	new mongoose.Schema({
		orgId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "organization",
			index: true,
			required: true,
		},
		appId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "app",
			index: true,
			required: true,
		},
		envId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "environment",
			index: true,
			required: true,
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

// Handle errors in engine workers
export const handleWorkerError = (errorMessage) => {
	// Save the worker error to the errors collection, do not wait for the save operation to complete and write it fast
	new WorkerErrorModel({
		errorMessage,
	}).save({ w: 0 });
};
