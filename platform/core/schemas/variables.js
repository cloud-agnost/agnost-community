import mongoose from "mongoose";
import { body } from "express-validator";

/**
 * An project is your workspace that packages all project environments and associated containers.
 */
export const VariableModel = mongoose.model(
	"variable",
	new mongoose.Schema(
		{
			orgId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "organization",
				index: true,
			},
			projectId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "project",
				index: true,
			},
			iid: {
				// Internal identifier
				type: String,
				required: true,
				index: true,
				immutable: true,
			},
			isShared: {
				// Internal identifier
				type: Boolean,
				required: true,
				index: true,
				immutable: true,
				default: false,
			},
			name: {
				type: String,
				required: true,
				index: true,
			},
			value: {
				type: String,
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9 _.-]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Project names can include only numbers, letters, spaces, dash, dot and underscore characters"
								)
							);
						}

						let regex2 = /^[ _-].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t(
									"Project names cannot start with a dash or underscore character"
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
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
					.isIn(projectRoles)
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
						let projectMember = req.project.team.find(
							(entry) => entry.userId.toString() === value
						);

						if (!projectMember) {
							throw new AgnostError(
								t(
									"The user identified with id '%s' is not a member of project '%s'. Project ownership can only be transferred to an existing project member with 'Admin' role.",
									value,
									req.project.name
								)
							);
						}

						if (projectMember.role !== "Admin") {
							throw new AgnostError(
								t(
									"Project ownership can only be transferred to an existing project member with 'Admin' role."
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
