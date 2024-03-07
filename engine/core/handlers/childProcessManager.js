import express from "express";
import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import responseTime from "response-time";
import cookieParser from "cookie-parser";
import RedisStore from "connect-redis";
import session from "express-session";
import { DeploymentManager } from "./deploymentManager.js";
import { handleUndefinedPaths } from "../middlewares/undefinedPaths.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import { applyRateLimit } from "../middlewares/applyRateLimit.js";
import { logRequest } from "../middlewares/logRequest.js";
import { applyTimeout } from "../middlewares/applyTimeout.js";
import { clearTimeout } from "../middlewares/clearTimeout.js";
import { checkAPIKey } from "../middlewares/checkAPIKey.js";
import { checkSession } from "../middlewares/checkSession.js";
import { handleFileUploads } from "../middlewares/handleFileUploads.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { applyCustomMiddleware } from "../middlewares/applyCustomMiddleware.js";
import { clearTemporaryFileStorage } from "../middlewares/clearTemporaryFileStorage.js";
import {
	turnOnLogging,
	turnOffLogging,
} from "../middlewares/manageDebugChannels.js";
import { runHandler } from "../middlewares/runHandler.js";
import { adapterManager } from "./adapterManager.js";
import { MetaManager } from "./metaManager.js";
import { setUpSMTPConnection } from "../util/authHelper.js";
import {
	initializeRealtimeServer,
	disconnectRealtimeClient,
} from "../init/realtime.js";
import { getRedisClient } from "../init/cache.js";

export class ChildProcessDeploymentManager extends DeploymentManager {
	constructor(msgObj, envObj, i18n) {
		super(msgObj, envObj);
		this.expressApp = null;
		this.httpServer = null;
		this.i18n = i18n;
		this.loaderQuery = null;
		this.overallStatus = "OK";
	}

	/**
	 * Helper method to destroy http server during engine updates
	 */
	enableDestroy(server) {
		var connections = {};

		server.on("connection", function (conn) {
			var key = conn.remoteAddress + ":" + conn.remotePort;
			connections[key] = conn;
			conn.on("close", function () {
				delete connections[key];
			});
		});

		server.destroy = function (cb) {
			server.close(cb);
			for (var key in connections) connections[key].destroy();
		};
	}

	/**
	 * Sets the express app
	 * @param  {Object} app The express app
	 */
	setExpressApp(app) {
		this.expressApp = app;
	}

	/**
	 * Returns the express app
	 */
	getExpressApp() {
		return this.expressApp;
	}

	/**
	 * Sets the http server
	 * @param  {Object} server The http server
	 */
	setHttpServer(server) {
		this.httpServer = server;
	}

	/**
	 * Returns the http server
	 */
	getHttpServer() {
		return this.httpServer;
	}

	/**
	 * Shuts down the http server
	 */
	async closeHttpServer() {
		const server = this.getHttpServer();
		server.destroy();
		logger.info("Http server closed");
	}

