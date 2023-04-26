import modelCtrl from "../controllers/model.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateModel = async (req, res, next) => {
	try {
		const { modelId } = req.params;

		// Get the model object
		let model = await modelCtrl.getOneById(modelId, { cacheKey: modelId });

		if (!model) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("No such model with the provided id '%s' exists.", modelId),
				code: ERROR_CODES.notFound,
			});
		}

		if (model.dbId.toString() !== req.db._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"App database does not have a model with the provided id '%s'",
					modelId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Assign model data
		req.model = model;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateOls = async (req, res, next) => {
	try {
		const { olsId } = req.params;

		// Get the param object
		let ols = req.model.ols.find(
			(entry) => entry._id.toString() === olsId.toString()
		);

		if (!ols) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such row (object) level security rule with the provided id '%s' exists.",
					olsId
				),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign ols data
		req.ols = ols;
		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateField = async (req, res, next) => {
	try {
		const { fieldId } = req.params;
		const { model } = req;

		// Get the field object
		let field = await model.fields.find(
			(entry) => entry._id.toString() === fieldId
		);

		if (!field) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("No such field with the provided id '%s' exists.", fieldId),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign field data
		req.field = field;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};

export const validateValidationRule = async (req, res, next) => {
	try {
		const { ruleId } = req.params;
		const { field } = req;

		// Get the validation rule object
		let rule = await field.validationRules.find(
			(entry) => entry._id.toString() === ruleId
		);

		if (!rule) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such validation rule with the provided id '%s' exists.",
					ruleId
				),
				code: ERROR_CODES.notFound,
			});
		}

		// Assign validation rule data
		req.rule = rule;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
