import mongoose from "mongoose";
import { methodTypes } from "../config/constants.js";

/**
 * Node.js express endpoint definition
 */
export const EndpointModel = mongoose.model(
	"endpoint",
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
			method: {
				type: String,
				required: true,
				enum: methodTypes,
			},
			// The path of the endpoint in name1/:id1/name2/:id2/.... etc.
			path: {
				type: String,
				required: true,
			},
			// The path finterprint of the endpoint in name1/:id/name2/:id/.... etc.
			// The difference between path and finterprint is that instead of specific id names we use standart {id} names
			fingerprint: {
				type: String,
			},
			apiKeyRequired: {
				type: Boolean,
				default: false,
			},
			sessionRequired: {
				type: Boolean,
				default: false,
			},
			logExecution: {
				type: Boolean,
				default: true,
			},
			code: {
				type: String,
				index: true,
				default: "",
			},
			rateLimits: {
				type: [String], // Array of rate limit iids
				default: [],
			},
			middlewares: {
				type: [String], // Array of middleware iids
				default: [],
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
