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
			// Environment status
			dbStatus: {
				type: String,
				index: true,
				enum: envStatuses,
			},
			// Environment status
			serverStatus: [
				{
					pod: {
						type: String,
						index: true,
					},
					status: {
						type: String,
						index: true,
						enum: envStatuses,
					},
				},
			],
			// Environment status
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
		default:
			return [];
	}
};
