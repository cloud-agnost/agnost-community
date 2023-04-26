import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Decimal extends Field {
	static typeName = "Decimal";
	/**
	 * @description The name of the database adapter.
	 */
	adapter;

	/**
	 * @description The data type of the field.
	 */
	type = "number";

	/**
	 * @description The name of the field.
	 */
	name;

	/**
	 * @description The configuration for the field.
	 */
	config = {
		precision: 10,
		scale: 2,
	};

	/**
	 * @description The name of the data type.
	 */
	versions = {
		[DATABASE.MySQL]: "DECIMAL",
		[DATABASE.PostgreSQL]: "DECIMAL",
		[DATABASE.SQLServer]: "DECIMAL",
		[DATABASE.Oracle]: "DECIMAL",
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
	 * @description Max length for the data type.
	 */
	maxLength() {
		return `(${this.config.precision},${this.config.scale})`;
	}

	/**
	 * @description Generates the query for the field.
	 */
	toDefinitionQuery() {
		return this.name + " " + this.versions[this.adapter] + this.maxLength();
	}

	/**
	 * @description Generates the query for the rename field.
	 */
	toDefinitionQueryForRename() {
		return this.versions[this.adapter];
	}
}
