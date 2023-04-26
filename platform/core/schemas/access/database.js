import { body } from "express-validator";
import { databaseTypes, mongoDBConnFormat } from "../../config/constants.js";

export default [
	body("access.connFormat")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				["MongoDB"].includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(mongoDBConnFormat)
		.withMessage(t("Unsupported connection format")),
	body("access.connOptions")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				["MongoDB"].includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.optional(),
	body("access.host")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.port")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				!req.body.managed &&
				((databaseTypes.includes(req.body.instance) &&
					req.body.instance !== "MongoDB") ||
					(req.body.instance === "MongoDB" &&
						req.body.access?.connFormat === "standard"))
		)
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
	body("access.username")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.password")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.host")
		.optional()
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.port")
		.optional()
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				!req.body.managed &&
				((databaseTypes.includes(req.body.instance) &&
					req.body.instance !== "MongoDB") ||
					(req.body.instance === "MongoDB" &&
						req.body.access?.connFormat === "standard"))
		)
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
	body("accessReadOnly.username")
		.optional()
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.password")
		.optional()
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance) &&
				!req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
];
