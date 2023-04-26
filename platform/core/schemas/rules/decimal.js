import { body } from "express-validator";

export const decimalRules = (type) => {
	switch (type) {
		case "create-field":
		case "update-field":
			return [
				body("decimal")
					.if((value, { req }) => {
						if (req.body.type === "decimal" || req.field?.type === "decimal")
							return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t("Decimal properties need to be provided, cannot be left empty")
					),
				body("decimal.decimalDigits")
					.if((value, { req }) => {
						if (req.body.type === "decimal" || req.field?.type === "decimal")
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(
						t("Decimal digits need to be provided, cannot be left empty")
					)
					.bail()
					.isInt({ min: 0, max: config.get("general.maxDecimalDigits") })
					.withMessage(
						t(
							"Decimal digits needs to be an integer and max %s digits allowed",
							config.get("general.maxDecimalDigits")
						)
					),
				body("decimal.roundingStyle")
					.if((value, { req }) => {
						if (req.body.type === "decimal" || req.field?.type === "decimal")
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(
						t("Rounding Style need to be provided, cannot be left empty")
					)
					.bail()
					.isInt({ min: 0, max: 8 })
					.withMessage(
						t("Rounding Style needs to be be an integer between 0-8")
					),
			];
		default:
			return [];
	}
};
