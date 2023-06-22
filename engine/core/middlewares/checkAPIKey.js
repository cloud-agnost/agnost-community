import net from "net";
import ERROR_CODES from "../config/errorCodes.js";

// Middleware to check whether a valid API key is provided. If API key also has authorized domains or IP addresses also checks these values
export const checkAPIKey = (endpoint) => (req, res, next) => {
	// Get API key from header
	let apiKey = req.header("Authorization");
	// If api key is not provided in the header check the query string parameter
	if (!apiKey) {
		apiKey = req.query.apikey;
	}

	if (!apiKey) {
		return res
			.status(401)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingAPIKey,
					t(
						"No API Key was found in 'Authorization' header or 'apikey' query parameter."
					)
				)
			);
	}

	// Get the defined API keys of the version
	const { apiKeys } = META.getVersion();
	// Check if provided API key is valid or not
	const apiKeyObj = apiKeys.find((entry) => entry.key === apiKey);
	if (!apiKeyObj) {
		return res
			.status(401)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.invalidAPIKey,
					t("API key is not valid, application does not have such a key.")
				)
			);
	}

	// Check if key has expiry date and if it is expired or not
	if (apiKeyObj.expiryDate) {
		let expiryDate = new Date(apiKeyObj.expiryDate);

		if (Date.now() > expiryDate) {
			return res
				.status(403)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.expiredAPIKey,
						t(
							"API key is expired, no request can be processed with this API key until its expiry date is extended."
						)
					)
				);
		}
	}

	// Check whether this endpoint is allowed by the API key or not
	switch (apiKeyObj.type) {
		case "full-access":
			break;
		case "no-access":
			return res
				.status(401)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.endpointsNotAllowed,
						t("API key does not allow calling endpoints.")
					)
				);
		case "custom-allowed":
			if (!apiKeyObj.allowedEndpoints.includes(endpoint.iid)) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.endpointNotAllowed,
							t(
								"Endpoint '%s - %s' is not allowed with the provided API key.",
								endpoint.method,
								endpoint.path
							)
						)
					);
			}
			break;
		case "custom-excluded":
			if (apiKeyObj.excludedEndpoints.includes(endpoint.iid)) {
				return res
					.status(401)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.endpointNotAllowed,
							t(
								"Endpoint '%s - %s' is not allowed with the provided API key.",
								endpoint.method,
								endpoint.path
							)
						)
					);
			}
			break;
	}

	// Check if the api key requires authorized domains and if yes check whether the request origin is from a valid domain
	if (apiKeyObj.domainAuthorization === "specified") {
		let origin = req.header("origin");
		if (!origin) {
			let host = req.get("host");
			if (host && req.protocol) origin = req.protocol + "://" + host;
		}

		// Request doesn't have an origin header
		if (!origin) {
			return res
				.status(401)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.missingRequestOrigin,
						t(
							"The proviced API key requires authorized domain control but request does not have a origin header to check against whitelisted domains."
						)
					)
				);
		}

		const { authorizedDomains } = apiKeyObj;
		// Check if the origin is in the allowed domains list
		const isAllowedDomain = authorizedDomains.some((domain) => {
			if (domain.startsWith("http://*.") || domain.startsWith("https://*.")) {
				// Wildcard subdomain match
				const regex = new RegExp(
					`^[^.]+\\.${allowedDomain.substr(2).replace(".", "\\.")}$`,
					"i"
				);
				return regex.test(origin);
			} else {
				// Exact domain match
				return origin === domain;
			}
		});

		if (!isAllowedDomain) {
			return res
				.status(401)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.domainNotAuthorized,
						t(
							"Origin domain '%s' is not an authorized domain that can send requests to endpoints.",
							origin
						)
					)
				);
		}
	}

	// Check if the api key requires authorized IP addresses or adress ranges and if yes the request IP is from a valid IP address
	if (apiKeyObj.IPAuthorization === "specified") {
		let clientIP = helper.getIP(req);
		// If the IP address is in IPv6 format, convert it to IPv4 format
		clientIP = clientIP
			? net.isIPv4(clientIP)
				? clientIP
				: clientIP.substring(7)
			: null;

		// Request doesn't have an origin header
		if (!clientIP) {
			return res
				.status(401)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.missingClientIP,
						t(
							"The proviced API key requires authorized IP address control but request does not have an IP address to check against whitelisted IP addresses."
						)
					)
				);
		}

		if (helper.isAuthorizedIP(clientIP, apiKeyObj.authorizedIPs) === false) {
			return res
				.status(401)
				.json(
					helper.createErrorMessage(
						ERROR_CODES.clientError,
						ERROR_CODES.IPNotAuthorized,
						t(
							"Client IP '%s' is not an authorized IP address that can send requests to endpoints.",
							clientIP
						)
					)
				);
		}
	}

	// Everthing looks fine, proceed to the next step
	next();
};
