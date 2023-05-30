import mongo from "mongodb";

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
 * Returns a random integer between min and max
 * @param  {integer} min
 * @param  {integer} max
 */
function randomInt(min, max) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate a new unique MongoDB identifier
 * @param  {string} id The string representation of a MongoDB id
 */
const generateId = (id = null) => {
	if (id && typeof id === "string") return new mongo.ObjectID(id);
	else if (id instanceof mongo.ObjectID) return id;
	else return new mongo.ObjectID();
};

export default { randomInt, generateId, getIP };
