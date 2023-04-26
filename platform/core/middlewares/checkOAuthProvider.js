import authCtrl from "../controllers/auth.js";
import ERROR_CODES from "../config/errorCodes.js";

export const checkOAuthProvider = async function (req, res, next) {
	// Get provicer name from request params
	let providerName = req.params.provider;

	if (!providerName) {
		return res.status(400).json({
			error: t("No OAuth Provider Found"),
			details: t("An OAuth provider needs to be specified in request URL."),
			code: ERROR_CODES.noOAuthProvider,
		});
	}

	// Check if provider is supported or not
	if (!authCtrl.getSupportedProviders().includes(providerName)) {
		return res.status(400).json({
			error: t("Unsupported OAuth Provider"),
			details: t(
				"The specified OAuth provider '%s' is not supported.",
				req.params.provider
			),
			code: ERROR_CODES.noOAuthProviderConfig,
		});
	}

	// Set the provider information
	req.provider = authCtrl.getProviderConfig(providerName);
	next();
};
