import mongoose from "mongoose";
import { query } from "express-validator";

/**
 * Account is the top level model which will hold the list of organizations, under organization there will be users and apps etc.
 * Whenever a new users signs up a personal account with 'Admin' role will be creted. When a user joins to an organization, a new account entry
 * will be added for the user with the specified role type
 */
export const AuditModel = mongoose.model(
	"audit",
	new mongoose.Schema({
		// Object type e.g., user, organization, app etc.
		object: {
			type: String,
			required: true,
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
		dbId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "database",
			index: true,
		},
		modelId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "model",
			index: true,
		},
		fieldId: {
			type: mongoose.Schema.Types.ObjectId,
			index: true,
		},
		resourceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "resource",
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
		middlewareId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "middleware",
			index: true,
		},
		queueId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "queue",
			index: true,
		},
		taskId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "task",
			index: true,
		},
		storageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "storage",
			index: true,
		},
		cacheId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "cache",
			index: true,
		},
		functionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "function",
			index: true,
		},
		domainId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "domain",
			index: true,
		},
		// Action type e.g., create, update, delete, deploy, merge
		action: {
			type: String,
			required: true,
			index: true,
		},
		// Info about the person who took the action
		actor: {
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
				index: true,
			},
			name: {
				type: String,
				index: true,
			},
			pictureUrl: {
				type: String,
			},
			color: {
				// If no picture provided then this will be the avatar background color of the user
				type: String,
			},
			loginEmail: {
				type: String,
				index: true,
			},
			contactEmail: {
				type: String,
				index: true,
			},
		},
		// Descriptive text about the action (e.g., created app 'my app')
		description: {
			type: String,
		},
		// Data of the action e.g., if an app is created then the created app object data
		data: {
			type: mongoose.Schema.Types.Mixed,
		},
		// Datetime of the action. Audit logs are kept only for 3 months and any older logs will be automatically deleted
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
			immutable: true,
			//expire records after 1 year
			expires: helper.constants["3months"],
		},
		__v: {
			type: Number,
			select: false,
		},
	})
);

export const applyRules = (type) => {
	switch (type) {
		case "view-logs":
			return [
				query("start")
					.trim()
					.optional()
					.isISO8601({ strict: true, strictSeparator: true })
					.withMessage(t("Not a valid ISO 8061 date-time"))
					.toDate(),
				query("end")
					.trim()
					.optional()
					.isISO8601({ strict: true, strictSeparator: true })
					.withMessage(t("Not a valid ISO 8061 date-time"))
					.toDate(),
				query("page")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
					})
					.withMessage(
						t("Page number needs to be a positive integer or 0 (zero)")
					)
					.toInt(),
				query("size")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: config.get("general.minPageSize"),
						max: config.get("general.maxPageSize"),
					})
					.withMessage(
						t(
							"Page size needs to be an integer, between %s and %s",
							config.get("general.minPageSize"),
							config.get("general.maxPageSize")
						)
					)
					.toInt(),
			];
		default:
			return [];
	}
};
