import { DATABASE } from "../../config/constants.js";

const MYSQL_COLLATE = "utf8mb4_0900_as_cs";

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
     * @description The database type
     * @type {string}
     */
    dbType;

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
     *
     * @param options
     * @param options.name {string}
     * @param options.fields {[]|undefined}
     * @param options.schema {string|undefined}
     * @param options.dbType {string|undefined}
     */
    constructor({ name, fields = undefined, schema = undefined, dbType }) {
        this.name = name;
        this.schema = schema;
        if (fields) this.fields = fields;
        this.dbType = dbType;
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
        const isMySQL = this.dbType === DATABASE.MySQL;

        let SQL = `
CREATE TABLE {SCHEMA_NAME}{TABLE_NAME} (
{TABLE_FIELDS}
); \n`;

        if (isMySQL)
            SQL = `
CREATE TABLE {SCHEMA_NAME}{TABLE_NAME} (
{TABLE_FIELDS}
) COLLATE ${MYSQL_COLLATE}; \n`;

        const fields = this.fields.map((field) => "\t" + field.toDefinitionQuery()).join(", \n");

        return SQL.replaceAll("{TABLE_NAME}", this.name)
            .replaceAll("{TABLE_FIELDS}", fields)
            .replace("{SCHEMA_NAME}", this.schema ? `${this.schema}.` : "");
    }
}
