import mongoose from "mongoose";
import { body, query } from "express-validator";
import helper from "../util/helper.js";
import { appRoles, orgRoles, invitationStatus } from "../config/constants.js";

/**
 * Organization invitions. Each member is first needs to be added to the organization.
 * Later on these members will be aded to specific apps.
 */

export const AppInvitationModel = mongoose.model(
	"app_invitation",
	new mongoose.Schema({
		orgId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "organization",
			index: true,
			immutable: true,
		},
		appId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "app",
			index: true,
			immutable: true,
		},
		email: {
			type: String,
			index: true,
			required: true,
			immutable: true,
		},
		token: {
			type: String,
			index: true,
			required: true,
			immutable: true,
		},
		role: {
			type: String,
			required: true,
			index: true,
			enum: appRoles,
			required: true,
		},
		orgRole: {
			type: String,
			required: true,
			index: true,
			enum: orgRoles,
			default: "Developer",
			required: true,
		},
		status: {
			type: String,
			required: true,
			index: true,
			default: "Pending",
			enum: invitationStatus,
		},
		// Info about the person who invites the user
		host: {
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
				index: true,
			},
			name: {
				type: String,
				index: true,
			},
			pictureUrl: {
				type: String,
			},
			color: {
				// If no picture provided then this will be the avatar background color of the user
				type: String,
			},
			contactEmail: {
				// Independent of the provider we store the email address of the user
				type: String,
				index: true,
			},
		},
		createdAt: {
			type: Date,
			default: Date.now,
			index: true,
			immutable: true,
			//expire records after 1 month
			expires: helper.constants["1month"],
		},
		__v: {
			type: Number,
			select: false,
		},
	})
);

export const applyRules = (type) => {
	switch (type) {
		case "invite":
			return [
				body("*.email")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("*.role")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported app member role")),
			];
		case "update-invite":
			return [
				query("token")
					.trim()
					.notEmpty()
					.withMessage(t("Required parameter, cannot be left empty")),
				body("role")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(appRoles)
					.withMessage(t("Unsupported app member role")),
			];
		case "resend-invite":
		case "delete-invite":
			return [
				query("token")
					.trim()
					.notEmpty()
					.withMessage(t("Required parameter, cannot be left empty")),
			];
		case "get-invites":
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
		case "delete-invite-multi":
			return [
				body("tokens")
					.notEmpty()
					.withMessage(t("Required parameter, cannot be left empty"))
					.bail()
					.isArray()
					.withMessage(t("Invitation tokens needs to be an array of strings")),
				body("tokens.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required parameter, cannot be left empty")),
			];
		default:
			return [];
	}
};
