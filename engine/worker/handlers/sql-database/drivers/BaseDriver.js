export default class BaseDriver {
	/**
	 * @description The database type
	 */
	databaseType;

	/**
	 * @description The connection to the database
	 */
	connection;
	constructor(connection) {
		this.connection = connection;
	}

	/**
	 * @description Get all databases in the database instance
	 */
	getDatabases() {}

	/**
	 * @description Get all tables in the database
	 */
	getModels() {}

	/**
	 * @description Drop a database
	 * @param {string} name - The name of the database
	 */
	dropDatabase(name) {}

	/**
	 * @description Drop a table
	 * @param {string} table - The name of the table
	 */
	dropTable(table) {}

	/**
	 * @description Add a column to a table
	 * @param {Model} table - The table model
	 */
	addColumn(table) {}

	/**
	 * @description Drop a column from a table
	 * @param {string} columnName - The name of the column
	 * @param {string} table - The name of the table
	 */
	dropColumn(columnName, table) {}

	/**
	 * @description Rename a column
	 * @param {string} table - The name of the table
	 * @param {string} oldName - The old name of the column
	 * @param {string} newName - The new name of the column
	 */
	renameColumn(table, oldName, newName) {}
	/**
	 * @description Drop an index from a table column
	 * @param {string} column - The name of the column
	 * @param {string|undefined} table - The name of the table
	 * @returns {Promise}
	 * @throws {Error} - If no database name is provided or if the table does not exist or query fails
	 */
	dropIndex(column, table) {}

	/**
	 * @description Run a query
	 * @param {string} query - The query to run
	 * @param {[]|undefined} values - The values to bind to the query
	 */

	/**
	 * @description Create a new table
	 * @param {Model} model - The table model
	 */
	createTable(model) {
		this.connection.addQuery(
			`CREATE TABLE ${model.name} ( 
${model.fields.map((field) => "\t" + field.toDefinitionQuery()).join(", \n")}
);\n`
		);
	}
	/**
	 * @description Check if a database exists
	 * @param {string} database - The name of the database to check
	 * @returns {Promise}
	 */
	async isDatabaseExists(database) {
		const databases = await this.getDatabases();
		return databases.includes(database);
	}
	/**
	 * @description Check if a table exists
	 * @param {string} table - The name of the table to check
	 * @returns {Promise}
	 * @throws {Error} - If no database name is provided
	 */
	async isTableExists(table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		const tables = await this.getTables();
		return tables.includes(table);
	}

	/**
	 * @description Add an index to a table column
	 * @param {string} table - The name of the table
	 * @param column - The name of the column
	 * @returns {Promise} - A promise that resolves when the index is added
	 * @throws {Error} - If no database name is provided or if the table does not exist or query fails
	 */
	async addIndex(table, column) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table)))
			throw new Error(`Table ${table} does not exist`);
		try {
			await this.runQuery(
				`CREATE INDEX index_${column} ON ${this.getDatabaseName()}.${table}(${column})`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}
}
