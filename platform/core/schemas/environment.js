import mongoose from "mongoose";
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
						iid: {
							type: String,
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
			// Database deployment status
			dbStatus: {
				type: String,
				index: true,
				enum: envStatuses,
			},
			// API server status
			serverStatus: {
				type: String,
				index: true,
				enum: envStatuses,
			},
			// Cronjobs deployment status
			schedulerStatus: {
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
		case "update":
			return [
				body("autoDeploy")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
			];
		case "update-apiserver":
			return [
				body("minScale")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
					})
					.withMessage(
						t("Minimum scale needs to be a positive integer or 0 (zero)")
					)
					.bail()
					.toInt(),
				body("maxScale")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Maximum scale needs to be a positive integer"))
					.bail()
					.toInt()
					.custom(async (value, { req }) => {
						if (req.body.minScale > value)
							throw new AgnostError(
								t("Maximum scale cannot be smaller than minimum scale")
							);

						return true;
					}),
				body("scaleDownDelay")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						const regex = /^\d+m\d{2}s$/;
						const result = regex.test(value);

						if (!result)
							throw new AgnostError(
								t(
									"Not a valid duration format. The duration needs to be as minutes and seconds e.g., 5m30s which is 5 minutes 30 seconds"
								)
							);

						const minutesMatch = value.match(/(\d+)m/);
						const secondsMatch = value.match(/(\d+)s/);

						const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
						const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;

						if (
							minutes * 60 + seconds <
							config.get("general.scaleDownDelaySeconds")
						)
							throw new AgnostError(
								t(
									"Scale down duration cannot be less than %s seconds",
									config.get("general.scaleDownDelaySeconds")
								)
							);
					}),
				body("scaleToZeroPodRetentionPeriod")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						const regex = /^\d+m\d{2}s$/;
						const result = regex.test(value);

						if (!result)
							throw new AgnostError(
								t(
									"Not a valid duration format. The duration needs to be as minutes and seconds e.g., 5m30s which is 5 minutes 30 seconds"
								)
							);

						const minutesMatch = value.match(/(\d+)m/);
						const secondsMatch = value.match(/(\d+)s/);

						const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
						const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;

						if (
							minutes * 60 + seconds <
							config.get("general.scaleToZeroPodRetentionPeriodSeconds")
						)
							throw new AgnostError(
								t(
									"Scale to zero pod retention period cannot be less than %s seconds",
									config.get("general.scaleToZeroPodRetentionPeriodSeconds")
								)
							);
					}),
				body("cpu.request")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.matches(/^([1-9]\d*)m$/)
					.withMessage(
						t("CPU should be specified in non-zero millicores (e.g., 250m)")
					)
					.bail()
					.custom((value, { req }) => {
						const request = parseInt(value, 10);
						const limit = parseInt(req.body.cpu?.limit, 10);
						return request <= limit;
					})
					.withMessage(t("CPU request cannot be greater than CPU limit")),
				body("cpu.limit")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.matches(/^([1-9]\d*)m$/)
					.withMessage(
						t("CPU should be specified in non-zero millicores (e.g., 250m)")
					),
				body("memory.request")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.matches(/^([1-9]\d*(Mi|Gi))$/)
					.withMessage(
						t(
							"Memory should be specified in non-zero Mi or Gi (e.g., 500Mi or 1Gi)"
						)
					)
					.bail()
					.custom((value, { req }) => {
						const request = helper.memoryToBytes(value);
						const limit = helper.memoryToBytes(req.body.memory?.limit);
						if (request !== undefined && limit !== undefined)
							return request <= limit;
						return true;
					})
					.withMessage(t("Memory request cannot be greater than Memory limit")),
				body("memory.limit")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.matches(/^([1-9]\d*(Mi|Gi))$/)
					.withMessage(
						t(
							"Memory should be specified in non-zero Mi or Gi (e.g., 500Mi or 1Gi)"
						)
					),
			];
		default:
			return [];
	}
};
