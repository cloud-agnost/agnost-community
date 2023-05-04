import axios from "axios";
import BaseController from "./base.js";
import { ResourceModel } from "../schemas/resource.js";
import resLogCtrl from "./resourceLog.js";
import connCtrl from "./connection.js";

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
		const resourceIid = helper.generateSlug("res");
		const resource = await this.create(
			{
				_id: resourceId,
				orgId: org._id,
				iid: resourceIid,
				name: t("Cluster Storage"),
				type: "storage",
				instance: "Cluster Storage",
				managed: true,
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: config.get("defaultStorage.config"),
				access: connCtrl.encyrptSensitiveData({
					name: resourceIid,
					mountPath: resourceIid,
				}),
				deletable: false,
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
				iid: helper.generateSlug("res"),
				name: t("Default Queue"),
				type: "queue",
				instance: "Default Queue",
				managed: true,
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: config.get("defaultQueue.config"),
				access: connCtrl.encyrptSensitiveData({
					url: process.env.QUEUE_URL,
				}),
				deletable: false,
				status: "Binding",
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
				iid: helper.generateSlug("res"),
				name: t("Default Scheduler"),
				type: "scheduler",
				instance: "Default Scheduler",
				managed: true,
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: config.get("defaultScheduler.config"),
				access: connCtrl.encyrptSensitiveData(
					config.get("defaultScheduler.access")
				),
				deletable: false,
				status: "Binding",
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
	 * Initiates the actual creating/binding of cluster resources
	 * @param  {Object | Array} resources The resource objects that will be created/bound
	 */
	async manageClusterResources(resources) {
		resources = resources.map((entry) => {
			return {
				...entry.resource,
				access: connCtrl.decryptSensitiveData(entry.resource.access),
				action: entry.log.action,
				callback: `${config.get("general.platformBaseUrl")}/v1/org/${
					entry.resource.orgId
				}/resource/${entry.resource._id}/log/${entry.log._id}`,
			};
		});
		// Make api call to engine worker to create resources
		await axios.post(
			config.get("defaultEngineWorkerAccess.workerUrl") + "/v1/resource/manage",
			resources,
			{
				headers: {
					Authorization: config.get("defaultEngineWorkerAccess.accessToken"),
					"Content-Type": "application/json",
				},
			}
		);
	}
}

export default new ResourceController();
