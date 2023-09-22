import express from "express";
import responseTime from "response-time";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { authManageStorage } from "../middlewares/authManageStorage.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { handleFileUploads } from "../middlewares/handleFileUploads.js";
const router = express.Router({ mergeParams: true });

/*
@route      /storage/:storageName/bucket?page=0&limit=10&search=&sortBy=email&sortDir=asc
@method     GET
@desc       Get list of bucket of the storage
@access     private
*/
router.get(
	"/:storageName/bucket",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName } = req.params;
			const { page, limit, sortBy, sortDir, search, returnCountInfo } =
				req.query;
			const bucket = await agnost.storage(storageName).listBuckets({
				page: Number(page),
				limit: Number(limit),
				search,
				sort: { field: sortBy, order: sortDir },
				returnCountInfo: returnCountInfo ? JSON.parse(returnCountInfo) : false,
			});

			res.json(bucket);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket
@method     POST
@desc       Create a bucket in the storage
@access     private
*/
router.post(
	"/:storageName/bucket",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	checkContentType,
	async (req, res) => {
		try {
			const { storageName } = req.params;
			const { name, isPublic, tags, userId } = req.body;

			const bucket = await agnost
				.storage(storageName)
				.createBucket(name, isPublic, tags, userId);

			res.json(bucket);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/get-stats
@method     GET
@desc      Get stats of the storage
@access     private
*/
router.get(
	"/:storageName/get-stats",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName } = req.params;
			const stats = await agnost.storage(storageName).getStats();
			res.json(stats);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);
/*
@route      /storage/:storageName/files?page=0&limit=10&search=&sortBy=email&sortDir=asc
@method     GET
@desc       Get list of files of the storage
@access     private
*/
router.get(
	"/:storageName/files",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName } = req.params;
			const { page, limit, sortBy, sortDir, search } = req.query;

			const files = await agnost.storage(storageName).listFiles({
				page: Number(page),
				limit: Number(limit),
				sort: { field: sortBy, order: sortDir },
				search,
			});

			res.json(files);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName
@method     GET
@desc       Get a bucket from the storage
@access     private
*/

router.get(
  "/:storageName/bucket/:bucketName",
  authManageStorage,
  getResponseBody,
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  async (req, res) => {
    try {
      const { storageName, bucketName } = req.params;

      await agnost.storage(storageName).bucket(bucketName).getInfo();

      res.json();
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);
/*
@route      /storage/:storageName/bucket/:bucketName
@method     DELETE
@desc       Delete a bucket from the storage
@access     private
*/

router.delete(
	"/:storageName/bucket/:bucketName",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;

			await agnost.storage(storageName).bucket(bucketName).delete();

			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName
@method     DELETE
@desc       Delete a bucket from the storage
@access     private
*/

router.delete(
	"/:storageName/bucket/delete-multi",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketNames } = req.params;
			bucketNames.forEach(async (bucketName) => {
				await agnost.storage(storageName).bucket(bucketName).delete();
			});

			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/buckets/delete-multi-files",
@method     POST
@desc       Deletes multiple files identified by their paths.
@access     private
*/

router.delete(
	"/:storageName/bucket/:bucketName/delete-multi-files",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { paths } = req.query;
			await agnost.storage(storageName).bucket(bucketName).deleteFiles(paths);

			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName/empty
@method     DELETE
@desc       Empty a bucket
@access     private
*/

router.delete(
	"/:storageName/bucket/:bucketName/empty",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;

			await agnost.storage(storageName).bucket(bucketName).empty();

			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName/tag
@method     POST
@desc       Add tags to a bucket
@access     private
*/

router.post(
	"/:storageName/bucket/:bucketName/tag",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const buckets = [];
			await Promise.all(
				Object.entries(req.body).map(async ([key, value]) => {
					const bucket = await agnost
						.storage(storageName)
						.bucket(bucketName)
						.setTag(key, value);
					buckets.push(bucket);
				})
			);
			res.json(buckets);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName/tag/:tagKey
@method     DELETE
@desc       Remove tags from a bucket
@access     private
*/

router.delete(
	"/:storageName/bucket/:bucketName/tag/:tagKey",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketName, tagKey } = req.params;
			const bucket = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.removeTag(tagKey);

			res.json(bucket);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName/tag/delete-multi
@method     DELETE
@desc       Remove multiple tags from a bucket
@access     private
*/

router.delete(
	"/:storageName/bucket/:bucketName/tag/delete-multi",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;

			const bucket = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.removeTags();
			res.json(bucket);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName
@method     PUT
@desc       Update a bucket
@access     private
*/
router.put(
	"/:storageName/bucket/:bucketName",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { name, isPublic, tags, includeFiles } = req.body;
			const bucket = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.updateInfo(name, isPublic, tags, includeFiles);

			res.json(bucket);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);
/*
@route      /storage/:storageName/bucket/:bucketName/file?page=0&limit=10&search=&sortBy=email&sortDir=asc&search=
@method     GET
@desc       Get files in a bucket
@access     private
*/

router.get(
	"/:storageName/bucket/:bucketName/file",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { page, limit, sortBy, sortDir, returnCountInfo, search } =
				req.query;
			const files = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.listFiles({
					page: Number(page),
					limit: Number(limit),
					sort: { field: sortBy, order: sortDir },
					returnCountInfo: !!returnCountInfo,
					search,
				});

			res.json(files);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName/file
@method     POST
@desc       Upload a file to a bucket
@access     private
*/
router.post(
	"/:storageName/bucket/:bucketName/file",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	handleFileUploads,
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const result = [];
			for (const file of req.files) {
				const fileMetadata = await agnost
					.storage(storageName)
					.bucket(bucketName)
					.upload({
						path: file.filename,
						size: file.size,
						mimeType: file.mimetype,
						localPath: file.path,
					});
				result.push(fileMetadata);
			}

			res.json(result);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /storage/:storageName/bucket/:bucketName/file
@method     DELETE
@desc      Delete file from a bucket
@access     private
*/

router.delete(
	"/:storageName/bucket/:bucketName/file",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { filePath } = req.body;
			await agnost
				.storage(storageName)
				.bucket(bucketName)
				.file(filePath)
				.delete();
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);
/*
@route      /storage/:storageName/bucket/:bucketName/file/delete-multi
@method     DELETE
@desc      Delete multiple files from a bucket
@access     private
*/

router.delete(
	"/:storageName/bucket/:bucketName/file/delete-multi",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { filePaths } = req.body;
			filePaths.forEach(async (path) => {
				await agnost
					.storage(storageName)
					.bucket(bucketName)
					.file(path)
					.delete();
			});
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);
/*
@route      /storage/:storageName/bucket/:bucketName/file/replace
@method     PUT
@desc       Replace file in a bucket
@access     private
*/

router.put(
	"/:storageName/bucket/:bucketName/file/replace",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	handleFileUploads,
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { filePath } = req.body;
			const file = req.files[0];
			const result = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.file(filePath)
				.replace({
					path: file.filename,
					size: file.size,
					mimeType: file.mimetype,
					localPath: file.path,
				});

			res.json(result);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);
/*
@route      /storage/:storageName/bucket/:bucketName/file/copy
@method     PUT
@desc       Copy file in a bucket
@access     private
*/

router.put(
	"/:storageName/bucket/:bucketName/file/copy",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { filePath } = req.body;

			const files = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.listFiles({
					page: 1,
					limit: 100,
					search: filePath,
				});
			const result = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.file(filePath)
				.copyTo(`${filePath} copy - ${files.length}`);
			res.json(result);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);
/*
@route      /storage/:storageName/bucket/:bucketName/file
@method     PUT
@desc       Update file in a bucket
@access     private
*/

router.put(
	"/:storageName/bucket/:bucketName/file",
	authManageStorage,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	checkContentType,
	async (req, res) => {
		try {
			const { storageName, bucketName } = req.params;
			const { path, isPublic, tags, filePath } = req.body;
			const result = await agnost
				.storage(storageName)
				.bucket(bucketName)
				.file(filePath)
				.updateInfo(path, isPublic, tags);
			res.json(result);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

export default router;
