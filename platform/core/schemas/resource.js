import mongoose from "mongoose";
import { body, query } from "express-validator";
import appCtrl from "../controllers/app.js";
import {
	resourceTypes,
	addResourceTypes,
	createResourceTypes,
	addInstanceTypes,
	createInstanceTypes,
	appRoles,
	resourceStatuses,
} from "../config/constants.js";

import accessDatabaseRules from "./access/database.js";
import accessCacheRules from "./access/cache.js";
import accessQueueRules from "./access/queue.js";
import accessStorageRules from "./access/storage.js";
import configDatabaseRules from "./config/database.js";
import configCacheRules from "./config/cache.js";
import configQueueRules from "./config/queue.js";

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
			// Whether this resource can be accessed outside of the cluster or not
			allowExternalAccess: {
				type: Boolean,
				required: false,
				default: false,
			},
			// The domain name that is used to access this resource from outside of the cluster, this is only valid for clusters that have a valid IP address
			externalAccessHost: {
				type: String,
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
			// For each resource we need to have the relevant connection information to acccess the resource
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
			// Only used for API server resources
			availableReplicas: {
				type: Number,
			},
			// Only used for API server resources
			unavailableReplicas: {
				type: Number,
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
		case "update-config":
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
				...configDatabaseRules(type),
				...configCacheRules(type),
				...configQueueRules(type),
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
						max: config.get("general.maxDbNameLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxDbNameLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[a-z0-9-]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Resource names can include only numbers, lowercase letters and '-' characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Resource names cannot start with a number")
							);
						}

						let regex3 = /^-|-$/;
						if (regex3.test(value)) {
							throw new AgnostError(
								t("Resource names cannot start or end with '-' character")
							);
						}

						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						let resources = await ResourceModel.find({
							orgId: req.org._id,
							type: { $ne: "engine" },
						});

						resources.forEach((res) => {
							if (res.name.toLowerCase() === value.toLowerCase())
								throw new AgnostError(
									t("Resource with the provided name already exists")
								);
						});

						if (
							[
								"mongodb",
								"rabbitmq-server",
								"redis-master",
								"redis",
								"redis-headless",
								"rabbitmq",
								"minio",
							].includes(value.toLowerCase())
						) {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as resource name",
									value
								)
							);
						}
					}),
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
						max: config.get("general.maxDbNameLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxDbNameLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[a-z0-9-]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Resource names can include only numbers, lowercase letters and '-' characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Resource names cannot start with a number")
							);
						}

						let regex3 = /^-|-$/;
						if (regex3.test(value)) {
							throw new AgnostError(
								t("Resource names cannot start or end with '-' character")
							);
						}

						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						let resources = await ResourceModel.find({
							orgId: req.org._id,
							type: { $ne: "engine" },
						});

						resources.forEach((res) => {
							if (res.name.toLowerCase() === value.toLowerCase())
								throw new AgnostError(
									t("Resource with the provided name already exists")
								);
						});

						if (
							[
								"mongodb",
								"rabbitmq-server",
								"redis-master",
								"redis",
								"redis-headless",
								"rabbitmq",
								"minio",
								"minio-storage",
							].includes(value.toLowerCase())
						) {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as resource name",
									value
								)
							);
						}
					}),
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(createResourceTypes)
					.withMessage(t("Unsupported resource type")),
				body("instance")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						let instanceList = createInstanceTypes[req.body.type];
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
				body("config")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (typeof value !== "object" || Array.isArray(value))
							throw new AgnostError(t("Not a valid resource access setting"));

						return true;
					}),
				...configDatabaseRules(type),
				...configCacheRules(type),
				...configQueueRules(type),
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
			];
		case "update":
			return [
				body("allowedRoles.*")
					.isIn(appRoles)
					.withMessage(t("Unsupported app role")),
			];
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
