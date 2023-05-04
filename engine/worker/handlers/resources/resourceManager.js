import axios from "axios";
import k8s from "@kubernetes/client-node";

export class ResourceManager {
	constructor(resourceObj) {
		// The resource object also include the action type and the callback url to send the logs
		this.resourceObj = resourceObj;

		// Resource management operation logs
		this.logs = [];
	}

	/**
	 * Returns the resource action type, e,g., create, update, delete, bind
	 */
	getAction() {
		return this.resourceObj.action;
	}

	/**
	 * Returns the resource object
	 */
	getResource() {
		return this.resourceObj;
	}

	/**
	 * Returns the type of the resource
	 */
	getResourceType() {
		return this.resourceObj.type;
	}

	/**
	 * Returns the instance of the resource
	 */
	getResourceInstance() {
		return this.resourceObj.instance;
	}

	/**
	 * Returns true if the resouce is managed by the Agnost cluster, false otherwise
	 */
	isManaged() {
		return this.resourceObj.managed;
	}

	/**
	 * Adds a log message to track the progress of resource management operation
	 * @param  {string} message Logged message
	 * @param  {string} status Whether the operation has completed successfully or with errors
	 */
	addLog(message, status = "OK") {
		this.logs.push({
			startedAt: new Date(),
			status,
			message,
		});

		logger.info(message);
	}

	/**
	 * Updates the resource status and logs in platform
	 * @param  {string} status Final environment status
	 */
	async sendResourceLogs(status = "OK") {
		// If there is no callback just return
		if (!this.resourceObj.callback) return;
		try {
			// Update the resource log object
			await axios.post(
				this.resourceObj.callback,
				{
					status,
					logs: this.logs,
				},
				{
					headers: {
						Authorization: config.get("general.masterToken"),
						"Content-Type": "application/json",
					},
				}
			);
		} catch (err) {}
	}

	/**
	 * Creates the resource in Agnost cluster
	 */
	async creteResource() {
		try {
			this.addLog(t("Started resource creation"));
			switch (this.getResourceType()) {
				case "storage":
					await this.createStorage();
					break;
				default:
					break;
			}
			this.addLog(t("Completed resource creation successfully"));
			// Send the resource telemetry information to the platform
			await this.sendResourceLogs("OK");
			return { success: true };
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("Resource creation failed"),
					error.name,
					error.message,
					error.stack,
				].join("\n"),
				"Error"
			);
			await this.sendResourceLogs("Error");
			return { success: false, error };
		}
	}

	/**
	 * Binds the resouce to an existing cluster asset (e.g., messageq queue, cron job scheduler)
	 */
	async bindResource() {
		try {
			this.addLog(t("Started resource binding"));
			// Send the resource telemetry information to the platform
			await this.sendResourceLogs("OK");
			return { success: true };
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("Resource binding failed"),
					error.name,
					error.message,
					error.stack,
				].join("\n"),
				"Error"
			);
			await this.sendResourceLogs("Error");
			return { success: false, error };
		}
	}

	/**
	 * Updates the configuration of managed resource
	 */
	async updateResource() {
		try {
			this.addLog(t("Started resource binding"));
			// Send the resource telemetry information to the platform
			await this.sendResourceLogs("OK");
			return { success: true };
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("Resource update failed"),
					error.name,
					error.message,
					error.stack,
				].join("\n"),
				"Error"
			);
			await this.sendResourceLogs("Error");
			return { success: false, error };
		}
	}

	/**
	 * Deletes the managed resource
	 */
	async deleteResource() {
		try {
			this.addLog(t("Started resource binding"));
			// Send the resource telemetry information to the platform
			await this.sendResourceLogs("OK");
			return { success: true };
		} catch (error) {
			// Send the deployment telemetry information to the platform
			this.addLog(
				[
					t("Resource deletion failed"),
					error.name,
					error.message,
					error.stack,
				].join("\n"),
				"Error"
			);
			await this.sendResourceLogs("Error");
			return { success: false, error };
		}
	}

	/**
	 * Creates a persistent volume claim (PVC) in Agnost Kubernetes Cluster
	 */
	async createStorage() {
		const resource = this.getResource();
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const coreApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

		// Define the PVC specification
		const pvcSpec = {
			apiVersion: "v1",
			kind: "PersistentVolumeClaim",
			metadata: {
				name: resource.iid,
			},
			spec: {
				accessModes: ["ReadWriteMany"],
				resources: {
					requests: {
						storage: resource.config.size,
					},
				},
			},
		};

		try {
			await coreApi.createNamespacedPersistentVolumeClaim(
				config.get("general.k8sNamespace"),
				pvcSpec
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}
}
