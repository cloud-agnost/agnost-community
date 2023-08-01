import path from "path";
import express from "express";
import responseTime from "response-time";
import { getDBClient } from "../init/db.js";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { adapterManager } from "../handlers/adapterManager.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /storage/:id?attachment=true
@method     GET
@desc       Get a specific file from cloud storage
@access     public
*/
router.get(
	"/:id",
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { id } = req.params;
			const { attachment } = req.query;

			if (!id || !id.toString().trim()) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.missingFileIdentifier,
							t(
								"A valid file identifier is required to get the stored file contents"
							)
						)
					);
			}

			const conn = getDBClient();
			const db = conn.db(META.getEnvId());
			const fileInfo = await db
				.collection("files")
				.findOne({ id }, { readPreference: "secondaryPreferred" });

			if (!fileInfo) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidFileIdentifier,
							t(
								"The server can not find requested file. The provided file identifier '%s' does not resolve to a valid file metadata.",
								id
							)
						)
					);
			}

			if (!fileInfo.isPublic) {
				return res
					.status(403)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notPublic,
							t(
								"The requested file with id '%s' is not publicly available.",
								id
							)
						)
					);
			}

			const adapter = adapterManager.getStorageAdapterById(fileInfo.storageId);
			if (!adapter) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.missingStorageAdapter,
							t(
								"Adapter for storage identifed by id '%s' to access the file cannot be identified",
								fileInfo.storageId
							)
						)
					);
			}

			const dataStream = await adapter.createFileReadStreamUsingDriver(
				fileInfo.bucketId,
				fileInfo.id
			);

			res.set("Content-Type", fileInfo.mimeType);
			if (attachment === true || attachment === "true") {
				res.setHeader(
					"Content-Disposition",
					`attachment; filename="${path.basename(fileInfo.path)}"`
				);
			}

			dataStream.pipe(res);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/:bucketName/*
@method     GET
@desc       Get a specific file from cloud storage
@access     public
*/
router.get(
	"/:storageName/:bucketName/*",
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const filePath = req.params[0];
			const { attachment } = req.query;

			// First get the storage
			const storage = META.getStorageByName(storageName);
			if (!storage) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.storageNotFound,
							t("No storage found matching the name '%s'", storageName)
						)
					);
			}

			// Get the bucket info
			const conn = getDBClient();
			const db = conn.db(META.getEnvId());
			const bucketInfo = await db
				.collection("buckets")
				.findOne(
					{ storageId: storage.iid, name: bucketName },
					{ readPreference: "secondaryPreferred" }
				);

			if (!bucketInfo) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidBucketName,
							t(
								"The provided bucket name '%s' does not resolve to a valid bucket metadata.",
								bucketName
							)
						)
					);
			}

			// Get the file info
			const fileInfo = await db
				.collection("files")
				.findOne(
					{ bucketId: bucketInfo.id, path: filePath },
					{ readPreference: "secondaryPreferred" }
				);

			if (!fileInfo) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidFilePath,
							t(
								"The server can not find requested file. The provided file path '%s' does not resolve to a valid file metadata.",
								filePath
							)
						)
					);
			}

			if (!fileInfo.isPublic) {
				return res
					.status(403)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.notPublic,
							t(
								"The requested file with path '%s' is not publicly available.",
								fileInfo.path
							)
						)
					);
			}

			const adapter = adapterManager.getStorageAdapterById(fileInfo.storageId);
			if (!adapter) {
				return res
					.status(404)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.missingStorageAdapter,
							t(
								"Adapter for storage identifed by id '%s' to access the file cannot be identified",
								fileInfo.storageId
							)
						)
					);
			}

			const dataStream = await adapter.createFileReadStreamUsingDriver(
				fileInfo.bucketId,
				fileInfo.id
			);

			res.set("Content-Type", fileInfo.mimeType);
			if (attachment === true || attachment === "true") {
				res.setHeader(
					"Content-Disposition",
					`attachment; filename="${path.basename(fileInfo.path)}"`
				);
			}

			dataStream.pipe(res);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

export default router;
