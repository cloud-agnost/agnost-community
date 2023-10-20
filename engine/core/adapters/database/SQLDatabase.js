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
	 * Returns the comma seperated list of JSON object keys
	 * @param  {Object} data The JSON object
	 */
	getColumnNames(data) {
		if (Array.isArray(data)) return `(${Object.keys(data[0]).join(", ")})`;
		else return `(${Object.keys(data).join(", ")})`;
	}

	/**
	 * Returns the comma seperated list of value placeholders for the input JSON object
	 * @param  {Object} data The JSON object
	 */
	getValuePlaceholders(data) {
		if (Array.isArray(data)) {
			const keyCount = Object.keys(data[0]).length;
			return data
				.map(
					(entry, i1) =>
						`(${Object.keys(entry)
							.map((entry, i2) => `$${i1 * keyCount + i2 + 1}`)
							.join(", ")})`
				)
				.join(",\n");
		} else {
			return `(${Object.keys(data)
				.map((entry, index) => `$${index + 1}`)
				.join(", ")})`;
		}
	}

	/**
	 * Returns the SQL represenation of id value
	 * @param  {Object} id The id value
	 */
	getIdSQLValue(id) {
		if (typeof id === "string") return `'${id}'`;
		else return id;
	}

	/**
	 * Prepares the select part of the query namely the fields that will be returned.
	 * @param  {Object} modelMeta The model metadata
	 * @param  {Array} select The included fields
	 * @param  {Array} omit The exdluded fields
	 * @returns  The select for SQL or projection for no-SQL definiton
	 */
	getSelectDefinition(modelMeta, select, omit) {
		// If not select or omit definition the return all fields
		if (!select && !omit) return "*";

		const include = select ? true : false;
		const list = select ?? omit;

		if (include) {
			return list.map((entry) => entry.fieldName).join(", ");
		} else {
			const omits = list.map((entry) => entry.fieldName);

			return modelMeta.fields
				.filter((entry) => !omits.includes(entry.name))
				.map((entry) => entry.name)
				.join(", ");
		}
	}

	/**
	 * Prepares the update part of the query. The update instructions has the following structure
	 * {"set":{"updated_at":"2023-10-17T12:37:40.888Z","name":"michael"},"others":[{fieldName: "age", type: "$inc", "value": 1}, ....]}
	 * @param  {Object} modelMeta The model metadata
	 * @param  {object} updateInstructions The update instructions
	 * @returns  The update definition
	 */
	getUpdateDefinition(modelMeta, updateInstructions) {
		let counter = 1;
		const updates = [];
		const values = [];

		// Process set part
		for (const [key, value] of Object.entries(updateInstructions.set)) {
			const field = modelMeta.fields.find((entry) => entry.name === key);
			if (!field) continue;

			updates.push(`${key} = $${counter++}`);
			values.push(value);
		}

		for (const entry of updateInstructions.others) {
			switch (entry.type) {
				case "$set":
					updates.push(`${entry.fieldName} = $${counter++}`);
					values.push(entry.value);
					break;
				case "$inc":
					updates.push(
						`${entry.fieldName} = ${entry.fieldName} + ${entry.value}`
					);
					break;
				case "$mul":
					updates.push(
						`${entry.fieldName} = ${entry.fieldName} * ${entry.value}`
					);
					break;
				case "$max":
					updates.push(
						`${entry.fieldName} = GREATEST(${entry.fieldName}, ${entry.value})`
					);
					break;
				case "$min":
					updates.push(
						`${entry.fieldName} = LEAST(${entry.fieldName}, ${entry.value})`
					);
					break;
				default:
					break;
			}
		}

		return { updates: updates.join(", \n\t"), values };
	}
}

export default new DatabaseBase();
