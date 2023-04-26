import { DBManager } from "./dbManager.js";
import connManager from "../../init/connManager.js";
import fieldMap from "../sql-database/fieldMap.js";
import Model from "../sql-database/Model.js";

export class SQLBaseManager extends DBManager {
	/**
	 * @type {string}
	 */
	sql = "";

	constructor(dbConfig, prevDbConfig, addLogFn, Driver) {
		super(dbConfig, prevDbConfig, addLogFn);
		this.driver = new Driver(this);
	}

	async useDatabase(databaseName) {
		let config = this.getResourceAccessSettings();
		if (config.database) return;

		this.setDatabaseName(databaseName);
		config = this.getResourceAccessSettings();

		config.database = databaseName;
		this.conn = await connManager.getConn(
			this.getDbId(),
			this.getDbType(),
			this.getResourceAccessSettings(),
			true
		);
	}

	async createDatabase() {
		const dbName = this.getDbId().toLowerCase();
		this.addQuery(`CREATE DATABASE ${dbName};`);
		try {
			await this.runQuery();
			this.addLog(t("Created the database"));
			await this.useDatabase(dbName);
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	/**
	 * @return {void}
	 */
	beginSession() {}
	/**
	 * @return {void}
	 */
	endSession() {}

	async manageModels() {
		try {
			// definition of models
			const models = this.getModels();
			if (!models.length) return;

			// existing models
			const existingModels = await this.driver.getModels();

			this.beginSession();

			for (let model of models) {
				if (model.type === "model") {
					// Create Table for required models, if there is not any already
					if (!existingModels.includes(model.name)) {
						console.log("Table does not exist for model: ", model.name);
						await this.createModel(model);
					} else {
						console.log("Table exists for model: ", model.name);
					}
				}
			}

			this.endSession();
			await this.runQuery();
			this.addLog(t("Tables created successfully"));
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	/**
	 * Create a table and with its fields for the model
	 * @param {object} model
	 * @param {string} model.iid
	 * @param {object[]} model.fields
	 * @return {Promise<void>}
	 */
	async createModel(model) {
		const table = new Model(model.iid);
		for (let field of model.fields) {
			const FieldClass = fieldMap[field.type];
			if (!FieldClass) {
				throw new AgnostError(t(`Field type ${field.type} is not supported`));
			}
			table.addField(new FieldClass(this.driver.databaseType, field.name));
		}
		this.createTableSQL(table);
	}

	createTableSQL(table) {
		this.addQuery(
			`CREATE TABLE ${table.name} ( 
${table.fields.map((field) => "\t" + field.toDefinitionQuery()).join(", \n")}
);\n`
		);
	}

	addQuery(query) {
		this.sql += query;
	}
	resetQuery() {
		this.setQuery("");
	}
	setQuery(query) {
		this.sql = query;
	}
	getQuery() {
		return this.sql;
	}
	async runQuery() {}
}
