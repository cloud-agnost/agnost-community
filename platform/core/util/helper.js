import mongoose from "mongoose";
import randomColor from "randomcolor";
import { customAlphabet } from "nanoid";
import cyripto from "crypto-js";
import querystring from "querystring";
import CIDR from "ip-cidr";

const constants = {
	"1hour": 3600, // in seconds
	"2hours": 7200, // in seconds
	"1day": 86400, // in seconds
	"1week": 604800, // in seconds
	"1month": 2592000, // in seconds (30 days)
	"6months": 15552000, // in seconds (180 days)
	"1year": 31536000, // in seconds (365 days)
};

/**
 * Check whether the input value is a JS objet or not
 * @param  {object} input
 */
function isObject(value) {
	if (typeof value === "object" && !Array.isArray(value) && value !== null)
		return true;

	return false;
}

/**
 * Check whether the input json object is empty or not. If a json object is {} this function returns true
 * @param  {object} input
 */
function isEmptyJson(input) {
	for (let i in input) return false;
	return true;
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
 * Generates a random color for avatar backgrounds
 */
function generateColor(luminosity = "dark") {
	return randomColor({ luminosity });
}

/**
 * Generates a hihg probability unique slugs
 * @param  {string} prefix The prefix prepended to the slug
 * @param  {string} prefix The length of the slug excluding the prefix
 */
function generateSlug(prefix, length = 12) {
	// Kubernetes resource names need to be alphanumeric and in lowercase letters
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
	const nanoid = customAlphabet(alphabet, length);
	return `${prefix}-${nanoid()}`;
}

/**
 * Generate a new unique MongoDB identifier
 */
function generateId() {
	return new mongoose.Types.ObjectId().toString();
}

/**
 * Returns an ObjectId object
 * @param  {string} idString The string representation of the id
 */
function objectId(idString) {
	return new mongoose.Types.ObjectId(idString);
}

/**
 * Checks if the id is a valid MongoDB identifer or not
 * @param  {string} id The identifer to check
 */
function isValidId(id) {
	if (!id) return false;

	try {
		if (mongoose.Types.ObjectId.isValid(id)) {
			if (mongoose.Types.ObjectId(id).toString() === id.toString()) {
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
 * Get the IP number of requesting client
 * @param  {object} req HTTP request object
 */
function getDateStr(dtmStr) {
	function padTo2Digits(num) {
		return num.toString().padStart(2, "0");
	}

	let dtm = new Date(dtmStr);
	return [
		dtm.getFullYear(),
		padTo2Digits(dtm.getMonth() + 1),
		padTo2Digits(dtm.getDate()),
	].join("-");
}

/**
 * Builds the url by adding the query params to the url string. Returns the new URL string
 * @param  {string} url The url string
 * @param  {object} queryParams Key value pairs that will be appended to url
 */
function appendQueryParams(url, queryParams) {
	const urlObj = new URL(url);
	for (const key in queryParams) {
		let value = queryParams[key];
		urlObj.searchParams.append(key, value);
	}

	return urlObj.href;
}

/**
 * Encrypts the input text and returns the encrypted string value
 * @param  {string} text The input text to encrypt
 */
function encryptText(text) {
	return cyripto.AES.encrypt(text, process.env.PASSPHRASE).toString();
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
 * Encrtypes sensitive connection data
 * @param  {Object} access The connection settings needed to connect to the resource
 */
function encyrptSensitiveData(access) {
	if (Array.isArray(access)) {
		let list = [];
		access.forEach((entry) => {
			list.push(encyrptSensitiveData(entry));
		});

		return list;
	}

	let encrypted = {};
	for (const key in access) {
		const value = access[key];
		if (Array.isArray(value)) {
			encrypted[key] = value.map((entry) => {
				if (entry && typeof entry === "object")
					return encyrptSensitiveData(entry);
				if (entry && typeof entry === "string") return encryptText(entry);
				else return entry;
			});
		} else if (typeof value === "object" && value !== null) {
			encrypted[key] = encyrptSensitiveData(value);
		} else if (value && typeof value === "string")
			encrypted[key] = encryptText(value);
		else encrypted[key] = value;
	}

	return encrypted;
}

/**
 * Decrypt connection data
 * @param  {Object} access The encrypted connection settings needed to connect to the resource
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
 * Checks whether the domain provided is in correct format or not. Supports also wildcard domains. The domain name needs to start with http:// or https://.
 * The first item after the protocal can be wildcard *. Supported domain examples:
 * "http://example.com"
 * "https://www.example.com"
 * "https://*.mydomain.com"
 * "https://sub1.sub2.sub3.main.com"
 * "https://*.sub1.sub2.sub3.main.com:4000"
 * "http://localhost"
 * "http://localhost:3000"
 *
 * @param  {string} domain The domain name
 */
function isValidDomain(domain) {
	// Regular expression to match the URL structure
	const domainPattern =
		/^(https?:\/\/)?(\*\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+(:\d{2,5})?(\/[a-zA-Z0-9-_.\/?%&=]*)?$/;

	// Additional check for http://localhost
	const localhostPattern = /^https?:\/\/localhost(:\d{2,5})?$/;

	// Check if the domain matches the pattern
	return domainPattern.test(domain) || localhostPattern.test(domain);
}

/**
 * Checks whether the address provided is a valid IP address or IP address range in CIDR notation. Examples below:
 * "50.165.190.0/23"
 * "192.168.0.1"
 *
 * @param  {string} address The IPv4 address or address range in CIDR notation
 */
function isValidIPAddress(address) {
	return CIDR.isValidAddress(address);
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

export default {
	constants,
	isObject,
	isEmptyJson,
	getIP,
	generateColor,
	generateSlug,
	generateId,
	objectId,
	isValidId,
	getDateStr,
	appendQueryParams,
	encryptText,
	decryptText,
	encyrptSensitiveData,
	decryptSensitiveData,
	isValidDomain,
	isValidIPAddress,
	getQueryString,
	getAsObject,
};
