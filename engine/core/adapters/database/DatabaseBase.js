export class DatabaseBase {
	constructor() {}

	async disconnect() {}

	/**
	 * Returns the database driver
	 */
	getDriver() {
		return null;
	}

	/**
	 * Prepares the select part of the query namely the fields that will be returned.
	 * @param  {Array} select The list of included fields
	 * @param  {Array} omit The list of excluded fields
	 * @returns  The select for SQL or projection for no-SQL definiton
	 */
	getSelectDefinition(select, omit) {}

	/**
	 * Prepares the sort part of the query
	 * @param  {Array} sort The list of fields to sort
	 * @returns  The sort definition
	 */
	getSortDefinition(sort) {}

	/**
	 * Starts a new transaction on the database server. Any database CRUD operation that is executed after a call to `beginTransaction` will be executed within the transaction context. If the transaction is not committed then the changes will not be applied to the database.
	 * @param  {Object} dbMeta The database metadata
	 */
	async beginTransaction(dbMeta) {}

	/**
	 * Commits the currently active database transaction.
	 * @param  {Object} dbMeta The database metadata
	 */
	async commitTransaction(dbMeta) {}

	/**
	 * Aborts the transaction and rolls back the database changes that are exected within the transaction.
	 * @param  {Object} dbMeta The database metadata
	 */
	async rollbackTransaction(dbMeta) {}

	/**
	 * Inserts a new record to the database and returns the inserted record
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} data The record to insert
	 * @returns  Inserted record
	 */
	async createOne(dbMeta, modelMeta, data) {}

	/**
	 * Inserts new records/documents to the database and returns the inserted record count
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} data The array of records/documents to insert
	 * @returns  Inserted record count
	 */
	async createMany(dbMeta, modelMeta, data) {}

	/**
	 * Deletes the record identified by the id and returns the deleted record count.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The id option
	 * @returns  Deleted record count
	 */
	async deleteById(dbMeta, modelMeta, options) {}

	/**
	 * Deletes the record matching the where condition and returns the deleted record count
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where condition and join options
	 * @returns  Deleted record count
	 */
	async delete(dbMeta, modelMeta, options) {}

	/**
	 * Retrieves the record identified by id from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The id, select, omit, join and useReadReplica options
	 * @returns  The fetched record otherwise null if no record can be found
	 */
	async findById(dbMeta, modelMeta, options) {}

	/**
	 * Retrieves the fist record matching the where condition from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, select, omit, join, sort, skip and useReadReplica options
	 * @returns  The fetched record otherwise null if no record can be found
	 */
	async findOne(dbMeta, modelMeta, options) {}

	/**
	 * Returns the records matching the where condition from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, select, omit, join, sort, skip, limit and useReadReplica options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async findMany(dbMeta, modelMeta, options) {}

	/**
	 * Updates the record identified by id using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The select, omit, update and id options
	 * @returns  The updated record otherwise null if no record can be found
	 */
	async updateById(dbMeta, modelMeta, options) {}

	/**
	 * Updates the records matching the where condition using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, join and update options
	 * @returns  Updated record count
	 */
	async update(dbMeta, modelMeta, options) {}

	/**
	 * Groups the records and performs computations on these groups
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The `where`, `join`, `groupBy`, `computations`, `having`, `sort`, `limit` and `skip`  instructions
	 * @returns  Group computation results
	 */
	async aggregate(dbMeta, modelMeta, options) {}

	/**
	 * Returns the records matching the search query
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The searchText, where, select, omit, join, sort, skip, limit and useReadReplica options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async searchText(dbMeta, modelMeta, options) {}

	/**
	 * Returns the database name
	 * @param  {Object} dbMeta The database metadata
	 */
	getDbName(dbMeta) {
		return dbMeta.name;
	}

	/**
	 * Returns the model name
	 * @param  {Object} modelMeta The model metadata
	 */
	getModelName(modelMeta) {
		return modelMeta.name;
	}

	/**
	 * Returns the database iid (internal identifier)
	 * @param  {Object} dbMeta The database metadata
	 */
	getDbId(dbMeta) {
		return dbMeta.iid;
	}

	/**
	 * Returns the environment iid (internal identifier)
	 */
	getEnvId() {
		return META.getEnvId();
	}

	/**
	 * Returns whether the database should assign a unique name or use the name given when being created in Agnost studio
	 * @param  {Object} dbMeta The database metadata
	 */
	getAssignUniqueName(dbMeta) {
		return dbMeta.assignUniqueName ?? true;
	}

	/**
	 * Returns the actual database name that will be used by the database driver
	 * @param  {Object} dbMeta The database metadata
	 * @returns  Database name
	 */
	getAppliedDbName(dbMeta) {
		if (this.getAssignUniqueName(dbMeta))
			return `${this.getEnvId()}_${this.getDbId(dbMeta)}`;
		else return this.getDbName(dbMeta);
	}
}

export default new DatabaseBase();
