import cluster from "cluster";
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
	getRedisClientForInit,
	getRedisClient,
	getKey,
} from "./init/cache.js";
import { connectToDatabase, disconnectFromDatabase } from "./init/db.js";
import { connectToQueue, disconnectFromQueue } from "./init/queue.js";
import { initializeSyncClient, disconnectSyncClient } from "./init/sync.js";
import { PrimaryProcessDeploymentManager } from "./handlers/primaryProcessManager.js";
import { ChildProcessDeploymentManager } from "./handlers/childProcessManager.js";
import { adapterManager } from "./handlers/adapterManager.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

var childProcess = null;
// If this is the primary process a child process
if (cluster.isPrimary) {
	logger.info(`Primary process ${process.pid} is running`);

	// Init globally accessible variables
	initGlobalsForPrimaryProcess();
	// Set up locatlization
	initLocalization();
	// Connect to cache server(s)
	connectToRedisCache();
	// Connect to message queue
	connectToQueue();
	// Gracefull handle process exist
	handlePrimaryProcessExit();
	// Set up garbage collector
	setUpGC();
	getRedisClientForInit().on("connect", async function () {
		// Get the environment information
		let envObj = await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.object`);
		if (!envObj) return;
		// Create the primary process deployment manager and set up the engine core (API Sever)
		const manager = new PrimaryProcessDeploymentManager(null, envObj);
		await manager.initializeCore();

		// Fork child process
		childProcess = cluster.fork();

		cluster.on("exit", function (worker, code, signal) {
			logger.warn(`Child process ${worker.process.pid} died`);
			cluster.fork();
		});

		// Set up heartbeat interval
		const heartbeatInterval = setInterval(() => {
			// Send heartbeat message to the child process
			childProcess.send("heartbeat");

			// Set a timeout to check if child process responded
			const heartbeatTimeout = setTimeout(() => {
				// Child process did not respond within timeout, handle accordingly
				console.log("Child process is unresponsive!");

				// Disconnect the child process
				// childProcess.disconnect();

				// You can choose to restart the child process here using `cluster.fork()` if desired
				// cluster.fork();

				// Clear the heartbeat interval
				clearInterval(heartbeatInterval);
			}, config.get("general.heartbeatTimeoutSeconds") * 1000); // Timeout duration in milliseconds

			// Listen for heartbeat response from the child process
			childProcess.once("message", (message) => {
				if (message === "heartbeat") {
					logger.info(`Child process is up and running`);
					// Child process responded, clear the heartbeat timeout
					clearTimeout(heartbeatTimeout);
				}
			});
		}, config.get("general.heartbeatIntervalSeconds") * 1000); // Heartbeat interval duration in milliseconds
	});
} else if (cluster.isWorker) {
	logger.info(`Child process ${process.pid} is running`);

	// Listen for heartbeat messages from the parent process
	process.on("message", (message) => {
		if (message === "heartbeat") {
			// Respond back to the parent process to indicate responsiveness
			process.send("heartbeat");
		}
	});

	// Init globally accessible variables
	initGlobalsForChildProcess();
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
	});
	// Connect to synchronization server
	initializeSyncClient();
	// Set up garbage collector
	setUpGC();

	// Handle gracelfull process exit
	process.on("SIGINT", async () => {
		// Disconnect all connections/adapters
		await adapterManager.disconnectAll();
		// Close connection to cache server(s)
		disconnectFromRedisCache();
		// Close connection to the database
		await disconnectFromDatabase();
		// Close synchronization server connection
		disconnectSyncClient();
		// We call process exit so that primary process can fork a new child process
		process.exit();
	});
}

function initGlobalsForPrimaryProcess() {
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

function initGlobalsForChildProcess() {
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
	//Gracefully exit if we force quit through cntr+C
	process.on("SIGINT", async () => {
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
