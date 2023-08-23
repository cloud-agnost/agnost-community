/**
 * @description The model class for create a table
 * @class Model
 * @classdesc The model class for create a table
 */
export default class Model {
    /**
     * @description The fields of the model
     * @type {Field[]}
     */
    fields = [];

    /**
     * @description The name of the model
     * @type {string}
     */
    name;

    /**
     * @description The schema of the model
     * @type {string}
     */
    schema;

    /**
     * @description Create a new model
     * @param {string} name - The name of the model
     * @param {undefined|[]} fields - The fields of the model
     * @param {undefined|string} schema - The schema of the model
     */
    constructor(name, fields = undefined, schema = undefined) {
        this.name = name;
        this.schema = schema;
        if (fields) this.fields = fields;
    }

    /**
     * @description Add a field to the model
     * @param {Field|Field[]} field - The field to add
     */
    addField(field) {
        if (Array.isArray(field)) this.fields = [...this.fields, ...field];
        else this.fields.push(field);
    }

    /**
     * @description Generates the query for the creating model
     * @return {string}
     */
    toString() {
        const SQL = `
CREATE TABLE {SCHEMA_NAME}{TABLE_NAME} (
{TABLE_FIELDS}
); \n`;

        const fields = this.fields.map((field) => "\t" + field.toDefinitionQuery()).join(", \n");

        return SQL.replaceAll("{TABLE_NAME}", this.name)
            .replaceAll("{TABLE_FIELDS}", fields)
            .replace("{SCHEMA_NAME}", this.schema ? `${this.schema}.` : "");
    }
}
