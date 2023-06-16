import mongoose from "mongoose";
import { body } from "express-validator";
import resourceCtrl from "../controllers/resource.js";
import { databaseTypes } from "../config/constants.js";

/**
 * We can have multiple different type of databases in an app
 */
export const DatabaseModel = mongoose.model(
	"database",
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
			name: {
				type: String,
				required: true,
				index: true,
			},
			type: {
				type: String,
				required: true,
				index: true,
				immutable: true,
				enum: databaseTypes,
			},
			// Flag specifies whether the database schema is managed by the platform or not
			managed: {
				type: Boolean,
				index: true,
				immutable: true,
				default: true,
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
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Database names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Database names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Database names cannot start with underscore (_) character")
							);
						}

						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						let databases = await DatabaseModel.find({
							versionId: req.version._id,
						});

						databases.forEach((db) => {
							if (db.name.toLowerCase() === value.toLowerCase())
								throw new AgnostError(
									t("Database with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as database name",
									value
								)
							);
						}

						// Special case for oracle databases (schemas)
						if (
							req.type === "Oracle" &&
							value.length > config.get("general.maxOracleDbNameLength")
						)
							throw AgnostError(
								t(
									"Name must be at most %s characters long",
									config.get("general.maxOracleDbNameLength")
								)
							);

						return true;
					}),
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(databaseTypes)
					.withMessage(t("Unsupported database type")),
				body("managed")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("resourceId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid resource identifier"));

						let resource = await resourceCtrl.getOneById(value, {
							cacheKey: value,
						});

						if (!resource)
							throw new AgnostError(
								t("No such resource with the provided id '%s' exists.", value)
							);

						// Check if the selected resource type and input database type matches or not
						if (req.body.type !== resource.instance)
							throw new AgnostError(
								t(
									"The specified database type '%s' and the selected resource type '%s' do not match",
									req.body.type,
									resource.instance
								)
							);

						// Check the status of the resource whether it is in OK status or not
						if (resource.status !== "OK")
							throw new AgnostError(
								t(
									"Only resorces in ready (OK) status can be mapped to a database. The selected '%s' resoure '%s' is in '%s' status",
									resource.instance,
									resource.name,
									resource.status
								)
							);

						// Assign the resource object
						req.resource = resource;
						return true;
					}),
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
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Database names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Database names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Database names cannot start with underscore (_) character")
							);
						}

						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						let databases = await DatabaseModel.find({
							versionId: req.version._id,
						});

						databases.forEach((db) => {
							if (
								db.name.toLowerCase() === value.toLowerCase() &&
								req.db._id.toString() !== db._id.toString()
							)
								throw new AgnostError(
									t("Database with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as database name",
									value
								)
							);
						}

						return true;
					}),
			];
		default:
			return [];
	}
};
