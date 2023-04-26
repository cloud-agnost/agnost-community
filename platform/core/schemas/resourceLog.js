import mongoose from "mongoose";
import { body } from "express-validator";
import { resourceActions, resourceStatuses } from "../config/constants.js";

/**
 * Keeps the list of deployment
 */
export const ResourceLogModel = mongoose.model(
	"resource_log",
	new mongoose.Schema({
		orgId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "organization",
			index: true,
		},
		resourceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "resource",
			index: true,
		},
		action: {
			type: String,
			index: true,
			enum: resourceActions,
			required: true,
		},
		status: {
			type: String,
			index: true,
			enum: resourceStatuses,
			required: true,
		},
		// Resouce operation logs
		logs: { type: String },
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
			immutable: true,
			//expire records after 6 months
			expires: helper.constants["6months"],
		},
		// Last telemetry update for this environment
		updatedAt: { type: Date, default: Date.now },
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		},
		__v: {
			type: Number,
			select: false,
		},
	})
);

export const applyRules = (type) => {
	switch (type) {
		case "update":
			return [
				body("status")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(resourceStatuses)
					.withMessage(t("Unsupported environment status")),
				body("logs")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		default:
			return [];
	}
};
