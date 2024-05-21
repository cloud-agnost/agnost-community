import axios from "axios";
import mongoose from "mongoose";
import net from "net";
import randomColor from "randomcolor";
import { customAlphabet } from "nanoid";
import cyripto from "crypto-js";
import querystring from "querystring";
import CIDR from "ip-cidr";
import tcpProxyPortCtrl from "../controllers/tcpProxyPort.js";
import { getKey, setKey, incrementKey, deleteKey } from "../init/cache.js";

const constants = {
	"1hour": 3600, // in seconds
	"2hours": 7200, // in seconds
	"1day": 86400, // in seconds
	"1week": 604800, // in seconds
	"1month": 2592000, // in seconds (30 days)
	"3months": 7776000, // in seconds (90 days)
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
 * @param  {string} length The length of the slug excluding the prefix
 */
function generateSlug(prefix, length = 12) {
	// Kubernetes resource names need to be alphanumeric and in lowercase letters
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
	const nanoid = customAlphabet(alphabet, length);
	return `${prefix}-${nanoid()}`;
}

/**
 * Generates a random password
 * @param  {string} length The length of the slug excluding the prefix
 */
function generatePassword(length = 16) {
	// Kubernetes resource names need to be alphanumeric and in lowercase letters
	const alphabet =
		"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const nanoid = customAlphabet(alphabet, length);
	return nanoid();
}

/**
 * Generates a random username
 * @param  {string} length The length of the slug excluding the prefix
 */
function generateUsername(length = 16) {
	// Kubernetes resource names need to be alphanumeric and in lowercase letters
	// No uppercase letters since rabbitmq requires lowercase alphanumeric characters
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
	const nanoid = customAlphabet(alphabet, length);
	return nanoid();
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

/**
 * Helper function to convert memory string to bytes
 * @param  {string} memoryStr Memory size such as 500Mi or 1Gi
 */
function memoryToBytes(memoryStr) {
	const value = parseInt(memoryStr, 10);

	if (memoryStr.endsWith("Mi")) {
		return value * Math.pow(2, 20); // Convert mebibytes to bytes
	}

	if (memoryStr.endsWith("Gi")) {
		return value * Math.pow(2, 30); // Convert gibibytes to bytes
	}
}

async function getClusterIPs() {
	try {
		const result = await axios.get(
			helper.getWorkerUrl() + "/v1/resource/cluster-ip",
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
		return result.data;
	} catch (err) {
		logger.error(`Cannot fetch cluster ips`, { details: err });
		return [];
	}
}

/**
 * Checks if the given IP address is a private IP address which are not routable on the internet.
 * Private IP addresses include:
 * - 10.x.x.x
 * - 172.16.x.x - 172.31.x.x
 * - 192.168.x.x
 * - Unique local addresses in IPv6 (fc00::/7)
 *
 * @param {string} ip - The IP address to check.
 * @returns {boolean} Returns true if the IP address is private, otherwise returns false.
 */
function isPrivateIP(ip) {
	const parts = ip.split(".").map((part) => parseInt(part, 10));

	// Check for IPv4 private addresses
	// 10.x.x.x
	if (parts[0] === 10) {
		return true;
	}
	// 172.16.x.x - 172.31.x.x
	if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
		return true;
	}
	// 192.168.x.x
	if (parts[0] === 192 && parts[1] === 168) {
		return true;
	}

	// If IPv6, check for unique local addresses (fc00::/7)
	if (net.isIPv6(ip)) {
		const firstHex = parseInt(ip.substring(0, 4), 16);
		if (firstHex >= 0xfc00 && firstHex < 0xfe00) {
			return true;
		}
	}

	return false;
}

function decryptVersionData(data) {
	if (!data) return data;
	if (Array.isArray(data)) {
		const arrayCopy = JSON.parse(JSON.stringify(data));
		return arrayCopy.map((item) => {
			return decryptVersionData(item);
		});
	}

	if (typeof data === "object") {
		const objectCopy = JSON.parse(JSON.stringify(data));
		if (objectCopy.authentication?.email?.customSMTP?.password) {
			objectCopy.authentication.email.customSMTP.password = decryptText(
				objectCopy.authentication.email.customSMTP.password
			);
		}

		if (objectCopy.authentication?.phone?.providerConfig)
			objectCopy.authentication.phone.providerConfig = decryptSensitiveData(
				objectCopy.authentication.phone.providerConfig
			);

		if (objectCopy.authentication?.providers) {
			objectCopy.authentication.providers.forEach((entry) => {
				entry.config = decryptSensitiveData(entry.config);
			});
		}

		return objectCopy;
	}

	return data;
}

function decryptResourceData(data) {
	if (!data) return data;
	if (Array.isArray(data)) {
		const arrayCopy = JSON.parse(JSON.stringify(data));
		return arrayCopy.map((item) => {
			return decryptResourceData(item);
		});
	}

	if (typeof data === "object") {
		const objectCopy = JSON.parse(JSON.stringify(data));
		if (objectCopy.access) {
			objectCopy.access = decryptSensitiveData(objectCopy.access);
		}

		if (objectCopy.accessReadOnly) {
			objectCopy.accessReadOnly = decryptSensitiveData(
				objectCopy.accessReadOnly
			);
		}

		return objectCopy;
	}

	return data;
}

function getTypedValue(value) {
	if (typeof value !== "string") {
		// If input is not a string, return it as is
		return value;
	}

	if (value === "true") {
		return true;
	} else if (value === "false") {
		return false;
	} else if (value === "null") {
		return null;
	}

	const numberValue = Number(value);
	if (!isNaN(numberValue)) {
		return numberValue;
	}

	// If none of the above conditions are met, return the input string
	return value;
}

function getSyncUrl() {
	return `http://platform-sync-clusterip-service.${process.env.NAMESPACE}.svc.cluster.local:4000`;
}

function getRealtimeUrl() {
	return `http://engine-realtime-clusterip-service.${process.env.NAMESPACE}.svc.cluster.local:4000`;
}

function getPlatformUrl() {
	return `http://platform-core-clusterip-service.${process.env.NAMESPACE}.svc.cluster.local:4000`;
}

function getWorkerUrl() {
	return `http://engine-worker-clusterip-service.${process.env.NAMESPACE}.svc.cluster.local:4000`;
}

function escapeStringRegexp(text) {
	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return text.replace(/[|\\{}()[\]^$+*?.\/]/g, "\\$&").replace(/-/g, "\\x2d");
}

function highlight(text, term, matchCase) {
	const regex = matchCase ? new RegExp(term, "g") : new RegExp(term, "gi");
	return text.replace(regex, (matched) => `<mark>${matched}</mark>`);
}

async function isValidGitProviderAccessToken(accessToken, gitProvider) {
	if (gitProvider === "github") {
		try {
			const result = await axios.get("https://api.github.com/user", {
				headers: { Authorization: `token ${accessToken}` },
			});

			const email = await getGitHubUserEmail(accessToken);

			return {
				valid: true,
				user: {
					providerUserId: result.data.id.toString(),
					username: result.data.login,
					email: email,
					avatar: result.data.avatar_url,
				},
			};
		} catch (error) {
			if (error.response && error.response.status === 401) {
				return { valid: false, error: t("Invalid or expired token.") }; // Token is invalid
			} else {
				return { valid: false, error: error.message }; // Other errors
			}
		}
	}
	return { valid: false, error: t("Unsupported Git repository provider.") };
}

async function getGitHubUserEmail(accessToken) {
	try {
		let result = await axios.get("https://api.github.com/user/emails", {
			headers: {
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "OAuth App",
				Authorization: `token ${accessToken}`,
			},
		});

		if (result.data) {
			for (let i = 0; i < result.data.length; i++) {
				const emeilEntry = result.data[i];
				if (emeilEntry && emeilEntry.primary && emeilEntry.email)
					return emeilEntry.email;
			}
		}
	} catch (err) {}

	return null;
}

async function revokeGitProviderAccessToken(
	provider,
	accessToken,
	refreshToken
) {
	try {
		await axios.post(
			`https://auth.agnost.dev/provider/${provider}/revoke`,
			{ accessToken, refreshToken },
			{
				headers: {
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "OAuth App",
					Authorization: `token ${accessToken}`,
				},
			}
		);
	} catch (err) {}
}

async function getGitProviderRepos(gitProvider) {
	if (gitProvider.provider === "github") {
		try {
			const result = await axios.get("https://api.github.com/user/repos", {
				headers: { Authorization: `token ${gitProvider.accessToken}` },
			});

			return result.data.map((entry) => {
				return {
					repoId: entry.id,
					owner: entry.owner.login,
					repo: entry.name,
					fullName: entry.full_name,
					private: entry.private,
					url: entry.html_url,
				};
			});
		} catch (error) {
			return [];
		}
	}
}

async function getGitProviderRepoBranches(
	gitProvider,
	owner,
	repo,
	maxPages = 100
) {
	if (gitProvider.provider === "github") {
		try {
			let url = `https://api.github.com/repos/${owner}/${repo}/branches?per_page=${maxPages}`;
			const branches = [];
			let pageCount = 0;

			while (url && pageCount < maxPages) {
				const response = await axios.get(url, {
					headers: {
						Authorization: `Bearer ${gitProvider.accessToken}`,
						Accept: "application/vnd.github.v3+json",
					},
				});

				response.data.forEach((branch) => {
					branches.push({ name: branch.name, protected: branch.protected });
				});

				const linkHeader = response.headers.link;
				if (linkHeader) {
					const matches = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
					url = matches ? matches[1] : null;
				} else {
					url = null; // No more pages
				}

				pageCount++;
			}

			return branches;
		} catch (error) {
			return [];
		}
	}
}

async function getNewTCPPortNumber() {
	// First check if we have key value
	const latestPortNumber = await getKey("agnost_tcp_proxy_port_number");
	// Ok we do not have it set it to the latest value
	if (!latestPortNumber) {
		// First check if we have a database entry
		const entry = await tcpProxyPortCtrl.getOneByQuery(
			{},
			{ sort: { port: "desc" } }
		);

		if (entry) {
			// Set the latest port number to the latest value
			await setKey("agnost_tcp_proxy_port_number", entry.port);
		} else {
			// Set the latest port number to the latest value
			await setKey(
				"agnost_tcp_proxy_port_number",
				config.get("general.tcpProxyPortStart")
			);
		}
	}

	const newPortNumber = await incrementKey("agnost_tcp_proxy_port_number", 1);
	// Save new port number to database
	await tcpProxyPortCtrl.create({ port: newPortNumber });
	return newPortNumber;
}

export default {
	constants,
	isObject,
	isEmptyJson,
	getIP,
	generateColor,
	generateSlug,
	generatePassword,
	generateUsername,
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
	memoryToBytes,
	getClusterIPs,
	isPrivateIP,
	decryptVersionData,
	decryptResourceData,
	getTypedValue,
	getSyncUrl,
	getRealtimeUrl,
	getPlatformUrl,
	getWorkerUrl,
	escapeStringRegexp,
	highlight,
	isValidGitProviderAccessToken,
	getGitHubUserEmail,
	revokeGitProviderAccessToken,
	getGitProviderRepos,
	getGitProviderRepoBranches,
	getNewTCPPortNumber,
};
