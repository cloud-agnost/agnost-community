import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Blob extends Field {
	static typeName = "Blob";
	/**
	 * @description The configuration for the field.
	 */
	/**
	 * @description The name of the database adapter.
	 */
	adapter;

	/**
	 * @description The name of the field.
	 */
	name;

	/**
	 * @description The data type of the field.
	 */
	type = "string";

	/**
	 * @description The name of the data type.
	 */
	versions = {
		[DATABASE.MySQL]: `BLOB`,
		[DATABASE.PostgreSQL]: `BYTEA`,
		[DATABASE.SQLServer]: "BINARY",
		[DATABASE.Oracle]: "BLOB",
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
		return this.name + " " + this.versions[this.adapter];
	}

	/**
	 * @description Generates the query for the rename field.
	 */
	toDefinitionQueryForRename() {
		return this.versions[this.adapter];
	}
}
