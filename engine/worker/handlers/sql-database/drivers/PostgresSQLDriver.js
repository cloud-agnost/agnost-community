import BaseDriver from "./BaseDriver.js";
import { DATABASE } from "../../../config/constants.js";

/**
 * @description PostgresSQLDriver database manager
 * @class PostgresSQLDriver
 * @extends DatabaseManager
 */
export default class PostgresSQLDriver extends BaseDriver {
	/**
	 * @description The type of database
	 */
	databaseType = DATABASE.PostgreSQL;

	/**
	 * @type {PostgresDBManager}
	 */
	connection;

	/**
	 *
	 * @param {PostgresDBManager} connection
	 */
	constructor(connection) {
		super();
		this.connection = connection;
	}

	/**
	 * @description Add a new column to a table
	 * @param {Model} table - The name of the table
	 * @returns {Promise} - Resolves when the table is created
	 * @throws Rejects when the table does not exist or database name is not provided or the query fails
	 */
	async addColumn(table) {
		if (!this.getDatabaseName()) throw new Error("No database name provided");
		if (!(await this.isTableExists(table.name)))
			throw new Error(`Table ${table.name} does not exist`);
		try {
			await this.runQuery(
				`ALTER TABLE ${table.name} ${table.fields
					.map((field) => `ADD COLUMN ${field.toDefinitionQuery()}`)
					.join(", ")}`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Add a new table to the database
	 * @param {string} name - The name of the database to create
	 * @returns {Promise} - Resolves when the database is created
	 * @throws Rejects the query fails
	 */
	async createDatabase(name) {
		if (!(await this.isDatabaseExists(name))) {
			try {
				await this.runQuery(`CREATE DATABASE ${name}`);
				return Promise.resolve();
			} catch (error) {
				throw error;
			}
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
			await this.runQuery(`ALTER TABLE ${table} DROP COLUMN ${name}`);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @description Drop a database if it exists
	 * @param {string} name - The name of the database to drop
	 * @returns {Promise} - Resolves when the database is dropped
	 * @throws Rejects when the query fails
	 */
	async dropDatabase(name) {
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
			await this.runQuery(`DROP TABLE IF EXISTS ${table}`);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @description Get all databases in the MySQL instance
	 * @returns {Promise} - The databases in the MySQL instance
	 * @throws Rejects when the query fails
	 */
	async getDatabases() {
		try {
			const databases = await this.runQuery("SELECT datname FROM pg_database");
			if (Array.isArray(databases))
				return databases.map((table) => table.datname);
			return [];
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
				`SELECT table_name FROM information_schema.tables WHERE table_type='BASE TABLE' and table_schema = 'public';`
			);
			const tables = await this.connection.runQuery();
			if (Array.isArray(tables)) return tables.map((table) => table.table_name);
			return [];
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
			await this.runQuery(`
        ALTER TABLE ${table} RENAME COLUMN ${oldName} TO ${newName}
      `);
			return Promise.resolve();
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
			await this.runQuery(`DROP INDEX index_${column};`);
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
				`CREATE INDEX index_${column} ON ${table}(${column})`
			);
			return Promise.resolve();
		} catch (error) {
			throw error;
		}
	}
}
