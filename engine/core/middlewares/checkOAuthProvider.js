import ERROR_CODES from "../config/errorCodes.js";

export const checkOAuthProvider = async function (req, res, next) {
	let providerName = req.params.provider;
	if (!providerName) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.noOAuthProvider,
					t("An OAuth provider needs to be specified in request URL.")
				)
			);
	}

	const providers = getConfiguredOAuthProviders();
	if (providers.length === 0) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.noOAuthProviderConfig,
					t(
						"No OAuth provider is configured in app version authentication settings."
					)
				)
			);
	}

	// Convert provider name to lowercase letters
	providerName = providerName.toLowerCase();
	if (!getSupportedProviders().includes(providerName)) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.unsupportedOAuthProvider,
					t(
						"The specified OAuth provider (%s) is not supported.",
						req.params.provider
					)
				)
			);
	}

	const provider = providers.find((entry) => entry.name === providerName);
	if (!provider) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.OAuthProviderNotConfigured,
					t(
						"The OAuth provider specified (%s) in request URL cannot be matched to any configured OAuth providers (%s).",
						req.params.provider,
						providers.map((entry) => entry.name).join(", ")
					)
				)
			);
	}

	// Set the provider information
	req.provider = provider;
	next();
};

function getConfiguredOAuthProviders() {
	const providers = [];
	const { authentication } = META.getVersion();

	for (const entry of authentication.providers) {
		providers.push({
			name: entry.provider,
			settings: helper.decryptSensitiveData(entry.config),
		});
	}

	return providers;
}

function getSupportedProviders() {
	return ["google", "facebook", "twitter", "apple", "discord", "github"];
}
