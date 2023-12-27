import mongoose from "mongoose";
import { body, query } from "express-validator";
import {
	methodTypes,
	logicTypes,
	forbiddenEpPrefixes,
} from "../config/constants.js";

/**
 * Node.js express endpoint definition
 */
export const EndpointModel = mongoose.model(
	"endpoint",
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
			versionId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "version",
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
			method: {
				type: String,
				required: true,
				enum: methodTypes,
			},
			// The path of the endpoint in name1/:id1/name2/:id2/.... etc.
			path: {
				type: String,
				required: true,
			},
			// The path finterprint of the endpoint in name1/:id/name2/:id/.... etc.
			// The difference between path and finterprint is that instead of specific id names we use standart {id} names
			fingerprint: {
				type: String,
			},
			// The timeout duration of the endpoint, in milliseconds
			timeout: {
				type: Number,
			},
			apiKeyRequired: {
				type: Boolean,
				default: false,
			},
			sessionRequired: {
				type: Boolean,
				default: false,
			},
			logExecution: {
				type: Boolean,
				default: true,
			},
			type: {
				type: String,
				required: true,
				enum: logicTypes,
				default: "code",
			},
			logic: {
				type: String,
				text: true, // Declares a full-text index
			},
			rateLimits: {
				type: [String], // Array of rate limit iids
				default: [],
			},
			middlewares: {
				type: [String], // Array of middleware iids
				default: [],
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
		case "view":
			return [
				query("start")
					.trim()
					.optional()
					.isISO8601({ strict: true, strictSeparator: true })
					.withMessage(t("Not a valid ISO 8061 date-time"))
					.toDate(),
				query("end")
					.trim()
					.optional()
					.isISO8601({ strict: true, strictSeparator: true })
					.withMessage(t("Not a valid ISO 8061 date-time"))
					.toDate(),
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
		case "view-iid":
			return [
				body("iids.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required value, cannot be left empty")),
			];
		case "create":
		case "update":
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
						let regex = /^[A-Za-z0-9 _-]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Endpoint names can include only numbers, letters, spaces, dash and underscore characters"
								)
							);
						}

						let regex2 = /^[ _-].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t(
									"Endpoint names cannot start with a dash or underscore character"
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						//Check whether model name is unique or not
						let eps = await EndpointModel.find(
							{
								versionId: req.version._id,
							},
							"-logic"
						);
						eps.forEach((ep) => {
							if (
								(ep.name.toLowerCase() === value.toLowerCase() &&
									type === "create") ||
								(ep.name.toLowerCase() === value.toLowerCase() &&
									type === "update" &&
									req.ep._id.toString() !== ep._id.toString())
							)
								throw new AgnostError(
									t("Endpoint with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as endpoint name",
									value
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
				body("method")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(methodTypes)
					.withMessage(t("Unsupported method type")),
				body("path")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						// We are allowing root '/' path
						if (value !== "/") {
							const routeNameRegex =
								/^\/[a-zA-Z0-9_-]+(?:\/:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)*$/;
							const paramNameRegex = /^[a-zA-Z0-9_-]+$/;

							// Validate route name
							if (!routeNameRegex.test(value)) {
								throw new AgnostError(t("Not a valid endpoint route"));
							}

							// Extract parameter names from route
							const paramRegex = /:([^/?]+)/g;
							const parameterNames = [];
							let match;
							while ((match = paramRegex.exec(value)) !== null) {
								parameterNames.push(match[1]);
							}

							// Validate parameter names
							for (const paramName of parameterNames) {
								if (!paramNameRegex.test(paramName)) {
									throw new AgnostError(
										t("Invalid route parameter name '%s'", paramName)
									);
								}
							}

							// Validate parameter names
							const uniqueParameterNames = new Set(parameterNames);
							if (uniqueParameterNames.size !== parameterNames.length) {
								throw new AgnostError(t("Duplicate parameter names in route"));
							}

							if (
								forbiddenEpPrefixes.find((prefix) => value.startsWith(prefix))
							) {
								throw new AgnostError(
									t(
										"Endpoint route cannot start with '%s'",
										forbiddenEpPrefixes.join("', '")
									)
								);
							}
						}

						const fingerprint = value
							.split("/")
							.map((entry) =>
								entry.startsWith(":") ? ":p" : entry.toLowerCase()
							)
							.join("/");

						// We have the fingerprint, let's check whether we have and endpoint with the same fingerprint and method
						//Check whether model name is unique or not
						let ep = null;
						if (type === "update") {
							ep = await EndpointModel.findOne(
								{
									versionId: req.version._id,
									fingerprint: fingerprint,
									method: req.body.method,
									_id: { $ne: req.ep._id },
								},
								"-logic"
							);
						} else {
							ep = await EndpointModel.findOne(
								{
									versionId: req.version._id,
									fingerprint: fingerprint,
									method: req.body.method,
								},
								"-logic"
							);
						}

						if (ep) {
							throw new AgnostError(
								t(
									"Endpoint '%s' with the same route '%s:%s' already exists",
									ep.name,
									ep.method,
									ep.path
								)
							);
						}

						// Set the fingerprint of the endpoint
						req.body.fingerprint = fingerprint;
						return true;
					}),
				body("timeout")
					.trim()
					.optional()
					.isInt({
						min: 1,
					})
					.withMessage(t("Timeout needs to be a positive integer"))
					.toInt(),
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
				body("logExecution")
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
				body("middlewares")
					.optional()
					.isArray()
					.withMessage(t("Middlewares need to be an array of strings")),
				body("middlewares.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom((value, { req }) => {
						const { mws } = req;
						// Check if the input rate limit iid actuall exists
						let mwObj = mws.find((entry) => entry.iid === value);
						if (!mwObj)
							throw new AgnostError(
								t(
									"No such middleware with the provided identifier '%s' exists",
									value
								)
							);

						return true;
					}),
			];
		case "save-logic":
			return [body("logic").optional()];
		case "delete-multi":
			return [
				body("endpointIds.*")
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
