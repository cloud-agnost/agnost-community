import { body } from "express-validator";

export default [
	/* body("access.connFormat")
		.if(
			(value, { req }) =>
				req.body.type === "database" && ["MongoDB"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(mongoDBConnFormat)
		.withMessage(t("Unsupported connection format")), */
];
