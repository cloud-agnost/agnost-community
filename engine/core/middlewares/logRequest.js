import { getDBClient } from "../init/db.js";

// Log requests to console and add the log to the environment database
export const logRequestToConsole = (req, res, time) => {
	logger.info(
		`${req.method} (${res.statusCode}) ${Math.round(time * 10) / 10}ms ${
			req.originalUrl
		}`
	);
};

// Log requests to console and add the log to the environment database
export const logRequest = (endpoint) => (req, res, time) => {
	if (console.stdlog) console.log("Logging handler execution");

	logger.info(
		`${req.method} (${res.statusCode}) ${Math.round(time * 10) / 10}ms ${
			req.originalUrl
		}`
	);

	// Calculate size of the request and response body, if they are larger than certain size we do not log their content
	const conn = getDBClient();
	const reqBodySize = Buffer.byteLength(JSON.stringify(req.body));
	const resBodySize = Buffer.byteLength(JSON.stringify(res.body));

	const log = {
		timestamp: new Date(),
		name: endpoint.name,
		method: endpoint.method,
		path: endpoint.path,
		status: res.statusCode,
		duration: Math.round(time * 10) / 10,
		orgId: endpoint.orgId,
		appId: endpoint.appId,
		versionId: endpoint.versionId,
		envId: META.getEnvObj()._id,
		endpointId: endpoint._id,
		params: req.params,
		query: req.query,
		headers: req.headers,
		cookies: req.cookies,
		// We use the disk storage of multer so the file contents (buffer) is not included the req.files
		files: req.files,
		requestBody:
			reqBodySize > config.get("general.maxLogPayloadSizeKB") * 1024
				? t("Payload too large to store")
				: req.body,
		responseBody:
			resBodySize > config.get("general.maxLogPayloadSizeKB") * 1024
				? t("Payload too large to lostoreg")
				: res.body,
	};

	// Save log to the database
	conn
		.db(META.getEnvId())
		.collection("endpoint_logs")
		.insertOne(log, { writeConcern: { w: 0 } });
};
