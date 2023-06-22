import axios from "axios";
import dbCtrl from "../controllers/database.js";
import epCtrl from "../controllers/endpoint.js";
import mwCtrl from "../controllers/middleware.js";
import queueCtrl from "../controllers/queue.js";
import taskCtrl from "../controllers/task.js";
import modelCtrl from "../controllers/model.js";
import resourceCtrl from "../controllers/resource.js";
import versionCtrl from "../controllers/version.js";
import appCtrl from "../controllers/app.js";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import { sendMessage } from "../init/sync.js";

class DeploymentController {
	constructor() {}

	/**
	 * Returns the environment of the version
	 * @param  {object} version The version object
	 */
	async getEnvironment(version) {
		// Get the resources used by the environment
		const env = await envCtrl.getOneByQuery({
			versionId: version._id,
		});

		return env;
	}

	/**
	 * Returns the environment of the version
	 * @param  {object} version The version object
	 */
	async createEnvLog(
		version,
		env,
		user,
		dbStatus,
		serverStatus,
		schedulerStatus
	) {
		// Update the environment object status
		const updatedEnv = await envCtrl.updateOneById(
			env._id,
			{
				dbStatus,
				serverStatus,
				schedulerStatus,
				updatedBy: user._id,
			},
			{},
			{ cacheKey: env._id }
		);

		// Send realtime message
		sendMessage(version._id, {
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				loginEmail: user.loginProfiles[0].email,
				contactEmail: user.contactEmail,
			},
			action: "update",
			object: "org.app.version.environment",
			description: t("Updating environment"),
			timestamp: Date.now(),
			data: updatedEnv,
			identifiers: {
				orgId: version.orgId,
				appId: version.appId,
				versionId: version._id,
				envId: env._id,
			},
		});

		// Create environment logs entry, which will be updated when the deployment is completed
		let envLog = await envLogCtrl.create({
			orgId: version.orgId,
			appId: version.appId,
			versionId: version._id,
			envId: env._id,
			action: "auto-deploy",
			dbStatus: dbStatus,
			serverStatus: serverStatus,
			schedulerStatus: schedulerStatus,
			dbLogs: [],
			serverLogs: [],
			schedulerLogs: [],
			createdBy: user._id,
		});

