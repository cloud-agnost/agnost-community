import { body } from "express-validator";
import { textRules } from "./text.js";
import { richTextRules } from "./richText.js";
import { encryptedTextRules } from "./encryptedText.js";
import { decimalRules } from "./decimal.js";
import { enumRules } from "./enum.js";
import { objectRules } from "./object.js";
import { objectListRules } from "./objectList.js";
import { bvlRules } from "./bvl.js";
import { referenceRules } from "./reference.js";
import { fieldTypes } from "../../config/constants.js";

export const applyRules = (type) => {
	return [
		defaultRules(type),
		textRules(type),
		richTextRules(type),
		encryptedTextRules(type),
		decimalRules(type),
		enumRules(type),
		objectRules(type),
		objectListRules(type),
		bvlRules(type),
		referenceRules(type),
	];
};

const defaultRules = (type) => {
	switch (type) {
		case "create-field":
			return [
				body("name")
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
					.bail()
					.custom((value) => {
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

						//Indicates the success of this synchronous custom validator
						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						//Check whether field name is unique or not
						req.model.fields.forEach((field) => {
							if (field.name.toLowerCase() === value.toLowerCase())
								throw new AgnostError(
									t(
										"Field with the provided name already exists in model '%s'",
										field.name
									)
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as field name",
									value
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
				body("type")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(fieldTypes.map((entry) => entry.name))
					.withMessage(t("Unsupported field type"))
					.bail()
					.custom((value, { req }) => {
						if (
							fieldTypes
								.filter((entry) => entry[req.db.type])
								.map((entry) => entry.name)
								.includes(value)
						)
							return true;

						throw new AgnostError(
							t(
								"'%s' is not a supported field type for a '%s' database",
								value,
								req.db.type
							)
						);
					}),
				body("description")
					.trim()
					.optional()
					.isLength({ max: config.get("general.maxDetailTxtLength") })
					.withMessage(
						t(
							"Description can be max %s characters long",
							config.get("general.maxDetailTxtLength")
						)
					),
				body("required")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("unique")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("immutable")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("indexed")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("rule").trim().optional(),
			];
		// Name, type and uniqueness values of a field once set cannot be changed
		case "update-field":
			return [
				body("description")
					.trim()
					.optional()
					.isLength({ max: config.get("general.maxDetailTxtLength") })
					.withMessage(
						t(
							"Description can be max %s characters long",
							config.get("general.maxDetailTxtLength")
						)
					),
				body("required")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("immutable")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("indexed")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("rule").trim().optional(),
			];
		case "delete-multi":
			return [
				body("fieldIds.*")
					.trim()
					.optional()
					.custom((value) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valid object identifier"));
						}
						return true;
					}),
			];
		case "order-multi":
			return [
				body("orders")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value) => {
						if (!Array.isArray(value)) {
							throw new AgnostError(t("Not a valid field order list"));
						}
						return true;
					}),
				body("orders.*.id")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valid object identifier"));
						}
						return true;
					}),
				body("orders.*.order")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({ min: 1 })
					.withMessage(t("Order needs to be a positive integer"))
					.toInt(),
			];
		case "rename-field":
			return [
				body("name")
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
					.bail()
					.custom((value) => {
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

						//Indicates the success of this synchronous custom validator
						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						//Check whether field name is unique or not
						req.model.fields.forEach((field) => {
							if (
								field.name.toLowerCase() === value.toLowerCase() &&
								field._id.toString() !== req.field._id.toString()
							)
								throw new AgnostError(
									t(
										"Field with the provided name already exists in model '%s'",
										field.name
									)
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as field name",
									value
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
			];
		case "add-validation-rule":
		case "update-validation-rule":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("ruleExp")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("errorExp")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("bail")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
			];
		case "delete-multi-validation-rules":
			return [
				body("ruldIds.*")
					.trim()
					.optional()
					.custom((value) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valid object identifier"));
						}
						return true;
					}),
			];
		case "order-multi-validation-rules":
			return [
				body("orders")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value) => {
						if (!Array.isArray(value)) {
							throw new AgnostError(
								t("Not a valid validation rule order list")
							);
						}
						return true;
					}),
				body("orders.*.id")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valid object identifier"));
						}
						return true;
					}),
				body("orders.*.order")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({ min: 1 })
					.withMessage(t("Order needs to be a positive integer"))
					.toInt(),
			];
		default:
			return [];
	}
};
