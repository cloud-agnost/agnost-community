import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to MongoDB
 */
export class MongoDB extends DatabaseBase {
	constructor(driver) {
		super();
		this.driver = driver;
		this.session = null;
		this.transactionsSupported = null;
	}

	async disconnect() {
		try {
			await this.driver.close();
		} catch (err) {}
	}

	/**
	 * Returns the database driver
	 */
	getDriver() {
		return this.driver;
	}

	/**
	 * Returns a temporary field name that is used in specifying the let values in lookup stage.
	 * @returns  Temporary field name
	 */
	generateTempFieldName() {
		return `fld_${helper.generateSlug(null, 6)}`;
	}

	/**
	 * Prepares the select part of the query namely the fields that will be returned.
	 * @param  {Array} select The included fields
	 * @param  {Array} omit The exdluded fields
	 * @returns  The select for SQL or projection for no-SQL definiton
	 */
	getSelectDefinition(select, omit) {
		// If not select or omit definition the return all fields
		if (!select && !omit) return null;

		const include = select ? true : false;
		const list = select ?? omit;

		const projection = {};
		for (const entry of list) {
			projection[entry.fieldName] = include ? 1 : 0;
		}

		return projection;
	}

	/**
	 * Prepares the sort part of the query
	 * @param  {Array} sort The list of fields to sort
	 * @returns  The sort definition
	 */
	getSortDefinition(sort) {
		if (!sort) return null;

		const sortDef = {};
		for (const entry of sort) {
			sortDef[entry.fieldName] = entry.order === "asc" ? 1 : -1;
		}

		return sortDef;
	}

	/**
	 * Prepares the update part of the query
	 * @param  {object} updateInstructions The update instructions
	 * @returns  The update definition
	 */
	getUpdateDefinition(updateInstructions) {
		const updates = {};
		if (updateInstructions.set) {
			updates.$set = updateInstructions.set;
		}

		for (const entry of updateInstructions.others) {
			// Check if update operation already added or not
			if (!updates[entry.type]) updates[entry.type] = {};
			if (entry.type === "$pull") {
				updates[entry.type][entry.fieldName] = entry.exp
					? entry.value.getPullQuery("MongoDB", !entry.includeFields)
					: entry.value;
			} else updates[entry.type][entry.fieldName] = entry.value;
		}

		return updates;
	}

	/**
	 * Prepares the array filters part of the update operation
	 * @param  {object} arrayFilters The array filters structure
	 * @returns  The array filter definitions
	 */
	getArrayFilters(arrayFilters) {
		if (!arrayFilters) return null;
		const filters = [];
		for (const condition of arrayFilters) {
			filters.push(condition.getPullQuery("MongoDB", false));
		}

		return filters;
	}

	/**
	 * Creates the match state of the aggregation pipeline
		{
			"$match": {
			"_id": "5ef1efddb918c6057857af37"
			}
		}
	 * @param  {string} objectId The object identifier
	 * @param  {any[]} pipeline The pipeline array
	 */
	createMatchStage(id, pipeline) {
		pipeline.push({
			$match: { _id: helper.objectId(id) },
		});
	}

	/**
	 * Creates the match state for where condition of the aggregation pipeline
		{$match: { $expr: { $eq: ["$name", "temp"] } } }
	 * @param  {object} where The where expression
	 * @param  {any[]} pipeline The pipeline array
	 */
	createWhereStage(where, pipeline) {
		if (!where) return;
		pipeline.push({
			$match: { $expr: where.getQuery("MongoDB") },
		});
	}

