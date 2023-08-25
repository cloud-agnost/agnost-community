import mongoose from "mongoose";
import { body } from "express-validator";
import { modelTypes, fieldTypes } from "../config/constants.js";

/**
 * Each database holds models which are tables/collections with fields
 */
export const ModelModel = mongoose.model(
	"model",
	new mongoose.Schema(
		{
			orgId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "organization",
				required: true,
				index: true,
			},
			appId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "app",
				required: true,
				index: true,
			},
			versionId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "version",
				required: true,
				index: true,
			},
			dbId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "database",
				required: true,
				index: true,
			},
			iid: {
				// Internal identifier
				type: String,
				required: true,
				index: true,
				immutable: true,
			},
			parentiid: {
				// If this is a sub-model then this keeps reference to parent model, only valid for no-sql databases
				type: String,
				index: true,
			},
			name: {
				type: String,
				required: true,
				index: true,
			},
			type: {
				type: String,
				enum: modelTypes,
				required: true,
				default: "model",
			},
			description: {
				type: String,
			},
			schemaiid: {
				// Schema info, only valid for postgresql, mssql and oracle databases
				type: String,
				index: true,
			},
			timestamps: {
				enabled: {
					type: Boolean,
					default: false,
				},
				createdAt: {
					type: String,
					default: "createdAt",
				},
				updatedAt: {
					type: String,
					default: "updatedAt",
				},
			},
			fields: [
				{
					name: {
						type: String,
						required: true,
						index: true,
					},
					iid: {
						// Internal identifier
						type: String,
						required: true,
						index: true,
						immutable: true,
					},
					creator: {
						type: String,
						required: true,
						default: "user",
						enum: ["system", "user"],
					},
					type: {
						type: String,
						required: true,
						default: "text",
						enum: fieldTypes.map((entry) => entry.name),
					},
					dbType: {
						type: String,
					},
					order: {
						type: Number,
					},
					description: {
						type: String,
					},
					required: {
						type: Boolean,
						default: false,
					},
					unique: {
						type: Boolean,
						default: false,
					},
					immutable: {
						type: Boolean,
						default: false,
					},
					//Not applicable for 'object' or 'object-list' fields but for their model fields
					indexed: {
						type: Boolean,
						default: false,
					},
					// Default value of the field
					defaultValue: {
						type: mongoose.Schema.Types.Mixed,
					},
					text: {
						//If searchable is true then a text index is created in MongoDB
						searchable: {
							type: Boolean,
						},
						maxLength: {
							type: Number,
						},
					},
					richText: {
						//If searchable is true then a text index is created (wip, not implemented yet)
						searchable: {
							type: Boolean,
						},
					},
					encryptedText: {
						maxLength: {
							type: Number,
						},
					},
					decimal: {
						decimalDigits: {
							type: Number,
						},
					},
					enum: {
						selectList: {
							type: [String],
							default: undefined,
						},
					},
					object: {
						// Reference to model internal identifier
						iid: {
							type: String,
						},
					},
					reference: {
						// Reference to model internal identifier
						iid: {
							type: String,
						},
						action: {
							type: String,
							// Only valid for SQL databases
							enum: ["CASCADE", "NO ACTION", "SET NULL", "SET DEFAULT"],
						},
					},
					objectList: {
						// Reference to model internal identifier
						iid: {
							type: String,
						},
					},
					createdAt: { type: Date, default: Date.now, immutable: true },
					updatedAt: { type: Date, default: Date.now },
					createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
					updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
				},
			],
			createdBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
			updatedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
			__v: {
				type: Number,
				select: false,
			},
		},
		{ timestamps: true }
	)
);

export const applyRules = (type) => {
	switch (type) {
		case "create":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxModelNameLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxModelNameLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Model names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Model names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Model names cannot start with underscore (_) character")
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						//Check whether model name is unique or not
						let models = await ModelModel.find({
							dbId: req.db._id,
						});
						models.forEach((model) => {
							if (
								model.name.toLowerCase() === value.toLowerCase() &&
								model.type === "model"
							)
								throw new AgnostError(
									t("Model with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as model name",
									value
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
				body("timestamps.enabled").toBoolean(),
				body("timestamps.createdAt")
					.if((value, { req }) => {
						if (req.body.timestamps?.enabled) return true;
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

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as field name",
									value
								)
							);
						}

						if (
							value.toLowerCase() ===
							req.body.timestamps?.updatedAt?.toLowerCase()
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
				body("timestamps.updatedAt")
					.if((value, { req }) => {
						if (req.body.timestamps?.enabled) return true;
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

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as field name",
									value
								)
							);
						}

						if (
							value.toLowerCase() ===
							req.body.timestamps?.createdAt?.toLowerCase()
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
				body("schemaiid")
					.trim()
					.optional()
					.custom((value, { req }) => {
						const { db } = req;
						// Check if the schema exists
						if (db.schemas) {
							const schema = db.schemas.find((entry) => entry.iid === value);

							if (!schema)
								throw new AgnostError(
									t(
										"Schema with the provided iid '%s' does not exist in database '%s'",
										value,
										req.db.name
									)
								);

							req.schema = schema;
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
			];
		case "update":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxModelNameLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxModelNameLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Model names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Model names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Model names cannot start with underscore (_) character")
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						if (req.model.type === "model") {
							//Check whether model name is unique or not
							let models = await ModelModel.find({
								dbId: req.db._id,
							});

							models.forEach((model) => {
								if (
									model.name.toLowerCase() === value.toLowerCase() &&
									model._id.toString() !== req.model._id.toString() &&
									model.type === "model"
								)
									throw new AgnostError(
										t("Model with the provided name already exists")
									);
							});
						} else {
							// Get the parent model and check the field names of this parent model
							let parentModel = await ModelModel.find({
								dbId: req.db._id,
								iid: req.model.parentiid,
							});

							for (let i = 0; i < parentModel.fields.length; i++) {
								const field = parentModel.fields[i];

								if (field.name.toLowerCase() === value.toLowerCase())
									throw new AgnostError(
										t(
											"Field with the provided name already exists in parent model"
										)
									);
							}
						}

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as model name",
									value
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
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
			];
		case "delete-multi":
			return [
				body("modelIds.*")
					.trim()
					.optional()
					.custom((value) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valid object identifier"));
						}
						return true;
					}),
			];
		default:
			return [];
	}
};
