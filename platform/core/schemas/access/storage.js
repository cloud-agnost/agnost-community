import { body } from "express-validator";

export default [
	// AWS S3 access validation rules
	body("access.accessKeyId")
		.if(
			(value, { req }) =>
				req.body.type === "storage" && ["AWS S3"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.secretAccessKey")
		.if(
			(value, { req }) =>
				req.body.type === "storage" && ["AWS S3"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.region")
		.if(
			(value, { req }) =>
				req.body.type === "storage" && ["AWS S3"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	// Google Cloud Storage access validation rules
	body("access.projectId")
		.if(
			(value, { req }) =>
				req.body.type === "storage" &&
				["GCP Cloud Storage"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.keyFileContents")
		.if(
			(value, { req }) =>
				req.body.type === "storage" &&
				["GCP Cloud Storage"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	// Azure Blog Storage access validation rules
	body("access.connectionString")
		.if(
			(value, { req }) =>
				req.body.type === "storage" &&
				["Azure Blob Storage"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
];
