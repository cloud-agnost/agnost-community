import { body } from "express-validator";

export const richTextRules = (type) => {
	switch (type) {
		case "create-field":
		case "update-field":
			return [
				body("richText")
					.if((value, { req }) => {
						if (
							req.body.type === "rich-text" ||
							req.field?.type === "rich-text"
						)
							return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t("Rich text properties need to be provided, cannot be left empty")
					),
				body("richText.searchable")
					.optional()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("richText.minLength")
					.if((value, { req }) => {
						if (
							(req.body.type === "rich-text" ||
								req.field?.type === "rich-text") &&
							!!value
						)
							return true;
						else return false;
					})
					.trim()
					.optional()
					.isInt({
						min: 1,
						max: config.get("general.maxRichTextFieldLength"),
					})
					.withMessage(
						t(
							"Min length needs to be a positive integer between 1 - %s",
							config.get("general.maxRichTextFieldLength")
						)
					),
				body("richText.maxLength")
					.if((value, { req }) => {
						if (
							(req.body.type === "rich-text" ||
								req.field?.type === "rich-text") &&
							!!value
						)
							return true;
						else return false;
					})
					.trim()
					.optional()
					.isInt({
						min: 1,
						max: config.get("general.maxRichTextFieldLength"),
					})
					.withMessage(
						t(
							"Max length needs to be a positive integer between 1 - %s",
							config.get("general.maxRichTextFieldLength")
						)
					)
					.bail()
					.custom((value, { req }) => {
						if (req.body.richText.minLength) {
							let minValue = null;
							try {
								minValue = parseInt(req.body.richText.minLength, 10);
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
