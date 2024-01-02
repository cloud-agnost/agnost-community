import express from "express";
import responseTime from "response-time";
import { agnost } from "@agnost/server";
import ERROR_CODES from "../config/errorCodes.js";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { authManageStorage } from "../middlewares/authManageStorage.js";
import { authSession } from "../middlewares/authSession.js";
import { checkAPIKey } from "../middlewares/checkAPIKey.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import {
  checkBucket,
  checkStorage,
} from "../middlewares/checkStorageBucket.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { handleFileUploads } from "../middlewares/handleFileUploads.js";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { applyRules, validate } from "../util/authRules.js";
import { sendMessage } from "../init/sync.js";
import helper from "../util/helper.js";
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
  checkServerStatus,
  async (req, res) => {
    try {
      const { storageName } = req.params;
      const { page, size, sortBy, sortDir, search, returnCountInfo } =
        req.query;
      const bucket = await agnost.storage(storageName).listBuckets({
        page: Number(page) + 1,
        limit: Number(size),
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
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  checkContentType,
  checkServerStatus,
  authSession,
  checkStorage,

  async (req, res) => {
    try {
      const { storageName } = req.params;
      const { name, isPublic, tags, versionId } = req.body;
      const { user } = req;

      const bucket = await agnost
        .storage(storageName)
        .createBucket(
          name,
          isPublic,
          helper.stringifyObjectValues(tags),
          user._id
        );

      sendMessage(versionId, {
        actor: {
          userId: user._id,
          name: user.name,
          pictureUrl: user.pictureUrl,
          color: user.color,
          loginEmail: user.loginProfiles[0].email,
          contactEmail: user.contactEmail,
        },
        action: "create",
        object: "org.app.version.storage.bucket",
        description: `Created bucket ${name} in storage ${storageName}`,
        timestamp: Date.now(),
        data: bucket,
        identifiers: {
          bucketId: bucket.id,
          bucketName: name,
          versionId,
        },
      });
      res.json(bucket);
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
  checkServerStatus,
  checkStorage,
  checkBucket,
  async (req, res) => {
    try {
      const { bucket } = req;

      res.json(bucket);
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
  checkServerStatus,
  checkStorage,
  checkBucket,
  authSession,
  async (req, res) => {
    try {
      const { storageName, bucketName } = req.params;
      const { versionId } = req.query;
      const { user, bucket, storage } = req;
      await agnost.storage(storageName).bucket(bucketName).delete();
      sendMessage(versionId, {
        actor: {
          userId: user._id,
          name: user.name,
          pictureUrl: user.pictureUrl,
          color: user.color,
          loginEmail: user.loginProfiles[0].email,
          contactEmail: user.contactEmail,
        },
        action: "delete",
        object: "org.app.version.storage.bucket",
        description: `Deleted bucket ${bucket.name} in storage ${storageName}`,
        timestamp: Date.now(),
        data: {},
        identifiers: {
          bucketName: bucket.name,
          bucketId: bucket.id,
          storageId: storage.id,
          versionId,
        },
      });
      res.json();
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);

/*
@route      /storage/:storageName/bucket
@method     DELETE
@desc       Delete a bucket from the storage
@access     private
*/

router.delete(
  "/:storageName/delete-multi-buckets",
  authManageStorage,
  getResponseBody,
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  checkServerStatus,
  checkContentType,
  checkStorage,
  authSession,
  async (req, res) => {
    try {
      const { storageName } = req.params;
      const { deletedBuckets, versionId } = req.body;
      const { user, storage } = req;
      deletedBuckets.forEach(async (bucket) => {
        const { name, id } = bucket;
        await agnost.storage(storageName).bucket(name).delete();
        sendMessage(versionId, {
          actor: {
            userId: user._id,
            name: user.name,
            pictureUrl: user.pictureUrl,
            color: user.color,
            loginEmail: user.loginProfiles[0].email,
            contactEmail: user.contactEmail,
          },
          action: "delete",
          object: "org.app.version.storage.bucket",
          description: `Deleted bucket ${name} in storage ${storageName}`,
          timestamp: Date.now(),
          data: {},
          identifiers: {
            bucketId: id,
            storageId: storage.id,
            bucketName: name,
            versionId,
          },
        });
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
  checkServerStatus,
  checkContentType,
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
  checkServerStatus,
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
  checkServerStatus,
  authSession,
  checkStorage,
  async (req, res) => {
    try {
      const { storageName, bucketName } = req.params;
      const { name, isPublic, tags, includeFiles, versionId } = req.body;
      const { user, storage } = req;
      const bucket = await agnost
        .storage(storageName)
        .bucket(bucketName)
        .updateInfo(
          name,
          isPublic,
          helper.stringifyObjectValues(tags),
          includeFiles
        );

      sendMessage(versionId, {
        actor: {
          userId: user._id,
          name: user.name,
          pictureUrl: user.pictureUrl,
          color: user.color,
          loginEmail: user.loginProfiles[0].email,
          contactEmail: user.contactEmail,
        },
        action: "update",
        object: "org.app.version.storage.bucket",
        description: `Updated bucket ${name} in storage ${storageName}`,
        timestamp: Date.now(),
        data: bucket,
        identifiers: {
          bucketId: bucket.id,
          bucketName: name,
          storageId: storage.id,
          versionId,
        },
      });
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
  checkServerStatus,
  async (req, res) => {
    try {
      const { storageName, bucketName } = req.params;
      const { page, size, sortBy, sortDir, returnCountInfo, search } =
        req.query;
      const files = await agnost
        .storage(storageName)
        .bucket(bucketName)
        .listFiles({
          page: Number(page) + 1,
          limit: Number(size),
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
  checkServerStatus,
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
  checkServerStatus,
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
  checkServerStatus,
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
  checkServerStatus,
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
  checkServerStatus,
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
  checkServerStatus,
  async (req, res) => {
    try {
      const { storageName, bucketName } = req.params;
      const { path, isPublic, tags, filePath } = req.body;
      const result = await agnost
        .storage(storageName)
        .bucket(bucketName)
        .file(filePath)
        .updateInfo(path, isPublic, helper.stringifyObjectValues(tags));
      res.json(result);
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);

/*
@route      /storage/:storageName/bucket/:bucketName/upload-formdata
@method     POST
@desc       Upload a formdata, File or Blob object. This handler is to handle upload operations peformed through the @agnost/client library.
@access     public
*/
router.post(
  "/:storageName/bucket/:bucketName/upload-formdata",
  responseTime(logRequestToConsole),
  getResponseBody,
  applyDefaultRateLimiters(),
  checkServerStatus,
  handleFileUploads,
  checkContentType,
  checkAPIKey(null),
  checkStorage,
  checkBucket,
  applyRules("upload-formdata"),
  validate,
  async (req, res) => {
    try {
      const { storageName, bucketName } = req.params;

      let isPublic = req.bucket.isPublic;
      let upsert = false;
      let tags = [];
      if (req.query?.options) {
        try {
          req.query.options = JSON.parse(req.query.options);
          isPublic = req.query.options.isPublic ?? req.bucket.isPublic;
          isPublic = isPublic ? true : false;

          tags = req.query.options.tags;
          upsert = req.query.options.upsert;
        } catch (err) {}
      }

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json(
            helper.createErrorMessage(
              ERROR_CODES.clientError,
              ERROR_CODES.fileUploadError,
              t(
                "The file to upload cannot be recognized in the body of the request."
              )
            )
          );
      }

      const file = req.files[0];
      const fileMetadata = await agnost
        .storage(storageName)
        .bucket(bucketName)
        .upload(
          {
            path: req.query.fileName,
            size: file.size,
            mimeType: file.mimetype,
            localPath: file.path,
          },
          { isPublic: isPublic, tags: tags, upsert: upsert }
        );

      res.status(200).json(fileMetadata);
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);

export default router;
