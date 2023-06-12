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
import { connectToDatabase, disconnectFromDatabase } from "./init/db.js";
import { connectToQueue, disconnectFromQueue } from "./init/queue.js";
import { initializeSyncClient, disconnectSyncClient } from "./init/sync.js";
import { DeploymentManager } from "./handlers/deploymentManager.js";
import { adapterManager } from "./handlers/adapterManager.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

logger.info(`Process ${process.pid} is running`);

// Init globally accessible variables
initGlobals();
// Set up locatlization
const i18n = initLocalization();
// Connect to the database
connectToDatabase();
// Connect to cache server(s)
connectToRedisCache(finalizeProcessStartup);
// Connect to synchronization server
initializeSyncClient();
// Connect to message queue
connectToQueue();
// Gracefull handle process exist
handleProcessExit();
// Set up garbage collector
setUpGC();

async function finalizeProcessStartup() {
	// Get the environment information
	let envObj = await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.object`);
	// Create the deployment manager and set up the engine core (API Sever)
	const manager = new DeploymentManager(envObj, i18n);
	await manager.initialize();
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

function handleProcessExit() {
	// Handle gracelfull process exit
	process.on("SIGINT", async () => {
		// Disconnect all connections/adapters
		await adapterManager.disconnectAll();
		// Close connection to cache server(s)
		disconnectFromRedisCache();
		// Close connection to the database
		await disconnectFromDatabase();
		// Close connection to message queue
		disconnectFromQueue();
		// Close synchronization server connection
		disconnectSyncClient();
		// We call process exit so that primary process can fork a new child process
		process.exit();
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
