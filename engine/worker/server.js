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
import { initializeSyncClient, disconnectSyncClient } from "./init/sync.js";
import { createRateLimiter } from "./middlewares/rateLimiter.js";
import { handleUndefinedPaths } from "./middlewares/undefinedPaths.js";
import { logRequest } from "./middlewares/logRequest.js";

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

    // To correctly identify errors thrown by the engine vs. system thrown errors
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
    app.use(cors());
    //Disable client side caching
    app.use(nocache());
    app.set("etag", false);
    // Add middleware to identify user locale using 'accept-language' header to guess language settings
    app.use(i18n.init);
    app.use(responseTime(logRequest));

    app.use("/", (await import("./routes/system.js")).default);
    app.use("/v1/env", (await import("./routes/environment.js")).default);
    app.use("/v1/resource", (await import("./routes/resource.js")).default);
    app.use("/v1/domain", (await import("./routes/domain.js")).default);
    app.use("/v1/cicd", (await import("./routes/cicd.js")).default);

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
