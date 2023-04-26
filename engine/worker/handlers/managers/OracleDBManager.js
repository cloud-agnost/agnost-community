import { SQLBaseManager } from "./SQLBaseManager.js";

export class OracleDBManager extends SQLBaseManager {
	constructor(dbConfig, prevDbConfig, addLogFn) {
		super(dbConfig, prevDbConfig, addLogFn);

		this.appDB = null;
	}
}
