import express from "express";
import modelCtrl from "../controllers/model.js";
import auditCtrl from "../controllers/audit.js";
import deployCtrl from "../controllers/deployment.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateDb } from "../middlewares/validateDb.js";
import { validateModel, validateField } from "../middlewares/validateModel.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/model.js";
import { applyRules as fieldRules } from "../schemas/rules/field.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import { dbTypeMappings } from "../config/constants.js";
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
			const { name, description, timestamps, schemaiid } = req.body;

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
					schemaiid,
					timestamps,
					fields: modelCtrl.getDefaultFields(
						db.type,
						timestamps,
						user._id,
						"model"
					),
					createdBy: user._id,
				},
				{ cacheKey: modelId }
			);

			res.json(model);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

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
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/ref
@method     GET
@desc       Get a list of models that can be referenced
@access     private
*/
router.get(
	"/ref",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.model.view"),
	async (req, res) => {
		try {
			const models = await modelCtrl.getManyByQuery(
				{ dbId: req.db._id, type: "model" },
				{ sort: { name: 1 } }
			);

			res.json(models);

			/* If we allow references to sub-model objects then below code is needed
			res.json(
				modelCtrl.getReferenceModelsList(models).sort((a, b) => {
					if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return 0;
				})
			); */
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
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/iid/:iid
@method     GET
@desc       Get a specific database model by iid
@access     private
*/
router.get(
	"/iid/:iid",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	authorizeAppAction("app.model.view"),
	async (req, res) => {
		try {
			const { version } = req;
			const { iid } = req.params;

			const model = await modelCtrl.getOneByQuery({
				iid: iid,
				versionId: version._id,
			});

			res.json(model);
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
			});

			if (models.length === 0) return res.json();

			for (let i = 0; i < models.length; i++) {
				const model = models[i];

				// Check whether the model is a top level model or not
				if (model.type !== "model") {
					await modelCtrl.endSession(session);
					return res.status(422).json({
						error: t("Not Allowed"),
						details: t(
							"'%s' is not a top level model. Only top level models can be deleted.",
							model.name
						),
						code: ERROR_CODES.notAllowed,
					});
				}

				// If the model to be deleted is used as the model to store authenticated user data then return error
				if (
					version.authentication?.userDataModel?.database === db.iid &&
					version.authentication?.userDataModel?.model === model.iid
				) {
					await modelCtrl.endSession(session);
					return res.status(422).json({
						error: t("Not Allowed"),
						details: t(
							"Model '%s' is used as the authentication model to store user data in version user authentication settings. You cannot delete the user authentication data model.",
							model.name
						),
						code: ERROR_CODES.notAllowed,
					});
				}
			}

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
				[...dependentModels, ...models]
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
				{ _id: { $in: ids }, versionId: version._id },
				{
					cacheKey: ids,
					session,
				}
			);

			await modelCtrl.commit(session);
			res.json();

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

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
@desc       Deletes a top level model. Note: Sub-models are deleted as a field of their parent model.
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
			// Check whether the model is a top level model or not
			if (model.type !== "model") {
				await modelCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"'%s' is not a top level model. Only top level models can be deleted.",
						model.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// If the model to be deleted is used as the model to store authenticated user data then return error
			if (
				version.authentication?.userDataModel?.database === db.iid &&
				version.authentication?.userDataModel?.model === model.iid
			) {
				await modelCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Model '%s' is used as the authentication model to store user data in version user authentication settings. You cannot delete the user authentication data model.",
						model.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Get the list of dependent models to the deleted model
			let dependentModels = await modelCtrl.getDependentModelsToModel(model);

			// Get the list of dependent reference fields to the deleted model and its dependents
			let dependents = await modelCtrl.getDependentReferenceFieldsToModels(
				version._id,
				[model, ...dependentModels]
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
				{ _id: { $in: ids }, versionId: version._id },
				{
					cacheKey: ids,
					session,
				}
			);

			await modelCtrl.commit(session);
			res.json();

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

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
@route      /v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model/:modelId
@method     PUT
@desc       Upadate model description and name
@access     private
*/
router.put(
	"/:modelId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDb,
	validateModel,
	authorizeAppAction("app.model.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, db, model } = req;
			const { name, description } = req.body;

			// Update app name
			let updatedModel = await modelCtrl.updateOneById(
				model._id,
				{ name, description, updatedBy: user._id },
				{},
				{ cacheKey: model._id }
			);

			res.json(updatedModel);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
				"update",
				model.name !== name
					? t(
							"Updated the name of the model from '%s' to '%s'",
							model.name,
							name
					  )
					: t("Updated model '%s' description", model.name),
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
			cAt.dbType = dbTypeMappings[db.type]["createdat"];
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
			uAt.dbType = dbTypeMappings[db.type]["updatedat"];
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

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
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

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
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
				defaultValue,
			} = req.body;

			// Assign the field values
			let fieldId = helper.generateId();
			let fieldData = {
				_id: fieldId,
				name,
				iid: helper.generateSlug("fld"),
				creator: "user",
				type,
				dbType: dbTypeMappings[db.type][type],
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
				defaultValue,
				createdBy: user._id,
			};

			// If field is not searchabled then we should not have a language property
			if (type === "text" && !req.body.text.searchable) {
				delete req.body.text.language;
			} else if (type === "rich-text" && !req.body.richText.searchable) {
				delete req.body.richText.language;
			}

			// Assign field specific properties
			let fieldSpecifcPropName = modelCtrl.getFieldSpecificPropName(type);
			if (fieldSpecifcPropName) {
				fieldData[fieldSpecifcPropName] = req.body[fieldSpecifcPropName];
			}

			// If we are adding a searchable field to MongoDB then we need to add the 'languge' field
			if (db.type === "MongoDB" && (type === "text" || type === "rich-text")) {
				let searchable = false;
				let language = "";
				if (type === "text") {
					searchable = req.body.text.searchable;
					language = req.body.text.language;
				} else {
					searchable = req.body.richText.searchable;
					language = req.body.richText.language;
				}

				if (searchable) {
					// Ok the field is searchable, check to see if there is already a system field named language
					const field = model.fields.find((entry) => entry.name === "language");
					if (field) {
						if (field.creator === "user") {
							modelCtrl.endSession(session);
							return res.status(422).json({
								error: t("Not Allowed"),
								details: t(
									"Creating a searchable (full-text indexed) field in MongoDB requires a Agnost managed text field named 'language' to be added to the model. There is already a field named 'language' in model '%s' which is not managed by Agnost.",
									model.name
								),
								code: ERROR_CODES.notAllowed,
							});
						}
					} else {
						// We do not have the language field, lets create it
						let langFieldData = {
							_id: helper.generateId(),
							name: "language",
							iid: helper.generateSlug("fld"),
							creator: "system",
							type: "text",
							dbType: dbTypeMappings[db.type]["text"],
							order: modelCtrl.getNewFieldOrderNumber(model),
							required: true,
							unique: false,
							immutable: true,
							indexed: true,
							defaultValue: language,
							text: {
								searchable: false,
								maxLength: 32,
							},
							createdBy: user._id,
						};

						await modelCtrl.pushObjectById(
							model._id,
							"fields",
							langFieldData,
							{
								updatedBy: req.user._id,
							},
							{ cacheKey: model._id, session }
						);
					}
				}
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
					schemaiid: model.schemaiid,
					timestamps: pointer.timestamps,
					fields: modelCtrl.getDefaultFields(
						db.type,
						pointer.timestamps,
						user._id,
						type === "object" ? "sub-model-object" : "sub-model-list"
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
					updatedBy: req.user._id,
				},
				{ cacheKey: model._id, session }
			);

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.field",
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

			// If do not have any searchable field and have a system manged language field then delete it
			if (db.type === "MongoDB") {
				const languageField = updatedModel.fields.find(
					(entry) => entry.name === "language" && entry.creator === "system"
				);

				if (languageField) {
					let hasSearchabledField = false;
					// Ok we have language field check if it is still needed
					for (const field of updatedModel.fields) {
						if (field.type === "text" && field.text?.searchable) {
							hasSearchabledField = true;
							break;
						} else if (
							field.type === "rich-text" &&
							field.richText?.searchable
						) {
							hasSearchabledField = true;
							break;
						}
					}

					// No more searchable fields, delete the language field
					if (!hasSearchabledField) {
						// Delete the field from the models field list
						updatedModel = await modelCtrl.pullObjectById(
							model._id,
							"fields",
							languageField._id,
							{ updatedBy: user._id },
							{ session, cacheKey: model._id }
						);
					}
				}
			}

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

			fields.forEach(async (field) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.db.model.field",
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
					{ _id: { $in: impactedModelIds }, versionId: version._id },
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

			// If do not have any searchable field and have a system manged language field then delete it
			if (db.type === "MongoDB") {
				const languageField = updatedModel.fields.find(
					(entry) => entry.name === "language" && entry.creator === "system"
				);

				if (languageField) {
					let hasSearchabledField = false;
					// Ok we have language field check if it is still needed
					for (const field of updatedModel.fields) {
						if (field.type === "text" && field.text?.searchable) {
							hasSearchabledField = true;
							break;
						} else if (
							field.type === "rich-text" &&
							field.richText?.searchable
						) {
							hasSearchabledField = true;
							break;
						}
					}

					// No more searchable fields, delete the language field
					if (!hasSearchabledField) {
						// Delete the field from the models field list
						updatedModel = await modelCtrl.pullObjectById(
							model._id,
							"fields",
							languageField._id,
							{ updatedBy: user._id },
							{ session, cacheKey: model._id }
						);
					}
				}
			}

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.field",
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
@desc       Update properties of a field (excluding name)
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
		// Start new database transaction session
		const session = await modelCtrl.startSession();
		try {
			const { org, user, app, version, db, model, field } = req;
			const { name, description, required, immutable, indexed, defaultValue } =
				req.body;

			// Assign the field update values
			let fieldUpdateData = null;
			let updatedAt = Date.now();
			let fieldUnsetData = {};

			if (defaultValue === "$$unset") {
				fieldUnsetData = { "fields.$.defaultValue": "" };
			}

			if (field.creator === "system") {
				// For system managed fields only description can be updated
				fieldUpdateData = {
					"fields.$.description": description,
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": updatedAt,
					updatedBy: user._id,
				};
			} else {
				fieldUpdateData = {
					"fields.$.name": name,
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
					"fields.$.updatedBy": user._id,
					"fields.$.updatedAt": updatedAt,
					updatedBy: user._id,
				};

				if (
					defaultValue !== null &&
					defaultValue !== undefined &&
					defaultValue !== "$$unset"
				)
					fieldUpdateData["fields.$.defaultValue"] = defaultValue;
			}

			// If field is not searchabled then we should not have a language property
			if (field.type === "text" && !req.body.text.searchable) {
				delete req.body.text.language;
			} else if (field.type === "rich-text" && !req.body.richText.searchable) {
				delete req.body.richText.language;
			}

			// Assign field specific properties, we cannot update field specific properties for object and object-list
			let fieldSpecifcPropName = modelCtrl.getFieldSpecificPropName(field.type);
			if (
				fieldSpecifcPropName &&
				!["object", "object-list"].includes(field.type)
			) {
				fieldUpdateData[`fields.$.${fieldSpecifcPropName}`] =
					req.body[fieldSpecifcPropName];
			}

			// Update field properties
			let updatedModel = await modelCtrl.updateOneByQuery(
				{ _id: model._id, "fields._id": field._id },
				fieldUpdateData,
				fieldUnsetData,
				{ cacheKey: model._id, session }
			);

			// If we are renaming a sub-model field then we should also rename the sub-model
			// This update is required, while deploying to an enviroment we use the model names to
			// cretae paths for fields, especially in handling field name changes
			if (["object", "object-list"].includes(field.type)) {
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

			// If do not have any searchable field and have a system manged language field then delete it
			if (db.type === "MongoDB") {
				const languageField = updatedModel.fields.find(
					(entry) => entry.name === "language" && entry.creator === "system"
				);

				let hasSearchabledField = false;
				// Ok we have language field check if it is still needed
				for (const field of updatedModel.fields) {
					if (field.type === "text" && field.text?.searchable) {
						hasSearchabledField = true;
						break;
					} else if (field.type === "rich-text" && field.richText?.searchable) {
						hasSearchabledField = true;
						break;
					}
				}

				if (languageField) {
					// No more searchable fields, delete the language field
					if (!hasSearchabledField) {
						// Delete the field from the models field list
						updatedModel = await modelCtrl.pullObjectById(
							model._id,
							"fields",
							languageField._id,
							{ updatedBy: user._id },
							{ session, cacheKey: model._id }
						);
					}
				} else if (
					hasSearchabledField &&
					(field.type === "text" || field.type === "rich-text")
				) {
					// Ok this seems a field has been marked as searchable
					// We do not have the language field, lets create it
					let langFieldData = {
						_id: helper.generateId(),
						name: "language",
						iid: helper.generateSlug("fld"),
						creator: "system",
						type: "text",
						dbType: dbTypeMappings[db.type]["text"],
						order: modelCtrl.getNewFieldOrderNumber(model),
						required: true,
						unique: false,
						immutable: true,
						indexed: true,
						defaultValue:
							field.type === "text"
								? field.text.language
								: field.richText.language,
						text: {
							searchable: false,
							maxLength: 32,
						},
						createdBy: user._id,
					};

					updatedModel = await modelCtrl.pushObjectById(
						model._id,
						"fields",
						langFieldData,
						{
							updatedBy: req.user._id,
						},
						{ cacheKey: model._id, session }
					);
				}
			}

			// Commit transaction
			await modelCtrl.commit(session);

			res.json(updatedModel);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, db, "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model.field",
				"update",
				t(
					"Updated the properties of '%s' field '%s' in model '%s'",
					field.type,
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

export default router;
