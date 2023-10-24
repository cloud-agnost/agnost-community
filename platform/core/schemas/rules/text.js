import { body } from "express-validator";
import { ftsIndexLanguages } from "../../config/constants.js";

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
					})
					.withMessage(
						t(
							"Max length needs to be a positive integer greater than or equal 1"
						)
					)
					.bail()
					.custom((value, { req }) => {
						const { db } = req;
						if (db.type === "MongoDB") return true;
						else if (
							db.type === "PostgreSQL" &&
							value > config.get("general.PostgreSQLmaxTextFieldLength")
						)
							throw new AgnostError(
								t(
									"Max length cannot be larger than %s",
									config.get("general.PostgreSQLmaxTextFieldLength")
								)
							);
						else if (
							db.type === "MySQL" &&
							value > config.get("general.MySQLmaxTextFieldLength")
						)
							throw new AgnostError(
								t(
									"Max length cannot be larger than %s",
									config.get("general.MySQLmaxTextFieldLength")
								)
							);
						else if (
							db.type === "SQL Server" &&
							value > config.get("general.SQLServermaxTextFieldLength")
						)
							throw new AgnostError(
								t(
									"Max length cannot be larger than %s",
									config.get("general.SQLServermaxTextFieldLength")
								)
							);
						else if (
							db.type === "Oracle" &&
							value > config.get("general.OraclemaxTextFieldLength")
						)
							throw new AgnostError(
								t(
									"Max length cannot be larger than %s",
									config.get("general.OraclemaxTextFieldLength")
								)
							);

						return true;
					}),
				body("text.language")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							req.body.text?.searchable
						)
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (!req.body.text?.searchable) return true;
						if (!ftsIndexLanguages[req.db.type].includes(value)) {
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
							req.field.text.language &&
							req.field.text.language !== value
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
