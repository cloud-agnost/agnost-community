import realNumber from "decimal.js";
import { getDBClient } from "../../init/db.js";

export class StorageBase {
	constructor() {
		this.db = null;
	}
	async disconnect() {}

	/**
	 * Return access to platform-core database (MongoDB) where app design but also storage related data stored
	 */
	getDB() {
		const conn = getDBClient();
		this.db = conn.db(META.getEnvId());

		return this.db;
	}
	/**
	 * Creates the storage bucket if it does not exist. This method will be overriden by the actual adapter implementation.
	 * @param  {string} bucketName Name of the bucket
	 */
	async ensureBucket(bucketName) {}

	/**
	 * Creates a new bucket in storage. This method will be overriden by the actual adapter implementation.
	 * @param {object} storage The storage object metadata
	 * @param {string} name The name of the bucket to create (case sensitive).
	 * @param {boolean} isPublic The default privacy setting that will be applied to the files uploaded to this bucket.
	 * @param {object} tags JSON object (key-value pairs) that will be added to the bucket metadata.
	 * @param {string} userId The unique identifier of the user who created the bucket.

	 */
	async createBucket(
		storage,
		name,
		isPublic = true,
		tags = {},
		userId = null
	) {}

	/**
	 * Gets the list of buckets in app storage. Buckets can be filtered by their name, paginated and sorted using the options pararmeters.
	 * @param {object} storage The storage object metadata
	 * @param {string} options.search The search string parameter. Agnost searches the bucket names that includes the search string parameter
	 * @param {string} options.page A positive integer that specifies the page number to paginate bucket results. Page numbers start from 1
	 * @param {string} options.limit A positive integer that specifies the max number of buckets to return per page
	 * @param {string} options.sort.field Specifies the field name and sort direction for sorting returned buckets
	 * @param {string} options.sort.order Sorting order either "asc" or "desc"
	 * @param {string} options.returnCountInfo Flag to specify whether to return the count and pagination information such as total number of buckets, page number and page size
	 */
	async listBuckets(storage, options = {}) {
		let search = null;
		let pageNumber = 1;
		let pageSize = config.get("general.defaultPageSize");
		let sort = {};
		let returnCountInfo = false;

		if (options) {
			if (options.search) search = options.search;
			if (options.limit) pageSize = options.limit;
			if (options.page) pageNumber = options.page;
			if (options.sort && options.sort.field)
				sort[options.sort.field] = options.sort.order === "asc" ? 1 : -1;
			if (
				options.returnCountInfo !== null &&
				options.returnCountInfo !== undefined
			)
				returnCountInfo = options.returnCountInfo;
		}

		const query = { storageId: storage.iid };
		if (search) query.name = { $regex: search, $options: "i" };
		const skip = pageSize * (pageNumber - 1);

		// Get connection to storage metadata database
		const db = this.getDB();
		const dataCursor = await db.collection("buckets").find(query, {
			sort: sort,
			limit: pageSize,
			skip: skip,
			readPreference: "secondaryPreferred",
		});

		if (returnCountInfo) {
			const docCount = await db.collection("buckets").countDocuments(query, {
				readPreference: "secondaryPreferred",
			});

			let totalPages = realNumber.div(docCount, pageSize);
			totalPages = totalPages
				.toDecimalPlaces(0, realNumber.ROUND_UP)
				.toNumber();

			const countInfo = {
				count: docCount,
				totalPages: totalPages,
				currentPage: pageNumber,
				pageSize: pageSize,
			};

			if (skip > countInfo.count || countInfo.count == 0)
				return { info: countInfo, data: [] };
			else {
				const result = await dataCursor.toArray();
				await dataCursor.close();
				return { info: countInfo, data: result };
			}
		} else {
			const result = await dataCursor.toArray();
			await dataCursor.close();
			return result;
		}
	}

	/**
	 * Gets the list of files whose names match the search string. This method performs a global search across all the files contained in all the buckets.
	 * @param {object} storage The storage object metadata
	 * @param {string} options.search The search string parameter. Agnost searches the bucket names that includes the search string parameter
	 * @param {string} options.page A positive integer that specifies the page number to paginate bucket results. Page numbers start from 1
	 * @param {string} options.limit A positive integer that specifies the max number of buckets to return per page
	 * @param {string} options.sort.field Specifies the field name and sort direction for sorting returned buckets
	 * @param {string} options.sort.order Sorting order either "asc" or "desc"
	 * @param {string} options.returnCountInfo Flag to specify whether to return the count and pagination information such as total number of files, page number and page size
	 * @type {boolean}
	 */
	async listFiles(storage, options = {}) {
		let search = null;
		let pageNumber = 1;
		let pageSize = config.get("general.defaultPageSize");
		let sort = {};
		let returnCountInfo = false;

		if (options) {
			if (options.search) search = options.search;
			if (options.limit) pageSize = options.limit;
			if (options.page) pageNumber = options.page;
			if (options.sort && options.sort.field)
				sort[options.sort.field] = options.sort.order === "asc" ? 1 : -1;
			if (
				options.returnCountInfo !== null &&
				options.returnCountInfo !== undefined
			)
				returnCountInfo = options.returnCountInfo;
		}

		const query = { storageId: storage.iid };
		if (search) query.name = { $regex: search, $options: "i" };
		const skip = pageSize * (pageNumber - 1);

		// Get connection to storage metadata database
		const db = this.getDB();
		const dataCursor = await db.collection("files").find(query, {
			sort: sort,
			limit: pageSize,
			skip: skip,
			readPreference: "secondaryPreferred",
		});

		if (returnCountInfo) {
			const docCount = await db.collection("files").countDocuments(query, {
				readPreference: "secondaryPreferred",
			});

			let totalPages = realNumber.div(docCount, pageSize);
			totalPages = totalPages
				.toDecimalPlaces(0, realNumber.ROUND_UP)
				.toNumber();

			const countInfo = {
				count: docCount,
				totalPages: totalPages,
				currentPage: pageNumber,
				pageSize: pageSize,
			};

			if (skip > countInfo.count || countInfo.count == 0)
				return { info: countInfo, data: [] };
			else {
				const result = await dataCursor.toArray();
				await dataCursor.close();
				return { info: countInfo, data: result };
			}
		} else {
			const result = await dataCursor.toArray();
			await dataCursor.close();
			return result;
		}
	}

