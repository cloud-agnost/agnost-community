import express from "express";
import responseTime from "response-time";
import { agnost } from "@agnost/server";
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
			const { page, size, sortBy, sortDir, id, dbType } = req.query;

      const query =
        dbType === "MongoDB"
          ? {
              $eq: [
                "_id",
                {
                  $toObjectId: id,
                },
              ],
            }
          : { id: id };
      const defaultField = dbType === "MongoDB" ? "_id" : "id";
      const field = sortBy ?? defaultField;
      const direction = sortDir ?? "asc";
      const { data, info } = await agnost
        .db(dbName)
        .model(modelName)
        .findMany(
          {
            ...(id && query),
          },
          {
            ...(size && { limit: Number(size) }),
            ...(size && page && { skip: (Number(page) - 1) * Number(size) }),
            sort: { [field]: direction },
            returnCount: true,
          }
        );


			const countInfo = {
				totalCount: Number(info.count),
				totalPages: Math.ceil(info.count / Number(size)),
				currentPage: Number(page),
				pageSize: Number(size),
				count: data.length,
			};

			const updatedData = data.map((d) => {
				d.id = d?._id ?? d.id;
				delete d._id;
				return d;
			});

			res.json({ countInfo, data: updatedData });
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
				const value = await mongoClient
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

				value.id = value?._id ?? value.id;
				delete value._id;
				res.json(value);
			} else {
				const updatedData = await agnost
					.db(dbName)
					.model(modelName)
					.updateById(id, data);
				updatedData.id = updatedData?._id ?? updatedData.id;
				delete updatedData._id;
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
