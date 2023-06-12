import express from "express";
import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import responseTime from "response-time";
import cookieParser from "cookie-parser";
import axios from "axios";
import path from "path";
import fs from "fs/promises";
import { execSync } from "child_process";
import { getKey } from "../init/cache.js";
import { corePackages } from "../config/constants.js";
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

export class DeploymentManager {
	constructor(envObj, i18n) {
		// Set the environment object
		this.envObj = envObj;
		// Deployment operation logs
		this.logs = [];
		this.expressApp = null;
		this.i18n = i18n;
	}

	/**
	 * Set the environment object of the deployment manager
	 * @param  {Object} envObj Environment object json
	 */
	setEnvObj(envObj) {
		this.envObj = envObj;
	}

	/**
	 * Returns the environment object
	 */
	getEnvObj() {
		return this.envObj;
	}

	/**
	 * Returns the environment iid (internal identifier)
	 */
	getEnvId() {
		return this.getEnvObj().iid;
	}

	/**
	 * Returns the version of the app
	 */
	getVersion() {
		return this.getEnvObj().version;
	}

	/**
	 * Returns the NPM packages of the version
	 */
	getPackages() {
		return this.getVersion().npmPackages ?? [];
	}

	/**
	 * Returns the params of the version
	 */
	getEnvironmentVariables() {
		return this.getVersion().params ?? [];
	}

	/**
	 * Returns the API keys of the version
	 */
	getAPIKeys() {
		return this.getVersion().apiKeys ?? [];
	}

	/**
	 * Returns the rate limits of the version
	 */
	getLimits() {
		return this.getVersion().limits ?? [];
	}

	/**
	 * Returns the default rate limits of the application
	 */
	getEndpointDefaultRateLimits() {
		return this.getVersion().defaultEndpointLimits ?? [];
	}

	/**
	 * Returns the environment resource mappings
	 */
	getResourceMappings() {
		return this.getEnvObj().mappings ?? [];
	}

	/**
	 * Returns the environment resource mappings
	 */
	getResources() {
		return this.getEnvObj().resources ?? [];
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
	 * Adds a log message to track the progress of deployment operations
	 * @param  {string} message Logged message
	 * @param  {string} status Whether the operation has completed successfully or with errors
	 */
	addLog(message, status = "OK") {
		let dtm = new Date();
		let duration = 0;
		if (this.prevDtm) {
			duration = dtm - this.prevDtm;
		}

		this.logs.push({
			startedAt: dtm,
			duration: duration,
			status,
			message,
			pod: process.env.POD_NAME,
		});

		logger.info(`${message} (${duration}ms)`);
		this.prevDtm = dtm;
	}

	/**
	 * Updates the environment status and logs in platform
	 * @param  {string} status Final environment status
	 */
	async sendEnvironmentLogs(status = "OK") {
		// If there is no callback just return
		if (!this.envObj.callback) return;

		try {
			// Update the environment log object
			await axios.post(
				this.envObj.callback,
				{
					status: status,
					logs: this.logs,
					type: "server",
					pod: process.env.POD_NAME,
				},
				{
					headers: {
						Authorization: process.env.MASTER_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);
		} catch (err) {}
	}

	/**
	 * Loads the environment config file
	 */
	async loadEnvConfigFile() {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(
				`${appPath}/meta/config/environment.json`,
				"utf8"
			);
			return JSON.parse(fileContents);
		} catch (error) {
			return null;
		}
	}

	/**
	 * Loads the specific entity configuration file, if not config file exists it returns an empty array object
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 */
	async loadEntityConfigFile(contentType) {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(
				`${appPath}/meta/config/${contentType}.json`,
				"utf8"
			);
			return JSON.parse(fileContents);
		} catch (error) {
			return [];
		}
	}

	/**
	 * Manages the metadata of the API server and starts the API server
	 */
	async initialize() {
		try {
			this.addLog(t("Started managing API server configuration"));
			if (!this.getEnvObj()) {
				this.addLog(t("Cannot get the environment object data"));
				return;
			}
			// Check whether app is already deployed to this api server or not
			const envConfig = await this.loadEnvConfigFile();

			// If there is previous deployment check the timestamps
			if (envConfig) {
				const latestTimestamp = await getKey(
					`${process.env.AGNOST_ENVIRONMENT_ID}.timestamp`
				);

				// The api server has the latest configuration
				if (latestTimestamp && envConfig.timestamp === latestTimestamp) {
					this.addLog(
						t("API server has the latest configuration, no changes applied")
					);

					// Start up the API server
					await this.startUpServer(envConfig);
					return;
				}
			}

			// Intially clear all configuration files
			await this.clearConfig();
			// Save all configuration files
			await this.saveConfig();
			// Manage NPM packages
			await this.manageNPMPackages();
			this.addLog(t("Completed managing API server configuration"));
			// Start up the API server
			await this.startUpServer(envConfig);
			// Send the deployment telemetry information to the platform
			await this.sendEnvironmentLogs("OK");
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[t("Deployment failed"), error.name, error.message, error.stack].join(
					"\n"
				),
				"Error"
			);
			await this.sendEnvironmentLogs("Error");
		}
	}

