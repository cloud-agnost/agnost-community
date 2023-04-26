import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Bool extends Field {
	static typeName = "Bool";
	/**
	 * @description The name of the database adapter.
	 */
	adapter;

	/**
	 * @description The name of the field.
	 */
	name;

	/**
	 * @description The name of the data type.
	 */
	type = "string";

	/**
	 * @description The name of the data type.
	 */
	versions = {
		[DATABASE.MySQL]: "BOOLEAN",
		[DATABASE.PostgreSQL]: "BOOLEAN",
		[DATABASE.SQLServer]: "BIT",
		[DATABASE.Oracle]: "NUMBER(1)",
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
