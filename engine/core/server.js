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
	getKey,
} from "./init/cache.js";
import { connectToDatabase, disconnectFromDatabase } from "./init/db.js";
import { connectToQueue, disconnectFromQueue } from "./init/queue.js";
import { initializeSyncClient, disconnectSyncClient } from "./init/sync.js";
import { PrimaryProcessDeploymentManager } from "./handlers/primaryProcessManager.js";
import { ChildProcessDeploymentManager } from "./handlers/childProcessManager.js";
import { adapterManager } from "./handlers/adapterManager.js";
import { disconnectRealtimeClient } from "./init/realtime.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

var childManager = null;
var childProcess = null;
// If this is the primary process then fork a child process
if (cluster.isPrimary) {
	logger.info(`Primary process ${process.pid} is running`);

	// Init globally accessible variables
	initGlobals();
	// Set up locatlization
	initLocalization();
	// Connect to the database
	connectToDatabase();
	// Connect to cache server(s)
	connectToRedisCache(finalizePrimaryProcessStartup);
	// Connect to message queue
	connectToQueue(true);
	// Gracefull handle process exist
	handlePrimaryProcessExit();
	// Set up garbage collector
	setUpGC();
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
	initGlobals();
	// Set up locatlization
	const i18n = initLocalization();
	// Connect to the database
	connectToDatabase();
	// Connect to message queue
	connectToQueue(false);
	// Connect to cache server(s)
	await connectToRedisCache();
	// Create the child process manager which will set up the API server
	const manager = new ChildProcessDeploymentManager(null, null, i18n);
	await manager.initializeCore();
	childManager = manager;

	// In production environment we do not need to check for heartbeat, kubernetes will restart the process if it is unresponsive
	if (process.env.NODE_ENV === "development") {
		// Listen for child process update messages (not restart but update)
		process.on("message", (message) => {
			if (message === "restart") {
				logger.info(`Child process update started`);
				childManager.restartCore();
			}
		});
	}

	// Connect to synchronization server
	initializeSyncClient();
	// Set up garbage collector
	setUpGC();

	// Handle gracelfull process exit
	process.on("SIGINT", async () => {
		logger.info(t("********* CHILD PROCESS CLEAN START *********"));
		// Disconnect all connections/adapters
		await adapterManager.disconnectAll();
		// Close connection to cache server(s)
		await disconnectFromRedisCache();
		// Close connection to the database
		await disconnectFromDatabase();
		// Disconnect from realtime client
		disconnectRealtimeClient();
		// Close synchronization server connection
		disconnectSyncClient();
		// Close connection to message queue
		disconnectFromQueue();
		// Close the http server
		if (childManager) await childManager.closeHttpServer();
		// We call process exit so that primary process can fork a new child process
		logger.info(t("********* CHILD PROCESS CLEAN END *********"));
		process.exit();
	});
}

async function finalizePrimaryProcessStartup() {
	// Get the environment information
	let envObj = await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.object`);

	// Create the primary process deployment manager and set up the engine core (API Sever)
	const manager = new PrimaryProcessDeploymentManager(null, envObj);
	await manager.initializeCore();

	// Fork child process
	childProcess = cluster.fork();

	cluster.on("exit", function (worker, code, signal) {
		logger.warn(`Child process ${worker.process.pid} died`);
		childProcess = cluster.fork();
	});

	// In production environment we do not need to check for heartbeat, kubernetes will restart the process if it is unresponsive
	if (process.env.NODE_ENV === "development") {
		// Set up heartbeat interval
		setInterval(() => {
			// Send heartbeat message to the child process
			if (childProcess.isConnected()) childProcess.send("heartbeat");
			else return;

			// Set a timeout to check if child process responded
			const heartbeatTimeout = setTimeout(() => {
				// Child process did not respond within timeout, handle accordingly
				logger.warn("Child process is unresponsive!");

				// Kill the child process so that it restarts.
				// SIGINT does not work if child process is stuck in an ifinite loop, we need to use SIGTERM
				childProcess.kill("SIGTERM");
			}, config.get("general.heartbeatTimeoutSeconds") * 1000); // Timeout duration in milliseconds

			// Listen for heartbeat response from the child process
			childProcess.once("message", (message) => {
				if (message === "heartbeat") {
					// logger.info(`Child process is up and running`);
					// Child process responded, clear the heartbeat timeout
					clearTimeout(heartbeatTimeout);
				}
			});
		}, config.get("general.heartbeatIntervalSeconds") * 1000); // Heartbeat interval duration in milliseconds
	}
}

function initGlobals() {
	// Add logger to the global object
	global.logger = logger;
	global.__dirname = dirname;

	// To correctly identify errors thrown by the engine vs. system thrown errors
	global.AgnostError = class extends Error {
		constructor(message, code, specifics) {
			super(message);
			this.origin = "client_error";
			this.code = code;
			this.message = message;
			this.specifics = specifics;
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
		await disconnectFromRedisCache();
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
