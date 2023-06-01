import express from "express";
import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import responseTime from "response-time";
import cookieParser from "cookie-parser";
import { DeploymentManager } from "./deploymentManager.js";
import { handleUndefinedPaths } from "../middlewares/undefinedPaths.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import { applyRateLimit } from "../middlewares/applyRateLimit.js";
import { logRequest } from "../middlewares/logRequest.js";
import { checkAPIKey } from "../middlewares/checkAPIKey.js";
import { checkSession } from "../middlewares/checkSession.js";
import { handleFileUploads } from "../middlewares/handleFileUploads.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { applyCustomMiddleware } from "../middlewares/applyCustomMiddleware.js";
import { runHandler } from "../middlewares/runHandler.js";
import { adapterManager } from "./adapterManager.js";
import { MetaManager } from "./metaManager.js";

export class ChildProcessDeploymentManager extends DeploymentManager {
	constructor(msgObj, envObj, i18n) {
		super(msgObj, envObj);
		this.expressApp = null;
		this.i18n = i18n;
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
	 * Initializes the API server of the app version
	 */
	async initializeCore() {
		logger.info(`Started initializing the API server`);
		// First load the environment and vesion configuration file
		const envObj = await this.loadEnvConfigFile();
		// Set the environment object of the deployment manager
		this.setEnvObj(envObj);
		// Save also the environment object to globals for faster access
		global.META = new MetaManager(envObj);
		// We are initializing the server, do not process any incoming requests
		global.SERVER_STATUS = "initializing";

		// Initialize express server
		await this.initExpressServer();
		// Manage endpoints
		await this.manageEndpoints();
		// Spin up the express server
		await this.startExpressServer();

		// Set the environment variables of the API server
		this.manageEnvironmentVariables(this.getEnvironmentVariables());
		// Initialize the connection manager
		await this.setupResourceConnections();
		// Create initial buckets if needed, don't call it with await it can run in parallel
		this.manageStorages();
		// Set up the queue listeners
		await this.manageQueues();
		// Set up the task listeners
		await this.manageTasks();

		logger.info(`Completed initializing the API server`);
	}

	/**
	 * Manages the environment variables of the API server
	 * @param  {Array} variables The list of environment variables in name-value pairs
	 */
	manageEnvironmentVariables(variables) {
		if (variables.length === 0) return;

		for (const variable of variables) {
			process.env[variable.name] = variable.value;
			logger.info(`Added environment variable '${variable.name}'`);
		}
	}

	/**
	 * Initializes the express server
	 */
	async initExpressServer() {
		logger.info(`Initializing express server`);
		// Create and set the express application
		var app = express();
		this.setExpressApp(app);

		//Secure express app by setting various HTTP headers
		app.use(helmet());
		//Enable cross-origin resource sharing
		app.use(cors());
		//Disable client side caching
		app.use(nocache());
		app.set("etag", false);
		app.use(cookieParser());
		// Add middleware to identify user locale using 'accept-language' header to guess language settings
		app.use(this.i18n.init);

		// Add the default system endpoints
		app.use("/", (await import("../routes/system.js")).default);
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
			logger.info(`Http server started @ ${HOST}:${PORT}`);
			// We completed server initialization and can accept incoming requests
			global.SERVER_STATUS = "running";
		});

		/* 	Particularly needed in case of bulk insert/update/delete operations, we should not generate 502 Bad Gateway errors at nginex ingress controller, the value specified in default config file is in milliseconds */
		server.timeout = config.get("server.timeout");
	}

	/**
	 * Adds the endpoints and associated middlewares of the API server as routes to the express server app
	 */
	async manageEndpoints() {
		// First load the endpoints configuration file
		const endpoints = await META.getEndpoints();
		// Process each endpoint one by one and add it to the express app as a route
		for (const endpoint of endpoints) {
			// This will keep all middlewares and route hander
			const handlers = [];
			// Create a new router for the endpoint
			const router = express.Router();

			// Add the server status checker middleware
			handlers.push(getResponseBody);
			// Add the server status checker middleware
			handlers.push(checkServerStatus);
			// Add rate limiter middlewares if any
			this.addRateLimiters(endpoint, handlers);
			// If the endpoint is marked as log enabled then add logging middleware
			this.addLogMiddleware(endpoint, handlers);
			// If the endpoint is marked as API key required then add API key check middleware
			this.addAPIKeyMiddleware(endpoint, handlers);
			// If the endpoint is marked as session required then add session token check middleware
			this.addSessionMiddleware(endpoint, handlers);
			// Add file handler middleware
			handlers.push(handleFileUploads);
			// Add content-type check middleware
			handlers.push(checkContentType);
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

			this.getExpressApp().use(touter);

			logger.info(
				`Added endpoint '${endpoint.name}' ${endpoint.method}: ${endpoint.path}`
			);
		}
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
		if (rateLimiters.lendth === 0) {
			rateLimiters = this.getEndpointDefaultRateLimits();
		}

		// If there are no rate limites then do nothing
		if (rateLimiters.lendth === 0) return;

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

		handlers.push(checkSession);
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
				handlers.push(applyCustomMiddleware(endpoint, middleware));
			}
		}
	}

	/**
	 * Adds the route handler function
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	addEndpointHandler(endpoint, handlers) {
		handlers.push(runHandler(endpoint));
	}

	/**
	 * Sets up the connetions to application resources
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async setupResourceConnections() {
		const resources = this.getResources();
		for (const resource of resources) {
			await adapterManager.setupConnection(resource);
			logger.info(
				`Initialized the adapter of '${resource.type}' resource '${resource.name}'`
			);
		}
	}

	/**
	 * Sets up the storage resources for the api server
	 * @param  {Object} endpoint The endpoint JSON object
	 * @param  {Array} handlers The array where the route handler will be will be added
	 */
	async manageStorages() {
		const storageMappings = this.getResourceMappings().filter(
			(entry) => entry.design.type === "storage"
		);

		if (storageMappings.length === 0) return;

		for (const mapping of storageMappings) {
			const connection = adapterManager.getStorageAdapter(mapping.design.name);

			if (connection) {
				await connection.ensureStorage(`${mapping.design.iid}`);
				logger.info(`Initialized storage '${mapping.design.name}'`);
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
				adapterObj.listenMessages(queue.iid);
				logger.info(`Initialized handler of queue '${queue.name}'`);
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
			const adapterObj = adapterManager.getTaskAdapter(queue.name);
			if (adapterObj) {
				adapterObj.listenMessages(task.iid);
				logger.info(`Initialized handler of task '${task.name}'`);
			}
		}
	}
}
