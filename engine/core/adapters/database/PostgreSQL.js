import { SQLDatabase } from "./SQLDatabase.js";

/**
 * Manages read and write operations to PostgreSQL
 */
export class PostgreSQL extends SQLDatabase {
	constructor(driver) {
		super();
		this.driver = driver;
		this.inTransaction = false;
	}

	async disconnect() {
		try {
			await this.driver.end();
		} catch (err) {}
	}

	/**
	 * Returns the database driver
	 */
	getDriver() {
		return this.driver;
	}

	/**
	 * Starts a new transaction on the database server. Any database CRUD operation that is executed after a call to `beginTransaction` will be executed within the transaction context. If the transaction is not committed then the changes will not be applied to the database.
	 */
	async beginTransaction(dbMeta) {
		if (this.inTransaction) return;

		// Start the transaction
		await this.driver.query("BEGIN");
		this.inTransaction = true;
	}

	/**
	 * Commits the currently active database transaction.
	 */
	async commitTransaction(dbMeta) {
		if (this.inTransaction) {
			await this.driver.query("COMMIT");
			this.inTransaction = false;
		}
	}

	/**
	 * Aborts the transaction and rolls back the database changes that are exected within the transaction.
	 */
	async rollbackTransaction(dbMeta) {
		if (this.inTransaction) {
			await this.driver.query("ROLLBACK");
			this.inTransaction = false;
		}
	}

	/**
	 * Prepares the select part of the query namely the fields that will be returned.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Array} select The included fields
	 * @param  {Array} omit The exdluded fields
	 * @param  {Array} joins The list of join definitions
	 * @returns  The select for SQL or projection for no-SQL definiton
	 */
	getJoinLookupSelectDefinition(dbMeta, modelMeta, select, omit, joins) {
		// If no select or omit definition or joins then return all fields of the base model
		if (!select && !omit && (!joins || joins.length === 0))
			return `${modelMeta.name}.*`;

		// If we do not have any joins then return the standart select
		if (!joins || joins.length === 0) {
			if (!select && !omit) return `${modelMeta.name}.*`;

			const include = select ? true : false;
			const list = select ?? omit;

			if (include) {
				return list
					.map((entry) => `${modelMeta.name}.${entry.fieldName}`)
					.join(", ");
			} else {
				const omits = list.map((entry) => entry.fieldName);

				return modelMeta.fields
					.filter((entry) => !omits.includes(entry.name))
					.map((entry) => `${modelMeta.name}.${entry.name}`)
					.join(", ");
			}
		}

		// If we have joins but no select or omit definition then return all
		if (joins.length > 0 && !select && !omit) {
			// Add the base model entries
			const selectEntries = [
				this.getBaseModelSelectEntries(
					modelMeta.name,
					modelMeta.fields,
					null,
					false
				),
			];

			for (const joinDef of joins) {
				const joinedModelMeta = joinDef.joinModel.getMetaObj();
				// Join type if join (not lookup) then aggregate as json object
				if (joinDef.type === "join") {
					selectEntries.push(
						`CASE WHEN ${joinDef.as}.${
							this.getIdField(joinedModelMeta).name
						} IS NULL THEN NULL ELSE ${this.getJsonBuildObjectString(
							joinDef.as,
							joinedModelMeta.fields,
							null,
							false
						)} END AS ${joinDef.as}`
					);
				} else if (joinDef.joinType === "simple") {
					selectEntries.push(
						`COALESCE(
							(
								SELECT ${this.getJsonBuildObjectString(
									joinDef.as,
									joinedModelMeta.fields,
									null,
									false
								)}
								FROM ${this.getTableName(dbMeta, joinedModelMeta)} AS ${joinDef.as}
								WHERE ${modelMeta.name}.${joinDef.field.getName()} = ${joinDef.as}.${
							this.getIdField(joinedModelMeta).name
						}
							),
							NULL
						) AS ${joinDef.as}`
					);
				} else if (joinDef.joinType === "complex") {
					selectEntries.push(
						`COALESCE(
						(
							SELECT json_agg(${this.getJsonBuildObjectString(
								joinDef.as,
								joinedModelMeta.fields,
								null,
								false
							)})
							FROM ${this.getTableName(dbMeta, joinedModelMeta)} AS ${joinDef.as}
							WHERE ${joinDef.where.getQuery("PostgreSQL")}
						),
						'[]'::json
					) AS ${joinDef.as}`
					);
				}
			}

			return selectEntries.join(",\n");
		}

		// OK we have both joins and select/omit definitions
		// Add the base model entries
		const include = select ? true : false;
		const list = select ?? omit;
		const selectEntries = [];
		const baseModelEntries = this.getBaseModelSelectEntries(
			modelMeta.name,
			modelMeta.fields,
			list,
			include
		);

		if (baseModelEntries && baseModelEntries !== "")
			selectEntries.push(baseModelEntries);

		for (const joinDef of joins) {
			const joinedModelMeta = joinDef.joinModel.getMetaObj();
			const hasSelectEntry = this.hasJoinedModelSelectEntry(
				joinDef.as,
				joinedModelMeta.fields,
				list,
				include
			);

			// If joined model does not have any select entry then skip
			if (!hasSelectEntry) continue;

			if (joinDef.type === "join") {
				selectEntries.push(
					`CASE WHEN ${joinDef.as}.${
						this.getIdField(joinedModelMeta).name
					} IS NULL THEN NULL ELSE ${this.getJsonBuildObjectString(
						joinDef.as,
						joinedModelMeta.fields,
						list,
						include
					)} END AS ${joinDef.as}`
				);
			} else if (joinDef.joinType === "simple") {
				selectEntries.push(
					`COALESCE(
						(
							SELECT ${this.getJsonBuildObjectString(
								joinDef.as,
								joinedModelMeta.fields,
								list,
								include
							)}
							FROM ${this.getTableName(dbMeta, joinedModelMeta)} AS ${joinDef.as}
							WHERE ${modelMeta.name}.${joinDef.field.getName()} = ${joinDef.as}.${
						this.getIdField(joinedModelMeta).name
					}
							LIMIT 1
						),
						NULL
					) AS ${joinDef.as}`
				);
			} else if (joinDef.joinType === "complex") {
				selectEntries.push(
					`COALESCE(
						(
							SELECT json_agg(${this.getJsonBuildObjectString(
								joinDef.as,
								joinedModelMeta.fields,
								list,
								include
							)})
							FROM ${this.getTableName(dbMeta, joinedModelMeta)} AS ${joinDef.as}
							WHERE ${joinDef.where.getQuery("PostgreSQL")}
						),
						'[]'::json
					) AS ${joinDef.as}`
				);
			}
		}

		return selectEntries.join(",\n");
	}

