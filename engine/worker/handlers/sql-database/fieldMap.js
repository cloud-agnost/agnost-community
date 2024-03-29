import * as fields from "./data-types/index.js";

/**
 * @description A map of field types.
 * @type {Map<string, keyof fields>}
 */
const fieldMap = new Map([
    ["id", fields.Id],
    ["text", fields.Text],
    ["rich-text", fields.RichText],
    ["encrypted-text", fields.EncryptedText],
    ["email", fields.Email],
    ["link", fields.Link],
    ["phone", fields.PhoneNumber],
    ["boolean", fields.Bool],
    ["integer", fields.Integer],
    ["decimal", fields.Decimal],
    ["createdat", fields.DateTime],
    ["updatedat", fields.DateTime],
    ["datetime", fields.DateTime],
    ["date", fields.Date],
    ["time", fields.Time],
    ["binary", fields.Blob],
    ["json", fields.Json],
    ["reference", fields.Reference],
    ["enum", fields.Enum],
    ["geo-point", fields.GeoPoint],
]);
export default fieldMap;
