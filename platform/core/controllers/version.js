import BaseController from "./base.js";
import { VersionModel } from "../schemas/version.js";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import auditCtrl from "../controllers/audit.js";
import resourceCtrl from "../controllers/resource.js";
import resLogCtrl from "../controllers/resourceLog.js";
import epCtrl from "../controllers/endpoint.js";
import mwCtrl from "../controllers/middleware.js";
import queueCtrl from "../controllers/queue.js";
import taskCtrl from "../controllers/task.js";
import storageCtrl from "../controllers/storage.js";

class VersionController extends BaseController {
	constructor() {
		super(VersionModel);
	}

	/**
	 * Creates a new version. When creating the version we also create the version environment and associated engine deployment
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the version
	 * @param  {Object} org The organization object where the version will be created
	 * @param  {Object} app The app object where the version will be created
	 * @param  {Object} options The version related information such as name, private, readOnly and master flags
	 */
	async createVersion(
		session,
		user,
		org,
		app,
		{ name = "v1.0.0", isPrivate = false, readOnly = true, master = false }
	) {
		// Create the new version
		let versionId = helper.generateId();
		const version = await this.create(
			{
				_id: versionId,
				orgId: org._id,
				appId: app._id,
				iid: helper.generateSlug("ver"),
				name: name,
				private: isPrivate,
				readOnly: readOnly,
				master: master,
				createdBy: user._id,
			},
			{ session, cacheKey: versionId }
		);

		// Create the engine deployment resource of the version
		const envId = helper.generateId();
		const envIid = helper.generateSlug("env");
		const { resource, log: resLog } = await resourceCtrl.createEngineDeployment(
			session,
			user,
			org,
			app,
			version,
			envIid
		);

		const mappings = [
			{
				design: {
					iid: envIid,
					type: "engine",
					name: t("apiServer"),
				},
				resource: {
					iid: resource.iid,
					name: resource.name,
					type: resource.type,
					instance: resource.instance,
				},
			},
		];

		// Create environment data, we do not update the cache value yet, we update it after the deployment
		const env = await envCtrl.create(
			{
				_id: envId,
				orgId: org._id,
				appId: app._id,
				versionId: versionId,
				iid: envIid,
				name: t("Default Environment"),
				autoDeploy: true,
				// We have the mapping for engine, default queue, default scheduler and realtime by default
				mappings: mappings,
				dbStatus: "Deploying",
				serverStatus: "Deploying",
				schedulerStatus: "Deploying",
				createdBy: user._id,
				updatedBy: user._id,
			},
			{ session }
		);

		// Create environment logs entry, which will be updated when the deployment is completed
		let envLog = await envLogCtrl.create(
			{
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
				envId: env._id,
				action: "deploy",
				dbStatus: "Deploying",
				serverStatus: "Deploying",
				schedulerStatus: "Deploying",
				dbLogs: [],
				serverLogs: [],
				schedulerLogs: [],
				createdBy: user._id,
			},
			{ session }
		);

		return {
			version,
			resource,
			resLog,
			env,
			envLog,
		};
	}

