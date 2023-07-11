import { body } from "express-validator";

export const textRules = (type) => {
	switch (type) {
		case "create-field":
		case "update-field":
			return [
				body("text")
					.if((value, { req }) => {
						if (req.body.type === "text" || req.field?.type === "text")
							return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t("Text field properties need to be provided, cannot be left empty")
					),
				body("text.searchable")
					.optional()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("text.maxLength")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							value
						)
							return true;
						else return false;
					})
					.trim()
					.optional()
					.isInt({
						min: 1,
						max: config.get("general.maxTextFieldLength"),
					})
					.withMessage(
						t(
							"%Max length needs to be a positive integer between 1 - %s",
							config.get("general.maxTextFieldLength")
						)
					),
			];
		default:
			return [];
	}
};
