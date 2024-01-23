import mongoose from "mongoose";
import { body } from "express-validator";
import {
	resourceActions,
	resourceStatuses,
	logStatuses,
} from "../config/constants.js";

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
		// The resources are primarily kept at the organization level, if a resource is added under an app
		// this field helps to filter out the resources that belong to a specific app
		appId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "app",
			index: true,
		},
		// If the resource is an engine (API server) then we also keep the version information
		versionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "version",
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
		logs: [
			{
				startedAt: { type: Date },
				status: { type: String, enum: logStatuses },
				message: { type: String },
			},
		],
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
			immutable: true,
			//expire records after 1 month
			expires: helper.constants["1month"],
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
					.withMessage(t("Required field, cannot be left empty"))
					.isArray()
					.withMessage(t("Logs need to be an array of log entries")),
				body("logs.*.startedAt")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isISO8601()
					.withMessage(t("Not a valid date & time format")),
				body("logs.*.status")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(logStatuses)
					.withMessage(t("Unsupported log status")),
				body("logs.*.message")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		default:
			return [];
	}
};
