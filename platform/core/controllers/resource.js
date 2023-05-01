import BaseController from "./base.js";
import { ResourceModel } from "../schemas/resource.js";

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
		await this.addDefaultStorage(session, user, org);
		await this.addDefaultQueue(session, user, org);
		await this.addDefaultScheduler(session, user, org);
	}

	/**
	 * Adds the default storage object as a resource to the organization
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the default storage resource
	 * @param  {Object} org The organization object where the default storage will be added
	 */
	async addDefaultStorage(session, user, org) {
		let resourceId = helper.generateId();
		await resourceCtrl.create(
			{
				_id: resourceId,
				orgId: org._id,
				iid: helper.generateSlug("res"),
				name: t("Default Storage"),
				type: "storage",
				instance: "Default Storage",
				managed: true,
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: config.get("defaultStorage.config"),
				access: config.get("defaultStorage.access"),
				deletable: false,
				status: "Binding",
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);
	}

	/**
	 * Adds the default queue
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the default queue resource
	 * @param  {Object} org The organization object where the default queue will be added
	 */
	async addDefaultQueue(session, user, org) {
		let resourceId = helper.generateId();
		await resourceCtrl.create(
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
				access: config.get("defaultQueue.access"),
				deletable: false,
				status: "Binding",
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);
	}

	/**
	 * Adds the default cron job scheduler
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the default cron job scheduler resource
	 * @param  {Object} org The organization object where the default cron job scheduler will be added
	 */
	async addDefaultScheduler(session, user, org) {
		let resourceId = helper.generateId();
		await resourceCtrl.create(
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
				access: config.get("defaultScheduler.access"),
				deletable: false,
				status: "Binding",
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);
	}
}

export default new ResourceController();
