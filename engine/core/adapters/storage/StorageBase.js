import realNumber from "decimal.js";
import fs from "fs";

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
	 * Creates a new bucket in storage. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {string} name The name of the bucket to create (case sensitive).
	 */
	async createBucketUsingDriver(name) {}
	/**
	 * Empties the contents of a bucket in storage. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {string} name The name of the bucket to empty (case sensitive).
	 */
	async emptyBucketUsingDriver(name) {}
	/**
	 * Deletes a bucket in storage. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {string} name The name of the bucket to delete (case sensitive).
	 */
	async deleteBucketUsingDriver(name) {}
	/**
	 * Uploads a file to an existing bucket. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {string} bucketName The name of the bucket to upload the file (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 * @param {Readable} readableStream The contents of the file to upload
	 * @param {string} contentType The content-type of the file
	 */
	async uploadFileUsingDriver(bucketName, path, readableStream, contentType) {}
	/**
	 * Returns a read stream to read the contents of the file. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {string} bucketName The name of the bucket where the file is stored (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async createFileReadStreamUsingDriver(bucketName, path) {}
	/**
	 * Creates a copy of the file
	 *
	 * @param {string} sourceBucketName Source bucket
	 * @param {string} sourceFilePath Source file path
	 * @param {string} destinationBucketName Destination bucket
	 * @param {string} destinationFilePath Destination file path
	 */
	async copyFileUsingDriver(
		sourceBucketName,
		sourceFilePath,
		destinationBucketName,
		destinationFilePath
	) {}
	/**
	 * Deletes the file stored in the bucket. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {string} bucketName The name of the bucket (case sensitive).
	 * @param {string} path The path of the file (case sensitive).
	 */
	async deleteFileUsingDriver(bucketName, path) {}

	/**
	 * Creates a new bucket in storage.
	 * @param {object} storage The storage object metadata
	 * @param {string} name The name of the bucket to create (case sensitive).
	 * @param {boolean} isPublic The default privacy setting that will be applied to the files uploaded to this bucket.
	 * @param {object} tags JSON object (key-value pairs) that will be added to the bucket metadata.
	 * @param {string} userId The unique identifier of the user who created the bucket.
	 */
	async createBucket(storage, name, isPublic = true, tags = {}, userId = null) {
		// First get whether there is already a bucket with the provided name
		const bucketInfo = await this.getBucketMetadata(storage.iid, name);
		if (bucketInfo) {
			throw new AgnostError(
				t("A bucket with the provided name '%s' already exists.", name)
			);
		}

		const dtm = new Date();
		const id = helper.generateSlug("bck");
		const metadata = {
			id,
			storageId: storage.iid,
			name,
			isPublic,
			createdAt: dtm,
			updatedAt: dtm,
			tags: tags ?? undefined,
			userId: userId ?? undefined,
		};

		// Create the bucket in MinIO. We use the id of the bucket instead of its name to create it.
		await this.createBucketUsingDriver(id);
		// Create the bucket metada entry in the database
		await this.saveBucketMetadata(metadata);

		return metadata;
	}

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
	 * Check if the bucket exists.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @returns Returns true if bucket exists, false otherwise
	 */
	async bucketExists(storage, bucketName) {
		const bucketInfo = await this.getBucketMetadata(storage.iid, bucketName);
		return bucketInfo ? true : false;
	}

	/**
	 * Gets information about the bucket. If `detailed=true`, it provides additional information about the total number of files contained, their overall total size in bytes, average, min and max file size in bytes etc.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {boolean} detailed Specifies whether to get detailed bucket statistics or not
	 * @returns Returns basic bucket metadata informaton. If `detailed=true` provides additional information about contained files. If not such bucket exists then returns null.
	 */
	async getBucketInfo(storage, bucketName, detailed = false) {
		return await this.getBucketMetadata(storage.iid, bucketName, detailed);
	}

	/**
	 * Renames the bucket.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} newName The new name of the bucket.
	 * @returns Returns the updated bucket information
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async renameBucket(storage, bucketName, newName) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			// If no name change just return the bucket metadata
			if (bucketObj.name === newName) return bucketObj;

			if (await this.bucketExists(storage, newName)) {
				throw new AgnostError(
					t("A bucket with the provided name '%s' already exists.", newName)
				);
			}

			const updatedAt = new Date();
			const updatedBucket = await this.updateBucketMetadata(bucketObj.id, {
				name: newName,
				updatedAt: updatedAt,
			});

			return updatedBucket;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Removes all objects (e.g., files) inside the bucket. This method does not delete the bucket itself. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async emptyBucket(storage, bucketName) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			await this.emptyBucketUsingDriver(bucketObj.id);
			// Delete all files metadata contained in this bucket
			await this.deleteBucketFilesMetadata(bucketObj.id);
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Deletes the bucket and all objects (e.g., files) inside the bucket. This method will be overriden by the actual adapter implementation.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async deleteBucket(storage, bucketName) {
		const bucketObj = await this.getBucketInfo(storage, bucketName, true);
		if (bucketObj) {
			if (bucketObj.stats.objectsCount > 0) {
				throw new AgnostError(
					t(
						"The bucket '%s' is not empty. A bucket with existing files inside it cannot be deleted. You first need to empty the bucket and then delete it.",
						bucketName
					)
				);
			}
			await this.deleteBucketUsingDriver(bucketObj.id);
			// Delete all files metadata contained in this bucket
			await this.deleteBucketFilesMetadata(bucketObj.id);
			// Delete the bucket metadata
			await this.deleteBucketMetadata(bucketObj.id);
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Sets the default privacy of the bucket to **true**. You may also choose to make the contents of the bucket publicly readable by specifying `includeFiles=true`. This will automatically set `isPublic=true` for every file in the bucket.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {boolean} includeFiles Specifies whether to make each file in the bucket public.
	 * @returns Returns the updated bucket information
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async makeBucketPublic(storage, bucketName, includeFiles = false) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const updatedAt = new Date();
			const updatedBucket = await this.updateBucketMetadata(bucketObj.id, {
				isPublic: true,
				updatedAt: updatedAt,
			});

			if (includeFiles) {
				await this.updateBucketFilesMetadata(bucketObj.id, {
					isPublic: true,
					updatedAt: updatedAt,
				});
			}

			return updatedBucket;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Sets the default privacy of the bucket to **false**. You may also choose to make the contents of the bucket private by specifying `includeFiles=true`. This will automatically set `isPublic=false` for every file in the bucket.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {boolean} includeFiles Specifies whether to make each file in the bucket private.
	 * @returns Returns the updated bucket information
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async makeBucketPrivate(storage, bucketName, includeFiles = false) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const updatedAt = new Date();
			const updatedBucket = await this.updateBucketMetadata(bucketObj.id, {
				isPublic: false,
				updatedAt: updatedAt,
			});

			if (includeFiles) {
				await this.updateBucketFilesMetadata(bucketObj.id, {
					isPublic: false,
					updatedAt: updatedAt,
				});
			}

			return updatedBucket;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Sets the specified tag value in bucket's metadata.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} key The key of the tag
	 * @param {string} value The value of the tag
	 * @returns Returns the updated bucket information
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async setBucketTag(storage, bucketName, key, value) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const updatedAt = new Date();
			const updatedBucket = await this.updateBucketMetadata(bucketObj.id, {
				updatedAt: updatedAt,
				[`tags.${key}`]: value,
			});

			return updatedBucket;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Removes the specified tag from bucket's metadata.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} key The name of the tag key to remove from bucket metadata
	 * @returns Returns the updated bucket information
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async removeBucketTag(storage, bucketName, key) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const updatedAt = new Date();
			const updatedBucket = await this.updateBucketMetadata(
				bucketObj.id,
				{
					updatedAt: updatedAt,
				},
				{
					[`tags.${key}`]: "",
				}
			);

			return updatedBucket;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Removes all tags from bucket's metadata.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @returns Returns the updated bucket information
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async removeAllBucketTags(storage, bucketName) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const updatedAt = new Date();
			const updatedBucket = await this.updateBucketMetadata(bucketObj.id, {
				updatedAt: updatedAt,
				tags: {},
			});

			return updatedBucket;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Updates the overall bucket data (name, isPublic and tags) in a single method call.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} newName The new name of the bucket.
	 * @param {boolean} isPublic The default privacy setting that will be applied to the files uploaded to this bucket.
	 * @param {object} tags Array of string values that will be set as the bucket metadata.
	 * @param {boolean} includeFiles Specifies whether to make each file in the bucket to have the same privacy setting of the bucket.
	 * @returns Returns the updated bucket information
	 * @throws Throws an exception if bucket cannot be identified or updated
	 */
	async updateBucketInfo(
		storage,
		bucketName,
		newName,
		isPublic,
		tags,
		includeFiles = false
	) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			// If the name changed then check whether there is already a bucket with the same name
			if (
				bucketObj.name !== newName &&
				(await this.bucketExists(storage, newName))
			) {
				throw new AgnostError(
					t("A bucket with the provided name '%s' already exists.", newName)
				);
			}

			const updatedAt = new Date();
			const updatedBucket = await this.updateBucketMetadata(bucketObj.id, {
				updatedAt: updatedAt,
				name: newName,
				isPublic,
				tags,
			});

			if (includeFiles) {
				await this.updateBucketFilesMetadata(bucketObj.id, {
					isPublic,
					updatedAt: updatedAt,
				});
			}

			return updatedBucket;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Deletes multiple files identified either by their paths.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string[]} paths Array of paths of the files to delete
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async deleteBucketFiles(storage, bucketName, paths) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			// Get connection to storage metadata database
			const db = this.getDB();
			// Get list of file metadata from the database
			const filesCursor = await db.collection("files").find(
				{ bucketId: bucketObj.id, path: { $in: paths } },
				{
					readPreference: "secondaryPreferred",
				}
			);

			const filesToDelete = await filesCursor.toArray();
			await filesCursor.close();

			// Iterate over each file and delete them
			const idsToDelete = [];
			for (let i = 0; i < filesToDelete.length; i++) {
				const fileObj = filesToDelete[i];
				await this.deleteFileUsingDriver(bucketObj.id, fileObj.id);
				idsToDelete.push(fileObj.id);
			}

			// Delete the metadata of the files
			await db.collection("files").deleteMany({ id: { $in: idsToDelete } });
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Gets the list of files stored in the bucket. If `options.search` is specified, it runs the file name filter query to narrow down returned results, otherwise, returns all files contained in the bucket. You can paginate through your files and sort them using the input options parameter.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} options.search The search string parameter. Agnost searches the file names that includes the search string parameter
	 * @param {string} options.page A positive integer that specifies the page number to paginate file results. Page numbers start from 1
	 * @param {string} options.limit A positive integer that specifies the max number of files to return per page
	 * @param {string} options.sort.field Specifies the field name and sort direction for sorting returned files
	 * @param {string} options.sort.order Sorting order either "asc" or "desc"
	 * @param {string} options.returnCountInfo Flag to specify whether to return the count and pagination information such as total number of files, page number and page size
	 * @returns Returns the array of files. If `options.returnCountInfo=true`, returns an object which includes count information and array of files.
	 * @throws Throws an exception if bucket cannot be identified.
	 */
	async listBucketFiles(storage, bucketName, options) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (!bucketObj)
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));

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

		const query = { bucketId: bucketObj.id };
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
	 * Uploads a file to an existing bucket using a readable stream as imput or the local path of the file that is stored in disk.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} fileObject.path The path of the file e.g., *image/png*
	 * @param {string} fileObject.mimeType The mime-type of the file e.g.,
	 * @param {number} fileObject.size The size of the file in bytes
	 * @param {Readable} fileObject.stream The contents of the file as a readable stream
	 * @param {string} fileObject.localPath  The local path of the file where it is stored locally
	 * @param {boolean} options.isPublic Specifies whether file is publicy accessible or not. Defaults to the bucket's privacy setting if not specified.
	 * @param {boolean} options.upsert Specifies whether to create a new file or overwrite an existing file.
	 * @param {object} options.tags Key-value pairs that will be added to the file metadata.
	 * @returns Returns the metadata of the uploaded file
	 * @throws Throws an exception if bucket cannot be identified or and error occurs during file upload.
	 */
	async uploadFile(storage, bucketName, fileObject, options = null) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (!bucketObj)
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));

		// Sanitize file path
		fileObject.path = helper.removeLeadingAndTrailingSlash(fileObject.path);
		// Check if there is already such a file in bucket
		const fileInfo = await this.getFileMetadata(bucketObj.id, fileObject.path);

		// Build the file metadata
		const dtm = new Date();
		let fileMetadata = null;

		if (fileInfo) {
			if (!options?.upsert)
				throw new AgnostError(
					t(
						"Upsert is set to false but a file with the provided path '%s' already exists. Try setting upsert to true to overwrite an existing file.",
						fileObject.path
					)
				);

			fileMetadata = {
				...fileInfo,
				isPublic: options?.isPublic ?? fileInfo.isPublic,
				tags: options?.tags ?? fileInfo.tags,
				size: fileObject.size,
				mimeType: fileObject.mimeType,
				uploadedAt: dtm,
				updatedAt: dtm,
			};
		} else {
			const id = helper.generateSlug("fl");
			fileMetadata = {
				id: id,
				storageId: storage.iid,
				bucketId: bucketObj.id,
				path: fileObject.path,
				size: fileObject.size,
				mimeType: fileObject.mimeType,
				uploadedAt: dtm,
				updatedAt: dtm,
				isPublic: options?.isPublic ?? bucketObj.isPublic,
				tags: options?.tags ?? {},
			};
		}

		// Check if the file upload is from a stream of from a locally stored file on disk
		if (fileObject.stream)
			await this.uploadFileUsingDriver(
				bucketObj.id,
				fileMetadata.id,
				fileObject.stream,
				fileObject.mimeType
			);
		else {
			if (!fs.existsSync(fileObject.localPath)) {
				throw new AgnostError(
					t(
						"No such file at the specified path '%s' exists on local disk",
						fileObject.localPath
					)
				);
			}
			const fileStream = fs.createReadStream(fileObject.localPath);
			// We do not use the file object path when uploading it to a bucket but instead its id
			await this.uploadFileUsingDriver(
				bucketObj.id,
				fileMetadata.id,
				fileStream,
				fileObject.mimeType
			);
		}

		if (fileInfo)
			return await this.updateFileMetadata(fileMetadata.id, fileMetadata);
		else {
			await this.saveFileMetadata(fileMetadata);
			return fileMetadata;
		}
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

	/**
	 * Saves the file metadata to the database and returns the MongoDB id of the inserted document
	 * @param {object} metadata The file metadata
	 */
	async saveFileMetadata(metadata) {
		// Get connection to storage metadata database
		const db = this.getDB();
		const result = await db.collection("files").insertOne(metadata);
		// Clear mongodb identifier
		delete metadata._id;
		return result.insertedId;
	}

	/**
	 * Updates the bucket metadata in the database and returns the updated metadata object
	 * @param {string} bucketId The bucket identifer (e.g., iid)
	 * @param {object} set The data to set
	 * @param {object} unset The data to unset
	 */
	async updateBucketMetadata(bucketId, set, unset = null) {
		// Get connection to storage metadata database
		const db = this.getDB();
		let updatedMetadata = null;

		if (unset) {
			updatedMetadata = await db.collection("buckets").findOneAndUpdate(
				{ id: bucketId },
				{ $set: set, $unset: unset },
				{
					returnDocument: "after", //return the updated document
					upsert: false,
				}
			);
		} else {
			updatedMetadata = await db.collection("buckets").findOneAndUpdate(
				{ id: bucketId },
				{ $set: set },
				{
					returnDocument: "after", //return the updated document
					upsert: false,
				}
			);
		}

		// Clear mongodb identifier
		if (updatedMetadata?.value) delete updatedMetadata.value._id;
		return updatedMetadata.value;
	}

	/**
	 * Deletes the all files metadat contained in the bucket
	 * @param {string} bucketId The bucket identifer (e.g., iid)
	 */
	async deleteBucketFilesMetadata(bucketId) {
		// Get connection to storage metadata database
		const db = this.getDB();
		await db.collection("files").deleteMany({ bucketId: bucketId });
	}

	/**
	 * Updates the bucket files metadata
	 * @param {string} bucketId The bucket identifer (e.g., iid)
	 * @param {object} set The data to set
	 * @param {object} unset The data to unset
	 */
	async updateBucketFilesMetadata(bucketId, set, unset = null) {
		// Get connection to storage metadata database
		const db = this.getDB();
		let updatedMetadata = null;

		if (unset) {
			updatedMetadata = await db.collection("files").updateMany(
				{ bucketId: bucketId },
				{ $set: set, $unset: unset },
				{
					upsert: false,
				}
			);
		} else {
			updatedMetadata = await db.collection("files").updateMany(
				{ bucketId: bucketId },
				{ $set: set },
				{
					upsert: false,
				}
			);
		}
	}

	/**
	 * Updates the file metadata
	 * @param {string} fileId The file identifer (e.g., iid)
	 * @param {object} set The data to set
	 * @param {object} unset The data to unset
	 */
	async updateFileMetadata(fileId, set, unset = null) {
		// Get connection to storage metadata database
		const db = this.getDB();
		let updatedMetadata = null;

		if (unset) {
			updatedMetadata = await db.collection("files").findOneAndUpdate(
				{ id: fileId },
				{ $set: set, $unset: unset },
				{
					returnDocument: "after", //return the updated document
					upsert: false,
				}
			);
		} else {
			updatedMetadata = await db.collection("files").findOneAndUpdate(
				{ id: fileId },
				{ $set: set },
				{
					returnDocument: "after", //return the updated document
					upsert: false,
				}
			);
		}

		// Clear mongodb identifier
		if (updatedMetadata?.value) delete updatedMetadata.value._id;
		return updatedMetadata.value;
	}

	/**
	 * Deletes the bucket metadata
	 * @param {string} bucketId The bucket identifer (e.g., iid)
	 */
	async deleteBucketMetadata(bucketId) {
		// Get connection to storage metadata database
		const db = this.getDB();
		await db.collection("buckets").deleteOne({ id: bucketId });
	}

	/**
	 * Returns the metadata of the file identified by its path.
	 * @param {string} bucketId The storage identifier
	 * @param {string} path The path of the file
	 */
	async getFileMetadata(bucketId, path) {
		// Get connection to storage metadata database
		const db = this.getDB();
		const metadata = await db
			.collection("files")
			.findOne(
				{ bucketId: bucketId, path },
				{ readPreference: "secondaryPreferred", projection: { _id: 0 } }
			);

		return metadata;
	}

	/**
	 * Checks if the file exists.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @returns Returns true if file exists, false otherwise
	 */
	async fileExists(storage, bucketName, path) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (!bucketObj)
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));

		const fileInfo = await this.getFileMetadata(bucketObj.id, path);
		return fileInfo ? true : false;
	}

	/**
	 * Gets information about the file.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @returns Returns basic file metadata informaton. If not such file exists then returns null.
	 */
	async getFileInfo(storage, bucketName, path) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (!bucketObj)
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));

		return await this.getFileMetadata(bucketObj.id, path);
	}

	/**
	 * Deletes the file from the bucket.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @throws Throws an exception if file cannot be identified or deleted.
	 */
	async deleteFile(storage, bucketName, path) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			await this.deleteFileUsingDriver(bucketObj.id, fileObj.id);
			// Get connection to storage metadata database
			const db = this.getDB();
			// Delete the metadata of the file
			await db.collection("files").deleteOne({ id: fileObj.id });
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Sets the privacy of the file to **true**.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified.
	 */
	async makeFilePublic(storage, bucketName, path) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(fileObj.id, {
				isPublic: true,
				updatedAt: updatedAt,
			});

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Sets the privacy of the file to **false**.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified.
	 */
	async makeFilePrivate(storage, bucketName, path) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(fileObj.id, {
				isPublic: false,
				updatedAt: updatedAt,
			});

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Downloads the file as a stream. The returned readable stream can be piped to a writable stream or listened to for 'data' events to read a file's contents.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @returns Returns a readable stream to read the contents of the stored file
	 * @throws Throws an exception if file cannot be identified.
	 */
	async createFileReadStream(storage, bucketName, path) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			return await this.createFileReadStreamUsingDriver(
				bucketObj.id,
				fileObj.id
			);
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Sets the specified tag value in file's metadata.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @param {string} key The key of the tag
	 * @param {string} value The value of the tag
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified.
	 */
	async setFileTag(storage, bucketName, path, key, value) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(fileObj.id, {
				updatedAt: updatedAt,
				[`tags.${key}`]: value,
			});

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Removes the specified tag from file's metadata.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @param {string} key The name of the tag key to remove from bucket metadata
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified.
	 */
	async removeFileTag(storage, bucketName, path, key) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(
				fileObj.id,
				{
					updatedAt: updatedAt,
				},
				{
					[`tags.${key}`]: "",
				}
			);

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Removes all tags from file's metadata.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified.
	 */
	async removeAllFileTags(storage, bucketName, path) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(fileObj.id, {
				updatedAt: updatedAt,
				tags: {},
			});

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Copies the file to another path in the same bucket. It basically creates a copy of the existing file at the new path `toPath`.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @param {string} toPath The new file path where this file will be copied to.
	 * @returns Returns the copied file information
	 * @throws Throws an exception if file cannot be identified or if there is already a file stored at the new path
	 */
	async copyFileTo(storage, bucketName, path, toPath) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const toPathSanitized = helper.removeLeadingAndTrailingSlash(toPath);
			const destFileObj = await this.getFileMetadata(
				bucketObj.id,
				toPathSanitized
			);
			if (destFileObj)
				throw new AgnostError(
					t(
						"There is already a file '%s' under bucket '%s'. You cannot copy a file to a new path that is already in use by another file.",
						toPath,
						bucketName
					)
				);

			const dtm = new Date();
			const id = helper.generateSlug("fl");
			const newFileMetadata = {
				id: id,
				storageId: storage.iid,
				bucketId: bucketObj.id,
				path: toPathSanitized,
				size: fileObj.size,
				mimeType: fileObj.mimeType,
				uploadedAt: dtm,
				updatedAt: dtm,
				isPublic: fileObj.isPublic,
				tags: fileObj.tags,
			};

			await this.copyFileUsingDriver(
				bucketObj.id,
				fileObj.id,
				bucketObj.id,
				newFileMetadata.id
			);
			await this.saveFileMetadata(newFileMetadata);
			return newFileMetadata;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Moves the file to another path in the same bucket. This method basically updates the file path including the file name.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @param {string} toPath The new file path where this file will be copied to.
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified or if there is already a file stored at the new path
	 */
	async moveFileTo(storage, bucketName, path, toPath) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const toPathSanitized = helper.removeLeadingAndTrailingSlash(toPath);
			const destFileObj = await this.getFileMetadata(
				bucketObj.id,
				toPathSanitized
			);
			if (destFileObj)
				throw new AgnostError(
					t(
						"There is already a file '%s' under bucket '%s'. You cannot move a file to a new path that is already in use by another file.",
						toPath,
						bucketName
					)
				);

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(fileObj.id, {
				updatedAt: updatedAt,
				path: toPathSanitized,
			});

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Moves the file to another path in the same bucket. This method basically updates the file path including the file name.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @param {string} fileObject.mimeType The mime-type of the file e.g.,
	 * @param {number} fileObject.size The size of the file in bytes
	 * @param {Readable} fileObject.stream The contents of the file as a readable stream
	 * @param {string} fileObject.localPath  The local path of the file where it is stored locally
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified or an error occurs during file upload.
	 */
	async replaceFile(storage, bucketName, path, fileObject) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			// Check if the file upload is from a stream of from a locally stored file on disk
			if (fileObject.stream)
				await this.uploadFileUsingDriver(
					bucketObj.id,
					fileObj.id,
					fileObject.stream,
					fileObject.mimeType
				);
			else {
				if (!fs.existsSync(fileObject.localPath)) {
					throw new AgnostError(
						t(
							"No such file at the specified path '%s' exists on local disk",
							fileObject.localPath
						)
					);
				}
				const fileStream = fs.createReadStream(fileObject.localPath);
				// We do not use the file object path when uploading it to a bucket but instead its id
				await this.uploadFileUsingDriver(
					bucketObj.id,
					fileObj.id,
					fileStream,
					fileObject.mimeType
				);
			}

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(fileObj.id, {
				updatedAt: updatedAt,
				uploadedAt: updatedAt,
				mimeType: fileObject.mimeType,
				size: fileObject.size,
			});

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}

	/**
	 * Updates the overall file metadata (path, isPublic and tags) in a single method call.
	 *
	 * @param {object} storage The storage object metadata
	 * @param {string} bucketName The bucket name
	 * @param {string} path The file path
	 * @param {string} newPath The new path of the file.
	 * @param {boolean} isPublic The privacy setting of the file.
	 * @param {object} tags JSON object (key-value pairs) that will be set as the file metadata.
	 * @returns Returns the updated file information
	 * @throws Throws an exception if file cannot be identified or updated
	 */
	async updateFileInfo(storage, bucketName, path, newPath, isPublic, tags) {
		const bucketObj = await this.getBucketInfo(storage, bucketName);
		if (bucketObj) {
			const fileObj = await this.getFileMetadata(bucketObj.id, path);
			if (!fileObj)
				throw new AgnostError(
					t(
						"The file '%s' under bucket '%s' cannot be found.",
						path,
						bucketName
					)
				);

			const newPathSanitized = helper.removeLeadingAndTrailingSlash(newPath);
			const destFileObj = await this.getFileMetadata(
				bucketObj.id,
				newPathSanitized
			);
			if (destFileObj)
				throw new AgnostError(
					t(
						"There is already a file '%s' under bucket '%s'. You cannot move a file to a new path that is already in use by another file.",
						newPath,
						bucketName
					)
				);

			const updatedAt = new Date();
			const updatedFile = await this.updateFileMetadata(fileObj.id, {
				updatedAt: updatedAt,
				path: newPathSanitized,
				isPublic,
				tags,
			});

			return updatedFile;
		} else {
			throw new AgnostError(t("The bucket '%s' cannot be found.", bucketName));
		}
	}
}
