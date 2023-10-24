import { body } from "express-validator";
import { ftsIndexLanguages } from "../../config/constants.js";

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
				body("richText.language")
					.if((value, { req }) => {
						if (
							(req.body.type === "rich-text" ||
								req.field?.type === "rich-text") &&
							req.body.richText?.searchable
						)
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (!req.body.richText?.searchable) return true;
						if (!ftsIndexLanguages[req.db.type].some((item) => item.value.toString() === value)) {
							throw new AgnostError(
								t(
									"Language/collation '%s' is not supported in '%s' databases",
									value,
									req.db.type
								)
							);
						}

						if (
							type === "update-field" &&
							req.field.richText.language &&
							req.field.richText.language !== value
						) {
							throw new AgnostError(
								t(
									"Language/collation of the field cannot be changed from '%s' to '%s'",
									req.field.text.language,
									value
								)
							);
						}

						// If this is a MongoDB database then we need to check if there are other searchable fields and if there is any
						// the language needs to match the existing language.
						if (req.db.type === "MongoDB") {
							for (const field of req.model.fields) {
								if (
									field.type === "text" &&
									field.text?.searchable &&
									field.text?.language !== value
								)
									throw new AgnostError(
										t(
											"There is already a searchable field named '%s' in model '%s' with language/collaction '%s'. You cannot use a different language/collation for a searchable field in MongoDB database models at the same level of the hierarchy.",
											field.name,
											req.model.name,
											field.text?.language
										)
									);

								if (
									field.type === "rich-text" &&
									field.richText?.searchable &&
									field.richText?.language !== value
								)
									throw new AgnostError(
										t(
											"There is already a searchable field named '%s' in model '%s' with language/collaction '%s'. You cannot use a different language/collation for a searchable field in MongoDB database models at the same level of the hierarchy.",
											field.name,
											req.model.name,
											field.richText?.language
										)
									);
							}
						}

						return true;
					}),
			];
		default:
			return [];
	}
};
