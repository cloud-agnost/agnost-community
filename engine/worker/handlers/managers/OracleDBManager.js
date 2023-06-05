import { SQLBaseManager } from "./SQLBaseManager.js";

export class OracleDBManager extends SQLBaseManager {
	constructor(env, dbConfig, prevDbConfig, addLogFn) {
		super(env, dbConfig, prevDbConfig, addLogFn);

		this.appDB = null;
	}
}
