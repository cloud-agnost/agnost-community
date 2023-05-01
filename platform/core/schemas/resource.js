import mongoose from "mongoose";
import { body, query } from "express-validator";
import {
	resourceTypes,
	instanceTypes,
	appRoles,
	resourceStatuses,
} from "../config/constants.js";

import accessEngineRules from "./access/engine.js";
import accessDatabaseRules from "./access/database.js";

/**
 * Resources are the actual instances of IaaS or PaaS from specific providers. There resources can be managed by the platform or
 * managed by app developers. Resources are also mapped in environments to specific app design elements.
 *
 */
export const ResourceModel = mongoose.model(
	"resource",
	new mongoose.Schema(
		{
			orgId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "organization",
				index: true,
			},
			iid: {
				// Internal identifier
				type: String,
				required: true,
				index: true,
				immutable: true,
			},
			// The resources are primarily kept at the organization level, if a resource is added under an app
			// this field helps to filter out the resources that belong to a specific app
			appId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "app",
				index: true,
			},
			name: {
				type: String,
				required: true,
				index: true,
			},
			// General type of the resource
			type: {
				type: String,
				required: true,
				index: true,
				enum: resourceTypes,
			},
			// Specific technology type
			instance: {
				type: String,
				required: true,
			},
			// Whether this resource is managed by the platform or not
			managed: {
				type: Boolean,
				required: true,
				default: false,
			},
			// The list of app roles that can access to this resource and use in environment resource mappings besides the "Admin" role
			// App "Admin" role will always be added to the allowedRoles list
			allowedRoles: {
				type: [String],
				index: true,
			},
			// Populated only for managed resources
			config: {
				type: mongoose.Schema.Types.Mixed,
			},
			// For each resouce we need to have the relevant connection information to acccess the resource
			access: {
				type: mongoose.Schema.Types.Mixed,
			},
			// Typically for redis or some databases we might have a read only replica, this holds the read only replica acces settings
			accessReadOnly: {
				type: mongoose.Schema.Types.Mixed,
			},
			// Whether the resource can be deleted or not. Default engine cluster in community edition cannot be deleted.
			deletable: {
				type: Boolean,
				required: true,
				default: false,
			},
			// Resource status
			status: {
				type: String,
				index: true,
				enum: resourceStatuses,
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
		case "create":
			return [
				body("appId")
					.trim()
					.optional()
					.custom((value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid app identifier"));

						return true;
					}),
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					),
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(resourceTypes)
					.withMessage(t("Unsupported resource type")),
				body("instance")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						let instanceList = instanceTypes[req.body.type];
						if (!instanceList)
							throw new AgnostError(
								t(
									"Cannot identify the instance types for the provided resource type"
								)
							);

						if (!instanceList.includes(value))
							throw new AgnostError(
								t(
									"Not a valid instance type for respource type '%s'",
									req.body.type
								)
							);

						return true;
					}),
				body("managed")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("allowedRoles")
					.isArray()
					.withMessage(t("Allowed roles needs to be an array of strings")),
				body("allowedRoles.*")
					.if((value, { req }) => {
						if (Array.isArray(req.body.allowedRoles)) return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t("Allowed role needs to be provided, cannot be left empty")
					)
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported app role")),
				body("config")
					.if((value, { req }) => {
						// Local engine cluster we do not need configuration settings
						if (req.body.managed === false) return false;
						else return true;
					})
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isObject()
					.withMessage(t("Not a valid resource configuration"))
					.bail()
					.custom((value, { req }) => {
						// This is where we perform the resource configuation checks
						return true;
					}),
				body("access")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (typeof value !== "object" || Array.isArray(value))
							throw new AgnostError(t("Not a valid resource access setting"));

						return true;
					})
					.custom((value, { req }) => {
						return true;
					}),
				...accessEngineRules,
				...accessDatabaseRules,
			];
		case "get-resources":
			return [
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
		case "update":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					),
				body("allowedRoles")
					.isArray()
					.withMessage(t("Allowed roles needs to be an array of strings")),
				body("allowedRoles.*")
					.if((value, { req }) => {
						if (Array.isArray(req.body.allowedRoles)) return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t("Allowed role needs to be provided, cannot be left empty")
					)
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported app role")),
			];
		case "update-telemetry":
			return [
				body("status")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(resourceStatuses)
					.withMessage(t("Unsupported status type")),
				body("message").trim().optional(),
				body("logs").trim().optional(),
			];
		case "update-config":
			return [];
		case "update-access":
			return [...accessEngineRules, ...accessDatabaseRules];
		default:
			return [];
	}
};
