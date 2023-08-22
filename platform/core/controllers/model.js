import BaseController from "./base.js";
import { ModelModel } from "../schemas/model.js";
import { dbTypeMappings } from "../config/constants.js";

class ModelController extends BaseController {
	constructor() {
		super(ModelModel);
	}

	/**
	 * Returns the list of the default model fields
	 * @param  {string} dbType The database type
	 * @param  {Object} timestamps The timestamps configuration of the model
	 * @param  {string} userId The it the of the user who is creating the new model
	 */
	getDefaultFields(dbType, timestamps, userId, modelType) {
		// We are not creating the default _id or parent fields for sub-model-object or sub-model-list
		if (modelType !== "model") return [];

		let fields = [];
		let orderNumber = 10000;

		//First set-up the ID field
		let id = {};
		id.name = dbType === "MongoDB" ? "_id" : "id";
		id.creator = "system";
		id.order = orderNumber;
		id.type = "id";
		id.dbType = dbTypeMappings[dbType]["id"];
		id.required = true;
		id.unique = true;
		id.immutable = true;
		id.indexed = true;
		id.createdBy = userId;
		id.iid = helper.generateSlug("fld");

		orderNumber += 10000;
		fields.push(id);

		if (!timestamps || timestamps.enabled === false) return fields;

		//Add createdAt timestamp
		let createdAt = {};
		createdAt.name = timestamps.createdAt;
		createdAt.creator = "system";
		createdAt.order = orderNumber;
		createdAt.type = "createdat";
		createdAt.dbType = dbTypeMappings[dbType]["createdat"];
		createdAt.required = true;
		createdAt.unique = false;
		createdAt.immutable = true;
		createdAt.indexed = true;
		createdAt.createdBy = userId;
		createdAt.iid = helper.generateSlug("fld");

		orderNumber += 10000;
		//Add it to fields array
		fields.push(createdAt);

		//Add updatedAt timestamp
		let updatedAt = {};
		updatedAt.name = timestamps.updatedAt;
		updatedAt.creator = "system";
		updatedAt.order = orderNumber;
		updatedAt.type = "updatedat";
		updatedAt.dbType = dbTypeMappings[dbType]["updatedat"];
		updatedAt.label = timestamps.updatedAt;
		updatedAt.required = true;
		updatedAt.unique = false;
		updatedAt.immutable = false;
		updatedAt.indexed = true;
		updatedAt.createdBy = userId;
		updatedAt.iid = helper.generateSlug("fld");

		orderNumber += 10000;
		//Add it to fields array
		fields.push(updatedAt);

		return fields;
	}

	/**
	 * Returns the order number for a new field
	 * @param  {Object} modelObj The model object
	 */
	getNewFieldOrderNumber(modelObj) {
		let order = 0;
		let length = modelObj.fields.length;
		for (let i = 0; i < length; i++) {
			if (modelObj.fields[i].order > order) {
				order = modelObj.fields[i].order;
			}
		}

		return order + 10000;
	}

	/**
	 * Normalizes the field properties to the correct values. Some field properties cannot be set for specific field types.
	 * @param  {String} propName The name of the property to check
	 * @param  {String} fieldType The type of the field
	 * @param  {boolean} propValue The current value of the field property
	 */
	getNormalizedFieldPropValue(propName, fieldType, propValue) {
		switch (propName) {
			// Unique value cannot be set for
			case "unique":
				if (
					[
						"object",
						"object-list",
						"basic-values-list",
						"json",
						"binary",
						"geo-point",
						"encrypted-text",
						"rich-text",
					].includes(fieldType)
				)
					return false;
				else return propValue ?? false;
			// Immutable (read-only) value cannot be set for
			case "immutable":
				if (["object", "object-list"].includes(fieldType)) return false;
				else return propValue ?? false;
			// Indexed value cannot be set for
			case "indexed":
				if (
					[
						"object",
						"object-list",
						"json",
						"binary",
						"encrypted-text",
					].includes(fieldType)
				)
					return false;
				else return propValue ?? false;
			default:
				return propValue;
		}
	}

	/**
	 * Returns the field specifid property key.
	 * @param  {String} fieldType The type of the field
	 */
	getFieldSpecificPropName(type) {
		switch (type) {
			case "basic-values-list":
				return "basicValuesList";
			case "decimal":
				return "decimal";
			case "integer":
				return "integer";
			case "encrypted-text":
				return "encryptedText";
			case "enum":
				return "enum";
			case "object":
				return "object";
			case "object-list":
				return "objectList";
			case "rich-text":
				return "richText";
			case "text":
				return "text";
			case "reference":
				return "reference";
			default:
				return undefined;
		}
	}

	/**
	 * Recursively iterates through the model hierarchy and identifies the dependent models to the input sub-model field.
	 * If the field is a sub model object or sub model object list then there will be dependent models to this field.
	 * @param  {Object} model The starting model.
	 * @param  {Object} field The field to check dependencies.
	 * @param  {Object} models The the list of dependent model identifiers to return
	 */
	async getDependentModelsToField(model, field, models = []) {
		let subModel = await this.getOneByQuery({
			versionId: model.versionId,
			iid: field.type === "object" ? field.object.iid : field.objectList.iid,
		});

		if (subModel) {
			models.push(subModel);
			// Iterate throuth the model fields
			for (let i = 0; i < subModel.fields.length; i++) {
				const element = subModel.fields[i];
				if (["object", "object-list"].includes(element.type)) {
					await this.getDependentModelsToField(subModel, element, models);
				}
			}
		}

		return models;
	}

