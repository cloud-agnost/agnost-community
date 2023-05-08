import axios from "axios";
import BaseController from "./base.js";
import { ResourceModel } from "../schemas/resource.js";
import resLogCtrl from "./resourceLog.js";

class ResourceController extends BaseController {
	constructor() {
		super(ResourceModel);
	}

	/**
	 * Adds the default cluster resources to the organization
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the default organization resources
	 * @param  {Object} org The organization object where the default resources will be added
	 */
	async addDefaultOrganizationResources(session, user, org) {
		return {
			storage: await this.createClusterStorage(session, user, org),
			queue: await this.bindDefaultQueue(session, user, org),
			scheduler: await this.bindDefaultScheduler(session, user, org),
		};
	}

	/**
	 * Adds the cluster storage object as a resource to the organization
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the cluster storage resource
	 * @param  {Object} org The organization object where the cluster storage will be added
	 */
	async createClusterStorage(session, user, org) {
		const resourceId = helper.generateId();
		const resourceIid = helper.generateSlug("str");
		const resource = await this.create(
			{
				_id: resourceId,
				orgId: org._id,
				iid: resourceIid,
				name: t("Organization Storage"),
				type: "storage",
				instance: "Cluster Storage",
				managed: true, // The size of the storage can be updated
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: { size: config.get("general.defaulPVCSize") },
				access: helper.encyrptSensitiveData({
					name: resourceIid,
					mountPath: resourceIid,
				}),
				deletable: true,
				status: "Creating",
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);

		const log = await resLogCtrl.create(
			{
				orgId: org._id,
				resourceId: resourceId,
				action: "create",
				status: "Creating",
				createdBy: user._id,
			},
			{ session }
		);

		return { resource, log };
	}

	/**
	 * Adds the default queue
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the default queue resource
	 * @param  {Object} org The organization object where the default queue will be added
	 */
	async bindDefaultQueue(session, user, org) {
		const resourceId = helper.generateId();
		const resource = await this.create(
			{
				_id: resourceId,
				orgId: org._id,
				iid: helper.generateSlug("que"),
				name: t("Default Queue"),
				type: "queue",
				instance: "Default Queue",
				managed: false, // Default queue is a cluster resource and only cluster owner can update its configuration
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: {},
				access: helper.encyrptSensitiveData({
					url: process.env.QUEUE_URL,
				}),
				status: "Binding",
				deletable: false,
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);

		const log = await resLogCtrl.create(
			{
				orgId: org._id,
				resourceId: resourceId,
				action: "bind",
				status: "Binding",
				createdBy: user._id,
			},
			{ session }
		);

		return { resource, log };
	}

	/**
	 * Adds the default cron job scheduler
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the default cron job scheduler resource
	 * @param  {Object} org The organization object where the default cron job scheduler will be added
	 */
	async bindDefaultScheduler(session, user, org) {
		const resourceId = helper.generateId();
		const resource = await this.create(
			{
				_id: resourceId,
				orgId: org._id,
				iid: helper.generateSlug("sch"),
				name: t("Default Scheduler"),
				type: "scheduler",
				instance: "Default Scheduler",
				managed: false, // Default scheduler is a cluster resource and only cluster owner can update its configuration
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: {},
				access: helper.encyrptSensitiveData({
					name: config.get("general.defaultSchedulerDeploymentName"),
				}),
				status: "Binding",
				deletable: false,
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);

		const log = await resLogCtrl.create(
			{
				orgId: org._id,
				resourceId: resourceId,
				action: "bind",
				status: "Binding",
				createdBy: user._id,
			},
			{ session }
		);

		return { resource, log };
	}

	/**
	 * Adds the engine deployment object as a resource to the organization app
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the engine deployment
	 * @param  {Object} org The organization object where the engine deployment will be added
	 * @param  {Object} app The app object where the engine deployment will be added
	 * @param  {Object} version The version object where the engine deployment will be added
	 * @param  {string} envIid The version environment internal identifier
	 */
	async createEngineDeployment(session, user, org, app, version, envIid) {
		const resourceId = helper.generateId();
		const resourceIid = helper.generateSlug("eng");

		const resource = await this.create(
			{
				_id: resourceId,
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
				iid: resourceIid,
				name: t("API Server"),
				type: "engine",
				instance: "API Server",
				managed: true, // The configuration of engine deployment can be updated
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: config.get("general.defaultEngineConfig"),
				access: helper.encyrptSensitiveData({
					name: resourceIid,
					versionId: version.iid,
					envId: envIid,
				}),
				status: "Creating",
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);

		const log = await resLogCtrl.create(
			{
				orgId: org._id,
				resourceId: resourceId,
				action: "create",
				status: "Creating",
				createdBy: user._id,
			},
			{ session }
		);

		return { resource, log };
	}

	/**
	 * Initiates the actual creating/binding of cluster resources
	 * @param  {Array} resources The resource objects that will be created/bound/updated/deleted and their associated logs
	 */
	async manageClusterResources(resources) {
		resources = resources.map((entry) => {
			// If there is no log entry, then it is a delete operation
			if (entry.log?.action) {
				return {
					...entry.resource,
					access: helper.decryptSensitiveData(entry.resource.access),
					action: entry.log.action,
					callback: `${config.get("general.platformBaseUrl")}/v1/org/${
						entry.resource.orgId
					}/resource/${entry.resource._id}/log/${entry.log._id}`,
				};
			} else {
				return {
					...entry.resource,
					access: helper.decryptSensitiveData(entry.resource.access),
					action: "delete",
				};
			}
		});
		// Make api call to engine worker to create resources
		await axios.post(
			config.get("general.workerUrl") + "/v1/resource/manage",
			resources,
			{
				headers: {
					Authorization: config.get("general.workerAccessToken"),
					"Content-Type": "application/json",
				},
			}
		);
	}
}

export default new ResourceController();
