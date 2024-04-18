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
import funcCtrl from "../controllers/function.js";
import cacheCtrl from "../controllers/cache.js";
import dmnCtrl from "../controllers/domain.js";
import vBackupCtrl from "../controllers/versionBackup.js";
import { defaultMessages } from "../config/constants.js";
import { deleteKey } from "../init/cache.js";

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
				authentication: {
					messages: defaultMessages(user._id),
				},
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
				description: t("Performing first time deployment"),
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
				params: parentVersion.params,
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
				description: t("Performing first time deployment"),
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

		// Copy functions
		const functions = await funcCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy middlewares to the new version
		if (functions && functions.length > 0) {
			functions.forEach((func) => {
				func.versionId = versionId;
				delete func._id;
			});

			await funcCtrl.createMany(functions, { session });
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

		// Copy caches
		const caches = await cacheCtrl.getManyByQuery({
			versionId: parentVersion._id,
		});
		// Copy storages to the new version
		if (caches && caches.length > 0) {
			caches.forEach((cache) => {
				cache.versionId = versionId;
				delete cache._id;
			});

			await cacheCtrl.createMany(caches, { session });
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
	 * Pushes the contents of the from version to the target version. Before pushing the contents we get a backup of the target version.
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the version
	 * @param  {Object} org The organization object where the version will be pushed
	 * @param  {Object} app The app object where the version will be pushed
	 * @param  {Object} fromVersion The from version object whose contents will be pushed
	 * @param  {Object} toVersion The target (to) version object where the contents will be pushed
	 */
	async pushVersionContents(session, user, org, app, fromVersion, toVersion) {
		// First get the backup of the target version
		await this.backupVersionContents(session, toVersion, user);

		// First update the target version values, we do not update params, apiKeys and authentication, the deverloper should update them manually
		await this.updateOneById(
			toVersion._id,
			{
				realtime: fromVersion.realtime,
				limits: fromVersion.limits,
				defaultEndpointLimits: fromVersion.defaultEndpointLimits,
				npmPackages: fromVersion.npmPackages,
				updatedBy: user._id,
			},
			{},
			{ session, cacheKey: toVersion._id }
		);

		// Update the target environment mapping values
		const fromEnv = await envCtrl.getOneByQuery({ versionId: fromVersion._id });
		const toEnv = await envCtrl.getOneByQuery({ versionId: toVersion._id });

		// Get all non-api server mappings from the from environment
		const fromMappings = fromEnv.mappings.filter(
			(entry) => entry.resource.instance !== "API Server"
		);

		// Get the api server mapping from the target environment
		const toApiServerMapping = toEnv.mappings.filter(
			(entry) => entry.resource.instance === "API Server"
		);

		// Merget from mappings to the target mappings
		const toMappings = [...toApiServerMapping, ...fromMappings];

		// Upadate the target environment mappings
		await envCtrl.updateOneById(
			toEnv._id,
			{
				mappings: toMappings,
				updatedBy: user._id,
			},
			{},
			{ session, cacheKey: toEnv._id }
		);

		// Delete all the existing databases from the to version
		const toDatabases = await dbCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toDatabases.forEach((entry) => {
			deleteKey(entry._id.toString());
		});

		await dbCtrl.deleteManyByQuery({ versionId: toVersion._id }, { session });
		// Copy new databases
		const databases = await dbCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});

		// Store old and new database ids, we need them when copying the models
		const idMapping = [];
		// Copy databases to the new version
		if (databases && databases.length > 0) {
			databases.forEach((database) => {
				const newId = helper.generateId();
				idMapping.push({ new: newId, old: database._id });
				database.versionId = toVersion._id;
				database._id = newId;
			});

			await dbCtrl.createMany(databases, { session });
		}

		// Delete all the existing models from the to version
		const toModels = await modelCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toModels.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await modelCtrl.deleteManyByQuery(
			{ versionId: toVersion._id },
			{ session }
		);
		// Copy models
		const models = await modelCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy models to the new version
		if (models && models.length > 0) {
			models.forEach((model) => {
				model.dbId = idMapping.find(
					(entry) => model.dbId.toString() === entry.old.toString()
				).new;
				model.versionId = toVersion._id;
				delete model._id;
			});

			await modelCtrl.createMany(models, { session });
		}

		// Delete all the existing endpoints from the to version
		const toEps = await epCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toEps.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await epCtrl.deleteManyByQuery({ versionId: toVersion._id }, { session });
		// Copy endpoints
		const endpoints = await epCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy endpoints to the new version
		if (endpoints && endpoints.length > 0) {
			endpoints.forEach((endpoint) => {
				endpoint.versionId = toVersion._id;
				delete endpoint._id;
			});

			await epCtrl.createMany(endpoints, { session });
		}

		// Delete all the existing middlewares from the to version
		const toMws = await mwCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toMws.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await mwCtrl.deleteManyByQuery({ versionId: toVersion._id }, { session });
		// Copy middlewares
		const middlewares = await mwCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy middlewares to the new version
		if (middlewares && middlewares.length > 0) {
			middlewares.forEach((middleware) => {
				middleware.versionId = toVersion._id;
				delete middleware._id;
			});

			await mwCtrl.createMany(middlewares, { session });
		}

		// Delete all the existing functions from the to version
		const toFuncs = await funcCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toFuncs.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await funcCtrl.deleteManyByQuery({ versionId: toVersion._id }, { session });
		// Copy functions
		const functions = await funcCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy middlewares to the new version
		if (functions && functions.length > 0) {
			functions.forEach((func) => {
				func.versionId = toVersion._id;
				delete func._id;
			});

			await funcCtrl.createMany(functions, { session });
		}

		// Delete all the existing queues from the to version
		const toQueues = await queueCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toQueues.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await queueCtrl.deleteManyByQuery(
			{ versionId: toVersion._id },
			{ session }
		);
		// Copy queueus
		const queues = await queueCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy queueus to the new version
		if (queues && queues.length > 0) {
			queues.forEach((queue) => {
				queue.versionId = toVersion._id;
				delete queue._id;
			});

			await queueCtrl.createMany(queues, { session });
		}

		// Delete all the existing tasks from the to version
		const toTasks = await taskCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toTasks.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await taskCtrl.deleteManyByQuery({ versionId: toVersion._id }, { session });
		// Copy tasks
		const tasks = await taskCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy taks to the new version
		if (tasks && tasks.length > 0) {
			tasks.forEach((task) => {
				task.versionId = toVersion._id;
				delete task._id;
			});

			await taskCtrl.createMany(tasks, { session });
		}

		// Delete all the existing storages from the to version
		const toStorages = await storageCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toStorages.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await storageCtrl.deleteManyByQuery(
			{ versionId: toVersion._id },
			{ session }
		);
		// Copy storages
		const storages = await storageCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy storages to the new version
		if (storages && storages.length > 0) {
			storages.forEach((storage) => {
				storage.versionId = toVersion._id;
				delete storage._id;
			});

			await storageCtrl.createMany(storages, { session });
		}

		// Delete all the existing caches from the to version
		const toCaches = await cacheCtrl.getManyByQuery({
			versionId: toVersion._id,
		});
		toCaches.forEach((entry) => {
			deleteKey(entry._id.toString());
		});
		await cacheCtrl.deleteManyByQuery(
			{ versionId: toVersion._id },
			{ session }
		);
		// Copy caches
		const caches = await cacheCtrl.getManyByQuery({
			versionId: fromVersion._id,
		});
		// Copy storages to the new version
		if (caches && caches.length > 0) {
			caches.forEach((cache) => {
				cache.versionId = toVersion._id;
				delete cache._id;
			});

			await cacheCtrl.createMany(caches, { session });
		}
	}

	/**
	 * Backs up the contents of the version. This is used when pushing the contents of one version to another.
	 * @param  {Object} session The database session object
	 * @param  {Object} version The version to get the backup
	 * @param  {Object} user The user whose creating the backup of the version
	 */
	async backupVersionContents(session, version, user) {
		// Get the environment object
		let environment = await envCtrl.getOneByQuery({
			versionId: version._id,
		});
		// Backup databases
		const databases = await dbCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup models
		const models = await modelCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup endpoints
		const endpoints = await epCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup middlewares
		const middlewares = await mwCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup functions
		const functions = await funcCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup queues
		const queues = await queueCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup tasks
		const tasks = await taskCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup storages
		const storages = await storageCtrl.getManyByQuery({
			versionId: version._id,
		});
		// Backup caches
		const caches = await cacheCtrl.getManyByQuery({
			versionId: version._id,
		});

		await vBackupCtrl.create(
			{
				orgId: version.orgId,
				appId: version.appId,
				versionId: version._id,
				versionContents: {
					version,
					environment,
					databases,
					models,
					endpoints,
					middlewares,
					functions,
					queues,
					tasks,
					storages,
					caches,
				},
				createdBy: user._id,
			},
			{ session }
		);
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
		await funcCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await cacheCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await dmnCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
		await vBackupCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id, versionId: version._id },
			{ session }
		);
	}
}

export default new VersionController();
