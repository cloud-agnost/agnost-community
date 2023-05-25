import mongoose from "mongoose";
import { body, query } from "express-validator";
import {
	apiKeyTypes,
	osTypes,
	smsProviders,
	oAuthProviderTypes,
} from "../config/constants.js";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";

/**
 * All application design elements are specified in versions, and all execution configurations are specified in environments.
 */
export const VersionModel = mongoose.model(
	"version",
	new mongoose.Schema(
		{
			orgId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "organization",
				index: true,
			},
			appId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "app",
				index: true,
			},
			iid: {
				// Internal identifier
				type: String,
				required: true,
				index: true,
				immutable: true,
			},
			name: {
				type: String,
				required: true,
				index: true,
			},
			// Whether other team members with the right access can see the app version or not
			// Team members with 'Manager' role can always view even the private versions
			private: {
				type: Boolean,
				default: false,
			},
			// Whether other team members can edit the version or not
			readOnly: {
				type: Boolean,
				default: true,
			},
			// Flag to specify master version, one master per app. Master version cannot be deleted
			master: {
				type: Boolean,
				default: false,
			},
			realtime: {
				enabled: {
					type: Boolean,
					required: true,
					default: true,
				},
				apiKeyRequired: {
					type: Boolean,
					required: true,
					default: true,
				},
				sessionRequired: {
					type: Boolean,
					required: true,
					default: true,
				},
				rateLimits: {
					// The iid of rate limits are stored
					type: [String],
					index: true,
					default: [],
				},
			},
			params: [
				{
					iid: {
						// Internal identifier
						type: String,
						index: true,
						immutable: true,
					},
					name: {
						type: String,
					},
					value: {
						type: mongoose.Schema.Types.Mixed,
					},
					createdAt: { type: Date, default: Date.now, immutable: true },
					updatedAt: { type: Date, default: Date.now },
					createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
					updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
				},
			],
			limits: [
				{
					iid: {
						// Internal identifier
						type: String,
						index: true,
						immutable: true,
						required: true,
					},
					name: {
						type: String,
						required: true,
					},
					rate: {
						type: Number,
						required: true,
					},
					duration: {
						type: Number,
						required: true,
					},
					errorMessage: {
						type: String,
						required: false,
					},
					createdAt: { type: Date, default: Date.now, immutable: true },
					updatedAt: { type: Date, default: Date.now },
					createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
					updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
				},
			],
			defaultEndpointLimits: {
				type: [String], // Array of rate limit iids
				default: [],
			},
			apiKeys: [
				{
					name: {
						type: String,
						required: true,
						index: true,
					},
					key: {
						type: String,
						index: true,
					},
					expiryDate: {
						type: Date,
					},
					allowRealtime: {
						type: Boolean,
						default: true,
					},
					type: {
						type: String,
						enum: apiKeyTypes,
					},
					allowedEndpoints: [
						{
							//list of endpoint iids
							type: String,
							index: true,
						},
					],
					excludedEndpoints: [
						{
							//list of endpoint iids
							type: String,
							index: true,
						},
					],
					domainAuthorization: {
						type: String,
						default: "all",
						enum: ["all", "specified"],
					},
					authorizedDomains: [{ type: String }],
					IPAuthorization: {
						type: String,
						default: "all",
						enum: ["all", "specified"],
					},
					authorizedIPs: [{ type: String }],
					createdAt: { type: Date, default: Date.now, immutable: true },
					updatedAt: { type: Date, default: Date.now },
					createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
					updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
				},
			],
			npmPackages: [
				{
					name: {
						type: String,
					},
					version: {
						type: String,
					},
					description: {
						type: String,
					},
					createdAt: { type: Date, default: Date.now, immutable: true },
					updatedAt: { type: Date, default: Date.now },
					createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
					updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
				},
			],
			authentication: {
				userDataModel: {
					database: {
						type: String, // The database iid
					},
					model: {
						type: String, // The model iid
					},
				},
				defaultRedirect: {
					type: String,
					required: true,
					default: config.get("general.defaultAuthRedirect"),
				},
				osRedirects: [
					{
						os: {
							type: String,
							required: true,
							enum: osTypes,
						},
						primary: {
							type: String,
							required: true,
						},
						secondary: {
							type: String,
							required: false,
						},
					},
				],
				email: {
					enabled: {
						type: Boolean,
						default: true,
					},
					confirmEmail: {
						type: Boolean,
						default: true,
					},
					expiresIn: {
						type: Number,
						default: config.get("general.emailTokenExpiresInSeconds"),
					},
					customSMTP: {
						host: {
							type: String,
							required: true,
						},
						port: {
							type: Number,
							required: true,
						},
						user: {
							type: String,
							required: true,
						},
						password: {
							type: String,
							required: true,
						},
					},
				},
				phone: {
					enabled: {
						type: Boolean,
						default: false,
					},
					confirmPhone: {
						type: Boolean,
						default: true,
					},
					allowCodeSignIn: {
						type: Boolean,
						default: true,
					},
					smsProvider: {
						type: String,
						default: "Twilio",
						enum: smsProviders,
					},
					expiresIn: {
						type: Number,
						default: config.get("general.SMSCodeExpiresInSeconds"),
					},
					providerConfig: {
						type: mongoose.Schema.Types.Mixed,
					},
				},
				providers: [
					{
						provider: {
							type: String,
							required: true,
							enum: oAuthProviderTypes,
						},
						config: {
							type: mongoose.Schema.Types.Mixed,
						},
					},
				],
			},
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
		case "update":
		case "create":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					)
					.custom(async (value, { req }) => {
						let versions = await VersionModel.find({ appId: req.app._id });
						versions.forEach((version) => {
							if (
								version.name.toLowerCase() === value.toLowerCase() &&
								type === "create"
							)
								throw new AgnostError(
									t("Version with the provided name already exists")
								);

							if (
								version.name.toLowerCase() === value.toLowerCase() &&
								type === "update" &&
								req.version._id.toString() !== version._id.toString()
							)
								throw new AgnostError(
									t("Version with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as version name",
									value
								)
							);
						}

						return true;
					}),
				body("private")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("readOnly")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("defaultEndpointLimits")
					.optional()
					.isArray()
					.withMessage(
						t("Default endpoint limits need to be an array of strings")
					),
				body("defaultEndpointLimits.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						const { limits } = req.version;
						// Check if the input rate limit iid actuall exists
						let limitObj = limits.find((entry) => entry.iid === value);
						if (!limitObj)
							throw new AgnostError(
								t(
									"No such rate limiter with the provided identifier '%s' exists",
									value
								)
							);

						return true;
					}),
			];
		case "create-copy":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					)
					.custom(async (value, { req }) => {
						let versions = await VersionModel.find({ appId: req.app._id });
						versions.forEach((version) => {
							if (version.name.toLowerCase() === value.toLowerCase())
								throw new AgnostError(
									t("Version with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as version name",
									value
								)
							);
						}

						return true;
					}),
				body("private")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("readOnly")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("parentVersionId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid version identifier"));

						// Check whether email is unique or not
						let versionObj = await VersionModel.findById(value).lean();
						if (!versionObj) {
							throw new AgnostError(
								t("No such version with the provided id '%s' exists.", value)
							);
						}

						// Assign parent version object
						req.parentVersion = versionObj;
						return true;
					}),
			];
		case "view":
			return [
				query("page")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
					})
					.withMessage(
						t("Page number needs to be a positive integer or 0 (zero)")
					)
					.toInt(),
				query("size")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: config.get("general.minPageSize"),
						max: config.get("general.maxPageSize"),
					})
					.withMessage(
						t(
							"Page size needs to be an integer, between %s and %s",
							config.get("general.minPageSize"),
							config.get("general.maxPageSize")
						)
					)
					.toInt(),
			];
		case "create-param":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Param names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Parameter names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Parameter names cannot start with underscore (_) character")
							);
						}

						return true;
					})
					.bail()
					.custom((value, { req }) => {
						let params = req.app.params ?? [];
						params.forEach((param) => {
							if (param.name.toLowerCase() === value.toLowerCase())
								throw new AgnostError(
									t("Parameter with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as parameter name",
									value
								)
							);
						}

						return true;
					}),
				body("value")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "update-param":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Param names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Parameter names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Parameter names cannot start with underscore (_) character")
							);
						}

						return true;
					})
					.bail()
					.custom((value, { req }) => {
						let params = req.app.params ?? [];
						params.forEach((param) => {
							if (
								param.name.toLowerCase() === value.toLowerCase() &&
								param._id.toString() !== req.params.paramId.toString()
							)
								throw new AgnostError(
									t("Parameter with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as parameter name",
									value
								)
							);
						}

						return true;
					}),
				body("value")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "delete-multi-params":
			return [
				body("paramIds")
					.isArray()
					.withMessage(t("Parameter ids need to be an array of identifiers")),
				body("paramIds.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid app param identifier"));

						let param = req.version.params.find(
							(entry) => entry._id.toString() === value
						);

						if (!param)
							throw new AgnostError(
								t("No such app param with the provided id '%s' exists.", value)
							);

						return true;
					}),
			];
		case "create-limit":
		case "update-limit":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					),
				body("rate")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Max request count needs to be a positive integer"))
					.toInt(),
				body("duration")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 1,
					})
					.withMessage(t("Duration needs to be a positive integer"))
					.toInt(),
				body("errorMessage")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "delete-multi-limits":
			return [
				body("limitIds")
					.isArray()
					.withMessage(
						t("Rate limiter ids need to be an array of identifiers")
					),
				body("limitIds.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid rate limiter identifier"));

						let param = req.version.limits.find(
							(entry) => entry._id.toString() === value
						);

						if (!param)
							throw new AgnostError(
								t(
									"No such rate limiter with the provided id '%s' exists.",
									value
								)
							);

						return true;
					}),
			];
		case "update-realtime":
			return [
				body("enabled")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("apiKeyRequired")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("sessionRequired")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("rateLimits")
					.optional()
					.isArray()
					.withMessage(t("Rate limits need to be an array of strings")),
				body("rateLimits.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						const { limits } = req.version;
						// Check if the input rate limit iid actuall exists
						let limitObj = limits.find((entry) => entry.iid === value);
						if (!limitObj)
							throw new AgnostError(
								t(
									"No such rate limiter with the provided identifier '%s' exists",
									value
								)
							);

						return true;
					}),
			];
		case "create-key":
		case "update-key":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({ max: config.get("general.maxTextLength") })
					.withMessage(
						t(
							"Name must be at most %s characters long",
							config.get("general.maxTextLength")
						)
					),
				body("expiryDate")
					.trim()
					.optional({ checkFalsy: true }) // Empty strings "" will also be considered as optional
					.isISO8601()
					.withMessage(t("Not a valid date & time format"))
					.bail()
					.not()
					.isBefore(new Date().toString())
					.withMessage(t("Expiry date must be a date in the future")),
				body("allowRealtime")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("type")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(apiKeyTypes)
					.withMessage(t("Unsupported resource type")),
				body("allowedEndpoints")
					.optional()
					.isArray()
					.withMessage(t("Allowed endpoints need to be an array of strings")),
				body("excludedEndpoints")
					.optional()
					.isArray()
					.withMessage(t("Excluded endpoints need to be an array of strings")),
				body("domainAuthorization")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(["all", "specified"])
					.withMessage(t("Unsupported domain authorization type")),
				body("authorizedDomains")
					.optional()
					.isArray()
					.withMessage(t("Authorized domains need to be an array of strings")),
				body("authorizedDomains.*")
					.trim()
					.notEmpty()
					.withMessage(t("Domain URL cannot be left empty"))
					.bail()
					.custom((value) => {
						if (value.startsWith("http://") || value.startsWith("https://")) {
							if (value.indexOf("/", 8) !== -1)
								throw new AgnostError(
									t(
										"Not a valid domain name. Domain names do not include path definition."
									)
								);

							if (!helper.isValidDomain(value))
								throw new AgnostError(
									t(
										"Not a valid domain name. Domain names start with http:// or https:// and do not include path definition."
									)
								);

							return true;
						} else {
							throw new AgnostError(
								t("Domain name needs to start with http:// or https://")
							);
						}
					}),
				body("IPAuthorization")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(["all", "specified"])
					.withMessage(t("Unsupported IP address authorization type")),
				body("authorizedIPs")
					.optional()
					.isArray()
					.withMessage(
						t("Authorized IP addresses need to be an array of strings")
					),
				body("authorizedIPs.*")
					.trim()
					.notEmpty()
					.withMessage(t("IP address or address range cannot be left empty"))
					.bail()
					.custom((value) => {
						if (!helper.isValidIPAddress(value))
							throw new AgnostError(
								t("Not a valid IPv4 address or address range in CIDR notation.")
							);

						return true;
					}),
			];
		case "delete-multi-keys":
			return [
				body("keyIds")
					.isArray()
					.withMessage(t("API key ids need to be an array of identifiers")),
				body("keyIds.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid API key identifier"));

						let param = req.version.apiKeys.find(
							(entry) => entry._id.toString() === value
						);

						if (!param)
							throw new AgnostError(
								t("No such API key with the provided id '%s' exists.", value)
							);

						return true;
					}),
			];
		case "npm-search":
			return [
				query("page")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
					})
					.withMessage(
						t("Page number needs to be a positive integer or 0 (zero)")
					)
					.toInt(),
				query("size")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: config.get("general.minPageSize"),
						max: config.get("general.maxPageSize"),
					})
					.withMessage(
						t(
							"Page size needs to be an integer, between %s and %s",
							config.get("general.minPageSize"),
							config.get("general.maxPageSize")
						)
					)
					.toInt(),
				query("package")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "add-npm-package":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						const { npmPackages } = req.version;
						for (const npmPackage of npmPackages) {
							if (value.toLowerCase() === npmPackage.name.toLowerCase())
								throw new AgnostError(
									t("Package '%s' has alredy been installed", value)
								);
						}

						return true;
					}),
				body("version")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("description").trim().optional(),
			];
		case "update-npm-package":
			return [
				body("version")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "remove-multi-packages":
			return [
				body("packageIds")
					.isArray()
					.withMessage(t("NPM package ids need to be an array of identifiers")),
				body("packageIds.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid NPM package identifier"));

						let param = req.version.npmPackages.find(
							(entry) => entry._id.toString() === value
						);

						if (!param)
							throw new AgnostError(
								t(
									"No such NPM package with the provided id '%s' exists.",
									value
								)
							);

						return true;
					}),
			];
		case "save-model":
			return [
				body("databaseId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valida database identifier"));
						}

						let database = await dbCtrl.getOneById(value, {
							cacheKey: value,
						});

						if (!database) {
							throw new AgnostError(
								t("No such database with the provided id '%s' exists", value)
							);
						}

						req.database = database;
						return true;
					}),
				body("modelId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valida model identifier"));
						}

						let model = await modelCtrl.getOneById(value, {
							cacheKey: value,
						});

						if (!model) {
							throw new AgnostError(
								t("No such model with the provided id '%s' exists", value)
							);
						}

						req.model = model;
						return true;
					}),
			];
		case "add-fields":
			return [
				body("fields")
					.isArray()
					.withMessage(t("Fields need to be an array of field names")),
				body("fields.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.custom(async (value, { req }) => {
						return true;
					}),
			];
		case "save-redirect":
			return [
				body("defaultRedirect")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "create-osredirect":
			return [
				body("os")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(osTypes)
					.withMessage(t("Unsupported Operting System (OS) type"))
					.bail()
					.custom((value, { req }) => {
						const { osRedirects } = req.version.authentication;
						const osRedirect = osRedirects?.find((entry) => entry.os === value);
						if (osRedirect) {
							throw new AgnostError(
								t("Redirect URLs are already configured for '%s'", value)
							);
						}

						return true;
					}),
				body("primary")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("secondary").trim().optional(),
			];
		case "update-osredirect":
			return [
				body("primary")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("secondary").trim().optional(),
			];
		default:
			return [];
	}
};
