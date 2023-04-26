import express from "express";
import modelCtrl from "../controllers/model.js";
import auditCtrl from "../controllers/audit.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateDb } from "../middlewares/validateDb.js";
import {
	validateModel,
	validateOls,
	validateField,
	validateValidationRule,
} from "../middlewares/validateModel.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/model.js";
import { applyRules as fieldRules } from "../schemas/rules/field.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model
@method     GET
@desc       Get top-level models of the database, sorted by name ascending order
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.model.view"),
	async (req, res) => {
		try {
			let models = await modelCtrl.getManyByQuery(
				{ dbId: req.db._id, type: "model" },
				{ sort: { name: 1 } }
			);
			res.json(models);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model
@method     POST
@desc       Creates a new model
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.model.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		try {
			const { user, org, app, version, db } = req;
			const { name, description, timestamps } = req.body;

			// Create the new model object
			let modelId = helper.generateId();
			let model = await modelCtrl.create(
				{
					_id: modelId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					iid: helper.generateSlug("mdl"),
					name,
					type: "model",
					description,
					timestamps,
					fields: modelCtrl.getDefaultFields(
						db.type,
						timestamps,
						null,
						user._id
					),
					createdBy: user._id,
				},
				{ cacheKey: modelId }
			);

			res.json(model);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
				"create",
				t("Created a new model '%s' in database '%s'", name, db.name),
				model,
				{ orgId: org._id, appId: app._id, versionId: version._id, dbId: db._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId
@method     GET
@desc       Get a specific database model
@access     private
*/
router.get(
	"/:modelId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.view"),
	async (req, res) => {
		try {
			res.json(req.model);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/delete-multi
@method     DELETE
@desc       Deletes the list of top-level models
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.model.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db } = req;
			const { modelIds } = req.body;

			// Get the list of models that will be deleted
			let models = await modelCtrl.getManyByQuery({
				_id: { $in: modelIds },
				versionId: version._id,
				type: "model",
			});

			if (models.length === 0) return res.json();

			// Get the list of dependent models to the deleted models
			let dependentModels = [];
			for (let i = 0; i < models.length; i++) {
				const entry = models[i];
				let list = await modelCtrl.getDependentModelsToModel(entry);

				dependentModels.push(...list);
			}

			// Get the list of dependent reference fields to the deleted models including dependent ones
			let dependents = await modelCtrl.getDependentReferenceFieldsToModels(
				version._id,
				dependentModels
			);

			// First delete the dependent reference fields
			for (let i = 0; i < dependents.length; i++) {
				const depModel = dependents[i];
				await modelCtrl.pullObjectByQuery(
					depModel._id,
					"fields",
					{ _id: { $in: depModel.fields.map((entry) => entry._id) } },
					{ updatedBy: user._id },
					{ cacheKey: depModel._id, session }
				);
			}

			// Delete the list of top level models and their dependent models
			let ids = models
				.map((entry) => entry._id)
				.concat(dependentModels.map((entry) => entry._id));

			await modelCtrl.deleteManyByQuery(
				{ _id: { $in: ids } },
				{
					cacheKey: ids,
					session,
				}
			);

			await modelCtrl.commit(session);
			res.json();

			models.forEach((model) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.db.model",
					"delete",
					t("Deleted model '%s' from database '%s'", model.name, db.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						dbId: db._id,
						modelId: model._id,
					}
				);
			});
		} catch (err) {
			await modelCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId
@method     DELETE
@desc       Delete a top level model
@access     private
*/
router.delete(
	"/:modelId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.delete"),
	async (req, res) => {
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model } = req;

			// Get the list of dependent models to the deleted model
			let dependentModels = await modelCtrl.getDependentModelsToModel(model);

			// Get the list of dependent reference fields to the deleted model
			let dependents = await modelCtrl.getDependentReferenceFieldsToModels(
				version._id,
				[model]
			);

			// First delete the dependent reference fields
			for (let i = 0; i < dependents.length; i++) {
				const depModel = dependents[i];
				await modelCtrl.pullObjectByQuery(
					depModel._id,
					"fields",
					{ _id: { $in: depModel.fields.map((entry) => entry._id) } },
					{ updatedBy: user._id },
					{ cacheKey: depModel._id, session }
				);
			}

			// Delete the top level model and its dependent models
			let ids = dependentModels.map((entry) => entry._id).concat([model._id]);
			await modelCtrl.deleteManyByQuery(
				{ _id: { $in: ids } },
				{
					cacheKey: ids,
					session,
				}
			);

			await modelCtrl.commit(session);
			res.json();

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
				"delete",
				t("Deleted model '%s' from database '%s'", model.name, db.name),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
				}
			);
		} catch (err) {
			await modelCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/desc
@method     PUT
@desc       Upadate model description
@access     private
*/
router.put(
	"/:modelId/desc",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	applyRules("update-description"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model } = req;
			const { description } = req.body;

			// Update app name
			let updatedModel = await modelCtrl.updateOneById(
				model._id,
				{ description, updatedBy: user._id },
				{},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
				"update",
				t(
					"Update the description of the model '%s' from '%s' to '%s'",
					model.name,
					model.description,
					description
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/name
@method     PUT
@desc       Upadate model name
@access     private
*/
router.put(
	"/:modelId/name",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	applyRules("rename"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model } = req;
			const { name } = req.body;

			// Update app name
			let updatedModel = await modelCtrl.updateOneById(
				model._id,
				{ name, updatedBy: user._id },
				{},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
				"update",
				t("Update the name of the model '%s' to '%s'", model.name, name),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/enable-timestamps
@method     PUT
@desc       Enable model timestamps
@access     private
*/
router.put(
	"/:modelId/enable-timestamps",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	applyRules("enable-timestamps"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model } = req;
			const { createdAt, updatedAt } = req.body;

			if (model.timestamps?.enabled === true) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The request is not allowed, model already has timestamps enabled."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			//Add createdAt timestamp
			let cAt = {};
			cAt.name = createdAt;
			cAt.creator = "system";
			cAt.order = modelCtrl.getNewFieldOrderNumber(model);
			cAt.type = "createdat";
			cAt.required = true;
			cAt.unique = false;
			cAt.immutable = true;
			cAt.indexed = true;
			cAt.createdBy = user._id;
			cAt.iid = helper.generateSlug("fld");

			//Add updatedAt timestamp
			let uAt = {};
			uAt.name = updatedAt;
			uAt.creator = "system";
			uAt.order = cAt.order + 10000;
			uAt.type = "updatedat";
			uAt.required = true;
			uAt.unique = false;
			uAt.immutable = false;
			uAt.indexed = true;
			uAt.createdBy = user._id;
			uAt.iid = helper.generateSlug("fld");

			// Add new timestamp fields to the model
			let updatedModel = await modelCtrl.pushObjectById(
				model._id,
				"fields",
				[cAt, uAt],
				{
					updatedBy: user._id,
					"timestamps.enabled": true,
					"timestamps.createdAt": createdAt,
					"timestamps.updatedAt": updatedAt,
				},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.timestamps",
				"update",
				t("Enabled the timestamps of model '%s'", model.name),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/disable-timestamps
@method     PUT
@desc       Disable model timestamps
@access     private
*/
router.put(
	"/:modelId/disable-timestamps",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	async (req, res) => {
		try {
			const { org, user, app, version, db, model } = req;

			if (model.timestamps?.enabled === false) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The request is not allowed, model does not have timestampts that you can disable"
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			let fields = model.fields
				.filter(
					(entry) => entry.type == "createdat" || entry.type == "updatedat"
				)
				.map((entry) => entry._id);

			// Remove timestamp fields from the model
			let updatedModel = await modelCtrl.pullObjectByQuery(
				model._id,
				"fields",
				{ _id: { $in: fields } },
				{
					"timestamps.enabled": false,
					"timestamps.createdAt": "createdAt",
					"timestamps.updatedAt": "updatedAt",
					updatedBy: user._id,
				},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.timestamps",
				"update",
				t("Disabled the timestamps of model '%s'", model.name),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/ols
@method     POST
@desc       Add object level security rule
@access     private
*/
router.post(
	"/:modelId/ols",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	applyRules("add-ols"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model } = req;
			const { action, type, session, rule } = req.body;

			let existingRule = model.ols.find((entry) => entry.action === action);
			if (existingRule) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"There is already a row (object) level security rule defined for '%s' operation. You can only modify or delete an existing rule.",
						action
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Add new OLS rule to the model
			let olsId = helper.generateId();
			let updatedModel = await modelCtrl.pushObjectById(
				model._id,
				"ols",
				{
					_id: olsId,
					action,
					type,
					session,
					rule,
					createdBy: user._id,
				},
				{
					updatedBy: user._id,
				},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.ols",
				"create",
				t(
					"Added row (object) level security rule to model '%s' for '%s' operation",
					model.name,
					action
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					olsId: olsId,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/ols/:olsId
@method     PUT
@desc       Update object level security rule
@access     private
*/
router.put(
	"/:modelId/ols/:olsId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateOls,
	authorizeAppAction("app.model.update"),
	applyRules("update-ols"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model, ols } = req;
			const { type, session, rule } = req.body;

			// Update existing OLS rule
			let updatedModel = await modelCtrl.updateOneByQuery(
				{ _id: model._id, "ols._id": ols._id },
				{
					"ols.$.type": type,
					"ols.$.session": session,
					"ols.$.rule": rule,
					"ols.$.updatedBy": user._id,
					"ols.$.updatedAt": Date.now(),
					updatedBy: user._id,
				},
				{},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.ols",
				"update",
				t(
					"Updated row (object) level security rule of model '%s' for '%s' operation",
					model.name,
					ols.action
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					olsId: ols._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/ols/:olsId
@method     DELETE
@desc       Delete object level security rule
@access     private
*/
router.delete(
	"/:modelId/ols/:olsId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateOls,
	authorizeAppAction("app.model.update"),
	async (req, res) => {
		try {
			const { org, user, app, version, db, model, ols } = req;

			// Delete existing OLS rule
			let updatedModel = await modelCtrl.pullObjectById(
				model._id,
				"ols",
				ols._id,
				{
					updatedBy: user._id,
				},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.ols",
				"delete",
				t(
					"Deleted row (object) level security rule from model '%s' for '%s' operation",
					model.name,
					ols.action
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					olsId: ols._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields
@method     POST
@desc       Add new field to a model
@access     private
*/
router.post(
	"/:modelId/fields",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	fieldRules("create-field"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model } = req;
			const {
				type,
				name,
				description,
				required,
				unique,
				immutable,
				indexed,
				dvExp,
			} = req.body;

			// Assign the field values
			let fieldId = helper.generateId();
			let fieldData = {
				_id: fieldId,
				name,
				iid: helper.generateSlug("fld"),
				creator: "user",
				type,
				order: modelCtrl.getNewFieldOrderNumber(model),
				description,
				required,
				unique: modelCtrl.getNormalizedFieldPropValue("unique", type, unique),
				immutable: modelCtrl.getNormalizedFieldPropValue(
					"immutable",
					type,
					immutable
				),
				indexed: modelCtrl.getNormalizedFieldPropValue(
					"indexed",
					type,
					indexed
				),
				dvExp,
				createdBy: user._id,
			};

			// Assign field specific properties
			let fieldSpecifcPropName = modelCtrl.getFieldSpecificPropName(type);
			if (fieldSpecifcPropName) {
				fieldData[fieldSpecifcPropName] = req.body[fieldSpecifcPropName];
			}

			// If we are creating a sub-model object or sub-model-list then we need to create the assocaited model also
			if (type === "object" || type === "object-list") {
				let pointer = type === "object" ? req.body.object : req.body.objectList;
				let subModelId = helper.generateId();

				let subModelData = {
					_id: subModelId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					iid: helper.generateSlug("mdl"),
					name,
					type: type === "object" ? "sub-model-object" : "sub-model-list",
					parentiid: model.iid,
					timestamps: pointer.timestamps,
					fields: modelCtrl.getDefaultFields(
						db.type,
						pointer.timestamps,
						model.iid,
						user._id
					),
					createdBy: user._id,
				};

				//Clear timestamps info from req body
				delete pointer.timestamps;
				//Set the iid of the field object, to refer it to this new sub-model
				pointer.iid = subModelData.iid;

				// Create the new submodel in the database
				await modelCtrl.create(subModelData, { cacheKey: subModelId, session });
			}

			// Add the new field to the model
			let updatedModel = await modelCtrl.pushObjectById(
				model._id,
				"fields",
				fieldData,
				{
					updatedBy: req.user.id,
				},
				{ cacheKey: model._id, session }
			);

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.fields",
				"create",
				t(
					"Added a new '%s' field named '%s' to model '%s'",
					type,
					name,
					model.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					fieldId: fieldId,
				}
			);
		} catch (error) {
			await modelCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/delete-multi
@method     DELETE
@desc       Delete multiple fields from a model
@access     private
*/
router.delete(
	"/:modelId/fields/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	fieldRules("delete-multi"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model } = req;
			const { fieldIds } = req.body;

			//First filter out the system generated fields from the delete list
			let fields = [];
			for (let i = 0; i < fieldIds.length; i++) {
				let field = model.fields.find(
					(entry) => entry._id.toString() === fieldIds[i].toString()
				);
				if (field && field.creator == "user") {
					fields.push(field);
				}
			}

			// Get the list of impacted models
			let impactedModels = [];
			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];
				if (["object", "object-list"].includes(field.type)) {
					let list = await modelCtrl.getDependentModelsToField(model, field);

					impactedModels.push(...list);
				}
			}

			// If there are dependent models then first delete them
			if (impactedModels.length > 0) {
				// Get the list of dependent reference fields to the deleted impacted models
				let dependents = await modelCtrl.getDependentReferenceFieldsToModels(
					version._id,
					impactedModels
				);

				// First delete the dependent reference fields
				for (let i = 0; i < dependents.length; i++) {
					const depModel = dependents[i];
					await modelCtrl.pullObjectByQuery(
						depModel._id,
						"fields",
						{ _id: { $in: depModel.fields.map((entry) => entry._id) } },
						{ updatedBy: user._id },
						{ cacheKey: depModel._id, session }
					);
				}

				let impactedModelIds = impactedModels.map((entry) => entry._id);
				await modelCtrl.deleteManyByQuery(
					{ _id: { $in: impactedModelIds }, versionId: version._id },
					{
						session,
						cacheKey: impactedModelIds,
					}
				);
			}

			// Delete the fields from the model field list
			let updatedModel = await modelCtrl.pullObjectByQuery(
				model._id,
				"fields",
				{ _id: { $in: fields.map((entry) => entry._id) } },
				{ updatedBy: user._id },
				{ session, cacheKey: model._id }
			);

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			fields.forEach(async (field) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.db.model.fields",
					"delete",
					t(
						"Deleted the '%s' field '%s' from model '%s'",
						field.type,
						field.name,
						model.name
					),
					updatedModel,
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						dbId: db._id,
						modelId: model._id,
						fieldId: field._id,
					}
				);
			});
		} catch (error) {
			await modelCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/order-multi
@method     PUT
@desc       Update order of multiple fields at once
@access     private
*/
router.put(
	"/:modelId/fields/order-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	fieldRules("order-multi"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model } = req;
			const { orders } = req.body;

			//First filter out the system generated fields from the delete list
			let fields = [];
			for (let i = 0; i < orders.length; i++) {
				let field = model.fields.find(
					(entry) => entry._id.toString() === orders[i].id.toString()
				);

				// Set the new order of the field
				field.order = orders[i].order;
				fields.push(field);
			}

			// Update the order of the fields
			let updatedModel = {};
			let updatedAt = Date.now();
			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];
				updatedModel = await modelCtrl.updateOneByQuery(
					{ _id: model._id, "fields._id": field._id },
					{
						"fields.$.order": field.order,
						"fields.$.updatedAt": updatedAt,
						"fields.$.updatedBy": user._id,
						updatedBy: user._id,
					},
					{},
					{ session, cacheKey: model._id }
				);
			}

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			fields.forEach(async (field) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.db.model.fields",
					"delete",
					t(
						"Updated the order of '%s' field '%s' in model '%s'",
						field.type,
						field.name,
						model.name
					),
					updatedModel,
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						dbId: db._id,
						modelId: model._id,
						fieldId: field._id,
					}
				);
			});
		} catch (error) {
			await modelCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId
@method     DELETE
@desc       Delete a specific field of a model
@access     private
*/
router.delete(
	"/:modelId/fields/:fieldId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	authorizeAppAction("app.model.update"),
	async (req, res) => {
		// Start new database transaction session
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model, field } = req;

			//System generated fields cannot be deleted
			if (field.creator !== "user") {
				modelCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Platform generated and managed fields cannot be deleted"),
					code: ERROR_CODES.notAllowed,
				});
			}

			let impactedModels = [];
			if (["object", "object-list"].includes(field.type)) {
				impactedModels = await modelCtrl.getDependentModelsToField(
					model,
					field
				);
			}

			// If there are dependent models then first delete them
			if (impactedModels.length > 0) {
				// Get the list of dependent reference fields to the deleted impacted models
				let dependents = await modelCtrl.getDependentReferenceFieldsToModels(
					version._id,
					impactedModels
				);

				// First delete the dependent reference fields
				for (let i = 0; i < dependents.length; i++) {
					const depModel = dependents[i];
					await modelCtrl.pullObjectByQuery(
						depModel._id,
						"fields",
						{ _id: { $in: depModel.fields.map((entry) => entry._id) } },
						{ updatedBy: user._id },
						{ cacheKey: depModel._id, session }
					);
				}

				let impactedModelIds = impactedModels.map((entry) => entry._id);
				await modelCtrl.deleteManyByQuery(
					{ _id: { $in: impactedModelIds } },
					{
						session,
						cacheKey: impactedModelIds,
					}
				);
			}

			// Delete the field from the models field list
			let updatedModel = await modelCtrl.pullObjectById(
				model._id,
				"fields",
				field._id,
				{ updatedBy: user._id },
				{ session, cacheKey: model._id }
			);

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.fields",
				"delete",
				t(
					"Deleted the '%s' field '%s' from model '%s'",
					field.type,
					field.name,
					model.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					fieldId: field._id,
				}
			);
		} catch (error) {
			await modelCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId
@method     PUT
@desc       Update properties of a field
@access     private
*/
router.put(
	"/:modelId/fields/:fieldId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	authorizeAppAction("app.model.update"),
	fieldRules("update-field"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model, field } = req;
			const { description, required, immutable, indexed, dvExp } = req.body;

			// Assign the field update values
			let fieldUpdateData = null;
			let updatedAt = Date.now();
			// For system managed fields only description can be updated
			if (field.creator === "system") {
				fieldUpdateData = {
					"fields.$.description": description,
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": updatedAt,
					updatedBy: user._id,
				};
			} else {
				fieldUpdateData = {
					"fields.$.description": description,
					"fields.$.required": required,
					"fields.$.immutable": modelCtrl.getNormalizedFieldPropValue(
						"immutable",
						field.type,
						immutable
					),
					"fields.$.indexed": modelCtrl.getNormalizedFieldPropValue(
						"indexed",
						field.type,
						indexed
					),
					"fields.$.dvExp": dvExp,
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": updatedAt,
					updatedBy: user._id,
				};
			}

			// Assign field specific properties, we cannot update field specific properties for object, object-list, and basic-values-list
			let fieldSpecifcPropName = modelCtrl.getFieldSpecificPropName(field.type);
			if (
				fieldSpecifcPropName &&
				!["object", "object-list", "basic-values-list"].includes(field.type)
			) {
				fieldUpdateData[`fields.$.${fieldSpecifcPropName}`] =
					req.body[fieldSpecifcPropName];
			}

			// Update field properties
			let updatedModel = await modelCtrl.updateOneByQuery(
				{ _id: model._id, "fields._id": field._id },
				fieldUpdateData,
				{},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.fields",
				"update",
				t(
					"Updated the properties of '%s' field '%s' in model '%s'",
					field.type,
					field.name,
					model.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					fieldId: field._id,
				}
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId/name
@method     PUT
@desc       Update name of a field
@access     private
*/
router.put(
	"/:modelId/fields/:fieldId/name",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	authorizeAppAction("app.model.update"),
	fieldRules("rename-field"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model, field } = req;
			const { name } = req.body;

			//System generated fields cannot be deleted
			if (field.creator !== "user") {
				modelCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Platform generated and managed fields cannot be renamed"),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Update the name of the field
			let updatedModel = await modelCtrl.updateOneByQuery(
				{ _id: model._id, "fields._id": field._id },
				{
					"fields.$.name": name,
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": Date.now(),
					updatedBy: user._id,
				},
				{},
				{ session, cacheKey: model._id }
			);

			// If we are renaming a sub-model field then we should also rename the sub-model
			// This update is required, while deploying to an enviroment we use the model names to
			// cretae paths for fields, especially in handling field name changes
			if (["object", "object-list", "basic-values-list"].includes(field.type)) {
				let iid =
					field.type === "object" ? field.object.iid : field.objectList.iid;

				let subModel = await modelCtrl.getOneByQuery({
					iid: iid,
					versionId: version._id,
				});

				if (subModel) {
					await modelCtrl.updateOneByQuery(
						{ iid: iid, versionId: version._id },
						{
							name,
							updatedBy: user._id,
						},
						{},
						{ session, cacheKey: subModel._id }
					);
				}
			}

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.fields",
				"update",
				t(
					"Changed the name of '%s' field from '%s' to '%s' in model '%s'",
					field.type,
					field.name,
					name,
					model.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					fieldId: field._id,
				}
			);
		} catch (error) {
			await modelCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId/rules
@method     POST
@desc       Add validation rule to a field
@access     private
*/
router.post(
	"/:modelId/fields/:fieldId/rules",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	authorizeAppAction("app.model.update"),
	fieldRules("add-validation-rule"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model, field } = req;
			const { name, ruleExp, errorExp, bail } = req.body;

			// System generated fields cannot be modified
			if (field.creator !== "user") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Validation rules cannot be added to platform generated and managed fields."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Validation rules cannot be added to sub-object fields
			if (["object", "object-list"].includes(field.type)) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Validation rules cannot be added to sub-model fields."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Add new validation rule to field
			let order = modelCtrl.getNewValidationRuleOrderNumber(field);
			let ruleId = helper.generateId();
			let updatedModel = await modelCtrl.pushObjectByQuery(
				{
					_id: model._id,
					"fields._id": field._id,
				},
				"fields.$.validationRules",
				{
					_id: ruleId,
					name,
					ruleExp,
					errorExp,
					bail,
					order,
				},
				{
					updatedBy: user._id,
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": Date.now(),
				},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.fields.validationRules",
				"create",
				t(
					"Added a new validation rule to model '%s' field '%s'",
					model.name,
					field.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					fieldId: field._id,
					validationRuleId: ruleId,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId/rules/delete-multi
@method     DELETE
@desc       Delete multiple fields from a model
@access     private
*/
router.delete(
	"/:modelId/fields/:fieldId/rules/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	authorizeAppAction("app.model.update"),
	fieldRules("delete-multi-validation-rules"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model, field } = req;
			const { ruleIds } = req.body;

			let rules = field.validationRules.filter((entry) =>
				ruleIds.includes(entry._id.toString())
			);

			// Delete the rules from the field validation rules list
			let updatedModel = await modelCtrl.pullObjectByQuery2(
				{
					_id: model._id,
					"fields._id": field._id,
				},
				"fields.$.validationRules",
				{ _id: { $in: ruleIds } },
				{
					updatedBy: user._id,
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": Date.now(),
				},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			rules.forEach(async (rule) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.db.model.fields.validationRules",
					"delete",
					t(
						"Deleted the validation rule '%s' of field '%s' in model '%s'",
						rule.name,
						field.name,
						model.name
					),
					updatedModel,
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						dbId: db._id,
						modelId: model._id,
						fieldId: field._id,
						validationRuleId: rule._id,
					}
				);
			});
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId/rules/order-multi
@method     PUT
@desc       Changes the order of multiple valdation rules at once
@access     private
*/
router.put(
	"/:modelId/fields/:fieldId/rules/order-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	authorizeAppAction("app.model.update"),
	fieldRules("order-multi-validation-rules"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model, field } = req;
			const { orders } = req.body;

			// Get the index number of the field
			let fieldIndex = 0;
			for (let i = 0; i < model.fields.length; i++) {
				if (model.fields[i]._id.toString() == field._id.toString()) {
					fieldIndex = i;
					break;
				}
			}

			// Update the order of the fields
			let updatedModel = {};
			let updatedAt = Date.now();
			let updatedRules = [];
			for (let i = 0; i < orders.length; i++) {
				const order = orders[i];

				// Get the index number of the rule
				let ruleIndex = -1;
				for (let i = 0; i < field.validationRules.length; i++) {
					if (field.validationRules[i]._id.toString() == order.id.toString()) {
						ruleIndex = i;
						updatedRules.push(field.validationRules[i]);
						break;
					}
				}

				// If we have the rule index then update it
				if (ruleIndex >= 0) {
					// Update validation rule properties of field
					updatedModel = await modelCtrl.updateOneByQuery(
						{
							_id: model._id,
							"fields._id": field._id,
							"fields.validationRules._id":
								field.validationRules[ruleIndex]._id,
						},
						{
							[`fields.${fieldIndex}.validationRules.${ruleIndex}.order`]:
								order.order,
							[`fields.${fieldIndex}.updatedBy`]: user._id,
							[`fields.${fieldIndex}.updatedAt`]: updatedAt,
							updatedBy: user._id,
						},
						{},
						{ session, cacheKey: model._id }
					);
				}
			}

			// Commit transaction
			await modelCtrl.commit(session);
			res.json(updatedModel);

			updatedRules.forEach(async (rule) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.db.model.fields.validationRules",
					"update",
					t(
						"Updated the validation rule order '%s' of field '%s' in model '%s'",
						rule.name,
						field.name,
						model.name
					),
					updatedModel,
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						dbId: db._id,
						modelId: model._id,
						fieldId: field._id,
						validationRuleId: rule._id,
					}
				);
			});
		} catch (err) {
			await modelCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId/rules/:ruleId
@method     PUT
@desc       Update validation rule of a field
@access     private
*/
router.put(
	"/:modelId/fields/:fieldId/rules/:ruleId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	validateValidationRule,
	authorizeAppAction("app.model.update"),
	fieldRules("update-validation-rule"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model, field, rule } = req;
			const { name, ruleExp, errorExp, bail } = req.body;

			// Get the index number of the field
			let fieldIndex = 0;
			for (let i = 0; i < model.fields.length; i++) {
				if (model.fields[i]._id.toString() == field._id.toString()) {
					fieldIndex = i;
					break;
				}
			}

			// Get the index number of the rule
			let ruleIndex = 0;
			for (let i = 0; i < field.validationRules.length; i++) {
				if (field.validationRules[i]._id.toString() == rule._id.toString()) {
					ruleIndex = i;
					break;
				}
			}

			// Update validation rule properties of field
			let updatedModel = await modelCtrl.updateOneByQuery(
				{
					_id: model._id,
					"fields._id": field._id,
					"fields.validationRules._id": rule._id,
				},
				{
					[`fields.${fieldIndex}.validationRules.${ruleIndex}.name`]: name,
					[`fields.${fieldIndex}.validationRules.${ruleIndex}.ruleExp`]:
						ruleExp,
					[`fields.${fieldIndex}.validationRules.${ruleIndex}.errorExp`]:
						errorExp,
					[`fields.${fieldIndex}.validationRules.${ruleIndex}.bail`]: bail,
					[`fields.${fieldIndex}.updatedBy`]: user._id,
					[`fields.${fieldIndex}.updatedAt`]: Date.now(),
					updatedBy: user._id,
				},
				{},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.fields.validationRules",
				"update",
				t(
					"Updated the validation rule '%s' of field '%s' in model '%s'",
					rule.name,
					field.name,
					model.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					fieldId: field._id,
					validationRuleId: rule._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId/fields/:fieldId/rules/:ruleId
@method     DELETE
@desc       Delete a specific validation rule of a field
@access     private
*/
router.delete(
	"/:modelId/fields/:fieldId/rules/:ruleId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	validateField,
	validateValidationRule,
	authorizeAppAction("app.model.update"),
	async (req, res) => {
		try {
			const { org, user, app, version, db, model, field, rule } = req;

			// Delete the rules from the field validation rules list
			let updatedModel = await modelCtrl.pullObjectByQuery2(
				{
					_id: model._id,
					"fields._id": field._id,
				},
				"fields.$.validationRules",
				{ _id: rule._id },
				{
					updatedBy: user._id,
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": Date.now(),
				},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.fields.validationRules",
				"delete",
				t(
					"Deleted the validation rule '%s' of field '%s' in model '%s'",
					rule.name,
					field.name,
					model.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: db._id,
					modelId: model._id,
					fieldId: field._id,
					validationRuleId: rule._id,
				}
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