	// Returns the base model select fields in following format
	// users.id, users.name, users.email
	getBaseModelSelectEntries(prefix, fields, list, include) {
		let filteredFields = fields;

		// If we have omits or select definitions then come up with the final list
		if (list) {
			const listFields = list.map((entry) => entry.fieldName);

			if (include)
				filteredFields = filteredFields.filter((entry) =>
					listFields.includes(entry.name)
				);
			else
				filteredFields = filteredFields.filter(
					(entry) => !listFields.includes(entry.name)
				);
		}

		// If no omit or select in base model fields then return all fields
		if (fields.length === filteredFields.length) return `${prefix}.*`;

		return filteredFields.map((entry) => `${prefix}.${entry.name}`).join(", ");
	}

	// Returns true if the joined model has select entries. We should not return joined model values if they are not selected
	hasJoinedModelSelectEntry(prefix, fields, list, include) {
		let filteredFields = fields;

		// If we have omits or select definitions then come up with the final list
		if (list) {
			const listFields = list.map((entry) => entry.fieldName);

			if (include)
				filteredFields = filteredFields.filter((entry) =>
					listFields.includes(`${prefix}.${entry.name}`)
				);
			else
				filteredFields = filteredFields.filter(
					(entry) => !listFields.includes(`${prefix}.${entry.name}`)
				);
		}

		return filteredFields.length > 0;
	}

	// Returns the json object in following format
	// json_build_object('id', myprofile.id, 'gender', myprofile.gender, 'hobby', myprofile.hobby)
	getJsonBuildObjectString(prefix, fields, list, include) {
		let filteredFields = fields;

		// If we have omits or select definitions then come up with the final list
		if (list) {
			const listFields = list.map((entry) => entry.fieldName);

			if (include)
				filteredFields = filteredFields.filter((entry) =>
					listFields.includes(`${prefix}.${entry.name}`)
				);
			else
				filteredFields = filteredFields.filter(
					(entry) => !listFields.includes(`${prefix}.${entry.name}`)
				);
		}

		const finalList = [];
		for (const field of filteredFields) {
			finalList.push(`'${field.name}'`);
			finalList.push(`${prefix}.${field.name}`);
		}

		return `json_build_object(${finalList.join(", ")})`;
	}

