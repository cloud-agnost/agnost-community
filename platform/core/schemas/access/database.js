import { body } from "express-validator";
import { databaseTypes, mongoDBConnFormat } from "../../config/constants.js";

export default [
	body("access.connFormat")
		.if(
			(value, { req }) =>
				req.body.type === "database" && ["MongoDB"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(mongoDBConnFormat)
		.withMessage(t("Unsupported connection format")),
	body("access.options")
		.optional()
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.isArray()
		.withMessage(t("Access options need to be an array of key-value pairs")),
	body("access.options.*.key")
		.if(
			(value, { req }) =>
				Array.isArray(req.body.access.options) &&
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.options.*.value")
		.if(
			(value, { req }) =>
				Array.isArray(req.body.access.options) &&
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.host")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.port")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				((databaseTypes.includes(req.body.instance) &&
					req.body.instance !== "MongoDB") ||
					(req.body.instance === "MongoDB" &&
						req.body.access?.connFormat === "mongodb"))
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
				databaseTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.password")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.encrypt")
		.if(
			(value, { req }) =>
				req.body.type === "database" &&
				["SQL Server"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isBoolean()
		.withMessage(t("Not a valid boolean value"))
		.toBoolean(),
	body("accessReadOnly.connFormat")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "database" &&
				["MongoDB"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(mongoDBConnFormat)
		.withMessage(t("Unsupported connection format")),
	body("accessReadOnly.options")
		.optional()
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "database" &&
				["MongoDB"].includes(req.body.instance)
		)
		.isArray()
		.withMessage(t("Access options need to be an array of key-value pairs")),
	body("accessReadOnly.options.*.key")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				Array.isArray(req.body.accessReadOnly.options) &&
				req.body.type === "database" &&
				["MongoDB"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.options.*.value")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				Array.isArray(req.body.accessReadOnly.options) &&
				req.body.type === "database" &&
				["MongoDB"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.host")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.port")
		.if(
			(value, { req }) =>
				eq.body.accessReadOnly &&
				req.body.type === "database" &&
				((databaseTypes.includes(req.body.instance) &&
					req.body.instance !== "MongoDB") ||
					(req.body.instance === "MongoDB" &&
						req.body.accessReadOnly?.connFormat === "mongodb"))
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
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.password")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "database" &&
				databaseTypes.includes(req.body.instance)
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.encrypt")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "database" &&
				["SQL Server"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isBoolean()
		.withMessage(t("Not a valid boolean value"))
		.toBoolean(),
];
