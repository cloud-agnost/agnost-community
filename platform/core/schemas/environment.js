import mongoose from "mongoose";
import mappingCtrl from "../controllers/mapping.js";
import { body, query } from "express-validator";
import { resourceTypes, envStatuses } from "../config/constants.js";

/**
 * Each version will have multiple execution environments. An environment will be tagged as development, test, staging, production etc.
 * Each environment will have the platform’s engine cluster deployment. Either a new engine cluster deployment will be created for
 * the environment, or an existing one at the same cloud provider region will be utilized. This will enable the deployment of multiple
 * applications to the same engine cluster.
 *
 * Environments will hold the resource mappings. The resource and external connection declarations of the app will be mapped to actual
 * cloud provider-specific resource instances. Again this will also enable usage of the same resource instance by multiple applications
 * (e.g. multiple apps will be able to use the same database server, or Redis cache)
 *
 * App version will be deployed to environment. Versions will also be undeployed and redeployed. The platform also supports
 * auto-redeployments for environments which have auto-redeployment enabled.
 *
 */
export const EnvironmentModel = mongoose.model(
	"environment",
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
			// The application version that is deployed to the environment
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
			// Auto-redeploy enabled or not
			autoDeploy: {
				type: Boolean,
				default: true,
				index: true,
			},
			// At environment level blocking access to methods, overrides all APIKey authorizations for the environment
			suspended: {
				type: Boolean,
				default: false,
				index: true,
			},
			// Version deployment datetime to the environment
			deploymentDtm: {
				type: Date,
				index: true,
			},
			// Resource mappings
			mappings: [
				{
					// For engine cluster mapping we will use the environment iid as design.iid
					design: {
						iid: {
							type: String,
							index: true,
						},
						// General type of the app design element
						type: {
							type: String,
							required: true,
							index: true,
							enum: resourceTypes,
						},
						name: {
							type: String,
						},
					},
					resource: {
						id: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "resource",
							index: true,
						},
						name: {
							type: String,
						},
						// General type of the resource
						type: {
							type: String,
							enum: resourceTypes,
						},
						// Specific technology type e.g., PostgreSQL, MySQL, MongoDB, SQL Server etc.
						instance: {
							type: String,
						},
					},
					createdAt: { type: Date, default: Date.now, immutable: true },
					updatedAt: { type: Date, default: Date.now },
					createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
					updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
				},
			],
			// Resource status
			status: {
				type: String,
				index: true,
				enum: envStatuses,
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
				body("autoDeploy")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
			];
		case "view":
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
		case "undeploy":
			return [
				body("dropData")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
			];
		case "add-param":
			return [
				body("value")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("paramId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid app param identifier"));

						let param = req.version.params.find(
							(entry) => entry._id.toString() === value
						);

						if (!param)
							throw new AgnostError(
								t("No such app param with the provided id '%s' exists.", value)
							);

						// Assign param information
						req.appParam = param;
						return true;
					}),
			];
		case "update-param":
			return [
				body("value")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "add-mapping":
			return [
				body("type")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(resourceTypes)
					.withMessage(t("Unsupported resource type")),
				body("designiid")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						// Get the design element
						let designElement = await mappingCtrl.getDesignElement(
							req.body.type,
							req.org._id,
							req.app._id,
							req.version._id,
							value
						);

						if (!designElement)
							throw new AgnostError(
								t(
									"No such app '%s' design element with the provided id '%s' exists.",
									req.body.type,
									value
								)
							);

						// Assign design element information
						req.designElement = designElement;
						return true;
					}),
				body("resourceId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid resource identifier"));

						// Get the resource
						let resource = await mappingCtrl.getResource(
							req.body.type,
							req.org._id,
							value
						);

						if (!resource)
							throw new AgnostError(
								t(
									"No such organization '%s' resource with the provided id '%s' exists.",
									req.body.type,
									value
								)
							);

						// Assign resource information
						req.resource = resource;
						return true;
					}),
			];
		default:
			return [];
	}
};
