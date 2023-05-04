import mongoose from "mongoose";
import helper from "../util/helper.js";
import { engineErrorType } from "../config/constants.js";

/**
 * Keeps track of the internal engine errors
 */
export const EngineErrorModel = mongoose.model(
	"engine_error",
	new mongoose.Schema({
		// e.g., engine-core, engine-worker
		source: {
			type: String,
			index: true,
		},
		orgId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "organization",
			index: true,
		},
		appId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "app",
			index: true,
		},
		versionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "version",
			index: true,
		},
		envId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "environment",
			index: true,
		},
		endpointId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "endpoint",
			index: true,
		},
		queueId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "queue",
			index: true,
		},
		cronjobId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "cronjob",
			index: true,
		},
		type: {
			type: String,
			index: true,
			enum: engineErrorType,
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
export const handleEngineError = (errorMessage) => {
	// Save the worker error to the errors collection, do not wait for the save operation to complete and write it fast
	if (errorMessage) {
		new EngineErrorModel(errorMessage).save({ w: 0 });
	}
};
