import { DatabaseBase } from "./DatabaseBase.js";

export class SQLDatabase extends DatabaseBase {
	constructor() {
		super();
	}

	/**
	 * Merges two input arrays
	 * @param  {Array} arr1 The first array
	 * @param  {Array} arr2 The second array
	 * @returns  Merged array
	 */
	mergeArrays(arr1, arr2) {
		if (!arr1 && !arr2) return null;
		// If arr1 is not an array, default to an empty array
		arr1 = Array.isArray(arr1) ? arr1 : [];

		// If arr2 is not an array, default to an empty array
		arr2 = Array.isArray(arr2) ? arr2 : [];

		return [...arr1, ...arr2];
	}

	/**
	 * Returns the name of the SQL database table name. If schema exists then prepends the schema name.
	 * @param  {Object} dbMeta The database metadata
	 * @param  {Object} modelMeta The model metadata
	 * @returns  Table name
	 */
	getTableName(dbMeta, modelMeta) {
		if (modelMeta.schemaiid) {
			const { schemaName } = dbMeta.schemas.find(
				(entry) => entry.iid === modelMeta.schemaiid
			);

			return `${schemaName}.${modelMeta.name}`;
		} else return modelMeta.name;
	}

	/**
	 * Returns the id field of the model
	 * @param  {Object} modelMeta The model metadata
	 */
	getIdField(modelMeta) {
		return modelMeta.fields.find((entry) => entry.type === "id");
	}

	/**
	 * Returns the SQL represenation of id value
	 * @param  {Object} id The id value
	 */
	getIdSQLValue(id) {
		if (typeof id === "string") return `'${id}'`;
		else return id;
	}
}

export default new DatabaseBase();
