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

		console.log("sql", insertQuery);
		console.log("values", values);

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

			console.log("sql", insertQuery);
			// console.log("values", values);

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
					WHERE ${idField.name} = ${options.id};
				  `;

		console.log("sql", selectQuery);

		// Execute the SELECT query
		const result = await this.driver.query(selectQuery);

		return result.rows && result.rows.length > 0 ? result.rows[0] : null;
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
					WHERE ${idField.name} = ${options.id};
				  `;

		console.log("sql", deleteQuery);

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
						WHERE ${idField.name} = ${options.id}
						RETURNING ${select};
					`;

		console.log("sql", updateQuery);
		console.log("values", values);

		// Execute the SELECT query
		const result = await this.driver.query(updateQuery, values);

		return result.rows && result.rows.length > 0 ? result.rows[0] : null;
	}
}
