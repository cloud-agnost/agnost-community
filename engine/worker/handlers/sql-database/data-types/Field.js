/**
 * @description The base class for all fields
 * @class Field
 * @description Abstract class for fields
 */
export default class Field {
	static typeName;
	/**
	 * @description The database provider that this field is for (e.g. MySQL, Postgres and MsSQLDriver)
	 */
	adapter;
	/**
	 * @description The type of the field (e.g. numeric, string and date)
	 */
	type;
	/**
	 * @description The configuration of the field (e.g. unique, not null and default value)
	 */
	config;
	/**
	 * @description The name of the field
	 */
	name;

	/**
	 * @description The type name of the field for each database provider (e.g. MySQL, Postgres and MsSQLDriver)
	 */
	versions;
	/**
	 * @description Converts the field to a query string
	 */
	toDefinitionQuery() {}
	/**
	 * @description Converts the field to a query string for renaming the field
	 */
	toDefinitionQueryForRename() {}
	getName() {
		return this.name;
	}
	getType() {
		return this.type;
	}
}
