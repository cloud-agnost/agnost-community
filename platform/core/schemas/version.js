import mongoose from "mongoose";
import { body, query } from "express-validator";

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
					updatedAt: { type: Date },
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
					updatedAt: { type: Date },
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
					allowRealtime: {
						type: Boolean,
						default: true,
					},
					type: {
						type: String,
						enum: [
							"no-access",
							"full-access",
							"custom-allowed",
							"custom-excluded",
						],
					},
					allowedEndpoints: [
						{
							//list of endpoint inames, custom type is only applicable if there is a deployed snapshot
							type: mongoose.Schema.Types.ObjectId,
							index: true,
						},
					],
					excludedEndpoints: [
						{
							//list of endpoint inames, custom type is only applicable if there is a deployed snapshot
							type: mongoose.Schema.Types.ObjectId,
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
					updatedAt: { type: Date },
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
					createdAt: { type: Date, default: Date.now, immutable: true },
					updatedAt: { type: Date },
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
		default:
			return [];
	}
};
