import { body } from "express-validator";
export default (actionType) => {
	return [
		// MongoDB
		body("config.version")
			.if(
				(value, { req }) =>
					req.body.type === "database" &&
					["MongoDB"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty")),
		body("config.size")
			.if(
				(value, { req }) =>
					req.body.type === "database" &&
					["MongoDB"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty"))
			.bail()
			.isInt({
				min: 1,
			})
			.withMessage(t("Database size needs to be a positive integer"))
			.toInt(),
		body("config.replicas")
			.if(
				(value, { req }) =>
					req.body.type === "database" &&
					["MongoDB"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty"))
			.bail()
			.isInt({
				min: 1,
			})
			.withMessage(t("Replica count needs to be a positive integer"))
			.toInt(),
		// PostgreSQL
		body("config.version")
			.if(
				(value, { req }) =>
					req.body.type === "database" &&
					["PostgreSQL"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty")),
		body("config.size")
			.if(
				(value, { req }) =>
					req.body.type === "database" &&
					["PostgreSQL"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty"))
			.bail()
			.isInt({
				min: 1,
			})
			.withMessage(t("Database size needs to be a positive integer"))
			.toInt(),
		body("config.instances")
			.if(
				(value, { req }) =>
					req.body.type === "database" &&
					["PostgreSQL"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty"))
			.bail()
			.isInt({
				min: 1,
			})
			.withMessage(t("Instance count needs to be a positive integer"))
			.toInt(),
		// MySQL
		body("config.version")
			.if(
				(value, { req }) =>
					req.body.type === "database" && ["MySQL"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty")),
		body("config.size")
			.if(
				(value, { req }) =>
					req.body.type === "database" && ["MySQL"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty"))
			.bail()
			.isInt({
				min: 1,
			})
			.withMessage(t("Database size needs to be a positive integer"))
			.toInt(),
		body("config.instances")
			.if(
				(value, { req }) =>
					req.body.type === "database" && ["MySQL"].includes(req.body.instance)
			)
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty"))
			.bail()
			.isInt({
				min: 1,
			})
			.withMessage(t("Instance count needs to be a positive integer"))
			.toInt(),
	];
};
