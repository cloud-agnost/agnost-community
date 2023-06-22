import cyripto from "crypto-js";
import { customAlphabet } from "nanoid";
import mongo from "mongodb";
import querystring from "querystring";
import { sendMessage } from "../init/sync.js";

/**
 * Generates a hihg probability unique slugs
 * @param  {string} prefix The prefix prepended to the slug
 * @param  {string} prefix The length of the slug excluding the prefix
 */
function generateSlug(length = 5) {
	// Kubernetes resource names need to be alphanumeric and in lowercase letters
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
	const nanoid = customAlphabet(alphabet, length);
	return nanoid();
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
	if (id && typeof id === "string") return new mongo.ObjectID(id);
	else if (id instanceof mongo.ObjectID) return id;
	else return new mongo.ObjectID();
};

/**
 * Returns an ObjectId object
 * @param  {string} idString The string representation of the id
 */
function objectId(idString) {
	return new mongo.ObjectID(idString);
}

/**
 * Bind console ouptput to send realtime messages to the client during debug mode
 * @param  {string} debugChannel The debug channel unique id for realtime messages
 */
function turnOnLogging(debugChannel) {
	// Register the original console methods
	console.stdlog = console.log.bind(console);
	console.stderror = console.error.bind(console);
	console.stdinfo = console.info.bind(console);
	console.stddebug = console.debug.bind(console);
	console.stdwarn = console.warn.bind(console);

	const debugLogger = (type, debugChannel) => {
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
				type: type,
				message: args.join(" "),
			});
		};
	};

	// Override the console output methods
	console.log = debugLogger("log", debugChannel);
	console.info = debugLogger("info", debugChannel);
	console.debug = debugLogger("debug", debugChannel);
	console.error = debugLogger("error", debugChannel);
	console.warn = debugLogger("warn", debugChannel);
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

export default {
	generateSlug,
	generateFileName,
	createErrorMessage,
	getIP,
	isAuthorizedIP,
	getJSONErrorMessage,
	generateId,
	objectId,
	turnOnLogging,
	turnOffLogging,
	randomInt,
	getQueryString,
	getAsObject,
	decryptSensitiveData,
};
