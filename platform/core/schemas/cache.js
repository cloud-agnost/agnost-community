import mongoose from "mongoose";
import { body, query } from "express-validator";
import resourceCtrl from "../controllers/resource.js";

/**
 * Message cron job and its handler definition
 */
export const CacheModel = mongoose.model(
	"cache",
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
			assignUniqueName: {
				type: Boolean,
				required: true,
				default: true,
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
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9_]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Cache names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Cache names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Cache names cannot start with underscore (_) character")
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						//Check whether model name is unique or not
						let caches = await CacheModel.find({
							versionId: req.version._id,
						});
						caches.forEach((cache) => {
							if (
								(cache.name.toLowerCase() === value.toLowerCase() &&
									type === "create") ||
								(cache.name.toLowerCase() === value.toLowerCase() &&
									type === "update" &&
									req.cache._id.toString() !== cache._id.toString())
							)
								throw new AgnostError(
									t("Cache with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as Cache name",
									value
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
				body("assignUniqueName")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isBoolean()
					.withMessage(t("Not a valid boolean value"))
					.toBoolean(),
				body("resourceId")
					.if(() => type === "create")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid resource identifier"));

						let resource = await resourceCtrl.getOneById(value, {
							cacheKey: value,
						});

						if (!resource)
							throw new AgnostError(
								t("No such resource with the provided id '%s' exists.", value)
							);

						// Check if the selected resource is a cache
						if (resource.type !== "cache")
							throw new AgnostError(
								t(
									"The selected resource '%s' (%s) is not a cache",
									resource.name,
									resource.instance
								)
							);

						// Check the status of the resource whether it is in OK status or not
						if (resource.status !== "OK")
							throw new AgnostError(
								t(
									"Only resorces in ready (OK) status can be mapped to a cache. The selected '%s' resoure '%s' is in '%s' status",
									resource.instance,
									resource.name,
									resource.status
								)
							);

						// Assign the resource object
						req.resource = resource;
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
									"Cache names can include only numbers, letters and underscore (_) characters"
								)
							);
						}

						let regex2 = /^[0-9].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t("Cache names cannot start with a number")
							);
						}

						if (value.startsWith("_")) {
							throw new AgnostError(
								t("Cache names cannot start with underscore (_) character")
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					})
					.bail()
					.custom(async (value, { req }) => {
						//Check whether model name is unique or not
						let caches = await CacheModel.find({
							versionId: req.version._id,
						});
						caches.forEach((cache) => {
							if (
								(cache.name.toLowerCase() === value.toLowerCase() &&
									type === "create") ||
								(cache.name.toLowerCase() === value.toLowerCase() &&
									type === "update" &&
									req.cache._id.toString() !== cache._id.toString())
							)
								throw new AgnostError(
									t("Cache with the provided name already exists")
								);
						});

						if (value.toLowerCase() === "this") {
							throw new AgnostError(
								t(
									"'%s' is a reserved keyword and cannot be used as Cache name",
									value
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
			];
		case "delete-multi":
			return [
				body("cacheIds.*")
					.trim()
					.optional()
					.custom((value) => {
						if (!helper.isValidId(value)) {
							throw new AgnostError(t("Not a valid object identifier"));
						}
						return true;
					}),
			];
	}
};
