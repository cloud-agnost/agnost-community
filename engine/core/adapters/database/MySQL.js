import { SQLDatabase } from "./SQLDatabase.js";

/**
 * Manages read and write operations to MySQL
 */
export class MySQL extends SQLDatabase {
	constructor(driver) {
		super();
		// Driver is the pool of MySQL connections
		this.driver = driver;
		this.inTransaction = false;
		// Individual MySQL connection used for the transaction
		this.connection = null;
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
		// If the adapter is in transaction then return the transaction executing connection otherwise return the driver
		if (this.inTransaction) return this.connection;
		else return this.driver;
	}

	/**
	 * Starts a new transaction on the database server. Any database CRUD operation that is executed after a call to `beginTransaction` will be executed within the transaction context. If the transaction is not committed then the changes will not be applied to the database.
	 */
	async beginTransaction(dbMeta) {
		if (this.inTransaction) return;

		// Acquire a client from the pool
		this.connection = await this.driver.getConnection();
		// Start the transaction
		await this.connection.beginTransaction();
		this.inTransaction = true;
	}

	/**
	 * Commits the currently active database transaction.
	 */
	async commitTransaction(dbMeta) {
		if (this.inTransaction) {
			await this.connection.commit();
			this.inTransaction = false;
			this.connection.release();
		}
	}

	/**
	 * Aborts the transaction and rolls back the database changes that are exected within the transaction.
	 */
	async rollbackTransaction(dbMeta) {
		if (this.inTransaction) {
			await this.connection.rollback();
			this.inTransaction = false;
			this.connection.release();
		}
	}

	/**
	 * Prepares the select part of the query namely the fields that will be returned.
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Array} select The included fields
	 * @param  {Array} omit The exdluded fields
	 * @returns  The select for SQL or projection for no-SQL definiton
	 */
	getSelectDefinition(modelMeta, select, omit) {
		// If not select or omit definition the return all fields
		if (!select && !omit) return "*";

		const include = select ? true : false;
		const list = select ?? omit;

		if (include) {
			return list.map((entry) => "`" + entry.fieldName + "`").join(", ");
		} else {
			const omits = list.map((entry) => entry.fieldName);

			return modelMeta.fields
				.filter((entry) => !omits.includes(entry.name))
				.map((entry) => "`" + entry.name + "`")
				.join(", ");
		}
	}

	/**
	 * Prepares the update part of the query. The update instructions has the following structure
	 * {"set":{"updated_at":"2023-10-17T12:37:40.888Z","name":"michael"},"others":[{fieldName: "age", type: "$inc", "value": 1}, ....]}
	 * @param  {Object} modelMeta The model metadata
	 * @param  {object} updateInstructions The update instructions
	 * @returns  The update definition
	 */
	getUpdateDefinition(modelMeta, updateInstructions) {
		const updates = [];
		const values = [];

		// Process set part
		for (const [key, value] of Object.entries(updateInstructions.set)) {
			const field = modelMeta.fields.find((entry) => entry.name === key);
			if (!field) continue;

			updates.push(`${key} = ?`);
			values.push(value);
		}

		for (const entry of updateInstructions.others) {
			switch (entry.type) {
				case "$set":
					updates.push(`${entry.fieldName} = ?`);
					values.push(entry.value);
					break;
				case "$inc":
					updates.push(
						`${entry.fieldName} = ${entry.fieldName} + ${entry.value}`
					);
					break;
				case "$mul":
					updates.push(
						`${entry.fieldName} = ${entry.fieldName} * ${entry.value}`
					);
					break;
				case "$max":
					updates.push(
						`${entry.fieldName} = GREATEST(${entry.fieldName}, ${entry.value})`
					);
					break;
				case "$min":
					updates.push(
						`${entry.fieldName} = LEAST(${entry.fieldName}, ${entry.value})`
					);
					break;
				default:
					break;
			}
		}

		return { updates: updates.join(", \n\t"), values };
	}

