import mongoose from "mongoose";
import { body, param, query } from "express-validator";
import { appRoles } from "../config/constants.js";

/**
 * An app is your workspace that packages all required design and configuration elements to run your backend app services.
 * All application design elements are specified in versions, and all execution configurations are specified in environments.
 */
export const AppModel = mongoose.model(
	"app",
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
			ownerUserId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
				index: true,
			},
			name: {
				type: String,
				required: true,
				index: true,
			},
			pictureUrl: {
				type: String,
			},
			color: {
				// If no picture provided then this will be the avatar background color of the app
				type: String,
			},
			team: [
				{
					userId: {
						type: mongoose.Schema.Types.ObjectId,
						ref: "user",
					},
					role: {
						type: String,
						required: true,
						index: true,
						enum: appRoles,
					},
					joinDate: {
						type: Date,
						default: Date.now,
						immutable: true,
					},
				},
			],
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
			];
		case "create-param":
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
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Param names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Parameter names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Parameter names cannot start with underscore (_) character")
							);
						}

						return true;
					})
					.bail()
					.custom((value, { req }) => {
						let params = req.app.params ?? [];
						params.forEach((param) => {
							if (param.name.toLowerCase() === value.toLowerCase())
								throw new AgnostError(
									t("Parameter with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as parameter name",
									value
								)
							);
						}

						return true;
					}),
				body("value")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "update-param":
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
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Param names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Parameter names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Parameter names cannot start with underscore (_) character")
							);
						}

						return true;
					})
					.bail()
					.custom((value, { req }) => {
						let params = req.app.params ?? [];
						params.forEach((param) => {
							if (
								param.name.toLowerCase() === value.toLowerCase() &&
								param._id.toString() !== req.params.paramId.toString()
							)
								throw new AgnostError(
									t("Parameter with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as parameter name",
									value
								)
							);
						}

						return true;
					}),
				body("value")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "create-limit":
		case "update-limit":
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
				body("rate")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Max request count needs to be a positive integer"))
					.toInt(),
				body("duration")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Duration needs to be a positive integer"))
					.toInt(),
			];
		case "update-member-role":
			return [
				param("userId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					}),
				body("role")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported team member role")),
			];
		case "remove-member":
			return [
				param("userId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					}),
			];
		case "remove-members":
			return [
				body("userIds")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.isArray()
					.withMessage(t("User identifiers need to be an array of strings")),
				body("userIds.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					}),
			];
		case "transfer":
			return [
				param("userId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					})
					.bail()
					.custom((value, { req }) => {
						// Check whether email is unique or not
						let appMember = req.app.team.find(
							(entry) => entry.userId.toString() === value
						);

						if (!appMember) {
							throw new AgnostError(
								t(
									"The user identified with id '%s' is not a member of app '%s'. App ownership can only be transferred to an existing app member with 'Admin' role.",
									value,
									req.app.name
								)
							);
						}

						if (appMember.role !== "Admin") {
							throw new AgnostError(
								t(
									"App ownership can only be transferred to an existing app member with 'Admin' role.",
									req.app.name
								)
							);
						}

						return true;
					}),
			];
		case "upload-picture":
			return [
				query("width")
					.trim()
					.optional({ nullable: true })
					.isInt({ min: 1 })
					.withMessage(t("Width needs to be a positive integer"))
					.toInt(),
				query("height")
					.trim()
					.optional({ nullable: true })
					.isInt({ min: 1 })
					.withMessage(t("Height needs to be a positive integer"))
					.toInt(),
			];
		default:
			return [];
	}
};
