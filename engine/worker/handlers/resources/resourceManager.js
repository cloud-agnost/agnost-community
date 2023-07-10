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
						Authorization: process.env.MASTER_TOKEN,
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
				case "engine":
					await this.createAPIServer();
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
			this.addLog(t("Completed resource binding successfully"));
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
			this.addLog(t("Started resource update"));
			switch (this.getResourceType()) {
				case "engine":
					await this.updateAPIServer();
					break;
				default:
					break;
			}
			this.addLog(t("Completed resource update successfully"));
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
			this.addLog(t("Started resource deletion"));
			switch (this.getResourceType()) {
				case "engine":
					await this.deleteAPIServer();
					break;
				default:
					break;
			}
			this.addLog(t("Completed resource deletion successfully"));
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
	 * Creates an engine deployment (API server) and associated horizontal pod autoscaler and ingress entry
	 */
	async createAPIServer() {
		const resource = this.getResource();

		// Create the deployment of engine
		await this.createKnativeService(
			resource.iid,
			resource.access,
			resource.config
		);

		// Add the Ingress for the engine service
		await this.createIngress(
			resource.iid,
			resource.iid,
			resource.iid,
			config.get("general.defaultKnativeIngressPort")
		);
	}

	/**
	 * Updates deployment resources, basically updates deployment resource requests, limits, replica count and HPA configuration.
	 * No changes are made for the deployment servcie and the ingress rule
	 */
	async updateAPIServer() {
		const resource = this.getResource();

		// Update the deployment of engine
		await this.updateKnativeService(resource.iid, resource.config);
	}

	/**
	 * Deletes deployment resources, deletes the deployment and accosiated HPA and clusterIP service and removes ingress rule
	 */
	async deleteAPIServer() {
		const resource = this.getResource();

		// Delete the deployment of engine
		await this.deleteKnativeService(resource.iid);

		// Delete the Ingress of the engine service
		await this.deleteIngress(resource.iid);
	}

	/**
	 * Creates an engine deployment (API server)
	 * @param  {string} deploymentName The deployment name prefix (resource iid)
	 * @param  {object} accessConfig The access configuration of the deployment
	 * @param  {object} deploymentConfig The deployment configuration
	 */
	async createKnativeService(deploymentName, accessConfig, deploymentConfig) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const k8sApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

		// Define the Deployment specification
		const serviceSpec = {
			apiVersion: "serving.knative.dev/v1",
			kind: "Service",
			metadata: {
				name: deploymentName,
			},
			spec: {
				template: {
					metadata: {
						labels: {
							app: deploymentName,
						},
						annotations: {
							"autoscaling.knative.dev/initial-scale":
								deploymentConfig.initialScale.toString(),
							"autoscaling.knative.dev/target":
								deploymentConfig.maxScale.toString(),
							"autoscaling.knative.dev/metric": "concurrency",
							"autoscaling.knative.dev/max-scale":
								deploymentConfig.maxScale.toString(),
							"autoscaling.knative.dev/target-utilization-percentage": "80",
							"autoscaling.knative.dev/scale-down-delay":
								deploymentConfig.scaleDownDelay.toString(),
							"autoscaling.knative.dev/scale-to-zero-pod-retention-period":
								deploymentConfig.scaleToZeroPodRetentionPeriod.toString(),
						},
					},
					spec: {
						containerConcurrency: deploymentConfig.containerConcurrency,
						containers: [
							{
								image: "gcr.io/agnost-community/engine/core",
								ports: [
									{
										containerPort: config.get("general.defaultClusterIPPort"),
									},
								],
								env: [
									{
										name: "AGNOST_VERSION_ID",
										value: accessConfig.versionId,
									},
									{
										name: "AGNOST_ENVIRONMENT_ID",
										value: accessConfig.envId,
									},
									{
										name: "CACHE_HOSTNAME",
										value: process.env.CACHE_HOSTNAME,
									},
									{
										name: "CACHE_READ_REPLICA_HOSTNAME",
										value: process.env.CACHE_READ_REPLICA_HOSTNAME,
									},
									{
										name: "CACHE_PWD",
										value: process.env.CACHE_PWD,
									},
									{
										name: "CACHE_READ_REPLICA_PWD",
										value: process.env.CACHE_READ_REPLICA_PWD,
									},
									{
										name: "QUEUE_USERNAME",
										value: process.env.QUEUE_USERNAME,
									},
									{
										name: "QUEUE_PASSWORD",
										value: process.env.QUEUE_PASSWORD,
									},
									{
										name: "QUEUE_HOST",
										value: process.env.QUEUE_HOST,
									},
									{
										name: "CLUSTER_DB_URI",
										value: process.env.CLUSTER_DB_URI,
									},
									{
										name: "CLUSTER_DB_USER",
										value: process.env.CLUSTER_DB_USER,
									},
									{
										name: "CLUSTER_DB_PWD",
										value: process.env.CLUSTER_DB_PWD,
									},
									{
										name: "MASTER_TOKEN",
										value: process.env.MASTER_TOKEN,
									},
									{
										name: "ACCESS_TOKEN",
										value: process.env.ACCESS_TOKEN,
									},
									{
										name: "PASSPHRASE",
										value: process.env.PASSPHRASE,
									},
									{
										name: "POD_NAME",
										value: "api-server",
									},
								],
								resources: {
									requests: {
										cpu: deploymentConfig.cpu.request.toString(),
										memory: deploymentConfig.memory.request.toString(),
									},
									limits: {
										cpu: deploymentConfig.cpu.limit.toString(),
										memory: deploymentConfig.memory.limit.toString(),
									},
								},
								livenessProbe: {
									httpGet: {
										path: "/health",
										port: config.get("general.defaultClusterIPPort"),
									},
									timeoutSeconds: config.get(
										"general.livenessProbe.timeoutSeconds"
									),
									periodSeconds: config.get(
										"general.livenessProbe.periodSeconds"
									),
									initialDelaySeconds: config.get(
										"general.livenessProbe.initialDelaySeconds"
									),
								},
								readinessProbe: {
									httpGet: {
										path: "/health",
										port: config.get("general.defaultClusterIPPort"),
									},
									timeoutSeconds: config.get(
										"general.readinessProbe.timeoutSeconds"
									),
									periodSeconds: config.get(
										"general.readinessProbe.periodSeconds"
									),
									initialDelaySeconds: config.get(
										"general.readinessProbe.initialDelaySeconds"
									),
								},
							},
						],
					},
				},
			},
		};

		try {
			// Create the knative service
			await k8sApi.createNamespacedCustomObject(
				"serving.knative.dev",
				"v1",
				config.get("general.k8sNamespace"),
				"services",
				serviceSpec
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Updates an engine deployment (API server)
	 * @param  {string} deploymentName The deployment name prefix (resource iid)
	 * @param  {object} deploymentConfig The deployment configuration
	 */
	async updateKnativeService(deploymentName, deploymentConfig) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const appsApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

		try {
			// Get the existing Deployment
			const { body: deployment } = await appsApi.readNamespacedDeployment(
				`${deploymentName}-deployment`,
				config.get("general.k8sNamespace")
			);

			// Update the replica count, resource requests, and limits
			deployment.spec.replicas = deploymentConfig.replicas;
			deployment.spec.template.spec.containers[0].resources.requests.cpu =
				deploymentConfig.cpu.request;
			deployment.spec.template.spec.containers[0].resources.requests.memory =
				deploymentConfig.memory.request;
			deployment.spec.template.spec.containers[0].resources.limits.cpu =
				deploymentConfig.cpu.limit;
			deployment.spec.template.spec.containers[0].resources.limits.memory =
				deploymentConfig.memory.limit;

			// Update the deployment
			await appsApi.replaceNamespacedDeployment(
				`${deploymentName}-deployment`,
				config.get("general.k8sNamespace"),
				deployment
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Deletes an engine Knative service (API server)
	 * @param  {string} deploymentName The deployment name prefix (resource iid)
	 */
	async deleteKnativeService(deploymentName) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const k8sApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

		try {
			// Delete the deployment
			await k8sApi.deleteNamespacedCustomObject(
				"serving.knative.dev",
				"v1",
				config.get("general.k8sNamespace"),
				"services",
				deploymentName
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Creates the ingress rule for the API server
	 * @param  {string} ingressName The ingress name
	 * @param  {string} pathName The ingress path to route external traffic to the resource (resource iid)
	 * @param  {string} serviceName The service name prefix (resource iid)
	 * @param  {number} port The service port
	 */
	async createIngress(ingressName, pathName, serviceName, port) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const networkingApi = kubeconfig.makeApiClient(k8s.NetworkingV1Api);

		try {
			const ingress = {
				apiVersion: "networking.k8s.io/v1",
				kind: "Ingress",
				metadata: {
					name: `${ingressName}-ingress`,
					annotations: {
						"kubernetes.io/ingress.class": "nginx",
						"nginx.ingress.kubernetes.io/proxy-body-size": "500m",
						"nginx.ingress.kubernetes.io/proxy-connect-timeout": "6000",
						"nginx.ingress.kubernetes.io/proxy-send-timeout": "6000",
						"nginx.ingress.kubernetes.io/proxy-read-timeout": "6000",
						"nginx.ingress.kubernetes.io/proxy-next-upstream-timeout": "6000",
						"nginx.ingress.kubernetes.io/rewrite-target": "/$1",
						"nginx.ingress.kubernetes.io/upstream-vhost": `${ingressName}.default.svc.cluster.local`,
					},
				},
				spec: {
					rules: [
						{
							http: {
								paths: [
									{
										path: `/${pathName}/(.*)`,
										pathType: "Prefix",
										backend: {
											service: {
												name: `${serviceName}`,
												port: { number: port },
											},
										},
									},
								],
							},
						},
					],
				},
			};

			// Create the ingress with the provided spec
			await networkingApi.createNamespacedIngress(
				config.get("general.k8sNamespace"),
				ingress
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Deletes the ingress of the API server
	 * @param  {string} ingressName The ingress name
	 */
	async deleteIngress(ingressName) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const networkingApi = kubeconfig.makeApiClient(k8s.NetworkingV1Api);

		try {
			// Delete the ingress resource
			await networkingApi.deleteNamespacedIngress(
				`${ingressName}-ingress`,
				config.get("general.k8sNamespace")
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}
}
