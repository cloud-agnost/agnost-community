import net from "net";
import ERROR_CODES from "../config/errorCodes.js";

export const checkApiKey = async function (socket) {
	// If the socket is connected from an engine (API server) pod then bypass middlewares
	if (socket.data.master) {
		return false;
	}

	const realtimeConfig = socket.temp.realtimeConfig;
	// If API key is not required then bypass the api key check
	if (!realtimeConfig.apiKeyRequired) {
		return false;
	}

	// Get the API key from the socket handshake, if not API key provided then return an error message
	const apiKey = socket.handshake.auth.apiKey;
	if (!apiKey || !apiKey.trim()) {
		socket.disconnect(true);
		return helper.errorMessage(
			{
				error: t("Realtime Connection Error - Missing API Key"),
				details: t("A valid API Key needs to be provided"),
			},
			ERROR_CODES.missingApiKey
		);
	}

	// Get the list of the API keys of the app version
	const apiKeys = socket.temp.apiKeys;
	// If no API keys specified for the version then return erro message
	if (!apiKeys || apiKeys.length === 0) {
		socket.disconnect(true);
		return helper.errorMessage(
			{
				error: t("Realtime Connection Error - Invalid API Key"),
				details: t(
					"Application version does not have such an API Key (%s)",
					apiKey
				),
			},
			ERROR_CODES.invalidApiKey
		);
	}

	// Find the api key object
	let apiKeyObj = null;
	for (let i = 0; i < apiKeys.length; i++) {
		const entry = apiKeys[i];
		if (entry.key === apiKey) {
			apiKeyObj = entry;
			break;
		}
	}

	// Check if the provided API key is a valid one or not
	if (!apiKeyObj) {
		socket.disconnect(true);
		return helper.errorMessage(
			{
				error: t("Realtime Connection Error - Invalid API Key"),
				details: t(
					"Application version does not have such an API key (%s)",
					apiKey
				),
			},
			ERROR_CODES.invalidApiKey
		);
	}

	if (!apiKeyObj.allowRealtime) {
		socket.disconnect(true);
		return helper.errorMessage(
			{
				error: t("Realtime Connection Error - Unauthorized API Key"),
				details: t(
					"The API key (%s) is not authorized for realtime service usage.",
					apiKey
				),
			},
			ERROR_CODES.unauthorizezApiKey
		);
	}

	// Check if the api key requires authorized domains and if yes the request origin is from a valid domain
	if (apiKeyObj.domainAuthorization === "specified") {
		let origin = socket.handshake.headers?.origin;
		if (origin && apiKeyObj.authorizedDomains.includes(origin) === false) {
			socket.disconnect(true);
			return helper.errorMessage(
				{
					error: t("Realtime Connection Error - Origin Domain Not Authorized"),
					details: t("Origin domain '%s' is not an authorized domain", origin),
				},
				ERROR_CODES.domainNotAuthorized
			);
		}
	}

	// Check if the api key requires authorized IP addresses or adress ranges and if yes the request IP is from a valid IP address
	if (apiKeyObj.IPAuthorization === "specified") {
		let clientIP = socket.handshakeaddress;
		// If the IP address is in IPv6 format, convert it to IPv4 format
		clientIP = clientIP
			? net.isIPv4(clientIP)
				? clientIP.substring(7)
				: clientIP
			: null;

		if (
			clientIP &&
			helper.isAuthorizedIP(clientIP, apiKeyObj.authorizedIPs) === false
		) {
			socket.disconnect(true);
			return helper.errorMessage(
				{
					error: t("Realtime Connection Error - IP Address Authorized"),
					details: t("IP address '%s' is not whitelisted", clientIP),
				},
				ERROR_CODES.IPNotAuthorized
			);
		}
	}

	// Store temporary data which will be deleted at the last step
	socket.temp.apiKey = apiKeyObj;
	return false;
};

export const checkApiKey2 =
	(socket) =>
	async ([event, ...args], next) => {
		return await checkApiKey(socket);
	};
