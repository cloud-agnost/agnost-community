import * as fields from "./data-types/index.js";

const fieldMap = {
	id: fields.Id,
	text: fields.Text,
	"rich-text": fields.RichText,
	"encrypted-text": fields.EncryptedText,
	email: fields.Email,
	link: fields.Link,
	phone: fields.PhoneNumber,
	boolean: fields.Bool,
	integer: fields.Integer,
	decimal: fields.Decimal,
	monetary: fields.Monetary,
	createdat: fields.DateTime,
	updatedat: fields.DateTime,
	datetime: fields.DateTime,
	date: fields.Date,
	time: fields.Time,
	binary: fields.Blob,
	json: fields.Json,
	reference: fields.Reference,
	enum: new Error("Enum field type not supported"),
	"geo-point": new Error("Geo Point field type not supported"),
};

export default fieldMap;
