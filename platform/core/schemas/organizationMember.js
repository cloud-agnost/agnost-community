import mongoose from "mongoose";
import { body, query, param } from "express-validator";

/**
 * An organization is the top level entitiy used to hold all apps and its associated design elements.
 * Each organization will have team members with different roled. There are two types of roles in Agnost one at the organization level
 * and the other at the application level. The organization level roles specifiy the authorizations an org member have.
 * Admin: Full access to the organization, can change organization name and add members to the organization
 * App Admin: Can only manage applications associated with an organization
 * Billing Admin: The billing related information is kept separately for each organization. Billing admins have read-only access to organization apps
 * and they can view and manage organization billing informaton
 * Resource Manager: Resource managers can manage organization level resources such as databases, message queuest etc. They can also manage the environments
 * of organization applications
 * Developer: Developers have read-only access to an organization. They cannot create a new app but can take part as a member to the development of specific apps.
 */
export const OrganizationMemberModel = mongoose.model(
	"organization_member",
	new mongoose.Schema({
		orgId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "organization",
			index: true,
			immutable: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			index: true,
			immutable: true,
		},
		role: {
			type: String,
			required: true,
			index: true,
			enum: [
				"Admin",
				"App Admin",
				"Billing Admin",
				"Read-only",
				"Resource Manager",
				"Developer",
			],
		},
		joinDate: {
			type: Date,
			default: Date.now,
			immutable: true,
		},
		__v: {
			type: Number,
			select: false,
		},
	})
);

export const applyRules = (type) => {
	switch (type) {
		case "get-members":
		case "list-eligible":
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
					.isIn([
						"Admin",
						"App Admin",
						"Billing Admin",
						"Read-only",
						"Resource Manager",
						"Developer",
					])
					.withMessage(t("Unsupported member role")),
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
		default:
			return [];
	}
};