	/**
	 * Returns the overall information about storage including total number of buckets and files stored, total storage size in bytes and average, min and max file size in bytes.
	 * @param {object} storage The storage object metadata
	 */
	async getStats(storage) {
		// Get connection to storage metadata database
		const db = this.getDB();

		// MongoDB aggregation pipeline
		let pipeline = [];
		pipeline.push({ $match: { storageId: storage.iid } });
		pipeline.push({
			$group: {
				_id: null,
				objectsCount: { $sum: 1 },
				totalStorageSize: { $sum: "$size" },
				averageObjectSize: { $avg: "$size" },
				minObjectSize: { $min: "$size" },
				maxObjectSize: { $max: "$size" },
			},
		});

		let cursor = await db.collection("files").aggregate(pipeline, {
			readPreference: "secondaryPreferred",
		});

		// Get the first item of the cursor
		let result = await cursor.next();
		await cursor.close();

		// Round the average number
		if (result && result.averageObjectSize) {
			let avg = new realNumber(result.averageObjectSize);
			result.averageObjectSize = avg
				.toDecimalPlaces(0, realNumber.ROUND_HALF_UP)
				.toNumber();
		}

		if (result) {
			delete result._id;
		} else {
			result = {
				objectsCount: 0,
				totalStorageSize: 0,
				averageObjectSize: 0,
				minObjectSize: 0,
				maxObjectSize: 0,
			};
		}

		result.bucketsCount = await db.collection("buckets").countDocuments(
			{ storageId: storage.iid },
			{
				readPreference: "secondaryPreferred",
			}
		);

		return result;
	}

	/**
	 * Returns the metadata of the bucket identified by its name.
	 * @param {string} storageId The storage identifier
	 * @param {string} bucketName The name of the bucket
	 * @param {boolean} detailed Whether to fetch detailed bucket info or not. If set to true then bucket file stats are also calculated.
	 */
	async getBucketMetadata(storageId, bucketName, detailed = false) {
		// Get connection to storage metadata database
		const db = this.getDB();
		const metadata = await db
			.collection("buckets")
			.findOne(
				{ storageId: storageId, name: bucketName },
				{ readPreference: "secondaryPreferred", projection: { _id: 0 } }
			);

		if (detailed && metadata) {
			const cursor = await db.collection("files").aggregate(
				[
					{
						$match: { bucketId: metadata.id },
					},
					{
						$group: {
							_id: null,
							objectsCount: { $sum: 1 },
							totalStorageSize: { $sum: "$size" },
							averageObjectSize: { $avg: "$size" },
							minObjectSize: { $min: "$size" },
							maxObjectSize: { $max: "$size" },
						},
					},
				],
				{
					readPreference: "secondaryPreferred",
				}
			);

			// Get the first item of the cursor
			const result = await cursor.next();
			await cursor.close();

			// Round the average number
			if (result && result.averageObjectSize) {
				let avg = new realNumber(result.averageObjectSize);
				result.averageObjectSize = avg
					.toDecimalPlaces(0, realNumber.ROUND_HALF_UP)
					.toNumber();
			}

			if (result) {
				delete result._id;
			} else {
				result = {
					objectsCount: 0,
					totalStorageSize: 0,
					averageObjectSize: 0,
					minObjectSize: 0,
					maxObjectSize: 0,
				};
			}

			metadata.stats = result;
			return metadata;
		} else {
			return metadata;
		}
	}

	/**
	 * Saves the bucket metadata to the database and returns the MongoDB id of the inserted document
	 * @param {object} metadata The bucket metadata
	 */
	async saveBucketMetadata(metadata) {
		// Get connection to storage metadata database
		const db = this.getDB();
		const result = await db.collection("buckets").insertOne(metadata);
		// Clear mongodb identifier
		delete metadata._id;
		return result.insertedId;
	}
}
