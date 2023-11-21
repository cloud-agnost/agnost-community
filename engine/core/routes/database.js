import express from "express";
import responseTime from "response-time";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { authManageStorage } from "../middlewares/authManageStorage.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { logRequestToConsole } from "../middlewares/logRequest.js";

const router = express.Router({ mergeParams: true });

/*
@route      /database/:dbName/model/:modelName?page=0&limit=10&search=&sortBy=email&sortDir=asc
@method     GET
@desc       Get all data from a model
@access     private
*/

router.get(
  "/:dbName/model/:modelName",
  authManageStorage,
  getResponseBody,
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  checkServerStatus,
  async (req, res) => {
    try {
      const { dbName, modelName } = req.params;
      const { page, size, sortBy, sortDir, id } = req.query;
      console.log("req.query", req.params);
      const data = await agnost
        .db(dbName)
        .model(modelName)
        .findMany(
          {
            ...(id && {
              $eq: [
                "_id",
                {
                  $toObjectId: id,
                },
              ],
            }),
          },
          {
            ...(size && { limit: Number(size) }),
            ...(sortBy && sortDir && { sort: { [sortBy]: sortDir } }),
            ...(size && page && { skip: Number(page) * Number(size) }),
          }
        );

      res.json(
        data.map((d) => {
          d.id = d?._id ?? d.id;
          delete d._id;
          return d;
        })
      );
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);

/*
@route      /:dbName/model/:modelName
@method     POST
@desc       Create a data in the model
@access     private
*/
router.post(
  "/:dbName/model/:modelName",
  authManageStorage,
  getResponseBody,
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  checkContentType,
  checkServerStatus,
  async (req, res) => {
    try {
      const { dbName, modelName } = req.params;

      const data = await agnost.db(dbName).model(modelName).createOne(req.body);

      res.json(data);
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);
/*
@route      /:dbName/model/:modelName/:id
@method     POST
@desc       Update a data in the model
@access     private
*/
router.put(
  "/:dbName/model/:modelName/:id",
  authManageStorage,
  getResponseBody,
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  checkContentType,
  checkServerStatus,
  async (req, res) => {
    try {
      const { dbName, modelName, id } = req.params;
      const { data, isSubObjectUpdate } = req.body;
      const mongoClient = agnost.db(dbName).getClient();
      const actualDbName = agnost.db(dbName).getActualDbName();

      if (isSubObjectUpdate) {
        const { value } = await mongoClient
          .db(actualDbName)
          .collection(modelName)
          .findOneAndUpdate(
            { _id: helper.objectId(id) },
            {
              $set: data,
            },
            {
              returnDocument: "after",
            }
          );
        res.json(value);
      } else {
        const updatedData = await agnost
          .db(dbName)
          .model(modelName)
          .updateById(id, data);
        res.json(updatedData);
      }
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);
/*
@route      /:dbName/model/:modelName/:id
@method     POST
@desc       Delete multiple data in the model
@access     private
*/
router.delete(
  "/:dbName/model/:modelName/delete-multi",
  authManageStorage,
  getResponseBody,
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  checkContentType,
  checkServerStatus,
  async (req, res) => {
    try {
      const { dbName, modelName } = req.params;
      const { ids } = req.body;
      ids.forEach(async (id) => {
        await agnost.db(dbName).model(modelName).deleteById(id);
      });
      res.json();
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);
/*
@route      /:dbName/model/:modelName/:id
@method     POST
@desc       Delete a data in the model
@access     private
*/
router.delete(
  "/:dbName/model/:modelName/:id",
  authManageStorage,
  getResponseBody,
  responseTime(logRequestToConsole),
  applyDefaultRateLimiters(),
  checkContentType,
  checkServerStatus,
  async (req, res) => {
    try {
      const { dbName, modelName, id } = req.params;

      const data = await agnost.db(dbName).model(modelName).deleteById(id);

      res.json(data);
    } catch (error) {
      helper.handleError(req, res, error);
    }
  }
);

export default router;
