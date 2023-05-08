import axios from "axios";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import resourceCtrl from "../controllers/resource.js";

class DeploymentController {
	constructor() {}

	/**
	 * Returns the list of environment resources mapped to this environment.
	 * When returning the resource information, it also decrypts the resources access settings
	 * @param  {object} env The environment object
	 */
	async getEnvironmentResources(env) {
		// Get all resource ids
		let resourceIds = env.mappings.map((entry) => entry.resource.id);

		// Get the resources used by the environment
		let resources = await resourceCtrl.getManyByQuery({
			_id: { $in: resourceIds },
		});

		// Decrypt access data of the resources and delete managed resource config settings
		resources.forEach((element) => {
			delete element.config;
			delete element.telemetry;
			element.access = helper.decryptSensitiveData(element.access);

			if (element.accessReadOnly)
				element.accessReadOnly = helper.decryptSensitiveData(
					element.accessReadOnly
				);
		});

		return resources;
	}

	/**
	 * Returns the database and associated models information
	 * @param  {string} versionId The version id
	 * @param  {string} dbId The database id
	 */
	async getDatabaseDesign(versionId, dbiid) {
		let db = await dbCtrl.getOneByQuery({ iid: dbiid, versionId: versionId });

		if (!db) return null;
		db.models = await modelCtrl.getManyByQuery({ dbId: db._id, versionId });

		return db;
	}

	/**
	 * Deploys the version to the environment
	 * @param  {object} log The environment log object
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the deployment
	 */
	async deploy(log, app, version, env, user) {
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);
		// Get environment engine
		let engine = resources.find((entry) => entry.type === "engine");

