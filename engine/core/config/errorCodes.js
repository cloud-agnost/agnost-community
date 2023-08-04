const ERROR_CODES = {
	clientError: "client_error",
	serverError: "server_error",
	internalServerError: "internal_server_error",
	resourceNotFound: "resource_not_found",
	serverNotReady: "api_server_not_ready",
	suspendedEnvironment: "suspended_environment",
	rateLimitExceeded: "rate_limit_exceeded",
	missingAPIKey: "missing_api_key",
	invalidAPIKey: "invalid_api_key",
	expiredAPIKey: "expired_api_key",
	endpointsNotAllowed: "endpoints_not_allowed",
	endpointNotAllowed: "endpoint_not_allowed",
	missingRequestOrigin: "missing_request_origin",
	domainNotAuthorized: "domain_not_authorized",
	missingClientIP: "missing_client_IP",
	IPNotAuthorized: "ip_not_authorized",
	missingSessionToken: "missing_session_token",
	invalidSessionToken: "invalid_session_token",
	fileUploadError: "file_upload_error",
	unsupportedMediaType: "unsupported_media_type",
	payloadTooLarge: "request_body_size_too_large",
	invalidRequestBodySyntax: "invalid_request_body_syntax",
	middlewareImportError: "middleware_import_error",
	middlewareExecutionError: "middleware_execution_error",
	missingDefaultExport: "missing_default_export",
	invalidFunction: "invalid_function",
	endpointExecutionError: "endpoint_execution_error",
	queueExecutionError: "queue_execution_error",
	taskExecutionError: "task_execution_error",
	endpointImportError: "endpoint_import_error",
	queueImportError: "queue_import_error",
	taskImportError: "task_import_error",
	requestTimedOut: "request_timed_out",
	missingAccessToken: "missing_access_token",
	invalidCredentials: "invalid_credentials",
	storageNotFound: "storage_not_found",
	queueNotFound: "queue_not_found",
	cronJobNotFound: "cronjob_not_found",
	invalidValue: "invalid_value",
	missingFileIdentifier: "missing_file_identifier",
	invalidFileIdentifier: "invalid_file_identifier",
	invalidFilePath: "invalid_file_path",
	invalidBucketName: "invalid_bucket_name",
	notPublic: "not_public",
	invalidAccessToken: "invalid_access_token",
};

export default ERROR_CODES;
