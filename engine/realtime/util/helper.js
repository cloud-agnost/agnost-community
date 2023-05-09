import axios from "axios";
import ERROR_CODES from "../config/errorCodes.js";

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

export const errorMessage = (obj, code, client = true, details = undefined) => {
	let err = new Error(obj.error);
	err.data = {
		origin: client ? ERROR_CODES.clientError : ERROR_CODES.serverError,
		code: code,
		message: obj.details,
		details: details,
	};
	return err;
};

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

export default {
	getIP,
	errorMessage,
	isAuthorizedIP,
};
