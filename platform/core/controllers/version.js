import BaseController from "./base.js";
import { VersionModel } from "../schemas/version.js";
import resourceCtrl from "./resource.js";
import envCtrl from "./environment.js";
import envLogCtrl from "./environmentLog.js";

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
	 * @param  {Object} org The version related information such as name, private, readOnly and master flags
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

		// Get the default cluster resources
		let defaultResources = await resourceCtrl.getManyByQuery({
			orgId: org._id,
			$or: [
				{ instance: "Default Scheduler" },
				{ instance: "Default Realtime" },
			],
		});

		const mappings = [
			{
				design: {
					iid: envIid,
					type: "engine",
					name: t("apiServer"),
				},
				resource: {
					id: resource._id,
					iid: resource.iid,
					name: resource.name,
					type: resource.type,
					instance: resource.instance,
				},
			},
		];

		for (let i = 0; i < defaultResources.length; i++) {
			let res = defaultResources[i];
			if (res.instance === "Default Scheduler") {
				mappings.push({
					design: {
						iid: envIid,
						type: "scheduler",
						name: t("cronScheduler"),
					},
					resource: {
						id: res._id,
						iid: res.iid,
						name: res.name,
						type: res.type,
						instance: res.instance,
					},
				});
			} else if (res.instance === "Default Realtime") {
				mappings.push({
					design: {
						iid: envIid,
						type: "realtime",
						name: t("realtimeServer"),
					},
					resource: {
						id: res._id,
						iid: res.iid,
						name: res.name,
						type: res.type,
						instance: res.instance,
					},
				});
			}
		}

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
				dbDeploymentStatus: "Deploying",
				engineDeploymentStatus: "Deploying",
				schedulerDeploymentStatus: "Deploying",
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
}

export default new VersionController();
