import { body } from "express-validator";
import modelCtrl from "../../controllers/model.js";

export const referenceRules = (type) => {
	switch (type) {
		case "create-field":
		case "update-field":
			return [
				body("reference")
					.if((value, { req }) => {
						if (
							req.body.type === "reference" ||
							req.field?.type === "reference"
						)
							return true;
						else return false;
					})
					.notEmpty()
					.withMessage(
						t("Reference properties need to be provided, cannot be left empty")
					),
				body("reference.iid")
					.if((value, { req }) => {
						if (
							req.body.type === "reference" ||
							req.field?.type === "reference"
						)
							return true;
						else return false;
					})
					.trim()
					.notEmpty()
					.withMessage(
						t("Referenced model id needs to be provided, cannot be left empty")
					)
					.bail()
					.custom(async (value, { req }) => {
						let model = await modelCtrl.getOneByQuery({
							versionId: req.version._id,
							iid: value,
						});

						if (!model) {
							throw new AgnostError(
								t(
									"No such referenced model exists with the provided id '%s'",
									value
								)
							);
						}

						return true;
					}),
			];
		default:
			return [];
	}
};
