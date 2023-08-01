import { SQLBaseManager } from "./SQLBaseManager.js";

export class MsSQLDBManager extends SQLBaseManager {
    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);
    }

    async useDatabase(databaseName) {
        this.setDatabaseName(databaseName);
    }
    beginSession() {
        this.sql = `BEGIN TRY
BEGIN TRANSACTION;
`;
    }
    endSession() {
        this.sql += `COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();
 
    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH;`;
    }
    async runQuery() {
        /**
         * @type {ConnectionPool}
         */
        const conn = await this.getConn();
        try {
            const database = this.getResourceAccessSettings().database;
            const useDb = database ? `USE ${database};\n` : "";
            this.setQuery(useDb + this.getQuery());
            const result = await conn.request().query(this.getQuery());
            this.addLog(
                "⤵\n" +
                    this.getQuery() +
                    "\n" +
                    t("Query executed successfully")
            );
            this.resetQuery();
            return result;
        } catch (e) {
            throw e;
        }
    }
}
