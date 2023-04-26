import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Time extends Field {
	maxLength = 8;
	static typeName = "Time";
	/**
	 * @description The name of the database adapter.
	 */
	adapter;

	/**
	 * @description The data type of the field.
	 */
	type = "date";

	/**
	 * @description The name of the field.
	 */
	name;

	/**
	 * @description The name of the data type.
	 */
	versions = {
		[DATABASE.MySQL]: "TIME",
		[DATABASE.PostgreSQL]: "TIME",
		[DATABASE.SQLServer]: "TIME",
		[DATABASE.Oracle]: "",
	};

	/**
	 * @description The default value for the data type.
	 * @param {string} adapter - The database adapter.
	 * @param {string} name - The name of the field.
	 */
	constructor(adapter, name) {
		if (adapter === DATABASE.Oracle) {
			throw new AgnostError(
				t(`${DATABASE.Oracle} does not support the Time data type.`)
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