	/**
	 * Clears all configuration files
	 */
	async clearConfig() {
		await this.deleteFilesInFolder("config");
		await this.deleteFilesInFolder("endpoints");
		await this.deleteFilesInFolder("middlewares");
		await this.deleteFilesInFolder("queues");
		await this.deleteFilesInFolder("tasks");

		this.addLog(t("Cleared app configuration files and metadata"));
	}

	/**
	 * Save the environment config file
	 */
	async saveEnvConfigFile() {
		const appPath = path.resolve(__dirname);
		const filePath = path.join(`${appPath}/meta/config/environment.json`);
		// Write environemnt config data
		await fs.writeFile(filePath, JSON.stringify(this.getEnvObj(), null, 2));
	}

	/**
	 * Saves the configuration data of the entity to its configuration file
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 * @param  {Array} configEntries The array of JSON objects for the app configuration e.g., array of endpoints, tasks excluding their code
	 */
	async saveEntityConfigFile(contentType, configEntries) {
		const appPath = path.resolve(__dirname);
		const filePath = path.join(`${appPath}/meta/config/${contentType}.json`);

		// Write config data
		await fs.writeFile(filePath, JSON.stringify(configEntries, null, 2));
	}

	/**
	 * Deletes all files in given metadata folder
	 * @param  {string} folderName The metadata foler name such as endpoints, queues, tasks, middlewares
	 */
	async deleteFilesInFolder(folderName) {
		const appPath = path.resolve(__dirname);
		const files = await fs.readdir(`${appPath}/meta/${folderName}`);
		for (const file of files) {
			const filePath = path.join(`${appPath}/meta/${folderName}`, file);
			// If the file does not exists it will throw an error, during initial load there will be no config files
			try {
				await fs.unlink(filePath);
			} catch (err) {}
		}
	}

	/**
	 * Saves configuration files
	 */
	async saveConfig() {
		// Save endpoints
		const endpoints =
			(await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.endpoints`)) ?? [];
		await this.manageConfigFiles("endpoints", endpoints, "set");

		// Save middlewares
		const middlewares =
			(await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.middlewares`)) ?? [];
		await this.manageConfigFiles("middlewares", middlewares, "set");

