import cyripto from "crypto-js";
import bcrypt from "bcrypt";
import { customAlphabet } from "nanoid";
import mongo from "mongodb";
import querystring from "querystring";
import Decimal from "decimal.js";
import { DateTime } from "luxon";
import validator from "validator";
import { sendMessage } from "../init/sync.js";
import ERROR_CODES from "../config/errorCodes.js";

/**
 * Generates a hihg probability unique slugs
 * @param  {string} prefix The prefix prepended to the slug
 * @param  {string} prefix The length of the slug excluding the prefix
 */
function generateSlug(prefix, length = 12) {
	// Kubernetes resource names need to be alphanumeric and in lowercase letters
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
	const nanoid = customAlphabet(alphabet, length);
	if (prefix) return `${prefix}-${nanoid()}`;
	else return nanoid();
}

/**
 * Generates a hihg probability unique slugs
 * @param  {string} prefix The prefix prepended to the slug
 * @param  {string} prefix The length of the slug excluding the prefix
 */
function generateFileName(length = 8) {
	// Kubernetes resource names need to be alphanumeric and in lowercase letters
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
	const nanoid = customAlphabet(alphabet, length);
	return `fl-${nanoid()}`;
}

/**
 * Create an error message object
 * @param  {string} origin Either client or server error
 * @param  {string} code The specific error code
 * @param  {string} message The descriptive error text
 * @param  {Object} details Additional message details
 */
function createErrorMessage(origin, code, message, details) {
	return {
		errors: [{ origin, code, message, details }],
	};
}

/**
 * Get the IP number of requesting client
 * @param  {object} req HTTP request object
 */
function getIP(req) {
	try {
		var ip;
		if (req.headers["x-forwarded-for"]) {
			ip = req.headers["x-forwarded-for"].split(",")[0];
		} else if (req.connection && req.connection.remoteAddress) {
			ip = req.connection.remoteAddress;
		} else {
			ip = req.ip;
		}

		return ip;
	} catch (err) {
		return req.ip ?? null;
	}
}

/**
 * Checks if the input IP address is in the IP address whitelist
 * @param  {string} IPaddress
 * @param  {Array} ipWhitelist Array of IP addresses or IP address ranges
 */
export const isAuthorizedIP = (IPaddress, ipWhitelist) => {
	return ipWhitelist.some((ip) => {
		if (ip.includes("/")) {
			// IP range specified in CIDR notation
			const [subnet, bits] = ip.split("/");
			const mask = ~(2 ** (32 - bits) - 1);
			const subnetInt = IPToInt(subnet);
			const ipAddressInt = IPToInt(IPaddress);
			return (subnetInt & mask) === (ipAddressInt & mask);
		} else {
			// Single IP address
			return ip === IPaddress;
		}
	});
};

/**
 * Helper function to convert IP address to integer
 * @param  {string} IPaddress
 */
const IPToInt = (IPaddress) => {
	return IPaddress.split(".").reduce((result, octet) => {
		return (result << 8) + parseInt(octet);
	}, 0);
};

/**
 * Makes JSON parse error messages more descriptive
 * @param  {Object} error The error object
 */
const getJSONErrorMessage = (error) => {
	let message = error.message;
	let startIndex = message.lastIndexOf("position");
	if (startIndex != -1) {
		// Make error message more descriptive
		let posNumberStr = message.substring(startIndex + "position".length).trim();
		let posNumber = parseInt(posNumberStr);

		if (Number.isNaN(posNumber) == false) {
			let lineNumber = 1;
			let lineBreakPos = error.body.indexOf("\n");
			let prevLineBreakPos = 0;
			while (lineBreakPos <= posNumber && lineBreakPos != -1) {
				lineNumber++;
				prevLineBreakPos = lineBreakPos;
				lineBreakPos = error.body.indexOf("\n", lineBreakPos + 1);
			}

			let msg =
				message.substring(0, startIndex - 3) +
				"near line " +
				lineNumber.toString() +
				" position " +
				(posNumber - prevLineBreakPos).toString();

			message = msg;
		}
	}

	return message;
};

/**
 * Generate a new unique MongoDB identifier
 * @param  {string} id The string representation of a MongoDB id
 */
const generateId = (id = null) => {
	if (id && typeof id === "string") return new mongo.ObjectId(id);
	else if (id instanceof mongo.ObjectId) return id;
	else return new mongo.ObjectId();
};

