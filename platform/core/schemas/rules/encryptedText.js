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
					.not()
					.isEmpty()
					.withMessage(
						t(
							"Encrypted text properties need to be provided, cannot be left empty"
						)
					),
				body("encryptedText.minLength")
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
							"Min length needs to be a positive integer between 1 - %s",
							config.get("general.maxEncryptedTextFieldLength")
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
					)
					.bail()
					.custom((value, { req }) => {
						if (req.body.encryptedText.minLength) {
							let minValue = null;
							try {
								minValue = parseInt(req.body.encryptedText.minLength, 10);
							} catch (err) {}

							if (!!minValue && minValue > value)
								throw new AgnostError(
									t(
										"Minimum length needs to be smaller than or equal to maximum length"
									)
								);
						}

						//Indicates the success of this  custom validator
						return true;
					}),
			];
		default:
			return [];
	}
};