	/**
	 * Prepares the join part of the query
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Array} joins The list of join definitions
	 * @returns  The JOIN query string
	 */
	getJoinDefinitions(modelMeta, joins) {
		if (!joins || joins.length === 0) return null;

		const joinEntries = [];

		for (const joinDef of joins) {
			const joinedModelMeta = joinDef.joinModel.getMetaObj();

			if (joinDef.joinType === "simple") {
				joinEntries.push(
					`LEFT JOIN ${joinedModelMeta.name} AS ${joinDef.as} ON ${
						modelMeta.name
					}.${joinDef.field.getName()} = ${joinDef.as}.${
						this.getIdField(joinedModelMeta).name
					}`
				);
			} else if (joinDef.joinType === "complex") {
				joinEntries.push(
					`LEFT JOIN ${joinedModelMeta.name} AS ${
						joinDef.as
					} ON ${joinDef.where.getQuery("PostgreSQL")}`
				);
			}
		}

		return joinEntries.join("\n");
	}

	/**
	 * Prepares the where part of the query
	 * @param  {object} where The where expression
	 * @returns  The WHERE query string
	 */
	getWhereDefinition(where) {
		if (!where) return null;

		return where.getQuery("PostgreSQL");
	}

	/**
	 * Prepares the 'group by' part of the query
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Array} joins The list of join definitions
	 * @returns  The GROUP BY query string
	 */
	getGroupByDefinition(modelMeta, joins) {}

	/**
	 * Prepares the 'order by' part of the query
	 * @param  {Array} sort The sort definition list
	 * @returns  The ORDER BY query string
	 */
	getOrderByDefinition(sort) {
		if (!sort || sort.length === 0) return null;

		const sortList = [];
		for (const entry of sort) {
			if (entry.joinType === "none")
				sortList.push(
					`${entry.joinModel.getName()}.${entry.field.getName()} ${entry.order.toUpperCase()}`
				);
			else sortList.push(`${entry.fieldPath} ${entry.order.toUpperCase()}`);
		}

		return sortList.join(", ");
	}

	/**
	 * Inserts a new record to the database and returns the inserted record
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} data The record to insert
	 * @returns  Inserted record
	 */
	async createOne(dbMeta, modelMeta, data) {
		// SQL query to insert a new user record
		const insertQuery = `
			INSERT INTO ${this.getTableName(dbMeta, modelMeta)} ${this.getColumnNames(data)}
			VALUES ${this.getValuePlaceholders(data)}
			RETURNING *;
		  `;

		const values = Object.values(data);

		console.log("***sql", insertQuery);
		console.log("***values", values);

		// Execute the INSERT query
		const result = await this.driver.query(insertQuery, values);

		return result.rows && result.rows.length > 0 ? result.rows[0] : null;
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
			// Begin the transaction
			await this.beginTransaction(dbMeta);

			// SQL query to insert a new user record
			const insertQuery = `
					INSERT INTO ${this.getTableName(dbMeta, modelMeta)} ${this.getColumnNames(data)}
					VALUES ${this.getValuePlaceholders(data)}
					RETURNING ${this.getIdField(modelMeta).name};
				  `;

			const values = data.flatMap((entry) => Object.values(entry));

			console.log("***sql", insertQuery);
			console.log("***values", values);

			// Execute the INSERT query
			const result = await this.driver.query(insertQuery, values);
			await this.commitTransaction(dbMeta);

			return { count: result.rowCount };
		} catch (err) {
			await this.rollbackTransaction(dbMeta);
			throw err;
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
		const from = this.getTableName(dbMeta, modelMeta);
		const select = this.getJoinLookupSelectDefinition(
			dbMeta,
			modelMeta,
			options.select,
			options.omit,
			options.lookup
		);
		const idField = this.getIdField(modelMeta);

		// SQL query to select a record from the database
		const selectQuery = `
					SELECT ${select} FROM ${from}
					WHERE ${idField.name} = ${this.getIdSQLValue(options.id)};
				  `;

		console.log("***sql", selectQuery);

		// Execute the SELECT query
		const result = await this.driver.query(selectQuery);

		return result.rows && result.rows.length > 0 ? result.rows[0] : null;
	}

