import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class EncryptedText extends Field {
	type = "string";
	static typeName = "EncryptedText";
	maxLength = 255;
	adapter;
	name;

	versions = {
		[DATABASE.MySQL]: `VARCHAR(${this.maxLength})`,
		[DATABASE.PostgreSQL]: `VARCHAR(${this.maxLength})`,
		[DATABASE.SQLServer]: `NVARCHAR(${this.maxLength})`,
		[DATABASE.Oracle]: `VARCHAR2(${this.maxLength})`,
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
