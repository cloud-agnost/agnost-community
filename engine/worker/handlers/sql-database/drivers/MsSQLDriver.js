import BaseDriver from "./BaseDriver.js";
import { DATABASE } from "../../../config/constants.js";

/**
 * @description MsSQL database manager
 * @class MsSQLDriver
 * @extends DatabaseManager
 */
export default class MsSQLDriver extends BaseDriver {
	/**
	 * @type {MsSQLDBManager}
	 * @description The connection to the MsSQL instance
	 */
	connection;

	/**
	 * @description The type of database
	 */
	databaseType = DATABASE.SQLServer;

	/**
	 *
	 * @param {MsSQLDBManager} connection
	 */
	constructor(connection) {
		super();
		this.connection = connection;
	}

	/**
	 * @description Add a column to a table
	 * @param {Model} table - The table to add the column to
	 * @returns {Promise} - Resolves when the column is added
	 * @throws Rejects when the table does not exist or database name is not provided or the query fails
	 */
	async addColumn(table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		try {
			await this.runQuery(
				`USE ${this.getDatabaseName()}; ALTER TABLE ${table.name} ${table.fields
					.map((field) => `ADD ${field.toDefinitionQuery()}`)
					.join(", ")}`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Drop a column from a table
	 * @param {string} columnName - The name of the column to drop
	 * @param {string} table - The name of the table to drop the column from
	 * @returns {Promise} - Resolves when the column is dropped
	 * @throws {Error} - If no database name is provided or the table does not exist or the query fails
	 */
	async dropColumn(columnName, table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table)))
			throw new Error(`Table ${table} does not exist`);
		try {
			await this.runQuery(
				`USE ${this.getDatabaseName()}; ALTER TABLE ${table} DROP COLUMN ${columnName};`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Drop a database if it exists
	 * @param {string} name - The name of the database to drop
	 * @returns {Promise} - Resolves when the database is dropped
	 * @throws {Error} - If the query fails
	 */
	async dropDatabase(name) {
		try {
			await this.runQuery(`DROP DATABASE IF EXISTS ${name};`);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Drop a table if it exists
	 * @param {string} table - The name of the table to drop
	 * @returns {Promise} - Resolves when the table is dropped
	 * @throws {Error} - If no database name is provided or the query fails
	 */
	async dropTable(table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		try {
			await this.runQuery(
				`USE ${this.getDatabaseName()}; DROP TABLE IF EXISTS ${table};`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Get all tables in a database
	 * @returns {Promise<[]>} - The tables in the database
	 * @throws Rejects when the query fails or database name is not provided or the query fails
	 */
	async getModels() {
		try {
			this.connection.addQuery(
				`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;`
			);
			const tables = await this.connection.runQuery();
			if (Array.isArray(tables)) return tables.map((table) => table.TABLE_NAME);
			return [];
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Rename a column in a table
	 * @param {string} table - The name of the table
	 * @param {string} oldName - The name of the column to rename
	 * @param {string} newName - The new name of the column
	 * @returns {Promise} - Resolves when the column is renamed
	 * @throws {Error} - If no database name is provided or the table does not exist or the query fails
	 */
	async renameColumn(table, oldName, newName) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table)))
			throw new Error(`Table ${table} does not exist`);
		try {
			await this.runQuery(
				`USE ${this.getDatabaseName()}; EXEC SP_RENAME '${table}.${oldName}', '${newName}', 'COLUMN';`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Run a query - DO NOT USE DOUBLED QUOTES IN THE QUERY
	 * @param {string} query - The query to run
	 * @returns {Promise} - Resolves with the result of the query
	 */
	async runQuery(query) {
		try {
			const result = await this.connection?.request().query(query);
			logger.info(`Query successfully executed: ${query}`);
			return result?.recordset;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Drop an index from a table column
	 * @param {string} column - The name of the column
	 * @param {string|undefined} table - The name of the table
	 * @returns {Promise} - Resolves when the index is dropped
	 * @throws {Error} - If no database name is provided or the table does not exist or the query fails
	 */
	async dropIndex(column, table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (table && !(await this.isTableExists(table)))
			throw new Error(`Table ${table} does not exist`);
		try {
			await this.runQuery(
				`USE ${this.getDatabaseName()}; DROP INDEX ${table}.index_${column};`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
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
				`USE ${this.getDatabaseName()}; CREATE INDEX index_${column} ON ${table}(${column})`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}
}