	/**
	 * Retrieves the fist record matching the where condition from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, select, omit, join, sort, skip and useReadReplica options
	 * @returns  The fetched record otherwise null if no record can be found
	 */
	async findOne(dbMeta, modelMeta, options) {
		const from = this.getTableName(dbMeta, modelMeta);
		const select = this.getJoinLookupSelectDefinition(
			dbMeta,
			modelMeta,
			options.select,
			options.omit,
			this.mergeArrays(options.lookup, options.join)
		);

		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);
		const orderBy = this.getOrderByDefinition(options.sort);
		const limit = 1;
		const offset = options.skip ?? 0;

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${select}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${where}`;
		if (orderBy) selectQuery = `${selectQuery}\nORDER BY ${orderBy}`;

		selectQuery = `${selectQuery}\nLIMIT ${limit}`;
		selectQuery = `${selectQuery}\nOFFSET ${offset};`;

		console.log("***sql", selectQuery);

		// Execute the SELECT query
		const result = await this.driver.query(selectQuery);

		return result.rows && result.rows.length > 0 ? result.rows[0] : null;
	}

	/**
	 * Returns the records matching the where condition from the database.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, select, omit, join, sort, skip, limit and useReadReplica options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async findMany(dbMeta, modelMeta, options) {
		const from = this.getTableName(dbMeta, modelMeta);
		const select = this.getJoinLookupSelectDefinition(
			dbMeta,
			modelMeta,
			options.select,
			options.omit,
			this.mergeArrays(options.lookup, options.join)
		);

		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);
		//const groupBy = this.getGroupByDefinition(modelMeta, options.join);
		const orderBy = this.getOrderByDefinition(options.sort);
		const limit = options.limit ?? null;
		const offset = options.skip ?? null;

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${select}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${where}`;
		if (orderBy) selectQuery = `${selectQuery}\nORDER BY ${orderBy}`;

		if (limit) selectQuery = `${selectQuery}\nLIMIT ${limit}`;
		if (offset) selectQuery = `${selectQuery}\nOFFSET ${offset};`;

		console.log("***sql", selectQuery);

		// Execute the SELECT query
		const result = await this.driver.query(selectQuery);

