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
	getRedisClient,
} from "./init/cache.js";
import { connectToDatabase, disconnectFromDatabase } from "./init/db.js";
import { initializeSyncClient, disconnectSyncClient } from "./init/sync.js";
import { ChildProcessDeploymentManager } from "./handlers/childProcessManager.js";
import { adapterManager } from "./handlers/adapterManager.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
var childManager = null;

(function () {
	logger.info(`Child process ${process.pid} is running`);
	// Init globally accessible variables
	initGlobals();
	// Set up locatlization
	const i18n = initLocalization();
	// Connect to the database
	connectToDatabase();
	// Connect to cache server(s)
	connectToRedisCache();
	getRedisClient().on("connect", async function () {
		// Create the child process manager which will set up the API server
		const manager = new ChildProcessDeploymentManager(null, null, i18n);
		await manager.initializeCore();
		childManager = manager;
	});
	// Connect to synchronization server
	initializeSyncClient();
	// Set up garbage collector
	setUpGC();

	// Handle gracelfull process exit
	process.on("SIGINT", async () => {
		await cleanUp();
		// We call process exit so that primary process can spawn a new child process
		process.exit();
	});

	// Handle gracelfull process exit, this code is sent when the main processes is also exiting, no need to spawn a new shild process
	process.on("SIGHUP", async () => {
		await cleanUp();
	});
})();

async function cleanUp() {
	// Disconnect all connections/adapters
	await adapterManager.disconnectAll();
	// Close connection to cache server(s)
	disconnectFromRedisCache();
	// Close connection to the database
	await disconnectFromDatabase();
	// Close synchronization server connection
	disconnectSyncClient();
	if (childManager) await childManager.closeHttpServer();
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

function setUpGC() {
	setInterval(() => {
		if (global.gc) {
			// Manually hangle gc to boost performance of our realtime server, gc is an expensive operation
			global.gc();
		}
	}, config.get("general.gcSeconds") * 1000);
}
