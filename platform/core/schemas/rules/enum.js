import { body } from "express-validator";

export const enumRules = (type) => {
	switch (type) {
		case "create-field":
		case "update-field":
			return [
				body("enum")
					.if((value, { req }) => {
						if (req.body.type === "enum" || req.field?.type === "enum")
							return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t(
							"Enumeration properties need to be provided, cannot be left empty"
						)
					),
				body("enum.selectList")
					.if((value, { req }) => {
						if (req.body.type === "enum" || req.field?.type === "enum")
							return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t(
							"Enumeration values list needs to be provided, cannot be left empty"
						)
					)
					.bail()
					.custom((value) => {
						if (!Array.isArray(value)) {
							throw new AgnostError(
								t("Enumeration values list needs to be an array of strings")
							);
						}

						if (value.length > config.get("general.maxOptionsCount")) {
							throw new AgnostError(
								t(
									"Enumeration values list can hold maximum %s items",
									config.get("general.maxOptionsCount")
								)
							);
						}
						//Indicates the success of this synchronous custom validator
						return true;
					}),
			];

		default:
			return [];
	}
};