	/**
	 * Creates the lookup stage of the pipeline
	 * For referecen fields look up, uses the following structure
		{
			"$lookup": {
				"from": "target_model_name",
				"let": {"fieldName": "$appPlan"},
				"pipeline": [{$match: { $expr: { $eq: ["$_id", "$$fieldName"] } } }]
				"as": "appPlan"
			}
		},
		{
			"$unwind": {
				"path": "$appPlan",
				"preserveNullAndEmptyArrays": true
			}
		}
	 * @param  {Array} joins The list of join definitions
	 * @param  {any[]} pipeline The pipeline array
	 */
	createJoinStage(joins, pipeline) {
		if (!joins) return;
		for (const joinDef of joins) {
			if (joinDef.joinType === "simple") {
				// For simple lookups we just need to return one matching record
				const tempName = this.generateTempFieldName();
				pipeline.push({
					$lookup: {
						from: joinDef.joinModel.getName(),
						let: { [tempName]: `$${joinDef.field.getQueryPath()}` },
						pipeline: [
							{ $match: { $expr: { $eq: ["$_id", `$$${tempName}`] } } },
						],
						as: joinDef.field.getQueryPath(),
					},
				});

				pipeline.push({
					$unwind: {
						path: `$${joinDef.field.getQueryPath()}`,
						preserveNullAndEmptyArrays: true,
					},
				});
			} else {
				const letPart = {};
				const letFillerFunction = (fieldName) => {
					// If a temp let value for the field has already been created use it
					for (const [key, value] of Object.entries(letPart)) {
						if (value === `$${fieldName}`) return `$${key}`;
					}

					// This is a new let entry create a new one
					const tempName = this.generateTempFieldName();
					letPart[tempName] = `$${fieldName}`;
					return `$${tempName}`;
				};
				const joinQuery = joinDef.where.getQuery("MongoDB", letFillerFunction);
				pipeline.push({
					$lookup: {
						from: joinDef.from,
						let: letPart,
						pipeline: [{ $match: { $expr: joinQuery } }],
						as: joinDef.as,
					},
				});

				pipeline.push({
					$unwind: {
						path: `$${joinDef.as}`,
						preserveNullAndEmptyArrays: true,
					},
				});
			}
		}
	}

	/**
	 * Creates the lookup stage of the pipeline
	 * For referecen fields look up, uses the following structure
		{
			"$lookup": {
				"from": "target_model_name",
				"let": {"fieldName": "$appPlan"},
				"pipeline": [{$match: { $expr: { $eq: ["$_id", "$$fieldName"] } } }]
				"as": "appPlan"
			}
		},
		{
			"$unwind": {
				"path": "$appPlan",
				"preserveNullAndEmptyArrays": true
			}
		}
	 * @param  {Array} joins The list of lookup definitions
	 * @param  {any[]} pipeline The pipeline array
	 */
	createLookupStage(joins, pipeline) {
		if (!joins) return;
		for (const joinDef of joins) {
			if (joinDef.joinType === "simple") {
				// For simple lookups we just need to return one matching record
				const tempName = this.generateTempFieldName();
				pipeline.push({
					$lookup: {
						from: joinDef.joinModel.getName(),
						let: { [tempName]: `$${joinDef.field.getQueryPath()}` },
						pipeline: [
							{ $match: { $expr: { $eq: ["$_id", `$$${tempName}`] } } },
							{ $limit: 1 },
						],
						as: joinDef.field.getQueryPath(),
					},
				});

				pipeline.push({
					$unwind: {
						path: `$${joinDef.field.getQueryPath()}`,
						preserveNullAndEmptyArrays: true,
					},
				});
			} else {
				const letPart = {};
				const letFillerFunction = (fieldName) => {
					// If a temp let value for the field has already been created use it
					for (const [key, value] of Object.entries(letPart)) {
						if (value === `$${fieldName}`) return `$${key}`;
					}

					// This is a new let entry create a new one
					const tempName = this.generateTempFieldName();
					letPart[tempName] = `$${fieldName}`;
					return `$${tempName}`;
				};
				const joinQuery = joinDef.where.getQuery("MongoDB", letFillerFunction);

				// If we have sort, skip and limit then add them
				const tempPipeline = [];
				this.createSortStage(joinDef.sort, tempPipeline);
				this.createSkipStage(joinDef.skip, tempPipeline);
				this.createLimitStage(joinDef.limit, tempPipeline);

				pipeline.push({
					$lookup: {
						from: joinDef.from,
						let: letPart,
						pipeline: [{ $match: { $expr: joinQuery } }, ...tempPipeline],
						as: joinDef.as,
					},
				});
			}
		}
	}

	/**
	 * Creates project stage.
		{
			"$project": {
			"userProfile._id": 1,
			"userProfile._parent": 1,
			"userProfile.firstName": 1,
			"userProfile.lastName": 1,
			"userProfile.objRef": 1
			}
		}
   	 * @param  {Array} select The included fields
	 * @param  {Array} omit The exdluded fields
	 * @param  {any[]} pipeline The pipeline array
	 * @returns  The select for SQL or projection for no-SQL definiton
	 */
	createProjectStage(select, omit, pipeline) {
		// If not select or omit definition the return all fields
		if (!select && !omit) return;

		const include = select ? true : false;
		const list = select ?? omit;

		const projection = {};
		for (const entry of list) {
			projection[entry.fieldName] = include ? 1 : 0;
		}

		pipeline.push({ $project: projection });
	}

