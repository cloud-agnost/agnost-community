import mongoose from "mongoose";
import clsCtrl from "../controllers/cluster.js";
import { body, query } from "express-validator";

/**
 * Message cron job and its handler definition
 */
export const DomainModel = mongoose.model(
	"domain",
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
			domain: {
				type: String,
				required: true,
				index: true,
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
		case "view":
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
		case "create":
			return [
				body("domain")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.toLowerCase() // convert the value to lowercase
					.custom(async (value, { req }) => {
						// The below reges allows for wildcard subdomains
						// const dnameRegex = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
						// Check domain name syntax, we do not currently allow wildcard subdomains
						const dnameRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
						// Validate domain name (can be at mulitple levels)
						if (!dnameRegex.test(value)) {
							throw new AgnostError(t("Not a valid domain name '%s'", value));
						}

						// Check to see if this domain is already in the domain list
						const domain = await DomainModel.findOne({
							domain: value,
						});

						if (domain) {
							throw new AgnostError(
								t(
									"The specified domain '%s' already exists in overall domains list",
									value
								)
							);
						}

						// Get the cluster object
						const cluster = await clsCtrl.getOneByQuery({
							clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
						});

						if (cluster?.domains?.find((entry) => entry === value)) {
							throw new AgnostError(
								t(
									"The specified domain '%s' already exists in cluster custom domains list",
									value
								)
							);
						}

						return true;
					}),
			];
		case "delete-multi":
			return [
				body("domainIds.*")
					.trim()
					.optional()
					.custom((value) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valid object identifier"));
						}
						return true;
					}),
			];
		case "delete-sse":
			return [
				body("domain")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.toLowerCase() // convert the value to lowercase
					.custom(async (value, { req }) => {
						// The below reges allows for wildcard subdomains
						// const dnameRegex = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
						// Check domain name syntax, we do not currently allow wildcard subdomains
						const dnameRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
						// Validate domain name (can be at mulitple levels)
						if (!dnameRegex.test(value)) {
							throw new AgnostError(t("Not a valid domain name '%s'", value));
						}

						// Check to see if this domain is already in the domain list
						const domain = await DomainModel.findOne({
							domain: value,
						});

						if (!domain) {
							throw new AgnostError(
								t(
									"The specified domain '%s' does not exists in domains list",
									value
								)
							);
						} else if (
							domain.vesionId.toString() !== req.version._id.toString()
						) {
							throw new AgnostError(
								t(
									"Version '%s' does not have such a domain '%s'",
									req.version.name,
									value
								)
							);
						}

						req.domain = domain;
						return true;
					}),
			];
	}
};
