const ERROR_CODES = {
	clientError: "client_error",
	serverError: "server_error",
	suspendedEnvironment: "suspended_environment",
	noEnvironment: "no_environment_found",
	missingApiKey: "missing_api_key",
	invalidApiKey: "invalid_api_key",
	expiredAPIKey: "expired_api_key",
	unauthorizezApiKey: "unauthorizez_api_key",
	domainNotAuthorized: "domain_not_authorized",
	missingClientIP: "missing_client_IP",
	IPNotAuthorized: "ip_not_authorized",
	missingRequestOrigin: "missing_request_origin",
	realtimeNotAllowed: "realtime_not_allowed",
	missingSessionAccessToken: "missing_session_access_token",
	invalidSessionAccessToken: "invalid_session_access_token",
	internalServerError: "internal_server_error",
	missingAccessToken: "missing_access_token",
	invalidCredentials: "invalid_credentials",
	invalidContentType: "invalid_content_type",
	invalidRequestBody: "invalid_request_body",
	rateLimitExceeded: "rate_limit_exceeded",
	resourceNotFound: "resource_not_found",
};
export default ERROR_CODES;
