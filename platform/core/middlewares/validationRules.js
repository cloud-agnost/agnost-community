import { body } from "express-validator";

export const validateSMTPTestParams = () => {
	return [
		body("host")
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty")),
		body("port")
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
		body("useTLS")
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty"))
			.bail()
			.isBoolean()
			.withMessage(t("Not a valid boolean value"))
			.toBoolean(),
		body("user")
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty")),
		body("password")
			.trim()
			.notEmpty()
			.withMessage(t("Required field, cannot be left empty")),
	];
};
