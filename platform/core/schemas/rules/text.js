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
				body("text.minLength")
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
							"Min length needs to be a positive integer between 1 - %s",
							config.get("general.maxTextFieldLength")
						)
					),
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
					)
					.bail()
					.custom((value, { req }) => {
						if (req.body.text.minLength) {
							let minValue = null;
							try {
								minValue = parseInt(req.body.text.minLength, 10);
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
				body("text.trim")
					.if((value, { req }) => {
						if (req.body.type === "text" || req.field?.type === "text")
							return true;
						else return false;
					})
					.trim()
					.optional()
					.isIn(["none", "leading", "trailing", "l+t", "any"])
					.withMessage((value) => {
						return t(
							"'%s' is not a valid trimming type that can be set",
							value
						);
					}),
				body("text.caseStyle")
					.if((value, { req }) => {
						if (req.body.type === "text" || req.field?.type === "text")
							return true;
						else return false;
					})
					.trim()
					.optional()
					.isIn([
						"none",
						"uppercase",
						"lowercase",
						"sentencecase",
						"capitilizewords",
					])
					.withMessage((value) => {
						return t("'%s' is not a valid case style that can be set", value);
					}),
				body("text.acceptType")
					.if((value, { req }) => {
						if (req.body.type === "text" || req.field?.type === "text")
							return true;
						else return false;
					})
					.trim()
					.optional()
					.isIn(["all", "select", "regex"])
					.withMessage((value) => {
						return t("'%s' is not a valid accept type that can be set", value);
					}),
				body("text.acceptSelect.letters")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							req.body.text &&
							req.body.text.acceptType === "select"
						)
							return true;
						else return false;
					})
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("text.acceptSelect.numbers")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							req.body.text &&
							req.body.text.acceptType === "select"
						)
							return true;
						else return false;
					})
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("text.acceptSelect.spaces")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							req.body.text &&
							req.body.text.acceptType === "select"
						)
							return true;
						else return false;
					})
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("text.acceptSelect.special")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							req.body.text &&
							req.body.text.acceptType === "select"
						)
							return true;
						else return false;
					})
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("text.acceptSelect.specialChars")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							req.body.text &&
							req.body.text.acceptType === "select" &&
							req.body.text.acceptSelect.special === true
						)
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(
						t("Special characters needs to be provided, cannot be left empty")
					),
				body("text.regex")
					.if((value, { req }) => {
						if (
							(req.body.type === "text" || req.field?.type === "text") &&
							req.body.text &&
							req.body.text.acceptType === "regex"
						)
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(
						t("Regular expression needs to be provided, cannot be left empty")
					)
					.bail()
					.custom((value) => {
						try {
							new RegExp(value);
							//Indicates the success of this custom regex validator
							return true;
						} catch (err) {
							throw new AgnostError(t("Not a valid regular expression"));
						}
					}),
			];
		default:
			return [];
	}
};
