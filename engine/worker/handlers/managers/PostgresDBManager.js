import PostgresSQLDriver from "../sql-database/drivers/PostgresSQLDriver.js";
import { SQLBaseManager } from "./SQLBaseManager.js";

export class PostgresDBManager extends SQLBaseManager {
	constructor(dbConfig, prevDbConfig, addLogFn) {
		super(dbConfig, prevDbConfig, addLogFn, PostgresSQLDriver);
	}

	beginSession() {
		this.sql = `DO $$
BEGIN
`;
	}
	endSession() {
		this.sql += `
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE EXCEPTION '%', SQLERRM;
END
$$;`;
	}
	async runQuery() {
		/**
		 * @type {Pool}
		 */
		const conn = await this.getConn();
		try {
			const result = await conn.query(this.getQuery());
			this.addLog(
				"⤵\n" + this.getQuery() + "\n" + t("Query executed successfully")
			);
			this.resetQuery();
			return result;
		} catch (e) {
			throw e;
		}
	}
}
