import { SQLBaseManager } from "./SQLBaseManager.js";
import MySQLDriver from "../sql-database/drivers/MySQLDriver.js";

export class MySQLDBManager extends SQLBaseManager {
	constructor(env, dbConfig, prevDbConfig, addLogFn) {
		super(env, dbConfig, prevDbConfig, addLogFn, MySQLDriver);
	}

	beginSession() {
		this.sql = `CREATE PROCEDURE TransactionFN()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '99999' SET MESSAGE_TEXT = @p2;
    END;

    START TRANSACTION;
`;
	}
	endSession() {
		this.sql += `COMMIT;
END;
CALL TransactionFN();
DROP PROCEDURE IF EXISTS TransactionFN;
`;
	}
	async runQuery() {
		/**
		 * @type {Pool}
		 */
		const conn = await this.getConn();
		try {
			console.log(this.getQuery());
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
