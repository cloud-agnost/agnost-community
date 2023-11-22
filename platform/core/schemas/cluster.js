import mongoose from "mongoose";
import { body } from "express-validator";
import {
	clusterComponents,
	clusterComponentsAll,
	clusterComponentStatus,
} from "../config/constants.js";
/**
 * Account is the top level model which will hold the list of organizations, under organization there will be users and apps etc.
 * Whenever a new users signs up a personal account with 'Admin' role will be creted. When a user joins to an organization, a new account entry
 * will be added for the user with the specified role type
 */
export const ClusterModel = mongoose.model(
	"cluster",
	new mongoose.Schema(
		{
			clusterAccesssToken: {
				type: String,
				required: true,
				index: true,
			},
			masterToken: {
				type: String,
				required: true,
				index: true,
			},
			accessToken: {
				type: String,
				required: true,
				index: true,
			},
			release: {
				type: String,
				required: true,
				index: true,
			},
			// Keeps the release number of the previous releases, whenever the current release is updated, the previous release number is added to this array
			releaseHistory: [
				{
					release: {
						type: String,
						required: true,
					},
					timestamp: { type: Date, default: Date.now, immutable: true },
				},
			],
			clusterResourceStatus: [
				{
					name: {
						type: String,
						required: true,
						enum: clusterComponentsAll.map((entry) => entry.deploymentName),
					},
					status: {
						type: String,
						required: true,
						enum: clusterComponentStatus,
					},
					lastUpdateAt: { type: Date, default: Date.now },
				},
			],
			smtp: {
				fromEmail: {
					type: String,
				},
				fromName: {
					type: String,
				},
				host: {
					type: String,
				},
				port: {
					type: Number,
				},
				useTLS: {
					type: Boolean,
				},
				user: {
					type: String,
				},
				// Password is encrypted when stored in database
				password: {
					type: String,
				},
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
			// Custom domains associted with the cluster
			domains: {
				type: [String],
				index: true,
			},
			// Enforce SSL access or not
			enforceSSLAccess: {
				type: Boolean,
				default: false,
			},
			// The ip addresses or hostnames of the cluster
			ips: {
				type: [String],
				index: true,
			},
		},
		{ timestamps: true }
	)
);

export const applyRules = (type) => {
	switch (type) {
		case "update-smtp":
			return [
				body("fromEmail")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("fromName").trim().optional(),
				body("host")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("port")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
						max: 65535,
					})
					.withMessage(t("Port number needs to be an integer between 0-65535"))
					.toInt(),
				body("useTLS")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("user")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("password")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "update-component":
			return [
				body("deploymentName")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(clusterComponents.map((entry) => entry.deploymentName))
					.withMessage(t("Unsupported cluster component type")),
				body("hpaName")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(clusterComponents.map((entry) => entry.hpaName))
					.withMessage(t("Unsupported cluster HPA type")),
				body("replicas")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Initial replicas needs to be a positive integer"))
					.bail()
					.toInt(),
				body("minReplicas")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Minimum replicas needs to be a positive integer"))
					.bail()
					.toInt(),
				body("maxReplicas")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Maximum replicas needs to be a positive integer"))
					.bail()
					.toInt()
					.custom(async (value, { req }) => {
						if (req.body.minReplicas > value)
							throw new AgnostError(
								t("Maximum replicas cannot be smaller than minimum replicas")
							);

						return true;
					}),
			];
		case "update-version":
			return [
				body("release")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "add-domain":
			return [
				body("domain")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.toLowerCase() // convert the value to lowercase
					.custom((value, { req }) => {
						const dnameRegex = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
						// Validate domain name (can be at mulitple levels and allows for wildcard subdomains)
						if (!dnameRegex.test(value)) {
							throw new AgnostError(t("Not a valid domain name '%s'", value));
						}

						// Check to see if this domain is already included in the list
						const { domains } = req.cluster;
						if (domains && domains.find((entry) => entry === value)) {
							throw new AgnostError(
								t(
									"The specified domain '%s' already exists in cluster domain list",
									value
								)
							);
						}
						return true;
					}),
			];
		case "delete-domain":
			return [
				body("domain")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.toLowerCase() // convert the value to lowercase
					.custom((value, { req }) => {
						// Check to see if this domain is already included in the list
						const { domains } = req.cluster;
						if (domains && domains.find((entry) => entry === value)) {
							return true;
						} else {
							throw new AgnostError(
								t(
									"The specified domain '%s' does not exist in cluster domain list",
									value
								)
							);
						}
					}),
			];
		case "update-enforce-ssl":
			return [
				body("enforceSSLAccess")
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