	/**
	 * Returns the comma seperated list of JSON object keys
	 * @param  {Object} data The JSON object
	 */
	getColumnNames(data) {
		if (Array.isArray(data))
			return `(${Object.keys(data[0])
				.map((entry) => "`" + entry + "`")
				.join(", ")})`;
		else
			return `(${Object.keys(data)
				.map((entry) => "`" + entry + "`")
				.join(", ")})`;
	}

	/**
	 * Returns the comma seperated list of value placeholders for the input JSON object
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} data The JSON object
	 */
	getValuePlaceholders(dbMeta, data) {
		if (Array.isArray(data)) {
			const keyCount = Object.keys(data[0]).length;
			return data
				.map(
					(entry, i1) =>
						`(${Object.keys(entry)
							.map((entry, i2) => {
								const field = dbMeta.fields.find(
									(entry2) => entry2.name === entry
								);
								if (field.type === "geo-point") return "ST_GeomFromText(?)";
								return "?";
							})
							.join(", ")})`
				)
				.join(",\n");
		} else {
			return `(${Object.keys(data)
				.map((entry, index) => {
					const field = dbMeta.fields.find((entry2) => entry2.name === entry);
					if (field.type === "geo-point") return "ST_GeomFromText(?)";
					return "?";
				})
				.join(", ")})`;
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
					// This is a complex lookup
					const orderBy = this.getOrderByDefinition(joinDef.sort);
					const limit = joinDef.limit ?? null;
					const offset = joinDef.skip ?? null;

					selectEntries.push(
						`COALESCE(
							(
								SELECT JSON_ARRAYAGG(${this.getJsonBuildObjectString(
									joinDef.as,
									joinedModelMeta.fields,
									null,
									false
								)})
								FROM (
									SELECT ${joinDef.as}.*
									FROM ${this.getTableName(dbMeta, joinedModelMeta)} AS ${joinDef.as}
									WHERE ${joinDef.where.getQuery("MySQL")}
									${orderBy ? `ORDER BY ${orderBy}` : ""}
									${limit ? `LIMIT ${limit}` : ""}
									${offset ? `OFFSET ${offset}` : ""}
								) AS ${joinDef.as}
							),
							JSON_ARRAY()
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
				// This is a complex lookup
				const orderBy = this.getOrderByDefinition(joinDef.sort);
				const limit = joinDef.limit ?? null;
				const offset = joinDef.skip ?? null;

				selectEntries.push(
					`COALESCE(
						(
							SELECT JSON_ARRAYAGG(${this.getJsonBuildObjectString(
								joinDef.as,
								joinedModelMeta.fields,
								list,
								include
							)})
							FROM (
								SELECT ${joinDef.as}.*
								FROM ${this.getTableName(dbMeta, joinedModelMeta)} AS ${joinDef.as}
								WHERE ${joinDef.where.getQuery("MySQL")}
								${orderBy ? `ORDER BY ${orderBy}` : ""}
								${limit ? `LIMIT ${limit}` : ""}
								${offset ? `OFFSET ${offset}` : ""}
							) AS ${joinDef.as}
						),
						JSON_ARRAY()
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
	// JSON_OBJECT(`id`, myprofile.id, `gender`, myprofile.gender, `hobby`, myprofile.hobby)
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

		return `JSON_OBJECT(${finalList.join(", ")})`;
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
					} ON ${joinDef.where.getQuery("MySQL")}`
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

		return where.getQuery("MySQL");
	}

	/**
	 * Prepares the 'group by' part of the query
	 * @param  {Array} groupBys The group by definitions
	 * @param  {Array} computations The computation definitions
	 * @returns  The SELECT query string for aggregation operation
	 */
	getAggregationSelectDefinitions(groupBys, computations) {
		// First add the groupBy entries
		const selectEntries = [];
		if (groupBys) {
			for (const groupBy of groupBys) {
				selectEntries.push(
					`${groupBy.expression.getQuery("MySQL")} AS ${groupBy.as}`
				);
			}
		}

		for (const comp of computations) {
			switch (comp.operator) {
				case "$count":
					selectEntries.push(`COUNT(*) AS ${comp.as}`);
					break;
				case "$countif":
					selectEntries.push(
						`SUM(${comp.compute.getQuery("MySQL")}) AS ${comp.as}`
					);
					break;
				case "$sum":
					selectEntries.push(
						`SUM(${comp.compute.getQuery("MySQL")}) AS ${comp.as}`
					);
					break;
				case "$avg":
					selectEntries.push(
						`AVG(${comp.compute.getQuery("MySQL")}) AS ${comp.as}`
					);
					break;
				case "$min":
					selectEntries.push(
						`MIN(${comp.compute.getQuery("MySQL")}) AS ${comp.as}`
					);
					break;
				case "$max":
					selectEntries.push(
						`MAX(${comp.compute.getQuery("MySQL")}) AS ${comp.as}`
					);
					break;
				default:
					break;
			}
		}

		return selectEntries.join(",\n");
	}

	/**
	 * Prepares the 'group by' part of the query
	 * @param  {Array} groupBys The group by definitions
	 * @returns  The GROUP BY query string
	 */
	getGroupByDefinition(groupBys) {
		if (!groupBys || groupBys.length === 0) return null;

		return groupBys
			.map((entry) => `${entry.expression.getQuery("MySQL")}`)
			.join(",\n");
	}

	/**
	 * Prepares the 'group by' part of the query
	 * @param  {Array} groupBys The group by definitions
	 * @param  {Array} computations The computation definitions
	 * @returns  The SELECT query string for aggregation operation
	 */
	getHavingDefinition(having, computations) {
		if (!having) return null;
		// First add the groupBy entries
		let havingQuery = `${having.getQuery("MySQL")}`;

		// This is need to remove overlapping cases, so that replaceAll does not mess up
		computations
			.sort((a, b) => {
				return b.as.length - a.as.length;
			})
			.sort((a, b) => {
				if (a.as > b.as) return -1;
				if (a.as < b.as) return 1;
				return 0;
			});

		// In SQL we need to replace the field values used in having with their counterpart computation expressions
		for (const comp of computations) {
			switch (comp.operator) {
				case "$count":
					havingQuery = havingQuery.replaceAll(comp.as, "COUNT(*)");
					break;
				case "$countif":
					havingQuery = havingQuery.replaceAll(
						comp.as,
						`SUM(${comp.compute.getQuery("MySQL")})`
					);
					break;
				case "$sum":
					havingQuery = havingQuery.replaceAll(
						comp.as,
						`SUM(${comp.compute.getQuery("MySQL")})`
					);
					break;
				case "$avg":
					havingQuery = havingQuery.replaceAll(
						comp.as,
						`AVG(${comp.compute.getQuery("MySQL")})`
					);
					break;
				case "$min":
					havingQuery = havingQuery.replaceAll(
						comp.as,
						`MIN(${comp.compute.getQuery("MySQL")})`
					);
					break;
				case "$max":
					havingQuery = havingQuery.replaceAll(
						comp.as,
						`MAX(${comp.compute.getQuery("MySQL")})`
					);
					break;
				default:
					break;
			}
		}

		return havingQuery;
	}

	/**
	 * Prepares the 'order by' part of the query
	 * @param  {Array} sort The sort definition list
	 * @returns  The ORDER BY query string
	 */
	getOrderByDefinition(sort) {
		if (!sort || sort.length === 0) return null;

		const sortList = [];
		for (const entry of sort) {
			if (entry.joinType === "none") {
				const modelName = entry.field.getModel().getName();
				if (modelName !== "$$dummy")
					sortList.push(
						`${entry.joinModel.getName()}.${entry.field.getName()} ${entry.order.toUpperCase()}`
					);
				else
					sortList.push(
						`${entry.field.getName()} ${entry.order.toUpperCase()}`
					);
			} else sortList.push(`${entry.fieldPath} ${entry.order.toUpperCase()}`);
		}

		return sortList.join(", ");
	}

	/**
	 * Prepares the full-text search part of the query
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} searchField The search field
	 * @param  {string} searchText The search text
	 * @returns  The full-text search query string
	 */
	getTextSearchDefinition(modelMeta, searchField, searchText) {
		const fieldName = `${modelMeta.name}.${searchField.field.getName()}`;
		return `MATCH(${fieldName}) AGAINST('${searchText}' IN BOOLEAN MODE)`;
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
			VALUES ${this.getValuePlaceholders(modelMeta, data)};
		  `;

		const values = Object.values(data);

		// console.log("***sql", insertQuery);
		// console.log("***values", values);

		// Execute the INSERT query
		const [insertResult] = await this.getDriver().query(insertQuery, values);
		// MySQL does not return the inserted record data, for this reason we need to run a select statement
		const idField = this.getIdField(modelMeta);
		const [rows] = await this.getDriver().query(
			`SELECT * FROM ${this.getTableName(dbMeta, modelMeta)} WHERE ${
				idField.name
			} = ?`,
			[insertResult.insertId]
		);

		return rows && rows.length > 0 ? rows[0] : null;
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
					VALUES ${this.getValuePlaceholders(modelMeta, data)};
				  `;

			const values = data.flatMap((entry) => Object.values(entry));

			// // console.log("***sql", insertQuery);
			// // console.log("***values", values);

			// Execute the INSERT query
			const [insertResult] = await this.getDriver().query(insertQuery, values);
			await this.commitTransaction(dbMeta);

			return { count: insertResult.affectedRows };
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
					SELECT ${select} 
					FROM ${from} AS ${modelMeta.name}
					WHERE ${modelMeta.name}.${idField.name} = ${this.getIdSQLValue(options.id)};
				  `;

		// // console.log("***sql", selectQuery);

		// Execute the SELECT query
		const [rows] = await this.getDriver().query(selectQuery);

		return rows && rows.length > 0 ? rows[0] : null;
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

		// // console.log("***sql", selectQuery);

		// Execute the SELECT query
		const [rows] = await this.getDriver().query(selectQuery);

		return rows && rows.length > 0 ? rows[0] : null;
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

		// // console.log("***sql", selectQuery);

		// Execute the SELECT query
		const [rows] = await this.getDriver().query(selectQuery);

		return rows && rows.length > 0 ? rows : [];
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

		// console.log("***sql", deleteQuery);

		// Execute the DELETE query
		const [deleteResult] = await this.getDriver().query(deleteQuery);

		return { count: deleteResult.affectedRows };
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

		if (joins && where) {
			// SQL query to select a record from the database
			let selectQuery = "";
			selectQuery = `SELECT ${select}`;
			selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;
			selectQuery = `${selectQuery}\n${joins}`;
			selectQuery = `${selectQuery}\nWHERE ${where}`;
			selectQuery = `${selectQuery}\nLIMIT ${limit}`;
			selectQuery = `${selectQuery}\nOFFSET ${offset};`;

			// console.log("***sql", selectQuery);

			// Execute the SELECT query
			const [rows] = await this.getDriver().query(selectQuery);

			const id = rows && rows.length > 0 ? rows[0][idField.name] : null;
			if (id === null) return { count: 0 };

			// Set options id value and perform the updates
			options.id = id;
			return await this.deleteById(dbMeta, modelMeta, options);
		} else {
			// If there are no joins we can directly update the records
			// SQL query to delete the record
			let deleteQuery = `DELETE FROM ${from} AS ${modelMeta.name}`;
			if (where) deleteQuery = `${deleteQuery}\nWHERE ${where}`;
			deleteQuery = `${deleteQuery}\nLIMIT 1;`;

			// console.log("***sql", deleteQuery);

			// Execute the UPDATE query
			const [deleteResult] = await this.getDriver().query(deleteQuery);

			return { count: deleteResult.affectedRows };
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
		// We first identify the ids of the records to update
		// const updates = this.getUpdateDefinition(dbMeta, modelMeta);
		const idField = this.getIdField(modelMeta);
		const from = this.getTableName(dbMeta, modelMeta);
		const select = `${modelMeta.name}.${idField.name}`;
		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);

		if (joins && where) {
			// SQL query to select a record from the database
			let selectQuery = "";
			selectQuery = `SELECT ${select}`;
			selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;
			selectQuery = `${selectQuery}\n${joins}`;
			selectQuery = `${selectQuery}\nWHERE ${where}`;
			selectQuery = `${selectQuery}\nGROUP BY ${select}`;

			// console.log("***sql", selectQuery);

			// Execute the SELECT query
			const [entries] = await this.getDriver().query(selectQuery);
			const rows = entries && entries.length > 0 ? entries : null;
			if (rows === null) return { count: 0 };

			// Get the list of id values
			const ids = rows.map((entry) => entry[idField.name]);

			// SQL query to delete records from the database
			const deleteQuery = `
						DELETE FROM ${from}
						WHERE ${idField.name} IN (${ids.join(", ")});
					`;

			// console.log("***sql", deleteQuery);

			// Execute the DELETE query
			const [deleteResult] = await this.getDriver().query(deleteQuery);

			return { count: deleteResult.affectedRows };
		} else {
			// If there are no joins we can directly update the records
			// SQL query to delete the record
			let deleteQuery = `DELETE FROM ${from} AS ${modelMeta.name}`;
			if (where) deleteQuery = `${deleteQuery}\nWHERE ${where};`;

			// console.log("***sql", deleteQuery);

			// Execute the UPDATE query
			const [deleteResult] = await this.getDriver().query(deleteQuery);

			return { count: deleteResult.affectedRows };
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
						WHERE ${idField.name} = ${this.getIdSQLValue(options.id)};`;

		// console.log("***sql", updateQuery);
		// console.log("***values", values);

		// Execute the UPDATE query
		const [updateResult] = await this.getDriver().query(updateQuery, values);

		if (updateResult.affectedRows === 0) return null;

		// MySQL does not return the inserted record data, for this reason we need to run a select statement
		const [rows] = await this.getDriver().query(
			`SELECT ${select} 
			FROM ${this.getTableName(dbMeta, modelMeta)} 
			WHERE ${idField.name} = ?`,
			[options.id]
		);

		return rows && rows.length > 0 ? rows[0] : null;
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
		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);
		const limit = 1;
		const offset = 0;

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${modelMeta.name}.${idField.name}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${where}`;
		selectQuery = `${selectQuery}\nLIMIT ${limit}`;
		selectQuery = `${selectQuery}\nOFFSET ${offset};`;

		// console.log("***sql", selectQuery);

		// Execute the SELECT query
		const [rows] = await this.getDriver().query(selectQuery);
		const id = rows && rows.length > 0 ? rows[0][idField.name] : null;

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
		const { updates, values } = this.getUpdateDefinition(
			modelMeta,
			options.updateData
		);

		if (joins && where) {
			// SQL query to select a record from the database
			let selectQuery = "";
			selectQuery = `SELECT ${select}`;
			selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;
			selectQuery = `${selectQuery}\n${joins}`;
			selectQuery = `${selectQuery}\nWHERE ${where}`;
			selectQuery = `${selectQuery}\nGROUP BY ${select}`;

			// console.log("***sql", selectQuery);

			// Execute the SELECT query
			const [selectRows] = await this.getDriver().query(selectQuery);
			const rows = selectRows && selectRows.length > 0 ? selectRows : null;

			if (rows === null) return { count: 0 };

			// Get the list of id values
			const ids = rows.map((entry) => entry[idField.name]);

			// SQL query to update records
			const updateQuery = `
						UPDATE ${from}
						SET ${updates}
						WHERE ${idField.name} IN (${ids.join(", ")});
					`;

			// console.log("***sql", updateQuery);
			// console.log("***values", values);

			// Execute the UPDATE query
			const [updateResult] = await this.getDriver().query(updateQuery, values);

			return { count: updateResult.affectedRows };
		} else {
			// If there are no joins we can directly update the records
			// SQL query to update records
			let updateQuery = `
						UPDATE ${from}
						SET ${updates}
					`;
			if (where) updateQuery = `${updateQuery}\nWHERE ${where};`;

			// console.log("***sql", updateQuery);
			// console.log("***values", values);

			// Execute the UPDATE query
			const [updateResult] = await this.getDriver().query(updateQuery, values);

			return { count: updateResult.affectedRows };
		}
	}

	/**
	 * Returns the records matching the search query
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The searchText, where, select, omit, join, sort, skip, limit and useReadReplica options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async searchText(dbMeta, modelMeta, options) {
		const from = this.getTableName(dbMeta, modelMeta);
		const select = this.getJoinLookupSelectDefinition(
			dbMeta,
			modelMeta,
			options.select,
			options.omit,
			this.mergeArrays(options.lookup, options.join)
		);
		const textSearch = this.getTextSearchDefinition(
			modelMeta,
			options.searchField,
			options.searchText
		);
		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);
		const orderBy = this.getOrderByDefinition(options.sort);
		const limit = options.limit ?? null;
		const offset = options.skip ?? null;

		// SQL query to select a record from the database
		let selectQuery = "";
		selectQuery = `SELECT ${select}`;
		selectQuery = `${selectQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) selectQuery = `${selectQuery}\n${joins}`;
		if (where) selectQuery = `${selectQuery}\nWHERE ${textSearch} AND ${where}`;
		else selectQuery = `${selectQuery}\nWHERE ${textSearch}`;

		if (orderBy) selectQuery = `${selectQuery}\nORDER BY ${orderBy}`;
		if (limit) selectQuery = `${selectQuery}\nLIMIT ${limit}`;
		if (offset) selectQuery = `${selectQuery}\nOFFSET ${offset};`;

		// console.log("***sql", selectQuery);

		// Execute the SELECT query
		const [rows] = await this.getDriver().query(selectQuery);

		return rows && rows.length > 0 ? rows : [];
	}

	/**
	 * Groups the records and performs computations on these groups
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The `where`, `join`, `groupBy`, `computations`, `having`, `sort`, `limit` and `skip`  instructions
	 * @returns  Group computation results
	 */
	async aggregate(dbMeta, modelMeta, options) {
		const from = this.getTableName(dbMeta, modelMeta);
		const select = this.getAggregationSelectDefinitions(
			options.groupBy,
			options.computations
		);

		const joins = this.getJoinDefinitions(modelMeta, options.join);
		const where = this.getWhereDefinition(options.where);
		const groupBy = this.getGroupByDefinition(options.groupBy);
		const having = this.getHavingDefinition(
			options.having,
			options.computations
		);

		const orderBy = this.getOrderByDefinition(options.sort);
		const limit = options.limit ?? null;
		const offset = options.skip ?? null;

		// SQL query to run aggregations
		let aggregateQuery = "";
		aggregateQuery = `SELECT ${select}`;
		aggregateQuery = `${aggregateQuery}\nFROM ${from} AS ${modelMeta.name}`;

		if (joins) aggregateQuery = `${aggregateQuery}\n${joins}`;
		if (where) aggregateQuery = `${aggregateQuery}\nWHERE ${where}`;
		if (groupBy) aggregateQuery = `${aggregateQuery}\nGROUP By ${groupBy}`;
		if (having) aggregateQuery = `${aggregateQuery}\nHAVING ${having}`;
		if (orderBy) aggregateQuery = `${aggregateQuery}\nORDER BY ${orderBy}`;
		if (limit) aggregateQuery = `${aggregateQuery}\nLIMIT ${limit}`;
		if (offset) aggregateQuery = `${aggregateQuery}\nOFFSET ${offset};`;

		// console.log("***sql", aggregateQuery);

		// Execute the SELECT query
		const [rows] = await this.getDriver().query(aggregateQuery);

		return rows && rows.length > 0 ? rows : [];
	}

	/**
	 * Returns the SQL query string of the query definition
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Object} options The where, select, omit, join, lookup, sort, skip and limit options
	 * @returns  The fetched records otherwise an empty array [] if no records can be found
	 */
	async getSQLQuery(dbMeta, modelMeta, options) {
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

		return selectQuery;
	}
}
