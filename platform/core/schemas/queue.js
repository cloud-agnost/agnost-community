import mongoose from "mongoose";
import { logicTypes } from "../config/constants.js";

/**
 * Message queue and its handler definition
 */
export const QueueModel = mongoose.model(
	"queue",
	new mongoose.Schema(
		{
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
			iid: {
				// Internal identifier
				type: String,
				required: true,
				index: true,
				immutable: true,
			},
			name: {
				type: String,
				required: true,
				index: true,
			},
			logExecution: {
				type: Boolean,
				default: true,
			},
			type: {
				type: String,
				required: true,
				enum: logicTypes,
				default: "code",
			},
			logic: {
				type: String,
				text: true, // Declares a full-text index
			},
			createdBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
			updatedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
			__v: {
				type: Number,
				select: false,
			},
		},
		{ timestamps: true }
	)
);

export const applyRules = (type) => {
	switch (type) {
		case "update":
		case "create":
			return [];
		default:
			return [];
	}
};
