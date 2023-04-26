import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Json extends Field {
	static typeName = "Json";
	/**
	 * @description The configuration for the field.
	 */
	config = {
		creator: "user",
	};

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
		[DATABASE.MySQL]: `JSON`,
		[DATABASE.PostgreSQL]: `JSON`,
		[DATABASE.SQLServer]: "",
		[DATABASE.Oracle]: "",
	};

	/**
	 * @description The default value for the data type.
	 * @param {string} adapter - The database adapter.
	 * @param {string} name - The name of the field.
	 */
	constructor(adapter, name) {
		if ([DATABASE.SQLServer, DATABASE.Oracle].includes(adapter)) {
			throw new AgnostError(
				t(
					`JSON is not supported by ${DATABASE.SQLServer} or ${DATABASE.Oracle}`
				)
			);
		}
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
