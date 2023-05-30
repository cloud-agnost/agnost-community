import { body } from "express-validator";

export default [
	body("access.workerUrl")
		.if(
			(value, { req }) =>
				["engine"].includes(req.body.type) && !req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isURL({
			require_valid_protocol: true,
			protocols: ["http", "https"],
			host_whitelist: ["engine-worker-clusterip-service"],
		})
		.withMessage(t("Not a valid URL")),
	body("access.accessToken")
		.if(
			(value, { req }) =>
				["engine"].includes(req.body.type) && !req.body.managed
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
];