	/**
	 * Creates the sort stage of the aggregation pipeline
		{
			"$sort": {
				"fields.name": 1,
				"fields.order": -1
			}
		}
  	 * @param  {Array} sort The sort definition list
	 * @param  {any[]} pipeline The pipeline array
	 */
	createSortStage(sort, pipeline) {
		if (!sort) return;

		const sortStage = {};
		for (const entry of sort) {
			sortStage[entry.fieldName] = entry.order === "asc" ? 1 : -1;
		}

		pipeline.push({ $sort: sortStage });
	}

	/**
	 * Creates the skip stage of the aggregation pipeline
	 * @param  {number} skip The skip count
	 * @param  {any[]} pipeline The pipeline array
	 */
	createSkipStage(skip, pipeline) {
		if (skip === null) return;
		pipeline.push({ $skip: skip });
	}

	/**
	 * Creates the limit stage of the aggregation pipeline
	 * @param  {number} limit The max number of records to return
	 * @param  {any[]} pipeline The pipeline array
	 */
	createLimitStage(limit, pipeline) {
		if (!limit) return;
		pipeline.push({ $limit: limit });
	}

	/**
	 * Creates group by stage
	 * @param  {any[]} groupBy The group by defintions array
	 * @param  {any[]} computations The computation definition array
	 */
	createGroupStage(groupBy, computations, pipeline) {
		let _id = null;
		const projection = {};
		if (groupBy) {
			_id = {};
			projection._id = 0;
			for (const entry of groupBy) {
				_id[entry.as] = entry.expression.getQuery("MongoDB");
				projection[entry.as] = `$_id.${entry.as}`;
			}
		} else {
			projection._id = 0;
		}

		const comps = {};
		for (const comp of computations) {
			switch (comp.operator) {
				case "$count":
					comps[comp.as] = { $sum: 1 };
					break;
				case "$countif":
					comps[comp.as] = {
						$sum: {
							$cond: { if: comp.compute.getQuery("MongoDB"), then: 1, else: 0 },
						},
					};
					break;
				case "$sum":
					comps[comp.as] = {
						$sum: comp.compute.getQuery("MongoDB"),
					};
					break;
				case "$avg":
					comps[comp.as] = {
						$avg: comp.compute.getQuery("MongoDB"),
					};
					break;
				case "$min":
					comps[comp.as] = {
						$min: comp.compute.getQuery("MongoDB"),
					};
					break;
				case "$max":
					comps[comp.as] = {
						$max: comp.compute.getQuery("MongoDB"),
					};
					break;
				default:
					break;
			}

			projection[comp.as] = 1;
		}

		pipeline.push({ $group: { _id, ...comps } });
		pipeline.push({ $project: projection });
	}

	/**
	 * Creates the text search stage of the aggregation pipeline
	 * @param  {string} searchText The search text
	 * @param  {any[]} pipeline The pipeline array
	 */
	createTextSearchStage(searchText, pipeline) {
		pipeline.push({
			$match: {
				$text: {
					$search: searchText.normalize("NFD"),
					$caseSensitive: false,
					$diacriticSensitive: false,
				},
			},
		});
	}

	/**
	 * Starts a new transaction on the database server. Any database CRUD operation that is executed after a call to `beginTransaction` will be executed within the transaction context. If the transaction is not committed then the changes will not be applied to the database.
	 */
	async beginTransaction(dbMeta) {
		if (this.transactionsSupported === null) {
			// Check to see if transactions are supported by MongoDB deployment
			const dbName = this.getAppliedDbName(dbMeta);
			const db = this.driver.db(dbName);

			const adminDb = db.admin();
			const serverStatus = await adminDb.serverStatus();

			// If transactions not supported then return
			if (!serverStatus.transactions) this.transactionsSupported = false;
			else this.transactionsSupported = true;
		}

		if (!this.transactionsSupported) return;

		if (this.session) {
			if (this.session.inTransaction()) await this.session.abortTransaction();
			this.session.endSession();
			this.session = null;
		}

		const session = await this.driver.startSession();
		await session.startTransaction();
		this.session = session;
	}

