/**
 * @description The model class for create a table
 * @class Model
 * @export
 * @classdesc The model class for create a table
 */
export default class Model {
	/**
	 * @description The fields of the model
	 */
	fields = [];

	/**
	 * @description The name of the model
	 */
	name;

	/**
	 * @description Create a new model
	 * @param {string} name - The name of the model
	 * @param {undefined|[]} fields - The fields of the model
	 */
	constructor(name, fields = undefined) {
		this.name = name;
		if (fields) this.fields = fields;
	}

	/**
	 * @description Add a field to the model
	 * @param {object|object[]} field - The field to add
	 */
	addField(field) {
		if (Array.isArray(field)) this.fields = [...this.fields, ...field];
		else this.fields.push(field);
	}
}
