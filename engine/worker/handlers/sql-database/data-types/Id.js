import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Id extends Field {
	/**
	 * @description The name of the data type.
	 */
	static typeName = "Id";

	/**
	 * @description The name of the database adapter.
	 */
	adapter;

	/**
	 * @description The data type of the field.
	 */
	type = "string";

	/**
	 * @description The name of the field.
	 */
	name;

	/**
	 * @description The name of the data type.
	 */
	versions = {
		[DATABASE.MySQL]: "VARCHAR(36)",
		[DATABASE.PostgreSQL]: "VARCHAR(36)",
		[DATABASE.SQLServer]: "NVARCHAR(36)",
		[DATABASE.Oracle]: "VARCHAR2(36)",
	};

	/**
	 * @description The default value for the data type.
	 * @param {DatabaseType} adapter - The database adapter.
	 * @param {string} name - The name of the field.
	 */
	constructor(adapter, name) {
		super();
		this.adapter = adapter;
		this.name = name;
	}

	/**
	 * @description Generates the query for the field.
	 */
	toDefinitionQuery() {
		return this.name + " " + this.versions[this.adapter] + " PRIMARY KEY";
	}

	/**
	 * @description Generates the query for the rename field.
	 */
	toDefinitionQueryForRename() {
		return this.versions[this.adapter];
	}
}
