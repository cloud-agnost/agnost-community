import { DatabaseBase } from "./DatabaseBase.js";

/**
 * Manages read and write operations to MySQL
 */
export class MySQL extends DatabaseBase {
	constructor(driver) {
		super();
		// Driver is the pool of PostgreSQL connections
		this.driver = driver;
		this.inTransaction = false;
		// Individual PostgreSQL connection used for the transaction
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
}
