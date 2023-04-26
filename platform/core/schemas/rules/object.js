import { body } from "express-validator";

export const objectRules = (type) => {
	switch (type) {
		case "create-field":
			return [
				body("object")
					.if((value, { req }) => {
						if (req.body.type === "object" || req.field?.type === "object") {
							return true;
						} else return false;
					})
					.notEmpty()
					.withMessage(
						t("Object properties need to be provided, cannot be left empty")
					),
				body("object.timestamps.enabled")
					.if((value, { req }) => {
						if (req.body.type === "object" || req.field?.type === "object") {
							return true;
						} else return false;
					})
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("object.timestamps.createdAt")
					.if((value, { req }) => {
						if (req.body.type === "object" || req.field?.type === "object") {
							return true;
						} else return false;
					})
					.if((value, { req }) => {
						if (req.body.object?.timestamps?.enabled) return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxFieldNameLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxFieldNameLength")
						)
					)
					.custom((value, { req }) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Field names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Field names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Field names cannot start with underscore (_) character")
							);
						}

						if (
							value.toLowerCase() ===
							req.body.object.timestamps?.updatedAt?.toLowerCase()
						) {
							throw new AgnostError(
								t(
									"Created at and updated at timestamp field names cannot be the same"
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
				body("object.timestamps.updatedAt")
					.if((value, { req }) => {
						if (req.body.type == "object" || req.field?.type === "object") {
							return true;
						} else return false;
					})
					.if((value, { req }) => {
						if (req.body.object?.timestamps?.enabled) return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxFieldNameLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxFieldNameLength")
						)
					)
					.custom((value, { req }) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Field names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Field names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Field names cannot start with underscore (_) character")
							);
						}

						if (
							value.toLowerCase() ===
							req.body.object.timestamps?.createdAt?.toLowerCase()
						) {
							throw new AgnostError(
								t(
									"Created at and updated at timestamp field names cannot be the same"
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
