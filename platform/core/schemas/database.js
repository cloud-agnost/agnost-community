import mongoose from "mongoose";
import { body } from "express-validator";
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
					.isLength({ max: config.get("general.maxDbNameLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
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

						return true;
					}),
				body("type")
					.if(() => type === "create")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(databaseTypes)
					.withMessage(t("Unsupported database type")),
				body("managed")
					.if(() => type === "create")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
			];
		case "update":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxDbNameLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
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
