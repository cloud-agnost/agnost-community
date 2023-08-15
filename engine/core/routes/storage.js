import express from "express";
import responseTime from "response-time";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";

const router = express.Router({ mergeParams: true });

/*
@route      /storage/:storageName/buckets?page&size&sortBy&sortOrder
@method     GET
@desc       Get list of buckets of the storage
@access     private
*/
router.get(
	"/:storageName/buckets",
	authAccessToken,
	getResponseBody,
	responseTime(logRequestToConsole),
	applyDefaultRateLimiters(),
	async (req, res) => {
		try {
			const { storageName } = req.params;
			const { page, size, sortBy, sortOrder } = req.query;

			const buckets = await agnost.storage(storageName).listBuckets({
				page: page,
				size: size,
				sort: { field: sortBy, order: sortOrder },
			});

			res.json(buckets);
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

export default router;
