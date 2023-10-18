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
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Array} select The included fields
	 * @param  {Array} omit The exdluded fields
	 * @param  {Array} joins The list of join definitions
	 * @returns  The select for SQL or projection for no-SQL definiton
	 */
	getJoinedSelectDefinition(modelMeta, select, omit, joins) {
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
			const selectEntries = [`${modelMeta.name}.*`];
			for (const joinDef of joins) {
				const joinedModelMeta = joinDef.joinModel.getMetaObj();
				if (joinDef.joinType === "simple") {
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
				} else if (joinDef.joinType === "complex") {
					selectEntries.push(
						`CASE WHEN COUNT(${joinDef.as}.${
							this.getIdField(joinedModelMeta).name
						}) = 0 THEN '[]'::json ELSE json_agg(${this.getJsonBuildObjectString(
							joinDef.as,
							joinedModelMeta.fields,
							null,
							false
						)}) END AS ${joinDef.as}`
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
			if (joinDef.joinType === "simple") {
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
			} else if (joinDef.joinType === "complex") {
				selectEntries.push(
					`CASE WHEN COUNT(${joinDef.as}.${
						this.getIdField(joinedModelMeta).name
					}) = 0 THEN '[]'::json ELSE json_agg(${this.getJsonBuildObjectString(
						joinDef.as,
						joinedModelMeta.fields,
						list,
						include
					)}) END AS ${joinDef.as}`
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
		if (data.length === 0) return 0;

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

			return result.rowCount;
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
		const select = this.getSelectDefinition(
			modelMeta,
			options.select,
			options.omit
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
		for (const join of options.join) {
			console.log("***join", {
				joinType: join.joinType,
				as: join.as,
				from: join.from,
				fieldPath: join.fieldPath,
			});
		}

		const from = this.getTableName(dbMeta, modelMeta);
		const select = this.getJoinedSelectDefinition(
			modelMeta,
			options.select,
			options.omit,
			options.join
		);
		const joins = this.getJoinDefinitions(modelMeta, options.join);

		// SQL query to select a record from the database
		const selectQuery = `
				SELECT ${select} FROM ${from} as ${modelMeta.name}
			  `;

		console.log("***joins", joins);

		//const sort = this.getSortDefinition(options.sort);
		return null;
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

		// SQL query to select a record from the database
		const deleteQuery = `
					DELETE FROM ${from}
					WHERE ${idField.name} = ${this.getIdSQLValue(options.id)};
				  `;

		console.log("***sql", deleteQuery);

		// Execute the SELECT query
		const result = await this.driver.query(deleteQuery);

		return result.rowCount;
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

		// SQL query to select a record from the database
		const updateQuery = `
						UPDATE ${from}
						SET ${updates}
						WHERE ${idField.name} = ${this.getIdSQLValue(options.id)}
						RETURNING ${select};
					`;

		console.log("***sql", updateQuery);
		console.log("***values", values);

		// Execute the SELECT query
		const result = await this.driver.query(updateQuery, values);

		return result.rows && result.rows.length > 0 ? result.rows[0] : null;
	}
}
