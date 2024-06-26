import express from "express";
import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import process from "process";
import config from "config";
import path from "path";
import responseTime from "response-time";

import { I18n } from "i18n";
import { fileURLToPath } from "url";
import logger from "./init/logger.js";
import helper from "./util/helper.js";
import { connectToDatabase, disconnectFromDatabase } from "./init/db.js";
import { connectToRedisCache, disconnectFromRedisCache } from "./init/cache.js";
import { connectToQueue, disconnectFromQueue } from "./init/queue.js";
import { createRateLimiter } from "./middlewares/rateLimiter.js";
import { handleUndefinedPaths } from "./middlewares/undefinedPaths.js";
import { logRequest } from "./middlewares/logRequest.js";
import { initializeSyncClient, disconnectSyncClient } from "./init/sync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(function () {
	logger.info(`Process ${process.pid} is running`);
	// Init globally accessible variables
	initGlobals();
	// Set up locatlization
	const i18n = initLocalization();
	// Connect to the database
	connectToDatabase();
	// Connect to cache server(s)
	connectToRedisCache();
	// Connect to message queue
	connectToQueue();
	// Spin up http server
	const server = initExpress(i18n);
	// Connect to synchronization server
	initializeSyncClient();

	// Gracefull handle process exist
	handleProcessExit(server);
})();

function initGlobals() {
	// Add logger to the global object
	global.logger = logger;

	// To correctly identify errors thrown by the platform vs. system thrown errors
	global.AgnostError = class extends Error {
		constructor(message) {
			super(message);
		}
	};
	// Add config to the global object
	global.config = config;
	// Add utility methods to the global object
	global.helper = helper;
}

function initLocalization() {
	// Multi-language support configuration
	const i18n = new I18n({
		locales: ["en", "tr"],
		directory: path.join(__dirname, "locales"),
		defaultLocale: "en",
		// watch for changes in JSON files to reload locale on updates
		autoReload: false,
		// whether to write new locale information to disk
		updateFiles: false,
		// sync locale information across all files
		syncFiles: false,
		register: global,
		api: {
			__: "t", //now req.__ becomes req.t
			__n: "tn", //and req.__n can be called as req.tn
		},
		preserveLegacyCase: false,
	});

	return i18n;
}

async function initExpress(i18n) {
	// Create express application
	var app = express();
	// Add rate limiter middlewares
	let rateLimiters = config.get("rateLimiters");
	rateLimiters.forEach((entry) => app.use(createRateLimiter(entry)));
	//Secure express app by setting various HTTP headers
	app.use(helmet());
	//Enable cross-origin resource sharing
	app.use(
		cors({
			exposedHeaders: ["Access-Token", "Refresh-Token"],
		})
	);
	//Disable client side caching
	app.use(nocache());
	app.set("etag", false);
	// Add middleware to identify user locale using 'accept-language' header to guess language settings
	app.use(i18n.init);
	app.use(responseTime(logRequest));
	// Serve static files from the specified directory
	app.use((await import("./middlewares/touchVersion.js")).default);
	app.use("/", (await import("./routes/system.js")).default);
	// Serve static files from the storage directory
	app.use("/storage", (await import("./routes/storage.js")).default);
	app.use("/v1/cluster", (await import("./routes/cluster.js")).default);
	app.use("/v1/engine", (await import("./routes/engine.js")).default);
	app.use("/v1/platform", (await import("./routes/platform.js")).default);
	app.use("/v1/telemetry", (await import("./routes/telemetry.js")).default);
	app.use("/v1/types", (await import("./routes/types.js")).default);
	app.use("/v1/auth", (await import("./routes/auth.js")).default);
	app.use("/v1/user", (await import("./routes/user.js")).default);
	app.use("/v1/user/git", (await import("./routes/git.js")).default);
	app.use("/v1/log", (await import("./routes/log.js")).default);
	app.use("/v1/org", (await import("./routes/organization.js")).default);
	app.use("/v1/org/:orgId/app", (await import("./routes/app.js")).default);
	app.use(
		"/v1/org/:orgId/project",
		(await import("./routes/project.js")).default
	);
	app.use(
		"/v1/org/:orgId/resource",
		(await import("./routes/resource.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/invite",
		(await import("./routes/appInvites.js")).default
	);
	app.use(
		"/v1/org/:orgId/project/:projectId/invite",
		(await import("./routes/projectInvites.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/team",
		(await import("./routes/appTeam.js")).default
	);
	app.use(
		"/v1/org/:orgId/project/:projectId/team",
		(await import("./routes/projectTeam.js")).default
	);
	app.use(
		"/v1/org/:orgId/project/:projectId/env",
		(await import("./routes/projectEnv.js")).default
	);
	app.use(
		"/v1/org/:orgId/project/:projectId/env/:envId/container",
		(await import("./routes/container.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version",
		(await import("./routes/version.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/env",
		(await import("./routes/environment.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/db",
		(await import("./routes/database.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/db/:dbId/model",
		(await import("./routes/model.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/ep",
		(await import("./routes/endpoint.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/mw",
		(await import("./routes/middleware.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/func",
		(await import("./routes/function.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/queue",
		(await import("./routes/queue.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/task",
		(await import("./routes/task.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/storage",
		(await import("./routes/appStorage.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/cache",
		(await import("./routes/cache.js")).default
	);
	app.use(
		"/v1/org/:orgId/app/:appId/version/:versionId/domain",
		(await import("./routes/domain.js")).default
	);

	// Middleware to handle undefined paths or posts
	app.use(handleUndefinedPaths);

	// Spin up the http server
	const HOST = config.get("server.host");
	const PORT = config.get("server.port");
	var server = app.listen(PORT, () => {
		logger.info(`Http server started @ ${HOST}:${PORT}`);
	});

	/* 	Particularly needed in case of bulk insert/update/delete operations, we should not generate 502 Bad Gateway errors at nginex ingress controller, the value specified in default config file is in milliseconds */
	server.timeout = config.get("server.timeout");

	return server;
}

function handleProcessExit(server) {
	//Gracefully exit if we force quit through cntr+C
	process.on("SIGINT", () => {
		// Close synchronization server connection
		disconnectSyncClient();
		// Close connection to the database
		disconnectFromDatabase();
		// Close connection to cache server(s)
		disconnectFromRedisCache();
		// Close connection to message queue
		disconnectFromQueue();
		//Close Http server
		server.close(() => {
			logger.info("Http server closed");
		});
	});
}