	/**
	 * Initializes the API server of the app version
	 */
	async initializeCore() {
		// Send message to master process
		process.send("updating");

		// Reset deployment status
		this.overallStatus = "OK";
		this.addLog(t("********* CHILD PROCESS INIT START *********"));
		// First load the environment and vesion configuration file
		const envObj = await this.loadEnvConfigFile();
		// If we do  not have the envObj yet then just spin up the express server to serve system default endpoints
		if (!envObj) {
			// Initialize express server
			await this.initExpressServer();

			// Spin up the express server
			await this.startExpressServer();

			this.addLog(t("********* CHILD PROCESS INIT END *********"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs(this.overallStatus);

			// We completed server initialization and can accept incoming requests
			global.SERVER_STATUS = "running";
			// Send message to master process
			process.send("ready");
			return;
		}

		// Set the environment object of the deployment manager
		this.setEnvObj(envObj);
		// Save the metadata manager to globals for faster access
		global.META = new MetaManager(envObj);
		// We are initializing the server, do not process any incoming requests
		global.SERVER_STATUS = "initializing";
		// Save the metadata manager to globals for faster access
		global.ADAPTERS = adapterManager;
		adapterManager.setModuleLoaderQuery(this.loaderQuery);

		// Initialize express server
		await this.initExpressServer();
		// Manage endpoints
		await this.manageEndpoints();

		// Spin up the express server
		await this.startExpressServer();

		// Set the environment variables of the API server
		this.manageEnvironmentVariables(this.getEnvironmentVariables());
		// Set up the authentication flow SMTP server connection if specified
		await this.setUpAuthSMTPConnection();
		// Initialize the connection manager
		await this.setupResourceConnections();
		// Manage the realtime connection
		this.manageRealtimeConnection();
		// Check databases
		await this.manageDatabases();
		// Check storages
		await this.manageStorages();
		// Check caches
		await this.manageCaches();
		// Set up the queue listeners
		await this.manageQueues();
		// Set up the task listeners
		await this.manageTasks();

		this.addLog(t("********* CHILD PROCESS INIT END *********"));
		// Send the deployment telemetry information to the platform
		await this.sendEnvironmentLogs(this.overallStatus);

		// We completed server initialization and can accept incoming requests
		global.SERVER_STATUS = "running";

		// Send message to master process
		process.send("ready");
	}

	/**
	 * Cleans up the child process to speed up API server updates. If we do not have any changes in resource definitions then we
	 * can update an API server faster
	 */
	async restartCore() {
		// Send message to master process
		process.send("updating");

		// Reset deployment status
		this.overallStatus = "OK";
		this.addLog(t("********* CHILD PROCESS RESTART *********"));
		global.SERVER_STATUS = "initializing";
		this.loaderQuery = helper.generateSlug(null, 6);
		// First clear the logs
		this.clearLogs();
		await this.closeHttpServer();

		/* 		// We haven't refreshed the META manager so that we can access the old values
		// Clear queue channels
		const queueus = await META.getQueues();
		for (const queue of queueus) {
			const adapterObj = adapterManager.getQueueAdapter(queue.name);
			if (adapterObj) {
				await adapterObj.closeChannels();
			}
		}

		// We haven't refreshed the META manager so that we can access the old values
		// Clear task channels
		const tasks = await META.getTasks();
		for (const task of tasks) {
			const adapterObj = adapterManager.getTaskAdapter(task.name);
			if (adapterObj) {
				await adapterObj.closeChannels();
			}
		} */

		// We haven't refreshed the META manager so that we can access the old values
		// Clear environment variables
		const variables = META.getEnvironmentVariables();
		for (const variable of variables) {
			delete process.env[variable.name];
		}

		// First load the environment and vesion configuration file
		const envObj = await this.loadEnvConfigFile();
		// If we do  not have the envObj yet then just spin up the express server to serve system default endpoints
		if (!envObj) {
			// Initialize express server
			await this.initExpressServer();

			// Spin up the express server
			await this.startExpressServer();

			this.addLog(t("********* CHILD PROCESS INIT END *********"));
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs(this.overallStatus);

			// We completed server initialization and can accept incoming requests
			global.SERVER_STATUS = "running";
			// Send message to master process
			process.send("ready");
			return;
		}

		// Set the environment object of the deployment manager
		this.setEnvObj(envObj);
		// Reset the metadata manager
		META.reset(envObj);
		// Set module loader query in adapter manager
		adapterManager.setModuleLoaderQuery(this.loaderQuery);

		// Initialize express server
		await this.initExpressServer();
		// Manage endpoints
		await this.manageEndpoints();
		// Spin up the express server
		await this.startExpressServer();

		// Set the environment variables of the API server
		this.manageEnvironmentVariables(this.getEnvironmentVariables());
		// Set up the authentication flow SMTP server connection if specified
		await this.setUpAuthSMTPConnection();
		// Manage the realtime connection
		this.manageRealtimeConnection();
		// Check databases
		await this.manageDatabases();
		// Check storages
		await this.manageStorages();
		// Check caches
		await this.manageCaches();
		// Set up the queue listeners
		await this.manageQueues();
		// Set up the task listeners
		await this.manageTasks();

		// Clear agnost package cache
		const pkg = (await import("@agnost/server")).default;
		const { agnost } = pkg;
		agnost.clearClientCache();
		this.addLog(`Cleared server side module '@agnost/server' cache`);
		this.addLog(t("********* CHILD PROCESS RESTART END *********"));

		// Send the deployment telemetry information to the platform
		await this.sendEnvironmentLogs(this.overallStatus);

		// We completed server initialization and can accept incoming requests
		global.SERVER_STATUS = "running";

		// Send message to master process
		process.send("ready");
	}

	/**
	 * Manages the environment variables of the API server
	 * @param  {Array} variables The list of environment variables in name-value pairs
	 */
	manageEnvironmentVariables(variables) {
		if (variables.length === 0) return;

		for (const variable of variables) {
			process.env[variable.name] = variable.value;
			this.addLog(`Added environment variable '${variable.name}'`);
		}
	}

	/**
	 * Initializes the express server
	 */
	async initExpressServer() {
		this.addLog(`Initializing express server`);
		// Create and set the express application
		var app = express();
		this.setExpressApp(app);

		// Initialize store
		const redisStore = new RedisStore({ client: getRedisClient() });

		//Secure express app by setting various HTTP headers
		app.use(helmet());
		//Parses incoming requests with urlencoded payloads
		app.use(
			express.urlencoded({
				extended: true,
			})
		);
		//Enable cross-origin resource sharing
		app.use(
			cors({
				origin: function (origin, callback) {
					callback(null, true);
				},
				credentials: true,
				exposedHeaders: [
					"Access-Token",
					"Refresh-Token",
					"Cross-Origin-Resource-Policy",
					"Access-Control-Allow-Origin",
					"Access-Control-Allow-Methods",
				],
			})
		);
		// Initialize sesssion storage
		app.use(
			session({
				store: redisStore,
				saveUninitialized: false,
				secret: config.get("general.expressSessionSecret"),
				resave: false,
			})
		);
		//Disable client side caching
		app.use(nocache());
		app.set("etag", false);
		app.use(cookieParser());
		// Add middleware to identify user locale using 'accept-language' header to guess language settings
		app.use(this.i18n.init);

		// Add the default system endpoints
		app.use("/agnost", (await import("../routes/system.js")).default);
	}

	async initializeDefaultEndpoints() {
		const app = this.getExpressApp();
		// Add the default storage object endpoints to access stored objects
		app.use("/agnost/object", (await import("../routes/object.js")).default);
		// Add the test queue and cron job handlers
		app.use("/agnost/test", (await import("../routes/test.js")).default);
		// Add the default storage object endpoints
		app.use("/agnost/storage", (await import("../routes/storage.js")).default);
		// Add the default user authentication endpoints
		app.use("/agnost/auth", (await import("../routes/auth.js")).default);
		app.use(
			"/agnost/database",
			(await import("../routes/database.js")).default
		);
		app.use("/agnost/oauth", (await import("../routes/oauth.js")).default);
		app.use(
			"/agnost/realtime",
			(await import("../routes/realtime.js")).default
		);
	}

	/**
	 * Spins up the express server and also register undefined paths handler (returns 404 http code)
	 */
	async startExpressServer() {
		const app = this.getExpressApp();
		// Middleware to handle undefined paths or posts
		app.use(handleUndefinedPaths);

		// Spin up the http server
		const HOST = config.get("server.host");
		const PORT = config.get("server.port");
		var server = app.listen(PORT, () => {
			this.addLog(`Http server started @ ${HOST}:${PORT}`);
		});

		/* 	Particularly needed in case of bulk insert/update/delete operations, we should not generate 502 Bad Gateway errors at nginex ingress controller, the value specified in default config file is in milliseconds */
		server.timeout = config.get("server.timeout");
		this.setHttpServer(server);
		this.enableDestroy(server);
	}

	/**
	 * Adds the endpoints and associated middlewares of the API server as routes to the express server app
	 */
	async manageEndpoints() {
		// Add the default system endpoints
		await this.initializeDefaultEndpoints();

		// First load the endpoints configuration file
		const endpoints = await META.getEndpoints();
		// Process each endpoint one by one and add it to the express app as a route
		for (const endpoint of endpoints) {
			// This will keep all middlewares and route hander
			const handlers = [];
			// Create a new router for the endpoint
			const router = express.Router();

			// Add debug channel handlers
			handlers.push(turnOnLogging(endpoint));
			// When headers are sent, automatically turn off logging
			handlers.push(turnOffLogging);
			// Add rate limiter middlewares if any
			this.addRateLimiters(endpoint, handlers);
			this.addTimeoutMiddleware(endpoint, handlers);
			this.addClearTimeoutMiddleware(endpoint, handlers);
			handlers.push(getResponseBody);
			handlers.push(checkServerStatus);
			// If the endpoint is marked as log enabled then add logging middleware
			this.addLogMiddleware(endpoint, handlers);
			// Add content-type check middleware
			handlers.push(checkContentType);
			// If the endpoint is marked as API key required then add API key check middleware
			this.addAPIKeyMiddleware(endpoint, handlers);
			// If the endpoint is marked as session required then add session token check middleware
			this.addSessionMiddleware(endpoint, handlers);
			// Add file handler middleware
			handlers.push(handleFileUploads);
			handlers.push(clearTemporaryFileStorage);
			// If the endpoint has custom defined middlewares then add those middlewares
			await this.addCustomMiddlewares(endpoint, handlers);
			// Add the route handler
			this.addEndpointHandler(endpoint, handlers);

			// Register the endpoint to the router
			if (endpoint.method === "GET")
				router.get(
					`${config.get("general.endpointPrefix")}${endpoint.path}`,
					...handlers
				);
			else if (endpoint.method === "POST")
				router.post(
					`${config.get("general.endpointPrefix")}${endpoint.path}`,
					...handlers
				);
			else if (endpoint.method === "PUT")
				router.put(
					`${config.get("general.endpointPrefix")}${endpoint.path}`,
					...handlers
				);
			else if (endpoint.method === "DELETE")
				router.delete(
					`${config.get("general.endpointPrefix")}${endpoint.path}`,
					...handlers
				);

			this.getExpressApp().use(router);

			this.addLog(
				`Added endpoint '${endpoint.name}' ${endpoint.method}: ${endpoint.path}`
			);
		}
	}

	/**
	 * Adds the timeout control middleware
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the timeout middleware will be added
	 */
	addTimeoutMiddleware(endpoint, handlers) {
		// If timeout specified then add the timeout middleware
		if (endpoint.timeout > 0) handlers.push(applyTimeout(endpoint));
	}

	/**
	 * Adds the timeout control middleware
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the timeout middleware will be added
	 */
	addClearTimeoutMiddleware(endpoint, handlers) {
		// If timeout specified then add the timeout middleware
		if (endpoint.timeout > 0) handlers.push(clearTimeout);
	}

	/**
	 * Adds rate limiters assigned to the endpoint or if there are default rate limiters then adds them
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the rate limiter middlewares will be added
	 */
	addRateLimiters(endpoint, handlers) {
		// Get the rate limiters of the endpoint
		let rateLimiters = endpoint.rateLimits || [];
		// If no endpoint rate limiters specified then check the default rate limites specified in version
		if (rateLimiters.length === 0) {
			rateLimiters = this.getEndpointDefaultRateLimits();
		}

		// If there are no rate limites then do nothing
		if (rateLimiters.length === 0) return;

		// OK we have rate limits then add the middlewares
		for (let i = 0; i < rateLimiters.length; i++) {
			const limitId = rateLimiters[i];
			const limitObj = this.getLimits().find((entry) => entry.iid === limitId);
			if (limitObj) {
				handlers.push(applyRateLimit(limitObj));
			}
		}
	}

	/**
	 * Adds request/response logging middleware if logging is enabled
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the middlewares will be added
	 */
	addLogMiddleware(endpoint, handlers) {
		if (!endpoint.logExecution) return;

		handlers.push(responseTime(logRequest(endpoint)));
	}

	/**
	 * Adds API key control middleware if API key is required
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the middlewares will be added
	 */
	addAPIKeyMiddleware(endpoint, handlers) {
		if (!endpoint.apiKeyRequired) return;

		handlers.push(checkAPIKey(endpoint));
	}

	/**
	 * Adds session token control middleware if session is required
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the middlewares will be added
	 */
	addSessionMiddleware(endpoint, handlers) {
		if (!endpoint.sessionRequired) return;

		handlers.push(checkSession(true));
	}

	/**
	 * Adds custom middlewares of the endpoing
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the middlewares will be added
	 */
	async addCustomMiddlewares(endpoint, handlers) {
		if (endpoint.middlewares.length === 0) return;
		// First load the middlewares configuration file
		const middlewares = await META.getMiddlewares();
		for (let i = 0; i < endpoint.middlewares.length; i++) {
			const middlewareid = endpoint.middlewares[i];
			const middleware = middlewares.find(
				(entry) => entry.iid === middlewareid
			);

			// Add the middleware handler
			if (middleware) {
				handlers.push(
					applyCustomMiddleware(endpoint, middleware, this.loaderQuery)
				);
			}
		}
	}

	/**
	 * Adds the route handler function
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	addEndpointHandler(endpoint, handlers) {
		handlers.push(runHandler(endpoint, this.loaderQuery));
	}

	/**
	 * Sets up the connetions to application resources
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async setupResourceConnections() {
		const resources = this.getResources();
		// Fist, we need to set up the database connections
		// Get the list of databases and filter the ones that are PostgreSQL, MySQL or SQL Server
		const dbs = await META.getDatabasesSync().filter((entry) =>
			["PostgreSQL", "MySQL", "SQL Server", "MongoDB"].includes(entry.type)
		);

		for (const db of dbs) {
			// First find the corresponding resource mapping
			const mapping = this.getResourceMappings().find(
				(entry) => entry.design.iid === db.iid
			);

			if (!mapping) continue;

			// Get the resource corresponding to this mapping
			const resource = resources.find(
				(entry) => entry.iid === mapping.resource.iid
			);

			// A database server can be used by multiple databases, for this reason we should not decrypt access data which is already decrypted
			if (!resource.isDecrypted) {
				resource.isDecrypted = true;
				resource.access = helper.decryptSensitiveData(resource.access);
			}

			// Assign the database pool size value to the resource config
			if (resource.config)
				resource.config.poolSize =
					db.poolSize ?? config.get("general.defaultDBPoolSize");
			else {
				resource.config = {
					poolSize: db.poolSize ?? config.get("general.defaultDBPoolSize"),
				};
			}

			// Add the database name info to the access settings, for MongoDB databases created within the cluster, we will not pass the databse name as parameter
			if (db.type !== "MongoDB")
				resource.access.dbName = this.getAppliedDbName(db);

			// We will use the design iid when registering databse connections in adapter manager not the resource.iid
			resource.designiid = db.iid;

			if (resource.accessReadOnly) {
				if (!resource.isReadOnlyDecrypted) {
					resource.isReadOnlyDecrypted = true;
					resource.accessReadOnly = helper.decryptSensitiveData(
						resource.accessReadOnly
					);
				}

				// Add the database name info to the access settings
				for (const readOnly of resource.accessReadOnly) {
					readOnly.dbName = this.getAppliedDbName(db);
				}
			}

			try {
				// Set up the connection
				await adapterManager.setupConnection(resource);
			} catch (err) {
				this.overallStatus = "Error";
				this.addLog(
					`Cannot connect to database server '${resource.name}'. ${err.message}`,
					"Error"
				);
			}
		}

		// Second, we need to set up the cache connections
		const caches = resources.filter((entry) => entry.type === "cache");
		for (const cache of caches) {
			cache.access = helper.decryptSensitiveData(cache.access);
			if (cache.accessReadOnly)
				cache.accessReadOnly = helper.decryptSensitiveData(
					cache.accessReadOnly
				);

			try {
				// Set up the connection
				await adapterManager.setupConnection(cache);
			} catch (err) {
				this.overallStatus = "Error";
				this.addLog(
					`Cannot connect to cache server '${cache.name}'. ${err.message}`,
					"Error"
				);
			}
		}

		// Third, we need to set up the storage connections
		const storages = resources.filter((entry) => entry.type === "storage");
		for (const storage of storages) {
			storage.access = helper.decryptSensitiveData(storage.access);
			if (storage.accessReadOnly)
				storage.accessReadOnly = helper.decryptSensitiveData(
					storage.accessReadOnly
				);

			try {
				// Set up the connection
				await adapterManager.setupConnection(storage);
			} catch (err) {
				this.overallStatus = "Error";
				this.addLog(
					`Cannot connect to storage '${storage.name}'. ${err.message}`,
					"Error"
				);
			}
		}

		// Finally, set up the remaining resource conections
		for (const resource of resources) {
			// We have already processed db, cache and storage resources, skip them
			if (!["RabbitMQ", "Agenda"].includes(resource.instance)) continue;

			resource.access = helper.decryptSensitiveData(resource.access);
			if (resource.accessReadOnly)
				resource.accessReadOnly = helper.decryptSensitiveData(
					resource.accessReadOnly
				);

			try {
				// Set up the connection
				await adapterManager.setupConnection(resource);
			} catch (err) {
				this.overallStatus = "Error";
				this.addLog(
					`Cannot connect to resource '${resource.name}'. ${err.message}`,
					"Error"
				);
			}
		}
	}

	/**
	 * Returns the name of the database to use. We need to make the letters lowercase e.g., postgresql users lowercase letters for database names
	 */
	getAppliedDbName(database) {
		if (database.assignUniqueName)
			return `${this.getEnvId()}_${database.iid}`
				.replaceAll("-", "_")
				.toLowerCase();
		else return database.name.toLowerCase();
	}

	/**
	 * Sets up the database resources for the api server
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async manageDatabases() {
		// First load the tasks configuration file
		const dbs = await META.getDatabases();
		if (dbs.length === 0) return;

		for (const db of dbs) {
			const adapterObj = adapterManager.getDatabaseAdapter(db.name);
			if (adapterObj) this.addLog(`Initialized database adapter '${db.name}'`);
			else {
				this.addLog(`Cannot initialize database adapter '${db.name}'`, "Error");
				this.overallStatus = "Error";
			}
		}
	}

	/**
	 * Sets up the storage resources for the api server
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async manageStorages() {
		// First load the tasks configuration file
		const storages = await META.getStorages();
		if (storages.length === 0) return;

		for (const storage of storages) {
			const adapterObj = adapterManager.getStorageAdapter(storage.name);
			if (adapterObj)
				this.addLog(`Initialized storage adapter '${storage.name}'`);
			else {
				this.addLog(
					`Cannot initialize storage adapter '${storage.name}'`,
					"Error"
				);
				this.overallStatus = "Error";
			}
		}
	}

	/**
	 * Sets up the cache resources for the api server
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async manageCaches() {
		// First load the tasks configuration file
		const caches = await META.getCaches();
		if (caches.length === 0) return;

		for (const cache of caches) {
			const adapterObj = adapterManager.getCacheAdapter(cache.name);
			if (adapterObj) this.addLog(`Initialized cache adapter '${cache.name}'`);
			else {
				this.addLog(
					`Cannot initialize cache adapter '${cache.name}'.`,
					"Error"
				);
				this.overallStatus = "Error";
			}
		}
	}

	/**
	 * Sets up the message queue listeners
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async manageQueues() {
		// First load the queues configuration file
		const queueus = await META.getQueues();
		if (queueus.length === 0) return;

		for (const queue of queueus) {
			const adapterObj = adapterManager.getQueueAdapter(queue.name);
			if (adapterObj) {
				try {
					await adapterObj.listenMessages(queue);
					this.addLog(`Initialized handler of queue '${queue.name}'`);
				} catch (err) {
					this.addLog(
						`Cannot initialize handler of queue '${queue.name}'. ${err.message}`,
						"Error"
					);
					this.overallStatus = "Error";
				}
			} else {
				this.addLog(
					`Cannot initialize handler of queue '${queue.name}'. No adapter found.`,
					"Error"
				);
				this.overallStatus = "Error";
			}
		}
	}

	/**
	 * Sets up the cron job listeners
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async manageTasks() {
		// First load the tasks configuration file
		const tasks = await META.getTasks();
		if (tasks.length === 0) return;

		for (const task of tasks) {
			const adapterObj = adapterManager.getTaskAdapter(task.name);
			// Independent of whether the task is enabled or not we will initialize the adapter and handler function since we can test the task from the UI
			if (adapterObj) {
				try {
					await adapterObj.listenMessages(task);
					this.addLog(`Initialized handler of task '${task.name}'`);
				} catch (err) {
					this.addLog(
						`Cannot initialize handler of task '${task.name}'. ${err.message}`,
						"Error"
					);
					this.overallStatus = "Error";
				}
			} else {
				this.addLog(
					`Cannot initialize handler of task '${task.name}'. No adapter found.`,
					"Error"
				);
				this.overallStatus = "Error";
			}
		}
	}

	/**
	 *  Sets up the authentication flow SMTP server connection if specified
	 */
	async setUpAuthSMTPConnection() {
		const { authentication } = this.getVersion();
		if (authentication.email.confirmEmail) {
			try {
				await setUpSMTPConnection(authentication.email.customSMTP);
				this.addLog(`Initialized authentication flow SMTP server connection`);
			} catch (err) {
				this.addLog(
					`Cannot initialize authentication flow SMTP server connection. ${err.message}`,
					"Error"
				);
				this.overallStatus = "Error";
			}
		}
	}

	/**
	 *  Sets up or disconnects the realtime connection
	 */
	manageRealtimeConnection() {
		const { realtime } = this.getVersion();
		if (realtime.enabled) {
			initializeRealtimeServer();
			this.addLog(`Initialized realtime server connection`);
		} else disconnectRealtimeClient();
	}
}