	/**
	 * Commits the currently active database transaction.
	 */
	async commitTransaction(dbMeta) {
		if (this.session) {
			await this.session.commitTransaction();
			this.session.endSession();
			this.session = null;
		}
	}

	/**
	 * Aborts the transaction and rolls back the database changes that are exected within the transaction.
	 */
	async rollbackTransaction(dbMeta) {
		if (this.session) {
			if (this.session.inTransaction()) await this.session.abortTransaction();
			this.session.endSession();
			this.session = null;
		}
	}

	/**
	 * Inserts a new record to the database and returns the inserted record
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} data The record to insert
	 * @returns  Inserted record
	 */
	async createOne(dbMeta, modelMeta, data) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);

		const insertResult = await collection.insertOne(data, {
			session: this.session,
		});
		const insertedDocument = await collection.findOne(
			{
				_id: insertResult.insertedId,
			},
			{ session: this.session }
		);

		return insertedDocument;
	}

	/**
	 * Inserts new records/documents to the database and returns the inserted record count
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} data The array of records/documents to insert
	 * @returns  Inserted record count
	 */
	async createMany(dbMeta, modelMeta, data) {
		// If nothing to insert return zero
		if (data.length === 0) return { count: 0 };

		try {
			const dbName = this.getAppliedDbName(dbMeta);
			const modelName = this.getModelName(modelMeta);

			const db = this.driver.db(dbName);
			const collection = db.collection(modelName);

			const insertResult = await collection.insertMany(data, {
				session: this.session,
			});

			return { count: insertResult.insertedCount };
		} catch (err) {
			await this.rollbackTransaction(dbMeta);
			throw err;
		}
	}

	/**
	 * Deletes the record identified by the id and returns the deleted record count.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The id option
	 * @returns  Deleted record count
	 */
	async deleteById(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);

		const deleteResult = await collection.deleteOne(
			{ _id: helper.objectId(options.id.toString()) },
			{
				session: this.session,
			}
		);

		return { count: deleteResult.deletedCount };
	}

	/**
	 * Deletes the first record matching the where condition and returns the deleted record count
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where condition and join options
	 * @returns  Deleted record count
	 */
	async deleteOne(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);

		const requiresAggreation =
			options.join?.length > 0 && options.where?.hasJoinFieldValues()
				? true
				: false;

		if (requiresAggreation) {
			const pipeline = [];
			this.createJoinStage(options.join, pipeline);
			this.createWhereStage(options.where, pipeline);

			// Only return the ids of the records to delete
			pipeline.push(
				{
					$group: {
						_id: "$_id",
					},
				},
				{
					$project: {
						_id: 1,
					},
				}
			);

			const dataCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
			});

			// Get the first element
			const findResult = await dataCursor.next();
			await dataCursor.close();

			if (findResult) {
				const deleteResult = await collection.deleteOne(
					{ _id: findResult._id },
					{
						session: this.session,
					}
				);

				return { count: deleteResult.deletedCount };
			}

			return { count: 0 };
		} else {
			const filter = {};
			if (options.where) filter.$expr = options.where.getQuery("MongoDB");

			const deleteResult = await collection.deleteOne(filter, {
				session: this.session,
			});

			return { count: deleteResult.deletedCount };
		}
	}

	/**
	 * Deletes the records matching the where condition and returns the deleted record count
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where condition and join options
	 * @returns  Deleted record count
	 */
	async deleteMany(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);

		const requiresAggreation =
			options.join?.length > 0 && options.where?.hasJoinFieldValues()
				? true
				: false;

		if (requiresAggreation) {
			const pipeline = [];
			this.createJoinStage(options.join, pipeline);
			this.createWhereStage(options.where, pipeline);

			// Only return the ids of the records to delete
			pipeline.push(
				{
					$group: {
						_id: "$_id",
					},
				},
				{
					$project: {
						_id: 1,
					},
				}
			);

			const dataCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
			});

			const findResult = await dataCursor.toArray();
			await dataCursor.close();

			if (findResult.length > 0) {
				const ids = findResult.map((entry) => entry._id);
				const deleteResult = await collection.deleteMany(
					{ _id: { $in: ids } },
					{
						session: this.session,
					}
				);

				return { count: deleteResult.deletedCount };
			}

			return { count: 0 };
		} else {
			const filter = {};
			if (options.where) filter.$expr = options.where.getQuery("MongoDB");

			const deleteResult = await collection.deleteMany(filter, {
				session: this.session,
			});

			return { count: deleteResult.deletedCount };
		}
	}

	/**
	 * Retrieves the record identified by id from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The id, select, omit, join and useReadReplica options
	 * @returns  The fetched record otherwise null if no record can be found
	 */
	async findById(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);
		const readPreference = this.session
			? "primary"
			: options.useReadReplica
			? "secondaryPreferred"
			: "primary";

		// If we the the lookups the we need to rund the aggregation pipeline
		if (options.join?.length > 0) {
			const pipeline = [];
			this.createMatchStage(options.id, pipeline);
			this.createLookupStage(options.lookup, pipeline);
			this.createProjectStage(options.select, options.omit, pipeline);

			const dataCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
				readPreference: readPreference,
			});

			const findResult = await dataCursor.next();
			await dataCursor.close();
			return findResult;
		} else {
			// No joins then just fetch the record
			const findResult = await collection.findOne(
				{ _id: helper.objectId(options.id.toString()) },
				{
					session: this.session,
					projection: this.getSelectDefinition(options.select, options.omit),
					readPreference: readPreference,
				}
			);

			return findResult;
		}
	}

	/**
	 * Retrieves the fist record matching the where condition from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, select, omit, join, sort, skip and useReadReplica options
	 * @returns  The fetched record otherwise null if no record can be found
	 */
	async findOne(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);
		const readPreference = this.session
			? "primary"
			: options.useReadReplica
			? "secondaryPreferred"
			: "primary";

		// If we the the lookups the we need to rund the aggregation pipeline
		if (options.join?.length > 0 || options.lookup?.length > 0) {
			const pipeline = [];
			if (options.where && options.where.hasJoinFieldValues()) {
				this.createJoinStage(options.join, pipeline);
				this.createWhereStage(options.where, pipeline);
				this.createLookupStage(options.lookup, pipeline);
			} else {
				this.createWhereStage(options.where, pipeline);
				this.createLookupStage(options.lookup, pipeline);
				this.createJoinStage(options.join, pipeline);
			}

			this.createSortStage(options.sort, pipeline);
			this.createSkipStage(options.skip, pipeline);
			this.createLimitStage(1, pipeline);
			this.createProjectStage(options.select, options.omit, pipeline);

			const dataCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
				readPreference: readPreference,
			});

			const findResult = await dataCursor.next();
			await dataCursor.close();
			return findResult;
		} else {
			// No joins then just fetch the record
			const filter = {};
			if (options.where) filter.$expr = options.where.getQuery("MongoDB");
			const findResult = await collection.findOne(filter, {
				session: this.session,
				projection: this.getSelectDefinition(options.select, options.omit),
				sort: this.getSortDefinition(options.sort),
				skip: options.skip ?? null,
				readPreference: readPreference,
			});

			return findResult;
		}
	}

	/**
	 * Returns the records matching the where condition from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, select, omit, join, sort, skip, limit and useReadReplica options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async findMany(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);
		const readPreference = this.session
			? "primary"
			: options.useReadReplica
			? "secondaryPreferred"
			: "primary";

		// If we the the lookups the we need to rund the aggregation pipeline
		if (options.join?.length > 0 || options.lookup?.length > 0) {
			const pipeline = [];
			if (options.where && options.where.hasJoinFieldValues()) {
				this.createJoinStage(options.join, pipeline);
				this.createWhereStage(options.where, pipeline);
				this.createLookupStage(options.lookup, pipeline);
			} else {
				this.createWhereStage(options.where, pipeline);
				this.createLookupStage(options.lookup, pipeline);
				this.createJoinStage(options.join, pipeline);
			}

			this.createSortStage(options.sort, pipeline);
			this.createSkipStage(options.skip, pipeline);
			this.createLimitStage(options.limit, pipeline);
			this.createProjectStage(options.select, options.omit, pipeline);

			const dataCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
				readPreference: readPreference,
			});

			const findResult = await dataCursor.toArray();
			await dataCursor.close();

			if (options.returnCount) {
				const countInfo = await this.getCountInfo(dbMeta, modelMeta, options);
				return { info: countInfo, data: findResult };
			} else return findResult;
		} else {
			// No joins then just fetch the records
			const filter = {};
			if (options.where) filter.$expr = options.where.getQuery("MongoDB");
			const dataCursor = await collection.find(filter, {
				session: this.session,
				projection: this.getSelectDefinition(options.select, options.omit),
				sort: this.getSortDefinition(options.sort),
				skip: options.skip ?? null,
				limit: options.limit ?? null,
				readPreference: readPreference,
			});

			const findResult = await dataCursor.toArray();
			await dataCursor.close();

			if (options.returnCount) {
				const countInfo = await this.getCountInfo(dbMeta, modelMeta, options);
				return { info: countInfo, data: findResult };
			} else return findResult;
		}
	}

	/**
	 * Updates the record identified by id using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The select, omit, update and id options
	 * @returns  The updated record otherwise null if no record can be found
	 */
	async updateById(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);

		// No joins then just fetch the record
		const updateResult = await collection.findOneAndUpdate(
			{ _id: helper.objectId(options.id.toString()) },
			this.getUpdateDefinition(options.updateData),
			{
				returnDocument: "after",
				session: this.session,
				projection: this.getSelectDefinition(options.select, options.omit),
				arrayFilters: this.getArrayFilters(options.arrayFilters),
			}
		);

		return updateResult;
	}

	/**
	 * Updates the first record matching the where condition using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, join and update options
	 * @returns  The updated record otherwise null if no record can be found
	 */
	async updateOne(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);

		const requiresAggreation =
			options.join?.length > 0 && options.where?.hasJoinFieldValues()
				? true
				: false;

		if (requiresAggreation) {
			const pipeline = [];
			this.createJoinStage(options.join, pipeline);
			this.createWhereStage(options.where, pipeline);

			// Only return the ids of the records to delete
			pipeline.push(
				{
					$group: {
						_id: "$_id",
					},
				},
				{
					$project: {
						_id: 1,
					},
				}
			);

			const dataCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
			});

			const findResult = await dataCursor.next();
			await dataCursor.close();

			if (findResult) {
				const updateResult = await collection.findOneAndUpdate(
					{ _id: findResult._id },
					this.getUpdateDefinition(options.updateData),
					{
						returnDocument: "after",
						session: this.session,
						projection: this.getSelectDefinition(options.select, options.omit),
						arrayFilters: this.getArrayFilters(options.arrayFilters),
					}
				);

				return updateResult;
			}

			return null;
		} else {
			const filter = {};
			if (options.where) filter.$expr = options.where.getQuery("MongoDB");

			const updateResult = await collection.findOneAndUpdate(
				filter,
				this.getUpdateDefinition(options.updateData),
				{
					returnDocument: "after",
					session: this.session,
					projection: this.getSelectDefinition(options.select, options.omit),
					arrayFilters: this.getArrayFilters(options.arrayFilters),
				}
			);

			return updateResult;
		}
	}

	/**
	 * Updates the records matching the where condition using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, join and update options
	 * @returns  Updated record count
	 */
	async updateMany(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);

		const requiresAggreation =
			options.join?.length > 0 && options.where?.hasJoinFieldValues()
				? true
				: false;

		if (requiresAggreation) {
			const pipeline = [];
			this.createJoinStage(options.join, pipeline);
			this.createWhereStage(options.where, pipeline);

			// Only return the ids of the records to delete
			pipeline.push(
				{
					$group: {
						_id: "$_id",
					},
				},
				{
					$project: {
						_id: 1,
					},
				}
			);

			const dataCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
			});

			const findResult = await dataCursor.toArray();
			await dataCursor.close();

			if (findResult.length > 0) {
				const ids = findResult.map((entry) => entry._id);
				const updateResult = await collection.updateMany(
					{ _id: { $in: ids } },
					this.getUpdateDefinition(options.updateData),
					{
						session: this.session,
						arrayFilters: this.getArrayFilters(options.arrayFilters),
					}
				);

				return { count: updateResult.modifiedCount };
			}

			return { count: 0 };
		} else {
			const filter = {};
			if (options.where) filter.$expr = options.where.getQuery("MongoDB");

			const updateResult = await collection.updateMany(
				filter,
				this.getUpdateDefinition(options.updateData),
				{
					session: this.session,
					arrayFilters: this.getArrayFilters(options.arrayFilters),
				}
			);

			return { count: updateResult.modifiedCount };
		}
	}

	/**
	 * Groups the records and performs computations on these groups
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The `where`, `join`, `groupBy`, `computations`, `having`, `sort`, `limit` and `skip`  instructions
	 * @returns  Group computation results
	 */
	async aggregate(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);
		const readPreference = this.session
			? "primary"
			: options.useReadReplica
			? "secondaryPreferred"
			: "primary";

		const pipeline = [];
		if (options.where && options.where.hasJoinFieldValues()) {
			this.createJoinStage(options.join, pipeline);
			this.createWhereStage(options.where, pipeline);
		} else {
			this.createWhereStage(options.where, pipeline);
			this.createJoinStage(options.join, pipeline);
		}

		this.createGroupStage(options.groupBy, options.computations, pipeline);

		this.createWhereStage(options.having, pipeline);

		this.createSortStage(options.sort, pipeline);
		this.createSkipStage(options.skip, pipeline);
		this.createLimitStage(options.limit, pipeline);

		const dataCursor = await collection.aggregate(pipeline, {
			allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
			session: this.session,
			readPreference: readPreference,
		});

		const findResult = await dataCursor.toArray();
		await dataCursor.close();

		return findResult;
	}

	/**
	 * Returns the records matching the search query
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The searchText, where, select, omit, join, sort, skip, limit and useReadReplica options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async searchText(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);
		const readPreference = this.session
			? "primary"
			: options.useReadReplica
			? "secondaryPreferred"
			: "primary";

		const pipeline = [];
		this.createTextSearchStage(options.searchText, pipeline);

		if (options.where && options.where.hasJoinFieldValues()) {
			this.createJoinStage(options.join, pipeline);
			this.createWhereStage(options.where, pipeline);
			this.createLookupStage(options.lookup, pipeline);
		} else {
			this.createWhereStage(options.where, pipeline);
			this.createLookupStage(options.lookup, pipeline);
			this.createJoinStage(options.join, pipeline);
		}

		this.createSortStage(options.sort, pipeline);
		this.createSkipStage(options.skip, pipeline);
		this.createLimitStage(options.limit, pipeline);
		this.createProjectStage(options.select, options.omit, pipeline);

		const dataCursor = await collection.aggregate(pipeline, {
			allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
			session: this.session,
			readPreference: readPreference,
		});

		const findResult = await dataCursor.toArray();
		await dataCursor.close();

		if (options.returnCount) {
			const countInfo = await this.getCountInfo(dbMeta, modelMeta, options);
			return { info: countInfo, data: findResult };
		} else return findResult;
	}

	/**
	 * Returns the count and pagination information for the records matching the query
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The searchText, where, select, omit, join, sort, skip, limit and useReadReplica options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async getCountInfo(dbMeta, modelMeta, options) {
		const dbName = this.getAppliedDbName(dbMeta);
		const modelName = this.getModelName(modelMeta);

		const db = this.driver.db(dbName);
		const collection = db.collection(modelName);
		const readPreference = this.session
			? "primary"
			: options.useReadReplica
			? "secondaryPreferred"
			: "primary";

		let docCount = 0;
		// Check if we need to use the aggregation pipeline
		if (
			options.join?.length > 0 ||
			options.lookup?.length > 0 ||
			options.searchText
		) {
			const pipeline = [];
			if (options.searchText)
				this.createTextSearchStage(options.searchText, pipeline);

			if (options.where && options.where.hasJoinFieldValues()) {
				this.createJoinStage(options.join, pipeline);
				this.createWhereStage(options.where, pipeline);
				this.createLookupStage(options.lookup, pipeline);
			} else {
				this.createWhereStage(options.where, pipeline);
				this.createLookupStage(options.lookup, pipeline);
				this.createJoinStage(options.join, pipeline);
			}

			// Add the final count staget to the pipeline
			pipeline.push({ $count: "_count" });

			const countCursor = await collection.aggregate(pipeline, {
				allowDiskUse: true, // Lets the server know if it can use disk to store temporary results for the aggregation
				session: this.session,
				readPreference: readPreference,
			});

			//Get the first item of the cursor to get the total object count if there are any results
			let result = null;
			try {
				result = await countCursor.next();
				await countCursor.close();
			} catch (err) {
				await countCursor.close();
				throw err;
			}

			docCount = result ? result._count : 0;
		} else {
			if (!options.where) {
				docCount = await collection.estimatedDocumentCount({
					session: this.session,
					readPreference: readPreference,
				});
			} else {
				// No joins then just fetch the records
				const filter = {};
				filter.$expr = options.where.getQuery("MongoDB");

				docCount = await collection.countDocuments(filter, {
					session: this.session,
					readPreference: readPreference,
				});
			}
		}

		return {
			count: docCount,
		};
	}
}