		return envLog;
	}

	/**
	 * Returns the list of environment resources mapped to this environment.
	 * @param  {object} env The environment object
	 */
	async getEnvironmentResources(env) {
		// Get all resource ids
		let resourceIds = env.mappings.map((entry) => entry.resource.iid);

		// Get the resources used by the environment
		let resources = await resourceCtrl.getManyByQuery({
			iid: { $in: resourceIds },
		});

		return resources;
	}

	/**
	 * Returns the databases and their associated models
	 * @param  {string} versionId The version id
	 */
	async getDatabases(versionId) {
		let databases = await dbCtrl.getManyByQuery({ versionId });
		for (const db of databases) {
			db.models = await modelCtrl.getManyByQuery({ dbId: db._id, versionId });
		}

		return databases;
	}

	/**
	 * Returns the endpoints
	 * @param  {string} versionId The version id
	 */
	async getEndpoints(versionId) {
		let endpoints = await epCtrl.getManyByQuery({ versionId });

		return endpoints;
	}

	/**
	 * Returns the middlewares
	 * @param  {string} versionId The version id
	 */
	async getMiddlewares(versionId) {
		let middlewares = await mwCtrl.getManyByQuery({ versionId });

		return middlewares;
	}

	/**
	 * Returns the message queues
	 * @param  {string} versionId The version id
	 */
	async getQueues(versionId) {
		let queues = await queueCtrl.getManyByQuery({ versionId });

		return queues;
	}

	/**
	 * Returns the tasks
	 * @param  {string} versionId The version id
	 */
	async getTasks(versionId) {
		let tasks = await taskCtrl.getManyByQuery({ versionId });

		return tasks;
	}

	/**
	 * Deploys the version to the environment
	 * @param  {object} envLog The environment log object
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the deployment
	 */
	async deploy(envLog, app, version, env, user) {
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);

		const callback = `${config.get("general.platformBaseUrl")}/v1/org/${
			env.orgId
		}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
			envLog._id
		}`;
		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "deploy",
			subAction: "deploy",
			callback: callback,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			// We pass the list of resources in env object, the callback is also required in the env object so that engine-core send back deployment status info
			env: { ...env, callback, version, resources, timestamp: new Date() },
			databases: await this.getDatabases(version._id),
			endpoints: await this.getEndpoints(version._id),
			middlewares: await this.getMiddlewares(version._id),
			queues: await this.getQueues(version._id),
			tasks: await this.getTasks(version._id),
			storage: [],
			cache: [],
		};

		//Make api call to environment worker engine to deploy app version
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/deploy",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Redeploys the version to the environment
	 * @param  {object} envLog The environment log object
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the deployment
	 */
	async redeploy(envLog, app, version, env, user) {
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);

		const callback = `${config.get("general.platformBaseUrl")}/v1/org/${
			env.orgId
		}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
			envLog._id
		}`;
		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "redeploy",
			subAction: "redeploy",
			callback: callback,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			// We pass the list of resources in env object, the callback is also required in the env object so that engine-core send back deployment status info
			env: { ...env, callback, version, resources, timestamp: new Date() },
			databases: await this.getDatabases(version._id),
			endpoints: await this.getEndpoints(version._id),
			middlewares: await this.getMiddlewares(version._id),
			queues: await this.getQueues(version._id),
			tasks: await this.getTasks(version._id),
			storage: [],
			cache: [],
		};

		//Make api call to environment worker engine to redeploy app version
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/redeploy",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Deletes the environment. Please note that when we delete an organization we pass the app and version parameters null.
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the delete operation
	 */
	async delete(app, version, env, user) {
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);

		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "delete",
			callback: null,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			env: { ...env, version, resources, timestamp: new Date() },
		};

		//Make api call to environment worker engine to delete the environment
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/delete",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Updates the version and also environment metadata in engine cluster if autoDeploy is turned on
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} user The user who initiated the update
	 */
	async updateVersionInfo(app, version, user, subAction) {
		const env = await this.getEnvironment(version);
		// If auto deploy is turned off or version has not been deployed to the environment then we do not send the environment updates to the engine cluster
		if (!env.autoDeploy || !env.deploymentDtm) return;

		// Create the environment log entry
		const envLog = await this.createEnvLog(
			version,
			env,
			user,
			"Deploying",
			[{ pod: "all", status: "Deploying" }],
			env.schedulerStatus
		);
		// First get the list of environment resources
		const resources = await this.getEnvironmentResources(env);

		const callback = `${config.get("general.platformBaseUrl")}/v1/org/${
			env.orgId
		}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
			envLog._id
		}`;
		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "update-version",
			subAction: subAction,
			callback: callback,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			// We pass the list of resources in env object, the callback is also required in the env object so that engine-core send back deployment status info
			env: { ...env, callback, version, resources, timestamp: new Date() },
		};

		// Make api call to environment worker engine to update environment data
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/update",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Updates the version and also environment metadata in engine cluster if autoDeploy is turned on
	 * @param  {string} appId The application id
	 * @param  {string} versionId The version id
	 * @param  {object} resource The resource whose access setting has been updated
	 * @param  {object} user The user who initiated the update
	 */
	async updateResourceAccessSettings(appId, versionId, resource, user) {
		const version = await versionCtrl.getOneById(versionId, {
			cacheKey: versionId,
		});
		const env = await this.getEnvironment(version);
		// If auto deploy is turned off or version has not been deployed to the environment then we do not send the environment updates to the engine cluster
		if (!env.autoDeploy || !env.deploymentDtm) return;

		const app = appCtrl.getOneById(appId, { cacheKey: appId });

		// Create the environment log entry
		const envLog = await this.createEnvLog(
			version,
			env,
			user,
			"Deploying",
			[{ pod: "all", status: "Deploying" }],
			env.schedulerStatus
		);
		// First get the list of environment resources
		const resources = await this.getEnvironmentResources(env);

		const callback = `${config.get("general.platformBaseUrl")}/v1/org/${
			env.orgId
		}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
			envLog._id
		}`;
		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "update-resource",
			subAction: "update-resource-access",
			callback: callback,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			// We pass the list of resources in env object, the callback is also required in the env object so that engine-core send back deployment status info
			env: { ...env, callback, version, resources, timestamp: new Date() },
			updatedResource: resource,
		};

		// Make api call to environment worker engine to update resource-access settings
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/update-resource-access",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Updates the database configuration if autoDeploy is turned on
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} user The user who initiated the update
	 * @param  {object} database The database object that is created/updted/deleted
	 * @param  {string} subAction Can be either add, update, delete
	 */
	async updateDatabase(app, version, user, database, subAction) {
		const env = await this.getEnvironment(version);
		// If auto deploy is turned off or version has not been deployed to the environment then we do not send the environment updates to the engine cluster
		if (!env.autoDeploy || !env.deploymentDtm) return;

		// Create the environment log entry
		const envLog = await this.createEnvLog(
			version,
			env,
			user,
			"Deploying",
			[{ pod: "all", status: "Deploying" }],
			env.schedulerStatus
		);

		// First get the list of environment resources
		const resources = await this.getEnvironmentResources(env);

		// Add models information to the database object
		database.models = await modelCtrl.getManyByQuery({
			dbId: database._id,
			versionId: version._id,
		});

		const callback = `${config.get("general.platformBaseUrl")}/v1/org/${
			env.orgId
		}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
			envLog._id
		}`;
		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "deploy",
			subAction: subAction,
			callback: callback,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			// We pass the list of resources in env object, the callback is also required in the env object so that engine-core send back deployment status info
			env: { ...env, callback, version, resources, timestamp: new Date() },
			databases: [database],
		};

		// Make api call to environment worker engine to update database
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/update-database",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Updates the endpoints if autoDeploy is turned on
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} user The user who initiated the update
	 * @param  {object} endpoints The endpoints that are created/updated/deleted
	 * @param  {string} subAction Can be either add, update, delete
	 */
	async updateEndpoints(app, version, user, endpoints, subAction) {
		const env = await this.getEnvironment(version);
		// If auto deploy is turned off or version has not been deployed to the environment then we do not send the environment updates to the engine cluster
		if (!env.autoDeploy || !env.deploymentDtm) return;

		// Create the environment log entry
		const envLog = await this.createEnvLog(
			version,
			env,
			user,
			"Deploying",
			[{ pod: "all", status: "Deploying" }],
			env.schedulerStatus
		);

		// First get the list of environment resources
		const resources = await this.getEnvironmentResources(env);

		const callback = `${config.get("general.platformBaseUrl")}/v1/org/${
			env.orgId
		}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
			envLog._id
		}`;
		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "deploy",
			subAction: subAction,
			callback: callback,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			// We pass the list of resources in env object, the callback is also required in the env object so that engine-core send back deployment status info
			env: { ...env, callback, version, resources, timestamp: new Date() },
			endpoints: endpoints,
		};

		// Make api call to environment worker engine to update database
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/update-endpoints",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Updates the middlewares if autoDeploy is turned on
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} user The user who initiated the update
	 * @param  {object} middlewares The middlewares that are created/updated/deleted
	 * @param  {string} subAction Can be either add, update, delete
	 */
	async updateMiddlewares(app, version, user, middlewares, subAction) {
		const env = await this.getEnvironment(version);
		// If auto deploy is turned off or version has not been deployed to the environment then we do not send the environment updates to the engine cluster
		if (!env.autoDeploy || !env.deploymentDtm) return;

		// Create the environment log entry
		const envLog = await this.createEnvLog(
			version,
			env,
			user,
			"Deploying",
			[{ pod: "all", status: "Deploying" }],
			env.schedulerStatus
		);

		// First get the list of environment resources
		const resources = await this.getEnvironmentResources(env);

		const callback = `${config.get("general.platformBaseUrl")}/v1/org/${
			env.orgId
		}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
			envLog._id
		}`;
		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			action: "deploy",
			subAction: subAction,
			callback: callback,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			// We pass the list of resources in env object, the callback is also required in the env object so that engine-core send back deployment status info
			env: { ...env, callback, version, resources, timestamp: new Date() },
			middlewares: middlewares,
		};

		// Make api call to environment worker engine to update database
		await axios.post(
			config.get("general.workerUrl") + "/v1/env/update-middlewares",
			payload,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}
}

export default new DeploymentController();
