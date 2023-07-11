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
			];
		default:
			return [];
	}
};
