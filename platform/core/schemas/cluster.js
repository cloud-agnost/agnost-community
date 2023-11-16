import mongoose from "mongoose";
import { body } from "express-validator";
import { clusterComponents } from "../config/constants.js";
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
			releaseHistory: {
				type: [String],
				index: true,
			},
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
		default:
			return [];
	}
};
