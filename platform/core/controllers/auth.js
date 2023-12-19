import parser from "ua-parser-js";
import { setKey, getKey, deleteKey, expireKey } from "../init/cache.js";

/**
 * Create a new 6-digit email validation code and stores it in cache
 * @param  {string} email
 */
const createValidationCode = async (email) => {
	// Create the 6-digit email validation code
	let code = Math.floor(100000 + Math.random() * 900000).toString();
	// Cache the email validation code, use the email as the cache key
	// The code expiry is also specified in seconds
	await setKey(email, code, config.get("session.validationCodeExpiry"));

	return code;
};

/**
 * Returns the email validation code associtated with the email from the cache
 * @param  {string} email
 */
const getValidationCode = async (email) => {
	return await getKey(email);
};

/**
 * Deletes the validation code in cache
 * @param  {string} email
 */
const deleteValidationCode = async (email) => {
	return await deleteKey(email);
};

/**
 * Creates a new session for the user login, returns the sesson access-token and refresh-token
 * @param  {string} email
 * @param  {string} ip IP address of the client
 * @param  {string} userAgent User-agent strng retrieved from request header
 */
const createSession = async (userId, ip, userAgent, provider) => {
	let at = helper.generateSlug("at", 36);
	let rt = helper.generateSlug("rt", 36);
	var ua = parser(userAgent);

	let dtm = new Date();
	// Set access token
	await setKey(
		at,
		{
			userId,
			provider,
			ip,
			createdAt: dtm.toISOString(),
			expiresAt: new Date(
				dtm.valueOf() + config.get("session.accessTokenExpiry") * 1000
			).toISOString(),
			ua,
			rt,
		},
		config.get("session.accessTokenExpiry")
	);

	// Set refresh token
	await setKey(
		rt,
		{
			userId,
			at,
			provider,
			createdAt: dtm.toISOString(),
			expiresAt: new Date(
				dtm.valueOf() + config.get("session.refreshTokenExpiry") * 1000
			).toISOString(),
		},
		config.get("session.refreshTokenExpiry")
	);

	return { at, rt };
};

/**
 * Invalidates (deletes) the session and also associated refresh token
 * @param  {object} session The session object to invalidate
 */
const deleteSession = async (session) => {
	await deleteKey(session.at);
	// We do not immediately delte the refresh token, since there can be parallel request to this refresh token
	// Just set its expiry to some seconds later
	await expireKey(session.rt, config.get("session.refreshTokenDelete"));
};

/**
 * Returns the list of supported oAuth providers
 */
const getSupportedProviders = () => {
	return providers.map((entry) => entry.name.toLowerCase());
};

/**
 * Returns the configuration for the specified oAuth provider
 * @param  {string} name The name of the provider
 */
const getProviderConfig = (name) => {
	return providers.find((entry) => entry.name === name);
};

export default {
	createValidationCode,
	getValidationCode,
	deleteValidationCode,
	createSession,
	deleteSession,
	getSupportedProviders,
	getProviderConfig,
};
