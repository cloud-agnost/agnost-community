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
				case "storage":
					await this.createStorage();
					break;
				case "engine":
					await this.createDeploymentResources();
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
				case "storage":
					await this.updateStorage();
					break;
				case "engine":
					await this.updateDeploymentResources();
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
				case "storage":
					await this.deleteStorage();
					break;
				case "engine":
					await this.deleteDeploymentResources();
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
				name: `${resource.iid}-pvc`,
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

	/**
	 * Updates a persistent volume claim (PVC) size in Agnost Kubernetes Cluster
	 */
	async updateStorage() {
		const resource = this.getResource();
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const coreApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

		try {
			const { body: pvc } = await k8sApi.readNamespacedPersistentVolumeClaim(
				`${resource.iid}-pvc`,
				config.get("general.k8sNamespace")
			);
			// Update the size of the PVC
			pvc.spec.resources.requests.storage = resource.config.size;

			await coreApi.replaceNamespacedPersistentVolumeClaim(
				`${resource.iid}-pvc`,
				config.get("general.k8sNamespace"),
				pvc
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Deletes a persistent volume claim (PVC) in Agnost Kubernetes Cluster
	 */
	async deleteStorage() {
		const resource = this.getResource();
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const coreApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

		try {
			await coreApi.deleteNamespacedPersistentVolumeClaim(
				`${resource.iid}-pvc`,
				config.get("general.k8sNamespace")
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Creates an engine deployment (API server) and associated horizontal pod autoscaler and ingress entry
	 */
	async createDeploymentResources() {
		const resource = this.getResource();

		// Create the deployment of engine
		await this.createDeployment(resource.iid, resource.access, resource.config);

		// Create the HPA of engine
		await this.createHPA(resource.iid, resource.iid, resource.config.hpa);

		// Create the Service of engine
		await this.createClusterIPService(
			resource.iid,
			resource.iid,
			config.get("general.defaultClusterIPPort")
		);

		// Add the Ingress rule for the engine service
		await this.addIngressRule(
			resource.iid,
			resource.iid,
			config.get("general.defaultClusterIPPort")
		);
	}

	/**
	 * Updates deployment resources, basically updates deployment resource requests, limits, replica count and HPA configuration.
	 * No changes are made for the deployment servcie and the ingress rule
	 */
	async updateDeploymentResources() {
		const resource = this.getResource();

		// Update the deployment of engine
		await this.updateDeployment(resource.iid, resource.config);

		// Update the HPA of engine
		await this.updateHPA(resource.iid, resource.config.hpa);
	}

	/**
	 * Deletes deployment resources, deletes the deployment and accosiated HPA and clusterIP service and removes ingress rule
	 */
	async deleteDeploymentResources() {
		const resource = this.getResource();

		// Delete the deployment of engine
		await this.deleteDeployment(resource.iid);

		// Delete the HPA of engine
		await this.deleteHPA(resource.iid);

		// Delete the ClusterIP service of engine
		await this.deleteClusterIPService(resource.iid);

		// Remove the Ingress rule of the engine service
		await this.removeIngressRule(resource.iid);
	}

	/**
	 * Creates an engine deployment (API server)
	 * @param  {string} deploymentName The deployment name prefix (resource iid)
	 * @param  {object} accessConfig The access configuration fo the deployment
	 * @param  {object} deploymentConfig The deployment configuration
	 */
	async createDeployment(deploymentName, accessConfig, deploymentConfig) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const appsApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

		// Define the Deployment specification
		const deploymentSpec = {
			apiVersion: "apps/v1",
			kind: "Deployment",
			metadata: {
				name: `${deploymentName}-deployment`,
				labels: {
					app: deploymentName,
				},
			},
			spec: {
				replicas: deploymentConfig.replicas,
				selector: {
					matchLabels: {
						app: deploymentName,
					},
				},
				template: {
					metadata: {
						labels: {
							app: deploymentName,
						},
					},
					spec: {
						containers: [
							{
								name: deploymentName,
								image: "agnost-enterprise/engine-core",
								imagePullPolicy: "Always",
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
										name: "AGNOST_ENGINE_ID",
										value: accessConfig.name,
									},
								],
								resources: {
									requests: {
										cpu: deploymentConfig.cpu.request,
										memory: deploymentConfig.memory.request,
									},
									limits: {
										cpu: deploymentConfig.cpu.limit,
										memory: deploymentConfig.memory.limit,
									},
								},
								ports: [
									{
										containerPort: config.get("general.defaultClusterIPPort"),
										name: "http",
									},
								],
								livenessProbe: {
									httpGet: {
										path: "/health",
										port: config.get("general.defaultClusterIPPort"),
									},
									initialDelaySeconds: config.get(
										"general.livenessProbe.initialDelaySeconds"
									),
									periodSeconds: config.get(
										"general.livenessProbe.periodSeconds"
									),
									timeoutSeconds: config.get(
										"general.livenessProbe.timeoutSeconds"
									),
								},
								readinessProbe: {
									httpGet: {
										path: "/health",
										port: config.get("general.defaultClusterIPPort"),
									},
									initialDelaySeconds: config.get(
										"general.readinessProbe.initialDelaySeconds"
									),
									periodSeconds: config.get(
										"general.readinessProbe.periodSeconds"
									),
									timeoutSeconds: config.get(
										"general.readinessProbe.timeoutSeconds"
									),
								},
							},
						],
					},
				},
			},
		};

		try {
			// Create the deployment
			await appsApi.createNamespacedDeployment(
				config.get("general.k8sNamespace"),
				deploymentSpec
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
	async updateDeployment(deploymentName, deploymentConfig) {
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
	 * Deletes an engine deployment (API server)
	 * @param  {string} deploymentName The deployment name prefix (resource iid)
	 */
	async deleteDeployment(deploymentName) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const appsApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

		try {
			// Delete the deployment
			await appsApi.deleteNamespacedDeployment(
				`${deploymentName}-deployment`,
				config.get("general.k8sNamespace")
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Creates horizontal pod autoscaler (HPA) for the deployment
	 * @param  {string} hpaName The HPA name prefix (resource iid)
	 * @param  {string} deploymentName The deployment name prefix (resource iid)
	 * @param  {object} hpaConfig The HPA configuration
	 */
	async createHPA(hpaName, deploymentName, hpaConfig) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const autoscalingApi = kubeconfig.makeApiClient(k8s.AutoscalingV2Api);

		// Define the HPA specification
		const hpaSpec = {
			apiVersion: "autoscaling/v2",
			kind: "HorizontalPodAutoscaler",
			metadata: {
				name: `${hpaName}-autoscaler`,
			},
			spec: {
				scaleTargetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: `${deploymentName}-deployment`,
				},
				minReplicas: hpaConfig.minReplicas,
				maxReplicas: hpaConfig.maxReplicas,
				metrics: [
					{
						type: "Resource",
						resource: {
							name: "cpu",
							target: {
								type: "Utilization",
								averageUtilization: hpaConfig.avgCPU,
							},
						},
					},
					{
						type: "Resource",
						resource: {
							name: "memory",
							target: {
								type: "Utilization",
								averageUtilization: hpaConfig.avgMemory,
							},
						},
					},
				],
			},
		};

		try {
			await autoscalingApi.createNamespacedHorizontalPodAutoscaler(
				config.get("general.k8sNamespace"),
				hpaSpec
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Updates horizontal pod autoscaler (HPA) for the deployment
	 * @param  {string} hpaName The HPA name prefix (resource iid)
	 * @param  {object} hpaConfig The HPA configuration
	 */
	async updateHPA(hpaName, hpaConfig) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const autoscalingApi = kubeconfig.makeApiClient(k8s.AutoscalingV2Api);

		try {
			// Get the existing HPA
			const { body: hpa } =
				await autoscalingApi.readNamespacedHorizontalPodAutoscaler(
					`${hpaName}-autoscaler`,
					config.get("general.k8sNamespace")
				);

			// Update the memory and CPU metrics and min/max replica counts
			hpa.spec.minReplicas = hpaConfig.minReplicas;
			hpa.spec.maxReplicas = hpaConfig.maxReplicas;
			hpa.spec.metrics[0].resource.target.averageUtilization = hpaConfig.avgCPU;
			hpa.spec.metrics[1].resource.target.averageUtilization =
				hpaConfig.avgMemory;

			await autoscalingApi.replaceNamespacedHorizontalPodAutoscaler(
				`${hpaName}-autoscaler`,
				config.get("general.k8sNamespace"),
				hpa
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Deletes horizontal pod autoscaler (HPA) for the deployment
	 * @param  {string} hpaName The HPA name prefix (resource iid)
	 * @param  {object} hpaConfig The HPA configuration
	 */
	async deleteHPA(hpaName) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const autoscalingApi = kubeconfig.makeApiClient(k8s.AutoscalingV2Api);

		try {
			// Delete the HPA
			await autoscalingApi.deleteNamespacedHorizontalPodAutoscaler(
				`${hpaName}-autoscaler`,
				config.get("general.k8sNamespace")
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Creates ClusterIP service for the deployment
	 * @param  {string} serviceName The service name prefix (resource iid)
	 * @param  {string} deploymentName The deployment name prefix (resource iid)
	 * @param  {number} port The target port of the service
	 */
	async createClusterIPService(serviceName, deploymentName, port) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const coreApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

		// Define the ClusterIP specification
		const serviceSpec = {
			apiVersion: "v1",
			kind: "Service",
			metadata: {
				name: `${serviceName}-service`,
			},
			spec: {
				selector: {
					app: deploymentName,
				},
				ports: [
					{
						name: "http",
						port: port,
						targetPort: port,
					},
				],
				type: "ClusterIP",
			},
		};

		try {
			await coreApi.createNamespacedService(
				config.get("general.k8sNamespace"),
				serviceSpec
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Deletes ClusterIP service for the deployment
	 * @param  {string} serviceName The service name prefix (resource iid)
	 */
	async deleteClusterIPService(serviceName) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const coreApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

		try {
			// Delete the service
			await coreApi.deleteNamespacedService(
				`${serviceName}-service`,
				config.get("general.k8sNamespace")
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Adds ingress rule for the deployment service
	 * @param  {string} pathName The ingress path to route external traffic to the resource (resource iid)
	 * @param  {string} serviceName The service name prefix (resource iid)
	 * @param  {number} port The service port
	 */
	async addIngressRule(pathName, serviceName, port) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const networkingApi = kubeconfig.makeApiClient(k8s.NetworkingV1Api);

		try {
			// Get the current ingress specification
			const response = await networkingApi.readNamespacedIngress(
				config.get("general.ingressServiceName"),
				config.get("general.k8sNamespace")
			);

			const ingressSpec = response.body.spec;

			// Add the new rule
			ingressSpec.rules.push({
				http: {
					paths: [
						{
							path: `/${pathName}`,
							pathType: "Prefix",
							backend: {
								service: {
									name: `${serviceName}-service`,
									port: { number: port },
								},
							},
						},
					],
				},
			});

			// Update the Ingress with the modified spec
			await networkingApi.replaceNamespacedIngress(
				config.get("general.ingressServiceName"),
				config.get("general.k8sNamespace"),
				response.body
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}

	/**
	 * Remove ingress rule of the deployment service
	 * @param  {string} pathName The ingress path to route external traffic to the resource (resource iid)
	 */
	async removeIngressRule(pathName) {
		// Create a Kubernetes core API client
		const kubeconfig = new k8s.KubeConfig();
		kubeconfig.loadFromDefault();
		const networkingApi = kubeconfig.makeApiClient(k8s.NetworkingV1Api);

		try {
			// Get the current ingress specification
			const response = await networkingApi.readNamespacedIngress(
				config.get("general.ingressServiceName"),
				config.get("general.k8sNamespace")
			);

			const ingressSpec = response.body.spec;
			// Revove the existing rule
			ingressSpec.rules = ingressSpec.rules.filter(
				(entry) => entry.http.paths[0].path !== `/${pathName}`
			);

			// Update the Ingress with the modified spec
			await networkingApi.replaceNamespacedIngress(
				config.get("general.ingressServiceName"),
				config.get("general.k8sNamespace"),
				response.body
			);
		} catch (err) {
			throw new AgnostError(err.body?.message);
		}
	}
}
