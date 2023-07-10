import mongoose from "mongoose";
import { body } from "express-validator";
import {
	envActions,
	envStatuses,
	logStatuses,
	envLogTypes,
} from "../config/constants.js";

/**
 * Keeps the list of deployment
 */
export const EnvironmentLogModel = mongoose.model(
	"environment_log",
	new mongoose.Schema({
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
		action: {
			type: String,
			index: true,
			enum: envActions,
			required: true,
		},
		dbStatus: {
			type: String,
			index: true,
			enum: envStatuses,
		},
		serverStatus: {
			type: String,
			index: true,
			enum: envStatuses,
		},
		schedulerStatus: {
			type: String,
			index: true,
			enum: envStatuses,
		},
		// Deployment log status
		dbLogs: [
			{
				startedAt: { type: Date },
				status: { type: String, enum: logStatuses },
				message: { type: String },
			},
		],
		serverLogs: [
			{
				startedAt: { type: Date },
				status: { type: String, enum: logStatuses },
				message: { type: String },
			},
		],
		schedulerLogs: [
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
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(envLogTypes)
					.withMessage(t("Unsupported environment log type")),
				body("status")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(envStatuses)
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
