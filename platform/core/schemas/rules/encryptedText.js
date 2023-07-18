import { body } from "express-validator";

export const encryptedTextRules = (type) => {
	switch (type) {
		case "create-field":
		case "update-field":
			return [
				body("encryptedText")
					.if((value, { req }) => {
						if (
							req.body.type === "encrypted-text" ||
							req.field?.type === "encrypted-text"
						)
							return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t(
							"Encrypted text properties need to be provided, cannot be left empty"
						)
					),
				body("encryptedText.maxLength")
					.if((value, { req }) => {
						if (
							(req.body.type === "encrypted-text" ||
								req.field?.type === "encrypted-text") &&
							!!value
						)
							return true;
						else return false;
					})
					.trim()
					.optional()
					.isInt({
						min: 1,
						max: config.get("general.maxEncryptedTextFieldLength"),
					})
					.withMessage(
						t(
							"Max length needs to be a positive integer between 1 - %s",
							config.get("general.maxEncryptedTextFieldLength")
						)
					),
			];
		default:
			return [];
	}
};
