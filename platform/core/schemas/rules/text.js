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
			];
		default:
			return [];
	}
};
