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
			storage: await this.bindClusterStorage(session, user, org),
			queue: await this.bindDefaultQueue(session, user, org),
			scheduler: await this.bindDefaultScheduler(session, user, org),
			realtime: await this.bindDefaultRealtime(session, user, org),
		};
	}

	/**
	 * Adds the cluster storage object as a resource to the organization
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the cluster storage resource
	 * @param  {Object} org The organization object where the cluster storage will be added
	 */
	async bindClusterStorage(session, user, org) {
		const resourceId = helper.generateId();
		const resourceIid = helper.generateSlug("res");
		const resource = await this.create(
			{
				_id: resourceId,
				orgId: org._id,
				iid: resourceIid,
				name: t("Default Storage"),
				type: "storage",
				instance: "MinIO",
				managed: false, // The size of the storage can be updated
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: {},
				access: helper.encyrptSensitiveData({
					endPoint: process.env.MINIO_ENDPOINT, // Kubernetes service name for MinIO
					port: parseInt(process.env.MINIO_PORT, 10), // MinIO service port (default: 9000)
					useSSL: false, // Whether to use SSL (default: false)
					accessKey: process.env.MINIO_ACCESS_KEY, // MinIO access key
					secretKey: process.env.MINIO_SECRET_KEY, // MinIO secret key
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
				name: t("Default Message Broker"),
				type: "queue",
				instance: "RabbitMQ",
				managed: false, // Default queue is a cluster resource and only cluster owner can update its configuration
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: {},
				access: helper.encyrptSensitiveData({
					format: "object", // can be either object or url
					scheme: "amqp",
					username: process.env.QUEUE_USERNAME,
					password: process.env.QUEUE_PASSWORD,
					host: process.env.QUEUE_HOST,
					port: 5672, // 5671 for TLS for normal 5672
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
				iid: helper.generateSlug("res"),
				name: t("Default Scheduler"),
				type: "scheduler",
				instance: "Agenda",
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
	 * Adds the default realtime server
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the default cron job scheduler resource
	 * @param  {Object} org The organization object where the default cron job scheduler will be added
	 */
	async bindDefaultRealtime(session, user, org) {
		const resourceId = helper.generateId();
		const resource = await this.create(
			{
				_id: resourceId,
				orgId: org._id,
				iid: helper.generateSlug("res"),
				name: t("Default Realtime Server"),
				type: "realtime",
				instance: "Socket.io",
				managed: false, // Default realtime is a cluster resource and only cluster owner can update its configuration
				allowedRoles: ["Admin", "Developer", "Viewer"],
				config: {},
				access: helper.encyrptSensitiveData({
					name: config.get("general.defaultRealtimeDeploymentName"),
					serverURL: config.get("general.defaultRealtimeServerURL"),
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
		// The engine deployment has the same iid of the environment
		const resourceIid = envIid;

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
				deletable: true, // Engine deployment can be deleted only if the version is deleted
				createdBy: user._id,
			},
			{ session, cacheKey: resourceId }
		);

		const log = await resLogCtrl.create(
			{
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
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
	 * @param  {Array} resources The resource objects that will be created/bound/updated and their associated logs
	 */
	async manageClusterResources(resources) {
		if (!resources && resources.length === 0) return;

		resources = resources.map((entry) => {
			return {
				...entry.resource,
				access: helper.decryptSensitiveData(entry.resource.access),
				accessReadOnly: helper.decryptSensitiveData(
					entry.resource.accessReadOnly
				),
				action: entry.log.action,
				callback: `${config.get("general.platformBaseUrl")}/v1/org/${
					entry.resource.orgId
				}/resource/${entry.resource._id}/log/${entry.log._id}`,
			};
		});

		// Make api call to engine worker to manage resources
		await axios.post(
			config.get("general.workerUrl") + "/v1/resource/manage",
			resources,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}

	/**
	 * Initiates the actual creating/binding of cluster resources
	 * @param  {Array} resources The resource objects that will be deleted
	 */
	async deleteClusterResources(resources) {
		if (!resources && resources.length === 0) return;

		resources = resources.map((entry) => {
			return {
				...entry,
				access: helper.decryptSensitiveData(entry.access),
				accessReadOnly: helper.decryptSensitiveData(entry.accessReadOnly),
				action: "delete",
			};
		});

		// Make api call to engine worker to manage resources
		await axios.post(
			config.get("general.workerUrl") + "/v1/resource/manage",
			resources,
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
	}
}

export default new ResourceController();
