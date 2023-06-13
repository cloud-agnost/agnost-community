import mongoose from "mongoose";
import { body, query, param } from "express-validator";
import orgMemberCtrl from "../controllers/organizationMember.js";
/**
 * Each account can have multiple organizations and an organization is the top level entitiy used to hold all apps and its associated design elements.
 */
export const OrganizationModel = mongoose.model(
	"organization",
	new mongoose.Schema(
		{
			ownerUserId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
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
			pictureUrl: {
				type: String,
			},
			color: {
				// If no picture provided then this will be the avatar background color of the organization
				type: String,
			},
			createdBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
				index: true,
			},
			updatedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
				index: true,
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
					),
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
		case "get-members":
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
					.custom(async (value, { req }) => {
						let orgMember = await orgMemberCtrl.getOneByQuery(
							{
								orgId: req.org._id,
								userId: value,
							},
							{ cacheKey: `${req.org._id}.${value}` }
						);

						if (!orgMember) {
							throw new AgnostError(
								t(
									"The user identified with id '%s' is not a member of organization '%s'. Organization ownership can only be transferred to an existing organization member with 'Admin' role.",
									value,
									req.org.name
								)
							);
						}

						if (orgMember.role !== "Admin") {
							throw new AgnostError(
								t(
									"Organization ownership can only be transferred to an existing organization member with 'Admin' role.",
									req.org.name
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