		if (!engine) {
			throw new AgnostError(
				t(
					"Environment '%s' does not have an assigned engine cluster. To deploy an app version to an environment, an engine cluster mapping needs to be made.",
					env.name
				)
			);
		}

		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			timestamp: new Date(),
			action: "deploy",
			callback: `${config.get("general.platformBaseUrl")}/v1/org/${
				env.orgId
			}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
				log._id
			}`,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			env: { ...env, version },
			databases: [],
		};

		// For each design element build entries in the payload
		for (let i = 0; i < env.mappings.length; i++) {
			const mapping = env.mappings[i];
			// Check if this mapping has a corresponding resource
			const resource = resources.find(
				(entry) => entry._id.toString() === mapping.resource.id.toString()
			);

			// If there is no resource availble we skip the design element
			if (!resource) continue;
			// We have the design element
			switch (mapping.design.type) {
				case "database": {
					let db = await this.getDatabaseDesign(
						version._id,
						mapping.design.iid
					);
					if (db) {
						// Assign the resource info of the database, also add the default database name to the access settings
						db.resource = resource;
						payload.databases.push(db);
					}
				}
				default:
					break;
			}
		}

		//Make api call to environment worker engine to deploy app version
		await axios.post(engine.access.workerUrl + "/v1/env/deploy", payload, {
			headers: {
				Authorization: engine.access.accessToken,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Redeploys the version to the environment
	 * @param  {object} log The environment log object
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the deployment
	 */
	async redeploy(log, app, version, env, user) {
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);
		// Get environment engine
		let engine = resources.find((entry) => entry.type === "engine");

		if (!engine) {
			throw new AgnostError(
				t(
					"Environment '%s' does not have an assigned engine cluster. To redeploy an app version to an environment, an engine cluster mapping needs to be made.",
					env.name
				)
			);
		}

		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			timestamp: new Date(),
			action: "redeploy",
			callback: `${config.get("general.platformBaseUrl")}/v1/org/${
				env.orgId
			}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
				log._id
			}`,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			env: { ...env, version },
			databases: [],
		};

		// For each design element build entries in the payload
		for (let i = 0; i < env.mappings.length; i++) {
			const mapping = env.mappings[i];
			// Check if this mapping has a corresponding resource
			const resource = resources.find(
				(entry) => entry._id.toString() === mapping.resource.id.toString()
			);

			// If there is no resource availble we skip the design element
			if (!resource) continue;
			// We have the design element
			switch (mapping.design.type) {
				case "database": {
					let db = await this.getDatabaseDesign(
						version._id,
						mapping.design.iid
					);
					if (db) {
						// Assign the resource info of the database, also add the default database name to the access settings
						db.resource = resource;
						payload.databases.push(db);
					}
				}
				default:
					break;
			}
		}

		//Make api call to environment worker engine to redeploy app version
		await axios.post(engine.access.workerUrl + "/v1/env/redeploy", payload, {
			headers: {
				Authorization: engine.access.accessToken,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Undeploys the version from the environment
	 * @param  {object} log The environment log object
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the deployment
	 * @param  {boolean} dropData Whether to delete environment data (e.g., app databases, storage, cache)
	 */
	async undeploy(log, app, version, env, user, dropData = true) {
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);
		// Get environment engine
		let engine = resources.find((entry) => entry.type === "engine");

		if (!engine) {
			throw new AgnostError(
				t(
					"Environment '%s' does not have an assigned engine cluster. To undeploy an app version from an environment, an engine cluster mapping needs to be made.",
					env.name
				)
			);
		}

		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			timestamp: new Date(),
			action: "undeploy",
			dropData: dropData,
			callback: `${config.get("general.platformBaseUrl")}/v1/org/${
				env.orgId
			}/app/${env.appId}/version/${env.versionId}/env/${env._id}/log/${
				log._id
			}`,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			env: { ...env, version },
		};

		//Make api call to environment worker engine to undeploy app version
		await axios.post(engine.access.workerUrl + "/v1/env/undeploy", payload, {
			headers: {
				Authorization: engine.access.accessToken,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Deletes the environment
	 * @param  {object} log The environment log object
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the deployment
	 */
	async delete(log, app, version, env, user) {
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);
		// Get environment engine
		let engine = resources.find((entry) => entry.type === "engine");

		// If the environment does not have an engine then do nothing
		if (!engine) return;

		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			timestamp: new Date(),
			action: "delete",
			callback: log
				? `${config.get("general.platformBaseUrl")}/v1/org/${env.orgId}/app/${
						env.appId
				  }/version/${env.versionId}/env/${env._id}/log/${log._id}`
				: undefined,
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			env: { ...env, version },
		};

		//Make api call to environment worker engine to delete the environment
		await axios.post(engine.access.workerUrl + "/v1/env/delete", payload, {
			headers: {
				Authorization: engine.access.accessToken,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Updates the environment data in engine cluster if autoDeploy is turned on and the version is deployed to the environemnt
	 * @param  {object} app The application object
	 * @param  {object} version The version object
	 * @param  {object} env The environment object
	 * @param  {object} user The user who initiated the deployment
	 */
	async update(app, version, env, user) {
		// If auto deploy is turned off or version has not been deployed to the environment then we do not send the environment updates to the engine cluster
		if (!env.autoDeploy || !env.deploymentDtm) return;
		// First get the list of environment resources
		let resources = await this.getEnvironmentResources(env);
		// Get environment engine
		let engine = resources.find((entry) => entry.type === "engine");

		// If the environment does not have an engine then do nothing
		if (!engine) return;

		// Start building the deployment instructions that will be sent to the engine cluster worker
		let payload = {
			timestamp: new Date(),
			action: "update",
			actor: {
				userId: user._id,
				name: user.name,
				pictureUrl: user.pictureUrl,
				color: user.color,
				contactEmail: user.contactEmail,
			},
			app,
			env: { ...env, version },
		};

		//Make api call to environment worker engine to update environment data
		await axios.post(engine.access.workerUrl + "/v1/env/update", payload, {
			headers: {
				Authorization: engine.access.accessToken,
				"Content-Type": "application/json",
			},
		});
	}
}

export default new DeploymentController();
