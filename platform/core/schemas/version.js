import mongoose from "mongoose";
import { body, query } from "express-validator";
import {
	apiKeyTypes,
	oAuthProviderTypes,
	messageTemplatesTypes,
	phoneAuthSMSProviders,
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
				redirectURLs: {
					type: [String], // Array of rate limit iids
					default: [config.get("general.defaultAuthRedirect")],
				},
				email: {
					enabled: {
						type: Boolean,
						default: true,
					},
					confirmEmail: {
						type: Boolean,
						default: false,
					},
					expiresIn: {
						type: Number,
						default: config.get("general.emailTokenExpiresInSeconds"),
					},
					customSMTP: {
						host: {
							type: String,
						},
						port: {
							type: Number,
						},
						useTLS: {
							type: Boolean,
							default: false,
						},
						user: {
							type: String,
						},
						// Password is encrypted when stored in database
						password: {
							type: String,
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
						enum: phoneAuthSMSProviders.map((entry) => entry.provider),
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
							enum: oAuthProviderTypes.map((entry) => entry.provider),
						},
						config: {
							type: mongoose.Schema.Types.Mixed,
						},
						createdAt: { type: Date, default: Date.now, immutable: true },
						updatedAt: { type: Date, default: Date.now },
						createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
						updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
					},
				],
				messages: [
					{
						type: {
							type: String,
							required: true,
							enum: messageTemplatesTypes,
						},
						fromEmail: {
							type: String,
						},
						fromName: {
							type: String,
						},
						subject: {
							type: String,
						},
						body: {
							type: String,
						},
						createdAt: { type: Date, default: Date.now, immutable: true },
						updatedAt: { type: Date, default: Date.now },
						createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
						updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
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
						let params = req.version.params ?? [];
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
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
						let params = req.version.params ?? [];
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
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
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
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
		case "add-fields":
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

						let model = await modelCtrl.getOneByQuery(
							{ dbId: req.body.databaseId, _id: value },
							{
								cacheKey: value,
							}
						);

						if (!model) {
							throw new AgnostError(
								t(
									"No such model with the provided id '%s' exists in database '%s'",
									value,
									req.database.name
								)
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
		case "save-redirect-urls":
			return [
				body("redirectURLs")
					.optional()
					.isArray()
					.withMessage(t("Redirect URLs need to be an array of strings")),
				body("redirectURLs.*")
					.trim()
					.notEmpty()
					.withMessage(t("Redirect URL cannot be left empty")),
			];
		case "save-email-config":
			return [
				body("enabled")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("confirmEmail")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("expiresIn")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: config.get("general.minEmailTokenExpirySeconds"),
					})
					.withMessage(
						t(
							"Email validation token expiry can be minimum '%s' seconds",
							config.get("general.minEmailTokenExpirySeconds")
						)
					)
					.toInt(),
				body("customSMTP.host")
					.if((value, { req }) => req.body.confirmEmail && req.body.enabled)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("customSMTP.port")
					.if((value, { req }) => req.body.confirmEmail)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: 0,
						max: 65535,
					})
					.withMessage(t("Port number needs to be an integer between 0-65535"))
					.toInt(),
				body("customSMTP.useTLS")
					.if((value, { req }) => req.body.confirmEmail && req.body.enabled)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("customSMTP.user")
					.if((value, { req }) => req.body.confirmEmail && req.body.enabled)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("customSMTP.password")
					.if((value, { req }) => req.body.confirmEmail && req.body.enabled)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "save-phone-config":
			return [
				body("enabled")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("confirmPhone")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("allowCodeSignIn")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("expiresIn")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isInt({
						min: config.get("general.minEmailTokenExpirySeconds"),
					})
					.withMessage(
						t(
							"SMS code expiry can be minimum '%s' seconds",
							config.get("general.minSMSCodeExpirySeconds")
						)
					)
					.toInt(),
				body("smsProvider")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(phoneAuthSMSProviders.map((entry) => entry.provider))
					.withMessage(t("Unsupported resource type")),
				body("providerConfig.accountSID")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "Twilio"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("providerConfig.authToken")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "Twilio"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("providerConfig.fromNumberOrSID")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "Twilio"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("providerConfig.accessKey")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "MessageBird"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("providerConfig.originator")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "MessageBird"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("providerConfig.apiKey")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "Vonage"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("providerConfig.apiSecret")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "Vonage"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("providerConfig.from")
					.if(
						(value, { req }) =>
							req.body.enabled &&
							req.body.confirmPhone &&
							req.body.smsProvider === "Vonage"
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "create-oauth-provider":
			return [
				body("provider")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(oAuthProviderTypes.map((entry) => entry.provider))
					.withMessage(t("Unsupported oAuth provider type"))
					.bail()
					.custom((value, { req }) => {
						const { providers } = req.version.authentication;
						const oauthProvider = providers?.find(
							(entry) => entry.provider === value
						);
						if (oauthProvider) {
							throw new AgnostError(
								t("Oauth configuration is already configured for '%s'", value)
							);
						}

						return true;
					}),
				body("config.key")
					.if((value, { req }) =>
						["google", "twitter", "facebook", "discord", "github"].includes(
							req.body.provider
						)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("config.secret")
					.if((value, { req }) =>
						["google", "twitter", "facebook", "discord", "github"].includes(
							req.body.provider
						)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("config.teamId")
					.if((value, { req }) => req.body.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("config.serviceId")
					.if((value, { req }) => req.body.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("config.keyId")
					.if((value, { req }) => req.body.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("config.privateKey")
					.if((value, { req }) => req.body.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "update-oauth-provider":
			return [
				body("key")
					.if((value, { req }) =>
						["google", "twitter", "facebook", "discord", "github"].includes(
							req.oauthProvider.provider
						)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("secret")
					.if((value, { req }) =>
						["google", "twitter", "facebook", "discord", "github"].includes(
							req.oauthProvider.provider
						)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("teamId")
					.if((value, { req }) => req.oauthProvider.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("serviceId")
					.if((value, { req }) => req.oauthProvider.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("keyId")
					.if((value, { req }) => req.oauthProvider.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("privateKey")
					.if((value, { req }) => req.oauthProvider.provider === "apple")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		case "set-message-template":
			return [
				body("type")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(messageTemplatesTypes)
					.withMessage(t("Unsupported message template type")),
				body("fromEmail")
					.if((value, { req }) =>
						[
							"confirm_email",
							"reset_password",
							"magic_link",
							"confirm_email_change",
						].includes(req.body.type)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address"))
					.bail()
					.normalizeEmail({ gmail_remove_dots: false }),
				body("fromName").trim().optional(),
				body("subject")
					.if((value, { req }) =>
						[
							"confirm_email",
							"reset_password",
							"magic_link",
							"confirm_email_change",
						].includes(req.body.type)
					)
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
				body("body")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty")),
			];
		default:
			return [];
	}
};