/**
 * Returns an ObjectId object
 * @param  {string} idString The string representation of the id
 */
function objectId(idString) {
	try {
		return new mongo.ObjectId(idString);
	} catch (err) {
		return null;
	}
}

/**
 * Checks if the id is a valid MongoDB identifer or not
 * @param  {string} id The identifer to check
 */
function isValidId(id) {
	if (!id) return false;

	try {
		const objId = objectId(id);
		if (objId && mongo.ObjectId.isValid(objId)) {
			if (objId.toString() === id.toString()) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	} catch (err) {
		return false;
	}
}

/**
 * Bind console ouptput to send realtime messages to the client during debug mode
 * @param  {string} debugChannel The debug channel unique id for realtime messages
 * @param  {string} id The id of the object generating this log e.g., the id of the endpoint, queue or cron job object
 * @param  {string} objectType The type of the object generating this log can be either "endpoint", "queue", "task"
 */
function turnOnLogging(debugChannel, id, objectType) {
	// Register the original console methods
	console.stdlog = console.log.bind(console);
	console.stderror = console.error.bind(console);
	console.stdinfo = console.info.bind(console);
	console.stddebug = console.debug.bind(console);
	console.stdwarn = console.warn.bind(console);

	const debugLogger = (type, debugChannel, id, objectType) => {
		return function () {
			var args = [];
			Array.from(arguments).forEach((arg) => {
				if (arg instanceof Object || Array.isArray(arg)) {
					args.push(JSON.stringify(arg));
				} else {
					args.push(arg);
				}
			});

			sendMessage(debugChannel, {
				timestamp: new Date().toISOString(),
				action: "log",
				type: type,
				object: objectType,
				id: id,
				message: args.join(" "),
			});
		};
	};

	// Override the console output methods
	console.log = debugLogger("log", debugChannel, id, objectType);
	console.info = debugLogger("info", debugChannel, id, objectType);
	console.debug = debugLogger("debug", debugChannel, id, objectType);
	console.error = debugLogger("error", debugChannel, id, objectType);
	console.warn = debugLogger("warn", debugChannel, id, objectType);
}

/**
 * Bind console ouptput its original methods
 */
function turnOffLogging() {
	console.log = console.stdlog;
	console.error = console.stderror;
	console.debug = console.stddebug;
	console.warn = console.stdwarn;
	console.info = console.stdinfo;
}

/**
 * Returns a random integer between min and max
 * @param  {integer} min
 * @param  {integer} max
 */
function randomInt(min, max) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Converts array of key-value objets to query string format e.g. key1=value1&key2=value2
 * @param  {Array} keyValuePairs Array of key-value pair objects
 */
function getQueryString(keyValuePairs) {
	if (!keyValuePairs || keyValuePairs.length === 0) return "";

	// Convert the array to an object
	const obj = {};
	keyValuePairs.forEach((item) => {
		obj[item.key] = item.value;
	});

	return querystring.stringify(obj);
}

/**
 * Converts array of key-value objets to an object {key1:value1, key2:value2}
 * @param  {Array} keyValuePairs Array of key-value pair objects
 */
function getAsObject(keyValuePairs) {
	if (!keyValuePairs || keyValuePairs.length === 0) return {};

	// Convert the array to an object
	const obj = {};
	keyValuePairs.forEach((item) => {
		obj[item.key] = item.value;
	});

	return obj;
}

/**
 * Decrypts the encrypted text and returns the decrypted string value
 * @param  {string} ciphertext The encrypted input text
 */
function decryptText(cipherText) {
	const bytes = cyripto.AES.decrypt(cipherText, process.env.PASSPHRASE);
	return bytes.toString(cyripto.enc.Utf8);
}

/**
 * Decrypt resource access settings
 * @param  {Object} access The encrypted access settings needed to connect to the resource
 */
function decryptSensitiveData(access) {
	if (Array.isArray(access)) {
		let list = [];
		access.forEach((entry) => {
			list.push(decryptSensitiveData(entry));
		});

		return list;
	}

	let decrypted = {};
	for (const key in access) {
		const value = access[key];
		if (Array.isArray(value)) {
			decrypted[key] = value.map((entry) => {
				if (entry && typeof entry === "object")
					return decryptSensitiveData(entry);
				if (entry && typeof entry === "string") return decryptText(entry);
				else return entry;
			});
		} else if (typeof value === "object" && value !== null) {
			decrypted[key] = decryptSensitiveData(value);
		} else if (value && typeof value === "string")
			decrypted[key] = decryptText(value);
		else decrypted[key] = value;
	}

	return decrypted;
}

/**
 * Removes leading slash character from input string.
 * @export
 * @param {string} str  The string to revove leading slash
 * @returns Trailed string
 */
function removeLeadingSlash(str) {
	return str.replace(/\/$/, "");
}

/**
 * Removes leading and trailing slash charactesr from input string.
 * @export
 * @param {string} str  The string to revove leading and trailing slashes
 * @returns Trailed string
 */
function removeLeadingAndTrailingSlash(str) {
	return str.replace(/^\/+|\/+$/g, "");
}

// Handle exceptions in route handlers
function handleError(req, res, error) {
	let entry = {
		code: ERROR_CODES.internalServerError,
		name: error.name,
		message: error.message,
		stack: error.stack,
	};

	if (error.name === "CastError") {
		entry.error = t("Not Found");
		entry.details = t("The object identifier is not recognized.");
		res.status(400).json(entry);
	} else {
		entry.error = t("Internal Server Error");
		entry.details = t(
			"The server has encountered a situation it does not know how to handle."
		);
		res.status(500).json(entry);
	}

	// Log also the error message in console
	logger.error(JSON.stringify(entry, null, 2));
}

/**
 * Returns the date representation of the input string. If string cannot be parsed to valid date returns null.
 * @param {string} str  The string to parse into a date value
 * @returns Date value
 */
function getDtmFromString(str) {
	let date = null;

	if (!str) return null;
	str = str.toString().trim();

	try {
		date = DateTime.fromISO(str);
	} catch (err) {
		date = null;
	}

	if (!date || !date.isValid) {
		try {
			date = DateTime.fromRFC2822(str);
		} catch (err) {
			date = null;
		}
	}

	if (!date || !date.isValid) {
		try {
			const millis = Date.parse(str);
			const tempDate = new Date(millis);
			date = DateTime.fromJSDate(tempDate);
		} catch (err) {
			date = null;
		}
	}

	if (!date || !date.isValid) {
		try {
			date = DateTime.fromMillis(parseInt(str, 10));
		} catch (err) {
			date = null;
		}
	}

	if (!date || !date.isValid) return null;
	else return date;
}

/**
 * Parses the input string and returns it in time format if valid otherwise returns null
 * @returns Parsed time value or null
 */
function getTimeFromString(str) {
	let date = null;

	if (!str) return null;
	str = str.toString().trim();

	try {
		date = DateTime.fromISO(str);
	} catch (err) {
		date = null;
	}

	if (!date || !date.isValid) return null;

	const timePortion = date.toFormat("HH:mm:ss.SSS");
	return timePortion;
}

/**
 * Returns the decimal resresentaion of inf put value
 * @param {number} value The input number
 * @returns Decimal value
 */
function createDecimal(value) {
	return new Decimal(value);
}

/**
 * Checks if the value is a valid email address or not
 * @returns True if it is an email otherwise false
 */
function isEmail(str) {
	return validator.isEmail(str);
}

/**
 * Checks if the value is a valid URL or not
 * @returns True if it is a URL otherwise false
 */
function isLink(str) {
	return validator.isURL(str, { require_tld: false, require_protocol: true });
}

/**
 * Checks if the value is a valid mobile phone number or not
 * @returns True if it is a valid mobile phone number otherwise false
 */
function isMobilePhone(str) {
	return validator.isMobilePhone(str, null, { strictMode: true });
}

/**
 * Encrypts the input text
 * @returns Enrypted text
 */
async function encryptText(text) {
	// Encrypt field value, this consumes some good time of compute resurces
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(text, salt);
}

export default {
	generateSlug,
	generateFileName,
	createErrorMessage,
	getIP,
	isAuthorizedIP,
	getJSONErrorMessage,
	generateId,
	objectId,
	isValidId,
	turnOnLogging,
	turnOffLogging,
	randomInt,
	getQueryString,
	getAsObject,
	decryptSensitiveData,
	removeLeadingSlash,
	removeLeadingAndTrailingSlash,
	handleError,
	getDtmFromString,
	getTimeFromString,
	createDecimal,
	isEmail,
	isLink,
	isMobilePhone,
	encryptText,
};
