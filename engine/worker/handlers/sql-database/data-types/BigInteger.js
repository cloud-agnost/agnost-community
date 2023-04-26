import Integer from "./Integer.js";
import { DATABASE } from "../../../config/constants.js";

export default class BigInteger extends Integer {
	static typeName = "BigInteger";
	/**
	 * @description The name of the data type.
	 */
	versions = {
		[DATABASE.MySQL]: "BIGINT",
		[DATABASE.PostgreSQL]: "BIGINT",
		[DATABASE.SQLServer]: "BIGINT",
		[DATABASE.Oracle]: "NUMBER(19)",
	};

	/**
	 * @description The default value for the data type.
	 * @param {DatabaseType} adapter - The database adapter.
	 * @param {string} name - The name of the field.
	 */
	constructor(adapter, name) {
		super(adapter, name);
	}
}