	/**
	 * Creates a new version by copying the parent version. When creating the version we also create the version environment and associated engine deployment
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the version
	 * @param  {Object} org The organization object where the version will be created
	 * @param  {Object} app The app object where the version will be created
	 * @param  {Object} options The version related information such as name, private, readOnly and master flags
	 */
	async createVersionCopy(
		session,
		user,
		org,
		app,
		{ name, isPrivate, readOnly, master, parentVersion }
	) {
		// Get the parent environment object
		let parentEnv = await envCtrl.getOneByQuery({
			versionId: parentVersion._id,
		});

		// Create the new version and copy relevant data from the parent version
		let versionId = helper.generateId();
		const version = await this.create(
			{
				_id: versionId,
				orgId: org._id,
				appId: app._id,
				iid: helper.generateSlug("ver"),
				name: name,
				private: isPrivate,
				readOnly: readOnly,
				master: master,
				realtime: parentVersion.realtime,
				params: parentVersion.pararms,
				limits: parentVersion.limits,
				defaultEndpointLimits: parentVersion.defaultEndpointLimits,
				apiKeys: parentVersion.apiKeys,
				npmPackages: parentVersion.npmPackages,
				authentication: parentVersion.authentication,
				createdBy: user._id,
			},
			{ session, cacheKey: versionId }
		);

		// Create the engine deployment resource of the version
		const envId = helper.generateId();
		const envIid = helper.generateSlug("env");
		const { resource, log: resLog } = await resourceCtrl.createEngineDeployment(
			session,
			user,
			org,
			app,
			version,
			envIid
		);

		const mappings = [
			{
				design: {
					iid: envIid,
					type: "engine",
					name: t("apiServer"),
				},
				resource: {
					iid: resource.iid,
					name: resource.name,
					type: resource.type,
					instance: resource.instance,
				},
			},
		];

		// We should also add the relevant mappings from the parent environment
		mappings.push(
			...parentEnv.mappings.filter(
				(entry) => entry.resource.instance !== "API Server"
			)
		);

		// Create environment data, we do not update the cache value yet, we update it after the deployment
		const env = await envCtrl.create(
			{
				_id: envId,
				orgId: org._id,
				appId: app._id,
				versionId: versionId,
				iid: envIid,
				name: t("Default Environment"),
				autoDeploy: true,
				// We have the mapping for engine, default queue, default scheduler and realtime by default
				mappings: mappings,
				dbStatus: "Deploying",
				serverStatus: "Deploying",
				schedulerStatus: "Deploying",
				createdBy: user._id,
				updatedBy: user._id,
			},
			{ session }
		);

		// Create environment logs entry, which will be updated when the deployment is completed
		let envLog = await envLogCtrl.create(
			{
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
				envId: env._id,
				action: "deploy",
				dbStatus: "Deploying",
				serverStatus: "Deploying",
				schedulerStatus: "Deploying",
				dbLogs: [],
				serverLogs: [],
				schedulerLogs: [],
				createdBy: user._id,
			},
			{ session }
		);

		// Copy databases
		const databases = await dbCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});

		// Store old and new database ids, we need them when copying the models
		const idMapping = [];
		// Copy databases to the new version
		if (databases && databases.length > 0) {
			databases.forEach((database) => {
				const newId = helper.generateId();
				idMapping.push({ new: newId, old: database._id });
				database.versionId = versionId;
				database._id = newId;
			});

			await dbCtrl.createMany(databases, { session });
		}

		// Copy models
		const models = await modelCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy models to the new version
		if (models && models.length > 0) {
			models.forEach((model) => {
				model.dbId = idMapping.find(
					(entry) => model.dbId.toString() === entry.old.toString()
				).new;
				model.versionId = versionId;
				delete model._id;
			});

			await modelCtrl.createMany(models, { session });
		}

		// Copy endpoints
		const endpoints = await epCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy endpoints to the new version
		if (endpoints && endpoints.length > 0) {
			endpoints.forEach((endpoint) => {
				endpoint.versionId = versionId;
				delete endpoint._id;
			});

			await epCtrl.createMany(endpoints, { session });
		}

		// Copy middlewares
		const middlewares = await mwCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy middlewares to the new version
		if (middlewares && middlewares.length > 0) {
			middlewares.forEach((middleware) => {
				middleware.versionId = versionId;
				delete middleware._id;
			});

			await mwCtrl.createMany(middlewares, { session });
		}

		// Copy queueus
		const queues = await queueCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy queueus to the new version
		if (queues && queues.length > 0) {
			queues.forEach((queue) => {
				queue.versionId = versionId;
				delete queue._id;
			});

			await queueCtrl.createMany(queues, { session });
		}

		// Copy tasks
		const tasks = await taskCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy taks to the new version
		if (tasks && tasks.length > 0) {
			tasks.forEach((task) => {
				task.versionId = versionId;
				delete task._id;
			});

			await taskCtrl.createMany(tasks, { session });
		}

		// Copy storages
		const storages = await storageCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy storages to the new version
		if (storages && storages.length > 0) {
			storages.forEach((storage) => {
				storage.versionId = versionId;
				delete storage._id;
			});

			await storageCtrl.createMany(storages, { session });
		}

		return {
			version,
			resource,
			resLog,
			env,
			envLog,
		};
	}

	/**
	 * Delete all version related data
	 * Delete all application related data
	 * @param  {Object} session The database session object
	 * @param  {Object} org The organization object
	 * @param  {Object} app The app object
	 * @param  {Object} version The version object that will be deleted
	 */
	async deleteVersion(session, org, app, version) {
		await this.deleteOneById(version._id, { session, cacheKey: app._id });
		await dbCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await modelCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await envCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await envLogCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await auditCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await resourceCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await resLogCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await epCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await mwCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await queueCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await taskCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await storageCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
	}
}

export default new VersionController();