	/**
	 * Recursively iterates through the model hierarchy and identifies the dependent models to the input model.
	 * If the field is a sub model object or sub model object list then there will be dependent models to this field.
	 * @param  {Object} model The starting model.
	 * @param  {Object} models The the list of dependent model identifiers to return
	 */
	async getDependentModelsToModel(model, models = []) {
		if (["sub-model-object", "sub-model-list"].includes(model.type))
			models.push(model);

		// Iterate throuth the model fields
		for (let i = 0; i < model.fields.length; i++) {
			const element = model.fields[i];
			if (["object", "object-list"].includes(element.type)) {
				let subModel = await this.getOneByQuery({
					versionId: model.versionId,
					iid:
						element.type === "object"
							? element.object.iid
							: element.objectList.iid,
				});

				if (subModel) await this.getDependentModelsToModel(subModel, models);
			}
		}

		return models;
	}

	/**
	 * Returns the model and field information that are dependend to the input models.
	 * @param  {Object} model The input models.
	 * @param  {Object} models The the list of dependent model and reference field information
	 */
	async getDependentReferenceFieldsToModels(versionId, models) {
		let iids = models.map((entry) => entry.iid.toString());

		// Get the list of models that have a dependent object reference field
		let result = await this.getManyByQuery({
			versionId: versionId,
			"fields.type": "reference",
			"fields.reference.iid": { $in: iids },
		});

		// Only return the matching reference fields for the models and filter out all other fields
		for (let i = 0; i < result.length; i++) {
			const model = result[i];
			model.fields = model.fields.filter(
				(entry) =>
					entry.type === "reference" &&
					iids.includes(entry.reference.iid?.toString())
			);
		}

		return result;
	}

	/**
	 * Returns the order number for a new validation rule of a field
	 * @param  {Object} fieldObj The field object
	 */
	getNewValidationRuleOrderNumber(fieldObj) {
		let order = 0;
		let length = fieldObj.validationRules.length;
		for (let i = 0; i < length; i++) {
			if (fieldObj.validationRules[i].order > order) {
				order = fieldObj.validationRules[i].order;
			}
		}

		return order + 10000;
	}

	/**
	 * Prepares the missing fields information
	 * @param  {Object} modelObj The model object
	 * @param  {Array} newFields The new fields information, provides the name and type of the field to add
	 */
	prepareAuthUserDataModelMissingFields(modelObj, newFields, user) {
		const fieldsToAdd = [];
		let startingOrderNumber = this.getNewFieldOrderNumber(modelObj);
		for (const newField of newFields) {
			// Assign the field values
			let fieldData = {
				_id: helper.generateId(),
				name: newField.name,
				iid: helper.generateSlug("fld"),
				creator: "user",
				type: newField.type,
				order: (startingOrderNumber += 10000),
				required: ["provider", "signUpAt"].includes(newField.name)
					? true
					: false,
				unique: ["email", "phone"].includes(newField.name) ? true : false,
				immutable: ["provider", "providerUserId", "2faSecret"].includes(
					newField.name
				)
					? true
					: false,
				indexed: [
					"provider",
					"providerUserId",
					"email",
					"phone",
					"name",
					"signUpAt",
					"lastLoginAt",
				].includes(newField.name)
					? true
					: false,
				createdBy: user._id,
			};

			if (newField.type === "text") {
				fieldData.text = {
					searchable: false,
					maxLength: 1024,
					trim: "none",
					caseStyle: "none",
					acceptType: "all",
				};
			} else if (newField.type === "encrypted-text") {
				fieldData.encryptedText = {
					maxLength: config.get("general.maxEncryptedTextFieldLength"),
				};
			}

			fieldsToAdd.push(fieldData);
		}

		return fieldsToAdd;
	}

	/**
	 * Returns the list of models that can be referened in a reference field
	 * @param  {Array} models The list all models defined in the database including sub-object and sub-object-list models
	 */
	getReferenceModelsList(models) {
		const refModels = [];
		for (const model of models) {
			refModels.push({
				name: this.getModelFullName(models, model),
				schema: model.schema,
				iid: model.iid,
			});
		}

		return refModels;
	}

	/**
	 * Returns the full name of the model (if there are parent models then parent names are also prepended)
	 * @param  {Array} models The list all models defined in the database including sub-object and sub-object-list models
	 * @param  {Objecdt} model The model object
	 */
	getModelFullName(models, model) {
		if (model.parentiid) {
			let parent = this.getModel(models, model.parentiid);
			return this.getModelFullName(models, parent) + "." + model.name;
		} else return model.name;
	}

	/**
	 * Returns the model info identified by iid
	 * @param  {Array} models The list all models defined in the database including sub-object and sub-object-list models
	 * @param  {string} iid The iid of the model
	 */
	getModel(models, iid) {
		return models.find((model) => model.iid === iid);
	}
}

export default new ModelController();
