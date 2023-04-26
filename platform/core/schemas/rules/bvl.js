import { body } from "express-validator";
import { bvlTypes } from "../../config/constants.js";

export const bvlRules = (type) => {
	switch (type) {
		case "create-field":
			return [
				body("basicValuesList")
					.if((value, { req }) => {
						if (
							req.body.type === "basic-values-list" ||
							req.field?.type === "basic-values-list"
						) {
							return true;
						} else return false;
					})
					.notEmpty()
					.withMessage(
						t(
							"Basic values list properties need to be provided, cannot be left empty"
						)
					),
				body("basicValuesList.type")
					.if((value, { req }) => {
						if (
							req.body.type === "basic-values-list" ||
							req.field?.type === "basic-values-list"
						)
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(
						t(
							"Basic values list data type needs to be provided, cannot be left empty"
						)
					)
					.bail()
					.isIn(bvlTypes)
					.withMessage((value) => {
						return t(
							"'%s' is not a valid basic values list type that can be set",
							value
						);
					}),
			];
		case "updated-field":
			return [
				body("basicValuesList.type")
					.if((value, { req }) => {
						if (
							req.body.type === "basic-values-list" ||
							req.field?.type === "basic-values-list"
						)
							return true;
						else return false;
					})
					.trim()
					.custom(async (value, { req }) => {
						//Check whether reference model exists or not
						if (value !== req.field.basicValuesList.type) {
							throw new AgnostError(
								t(
									"Once set basic values list field data type cannot be changed"
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
