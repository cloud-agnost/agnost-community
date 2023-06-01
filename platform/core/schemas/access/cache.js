import { body } from "express-validator";
import { cacheTypes } from "../../config/constants.js";

export default [
	body("access.host")
		.if(
			(value, { req }) =>
				req.body.type === "cache" && cacheTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.port")
		.if(
			(value, { req }) =>
				req.body.type === "cache" && cacheTypes.includes(req.body.instance)
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
	body("access.password")
		.if(
			(value, { req }) =>
				req.body.type === "cache" && cacheTypes.includes(req.body.instance)
		)
		.optional(),
	body("access.databaseNumber")
		.if(
			(value, { req }) =>
				req.body.type === "cache" && cacheTypes.includes(req.body.instance)
		)
		.optional()
		.trim()
		.isInt({
			min: 0,
			max: 15,
		})
		.withMessage(t("Database number needs to be an integer between 0-15"))
		.toInt(),
	body("accessReadOnly.host")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "cache" &&
				cacheTypes.includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("accessReadOnly.port")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "cache" &&
				cacheTypes.includes(req.body.instance)
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
	body("accessReadOnly.password")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "cache" &&
				cacheTypes.includes(req.body.instance)
		)
		.optional(),
	body("accessReadOnly.databaseNumber")
		.if(
			(value, { req }) =>
				req.body.accessReadOnly &&
				req.body.type === "cache" &&
				cacheTypes.includes(req.body.instance)
		)
		.optional()
		.trim()
		.isInt({
			min: 0,
			max: 15,
		})
		.withMessage(t("Database number needs to be an integer between 0-15"))
		.toInt(),
];
