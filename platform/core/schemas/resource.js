import mongoose from "mongoose";
import { body, query } from "express-validator";
import appCtrl from "../controllers/app.js";
import {
	resourceTypes,
	addResourceTypes,
	instanceTypes,
	addInstanceTypes,
	appRoles,
	resourceStatuses,
} from "../config/constants.js";

import accessDatabaseRules from "./access/database.js";
import accessCacheRules from "./access/cache.js";
import accessQueueRules from "./access/queue.js";
import accessStorageRules from "./access/storage.js";

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
			// this field helps to filter out the resources that belong to a specific app. If appId assigned then
			// the resource can be only used within that app and cannot be shared across other apps of the organization
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
			// Whether this resource can be deleted or not from the resource views list
			deletable: {
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
			// There can be multiple read only replicas for this reason it is an array of configuration items
			accessReadOnly: {
				type: [mongoose.Schema.Types.Mixed],
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
		case "test":
			return [
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(addResourceTypes)
					.withMessage(t("Unsupported resource type")),
				body("instance")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						let instanceList = addInstanceTypes[req.body.type];
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
				body("access")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (typeof value !== "object" || Array.isArray(value))
							throw new AgnostError(t("Not a valid resource access setting"));

						return true;
					}),
				...accessDatabaseRules,
				...accessCacheRules,
				...accessQueueRules,
				...accessStorageRules,
			];
		case "update-access":
			return [
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(addResourceTypes)
					.withMessage(t("Unsupported resource type")),
				body("instance")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						let instanceList = addInstanceTypes[req.body.type];
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
				body("access")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (typeof value !== "object" || Array.isArray(value))
							throw new AgnostError(t("Not a valid resource access setting"));

						return true;
					}),
				body("accessReadOnly")
					.optional()
					.custom((value, { req }) => {
						if (!Array.isArray(value))
							throw new AgnostError(
								t("Not a valid resource read-only access setting")
							);

						return true;
					}),
				...accessDatabaseRules,
				...accessCacheRules,
				...accessQueueRules,
				...accessStorageRules,
			];
		case "add":
			return [
				body("appId")
					.trim()
					.optional()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid app identifier"));

						const app = await appCtrl.getOneById(value, { cacheKey: value });
						if (!app)
							throw new AgnostError(
								t(
									"No such application with the provided id '%s' exists.",
									value
								)
							);

						if (app.orgId.toString() !== req.org._id.toString())
							throw new AgnostError(
								t(
									"Organization does not have an app with the provided id '%s'",
									value
								)
							);

						req.app = app;
						return true;
					}),
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					),
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(addResourceTypes)
					.withMessage(t("Unsupported resource type")),
				body("instance")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						let instanceList = addInstanceTypes[req.body.type];
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
				body("allowedRoles")
					.isArray()
					.withMessage(t("Allowed roles needs to be an array of strings")),
				body("allowedRoles.*")
					.notEmpty()
					.withMessage(
						t("Allowed role needs to be provided, cannot be left empty")
					)
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported app role")),
				body("access")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (typeof value !== "object" || Array.isArray(value))
							throw new AgnostError(t("Not a valid resource access setting"));

						return true;
					}),
				body("accessReadOnly")
					.optional()
					.custom((value, { req }) => {
						if (!Array.isArray(value))
							throw new AgnostError(
								t("Not a valid resource read-only access setting")
							);

						return true;
					}),
				...accessDatabaseRules,
				...accessCacheRules,
				...accessQueueRules,
				...accessStorageRules,
			];
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
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
				...accessDatabaseRules,
			];
		case "get-resources":
			return [
				query("appId")
					.trim()
					.optional()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid app identifier"));

						const app = await appCtrl.getOneById(value, { cacheKey: value });
						if (!app)
							throw new AgnostError(
								t(
									"No such application with the provided id '%s' exists.",
									value
								)
							);

						if (app.orgId.toString() !== req.org._id.toString())
							throw new AgnostError(
								t(
									"Organization does not have an app with the provided id '%s'",
									value
								)
							);

						req.app = app;

						// If the user is cluster owner then by default he has 'Admin' privileges to the app
						if (req.user.isClusterOwner) {
							// Assign app membership data
							req.appMember = {
								userId: req.user._id,
								role: "Admin",
								joinDate: req.user.createdAt,
							};
						} else {
							// Check if the user is a member of the app or not
							let appMember = app.team.find(
								(entry) => entry.userId.toString() === req.user._id.toString()
							);

							if (!appMember) {
								return res.status(401).json({
									error: t("Not Authorized"),
									details: t(
										"You are not a member of the application '%s'",
										app.name
									),
									code: ERROR_CODES.unauthorized,
								});
							}

							// Assign app membership data
							req.appMember = appMember;
						}
						return true;
					}),
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					),
				body("allowedRoles")
					.isArray()
					.withMessage(t("Allowed roles needs to be an array of strings")),
				body("allowedRoles.*")
					.trim()
					.notEmpty()
					.withMessage(
						t("Allowed role needs to be provided, cannot be left empty")
					)
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported app role")),
			];
		default:
			return [];
	}
};
