import axios from "axios";
import mongo from "mongodb";
import querystring from "querystring";
import ERROR_CODES from "../config/errorCodes.js";

const constants = {
	"1hour": 3600, // in seconds
	"1day": 86400, // in seconds
	"1week": 604800, // in seconds
	"1month": 2592000, // in seconds (30 days)
	"6months": 15552000, // in seconds (180 days)
	"1year": 31536000, // in seconds (365 days)
};

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
 * Handle exceptions in route handlers
 * @param  {object} req Express request object
 * @param  {object} res Express response object
 * @param  {object} error Error object
 */
function handleError(req, res, error) {
	let entry = {
		source: "engine-worker",
		type: "worker",
		code: ERROR_CODES.internalServerError,
		name: error.name,
		message: error.message,
		stack: error.stack,
	};

	if (error.name == "CastError") {
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
	logger.info(JSON.stringify(entry, null, 2));

	//Make api call to the platform to log the error message
	axios
		.post(config.get("general.platformBaseUrl") + "/v1/engine/error", entry, {
			headers: {
				Authorization: process.env.MASTER_TOKEN,
				"Content-Type": "application/json",
			},
		})
		.catch((error) => {});
}

/**
 * Generate a new unique MongoDB identifier
 */
function generateId() {
	return new mongo.ObjectID();
}

/**
 * Returns an ObjectId object
 * @param  {string} idString The string representation of the id
 */
function objectId(idString) {
	return new mongo.ObjectID(idString);
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
	randomInt,
	getIP,
	handleError,
	generateId,
	objectId,
	getQueryString,
	getAsObject,
};
