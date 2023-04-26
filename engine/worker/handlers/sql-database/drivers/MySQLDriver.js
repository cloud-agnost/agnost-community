import BaseDriver from "./BaseDriver.js";
import { DATABASE } from "../../../config/constants.js";

/**
 * @description MySQL database manager
 * @class MySQLDriver
 * @extends DatabaseManager
 */
export default class MySQLDriver extends BaseDriver {
	/**
	 * @description The database type
	 */
	databaseType = DATABASE.MySQL;

	/**
	 * @description The connection to the MySQL instance
	 */
	connection;

	/**
	 * @description Blacklisted databases that cannot be created or dropped
	 */
	blacklist = ["information_schema", "mysql", "performance_schema", "sys"];

	/**
	 *
	 * @param {MySQLDBManager} connection
	 */
	constructor(connection) {
		super();
		this.connection = connection;
	}

	/**
	 * @description Get all tables in a database
	 * @returns {Promise<[]>} - The tables in the database
	 * @throws Rejects when the query fails;
	 */
	async getModels() {
		try {
			this.connection.addQuery("SHOW TABLES;");
			const tables = await this.connection.runQuery();
			if (Array.isArray(tables))
				return tables.map((row) => Object.values(row)[0]);
			return [];
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Add a column to a table
	 * @param {Model} table - The table to add the column to
	 * @returns {Promise} - Resolves when the column is added
	 * @throws Rejects when the table does not exist or database name is not provided or the query fails
	 */
	async addColumn(table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table.name)))
			throw new Error(`Table ${table.name} does not exist`);
		try {
			await this.runQuery(
				`ALTER TABLE ${this.getDatabaseName()}.${table.name} ${table.fields
					.map((field) => `ADD COLUMN ${field.toDefinitionQuery()}`)
					.join(", ")}`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Drop a column from a table
	 * @param {string} name - The name of the column to drop
	 * @param {string} table - The table to drop the column from
	 * @returns {Promise} - Resolves when the column is dropped
	 * @throws Rejects when the table does not exist or database name is not provided or the query fails
	 */
	async dropColumn(name, table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table)))
			throw new Error(`Table ${table} does not exist`);
		try {
			await this.runQuery(
				`ALTER TABLE ${this.getDatabaseName()}.${table} DROP COLUMN ${name}`
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
	 * @throws Rejects when the database name is blacklisted or the query fails
	 */
	async dropDatabase(name) {
		if (this.blacklist.includes(name))
			throw new Error("Cannot drop a database with this name");
		try {
			await this.runQuery(`DROP DATABASE IF EXISTS ${name}`);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Drop a table if it exists
	 * @param {string} table - The name of the table to drop
	 * @returns {Promise} - Resolves when the table is dropped
	 * @throws Rejects when database name is not provided or the query fails
	 */
	async dropTable(table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		try {
			await this.runQuery(
				`DROP TABLE IF EXISTS ${this.getDatabaseName()}.${table}`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Rename a column
	 * @param {string} table - The table the column is in
	 * @param {string} oldName - The old name of the column
	 * @param {string} newName - The new name of the column
	 * @returns {Promise} - Resolves when the column is renamed
	 * @throws Rejects when the table does not exist or database name is not provided or the query fails
	 */
	async renameColumn(table, oldName, newName) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table)))
			throw new Error(`Table ${table} does not exist`);
		try {
			await this.runQuery(
				`ALTER TABLE ${this.getDatabaseName()}.${table} RENAME COLUMN ${oldName} TO ${newName}`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Drop an index from a table column
	 * @param {string} column - The name of the column
	 * @param {string} table - The name of the table
	 * @returns {Promise} - Resolves when the index is dropped
	 * @throws {Error} - If no database name is provided or the table does not exist or the query fails
	 */
	async dropIndex(column, table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table)))
			throw new Error(`Table ${table} does not exist`);
		try {
			await this.runQuery(
				`ALTER TABLE ${this.getDatabaseName()}.${table} DROP INDEX index_${column};`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}
}