		return result.rows && result.rows.length > 0 ? result.rows : [];
	}

	/**
	 * Deletes the record identified by the id and returns the deleted record count.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The id option
	 * @returns  Inserted record count
	 */
	async deleteById(dbMeta, modelMeta, options) {
		const from = this.getTableName(dbMeta, modelMeta);
		const idField = this.getIdField(modelMeta);

		// SQL query to delete a record from the database
		const deleteQuery = `
					DELETE FROM ${from}
					WHERE ${idField.name} = ${this.getIdSQLValue(options.id)};
				  `;

		console.log("***sql", deleteQuery);

		// Execute the DELETE query
		const result = await this.driver.query(deleteQuery);

		return { count: result.rowCount };
	}

	/**
	 * Deletes the first record matching the where condition and returns the deleted record count
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where condition and join options
	 * @returns  Deleted record count
	 */
	async deleteOne(dbMeta, modelMeta, options) {
		// We first identify the id of the record to update
		const idField = this.getIdField(modelMeta);
		const from = this.getTableName(dbMeta, modelMeta);
		const select = `${modelMeta.name}.${idField.name}`;
		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);
		const limit = 1;
		const offset = 0;

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${select}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${where}`;
		selectQuery = `${selectQuery}\nLIMIT ${limit}`;
		selectQuery = `${selectQuery}\nOFFSET ${offset};`;

		console.log("***sql", selectQuery);

		// Execute the SELECT query
		const result = await this.driver.query(selectQuery);

		const id =
			result.rows && result.rows.length > 0
				? result.rows[0][idField.name]
				: null;

		if (id === null) return { count: 0 };

		// Set options id value and perform the updates
		options.id = id;
		return await this.deleteById(dbMeta, modelMeta, options);
	}

	/**
	 * Deletes the records matching the where condition and returns the deleted record count
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where condition and join options
	 * @returns  Deleted record count
	 */
	async deleteMany(dbMeta, modelMeta, options) {
		// We first identify the ids of the records to update
		// const updates = this.getUpdateDefinition(dbMeta, modelMeta);
		const idField = this.getIdField(modelMeta);
		const from = this.getTableName(dbMeta, modelMeta);
		const select = `${modelMeta.name}.${idField.name}`;
		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${select}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${where}`;
		selectQuery = `${selectQuery}\nGROUP BY ${select}`;

		console.log("***sql", selectQuery);

		// Execute the SELECT query
		const selectResult = await this.driver.query(selectQuery);
		const rows =
			selectResult.rows && selectResult.rows.length > 0
				? selectResult.rows
				: null;

		if (rows === null) return { count: 0 };

		// Get the list of id values
		const ids = rows.map((entry) => entry[idField.name]);

		// SQL query to delete records from the database
		const deleteQuery = `
						DELETE FROM ${from}
						WHERE ${idField.name} IN (${ids.join(", ")});
					`;

		console.log("***sql", deleteQuery);

		// Execute the DELETE query
		const result = await this.driver.query(deleteQuery);

		return { count: result.rowCount };
	}

	/**
	 * Updates the record identified by id using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The select, omit, update and id options
	 * @returns  The updated record otherwise null if no record can be found
	 */
	async updateById(dbMeta, modelMeta, options) {
		const from = this.getTableName(dbMeta, modelMeta);
		const { updates, values } = this.getUpdateDefinition(
			modelMeta,
			options.updateData
		);
		const select = this.getSelectDefinition(
			modelMeta,
			options.select,
			options.omit
		);
		// const updates = this.getUpdateDefinition(dbMeta, modelMeta);
		const idField = this.getIdField(modelMeta);

		// SQL query to update a record
		const updateQuery = `
						UPDATE ${from}
						SET ${updates}
						WHERE ${idField.name} = ${this.getIdSQLValue(options.id)}
						RETURNING ${select};
					`;

		console.log("***sql", updateQuery);
		console.log("***values", values);

		// Execute the UPDATE query
		const result = await this.driver.query(updateQuery, values);

		return result.rows && result.rows.length > 0 ? result.rows[0] : null;
	}

	/**
	 * Updates the first record matching the where condition using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, join and update options
	 * @returns  The updated record otherwise null if no record can be found
	 */
	async updateOne(dbMeta, modelMeta, options) {
		// We first identify the id of the record to update
		const idField = this.getIdField(modelMeta);
		const from = this.getTableName(dbMeta, modelMeta);
		const select = `${modelMeta.name}.${idField.name}`;
		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);
		const limit = 1;
		const offset = 0;

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${select}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${where}`;
		selectQuery = `${selectQuery}\nLIMIT ${limit}`;
		selectQuery = `${selectQuery}\nOFFSET ${offset};`;

		console.log("***sql", selectQuery);

		// Execute the SELECT query
		const result = await this.driver.query(selectQuery);

		const id =
			result.rows && result.rows.length > 0
				? result.rows[0][idField.name]
				: null;

		if (id === null) return null;

		// Set options id value and perform the updates
		options.id = id;
		return await this.updateById(dbMeta, modelMeta, options);
	}

	/**
	 * Updates the records matching the where condition using the update instructions.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, join and update options
	 * @returns  Updated record count
	 */
	async updateMany(dbMeta, modelMeta, options) {
		// We first identify the ids of the records to update
		// const updates = this.getUpdateDefinition(dbMeta, modelMeta);
		const idField = this.getIdField(modelMeta);
		const from = this.getTableName(dbMeta, modelMeta);
		const select = `${modelMeta.name}.${idField.name}`;
		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${select}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${where}`;
		selectQuery = `${selectQuery}\nGROUP BY ${select}`;

		console.log("***sql", selectQuery);

		// Execute the SELECT query
		const selectResult = await this.driver.query(selectQuery);
		const rows =
			selectResult.rows && selectResult.rows.length > 0
				? selectResult.rows
				: null;

		if (rows === null) return { count: 0 };

		// Get the list of id values
		const ids = rows.map((entry) => entry[idField.name]);
		const { updates, values } = this.getUpdateDefinition(
			modelMeta,
			options.updateData
		);

		// SQL query to update records
		const updateQuery = `
						UPDATE ${from}
						SET ${updates}
						WHERE ${idField.name} IN (${ids.join(", ")});
					`;

		console.log("***sql", updateQuery);
		console.log("***values", values);

		// Execute the UPDATE query
		const result = await this.driver.query(updateQuery, values);

		return { count: result.rowCount };
	}
}
