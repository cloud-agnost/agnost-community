import process from "process";
import config from "config";
import path from "path";
import logger from "./init/logger.js";
import helper from "./util/helper.js";
import { I18n } from "i18n";
import { fileURLToPath } from "url";
import {
	connectToRedisCache,
	disconnectFromRedisCache,
	getKey,
} from "./init/cache.js";
import { connectToQueue, disconnectFromQueue } from "./init/queue.js";
import { PrimaryProcessDeploymentManager } from "./handlers/primaryProcessManager.js";
import { processManager } from "./childProcessManager.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

(function () {
	// If this is the primary process then fork a child process
	logger.info(`Primary process ${process.pid} is running`);

	// Init globally accessible variables
	initGlobals();
	// Set up locatlization
	initLocalization();
	// Connect to cache server(s)
	connectToRedisCache(finalizePrimaryProcessStartup);
	// Connect to message queue
	connectToQueue();
	// Gracefull handle process exist
	handlePrimaryProcessExit();
	// Set up garbage collector
	setUpGC();
})();

async function finalizePrimaryProcessStartup() {
	// Get the environment information
	let envObj = await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.object`);

	// Create the primary process deployment manager and set up the engine core (API Sever)
	const manager = new PrimaryProcessDeploymentManager(null, envObj);
	await manager.initializeCore();

	// Create the child process
	processManager.spawnChildProcess();
}

function initGlobals() {
	// Add logger to the global object
	global.logger = logger;
	global.__dirname = dirname;

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

function handlePrimaryProcessExit() {
	process.on("SIGINT", async () => {
		console.log("SIGINT");
		// Close connection to cache server(s)
		disconnectFromRedisCache();
		// Close connection to message queue
		disconnectFromQueue();
	});
}

function setUpGC() {
	setInterval(() => {
		if (global.gc) {
			// Manually hangle gc to boost performance of our realtime server, gc is an expensive operation
			global.gc();
		}
	}, config.get("general.gcSeconds") * 1000);
}