		// Save queues
		const queues =
			(await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.queues`)) ?? [];
		await this.manageConfigFiles("queues", queues, "set");

		// Save tasks
		const tasks =
			(await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.tasks`)) ?? [];
		await this.manageConfigFiles("tasks", tasks, "set");

		// Save environment and version info
		await this.saveEnvConfigFile();
		// Save databases info
		const databases =
			(await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.databases`)) ?? [];
		await this.saveEntityConfigFile("databases", databases);

		this.addLog(t("Saved new app configuration files and metadata"));
	}

	/**
	 * Saves configuration files to the specified meta folder and overall config folder
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares. This will also be used as the folder name.
	 * @param  {Array} contents The array of JSON objects for the app configuration e.g., array of endpoints, tasks
	 * @param  {string} actionType The action type such as set, update, delete and add
	 */
	async manageConfigFiles(contentType, contents, actionType) {
		// We save the files both to their respective meta folder but also udpate the entries in their respective data in config folder
		// As an example when we save each endpoint to meta/endpoints folder individually, we also save their configuration (without the code part) to meta/config/endpoints.json file also
		const configItems = [];
		const appPath = path.resolve(__dirname);
		switch (actionType) {
			case "set":
			case "update":
			case "add":
				for (const entry of contents) {
					const filePath = path.join(
						`${appPath}/meta/${contentType}/${entry.iid}.js`
					);

					// Write file code
					await fs.writeFile(filePath, entry.code);

					// Add the config item without the code to the overall config file
					delete entry.code;
					configItems.push(entry);
				}
				break;
			case "delete":
				for (const entry of contents) {
					const filePath = path.join(
						`${appPath}/meta/${contentType}/${entry.iid}.js`
					);

					// Delete the file if it exists
					try {
						await fs.unlink(filePath);
					} catch (err) {}

					// Add the config item withoud the code to the overall config file
					delete entry.code;
					configItems.push(entry);
				}
				break;
			default:
				break;
		}

		// Save the summary info about all design elements under the /meta/config folder
		await this.updateConfigEntries(contentType, configItems, actionType);
	}

	/**
	 * Saves configuration data to config folder
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 * @param  {Array} configEntries The array of JSON objects for the app configuration e.g., array of endpoints, tasks excluding their code
	 * @param  {string} actionType The action type such as set, update, delete and add
	 */
	async updateConfigEntries(contentType, configEntries, actionType) {
		let config = await this.loadEntityConfigFile(contentType);
		switch (actionType) {
			case "set":
				config = configEntries;
				break;
			case "add":
				config.push(...configEntries);
				await this.saveEntityConfigFile(contentType, config);
				break;
			case "update":
				config = config.map((entry) => {
					let newEntry = configEntries.find(
						(newEntry) => newEntry.iid === entry.iid
					);

					if (newEntry) return newEntry;
					else return entry;
				});
				break;
			case "delete":
				config = config.filter(
					(entry) => !secondArray.find((item) => item.iid === entry.iid)
				);
				break;
			default:
				break;
		}

		await this.saveEntityConfigFile(contentType, configEntries);
	}

	/**
	 * Parses the packages.json file and returns the dependencies list
	 */
	async getInstalledNPMPackages() {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(`${appPath}/package.json`, "utf8");
			const json = JSON.parse(fileContents);
			return json.dependencies;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Installs the required NPM packages
	 */
	async manageNPMPackages() {
		const installedPackages = await this.getInstalledNPMPackages();
		const packages = this.getPackages() ?? [];

		const packagesToInstall = [];
		for (const pkg of packages) {
			// Check if the package is already installed as a core package of the API server pod
			if (corePackages.includes(pkg.name)) continue;

			// Check whether the package is installed as an add-on and has the same version
			if (installedPackages[pkg.name] === `^${pkg.version}`) continue;

			// This is a new package or the package has a different version, we need to add it to our installation list
			packagesToInstall.push(`${pkg.name}@${pkg.version}`);
		}

		const packagesToUnInstall = [];
		for (const [key, value] of Object.entries(installedPackages)) {
			// Check if the package is a core package
			if (corePackages.includes(key)) continue;
			// Check if the package is in the version packages list
			if (packages.find((entry) => entry.name === key)) continue;
			// Add package to uninstall list
			packagesToUnInstall.push(`${key}`);
		}

		if (packagesToUnInstall.length > 0) {
			this.addLog(t("Uninstalling %s package(s)", packagesToUnInstall.length));
		}
		// If there are packages to uninstall then uninstall them
		for (let i = 0; i < packagesToUnInstall.length; i++) {
			const entry = packagesToUnInstall[i];
			try {
				execSync(`npm uninstall ${entry}`, {
					stdio: "ignore",
				});
				this.addLog(t("Uninstalled package %s", entry));
			} catch (err) {
				this.addLog(t("Failed to uninstall package %s", entry));
			}
		}

		if (packagesToInstall.length > 0) {
			this.addLog(
				t("Installing/updating %s package(s)", packagesToInstall.length)
			);
		}
		// If there are packages to install then install them
		for (let i = 0; i < packagesToInstall.length; i++) {
			const entry = packagesToInstall[i];
			try {
				execSync(`npm install ${entry}`, {
					stdio: "ignore",
				});
				this.addLog(t("Installed/updated package %s", entry));
			} catch (err) {
				this.addLog(t("Failed to install package %s", entry));
			}
		}
	}

	/**
	 * Initializes the API server of the app version
	 * @param  {Object} envObj The environment JSON object
	 */
	async startUpServer(envObj) {
		logger.info(`Starting up the API server`);
		// If we do  not have the envObj yet then just spin up the express server to serve system default endpoints
		if (!envObj) {
			// Initialize express server
			await this.initExpressServer();
			// Spin up the express server
			await this.startExpressServer();
			return;
		}

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

		logger.info(`API server up and running`);
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
