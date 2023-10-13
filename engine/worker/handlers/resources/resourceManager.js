import axios from "axios";
import k8s from "@kubernetes/client-node";
import { createRedis, deleteRedis, updateRedis } from "./redis.js";
import { createRabbitmqCluster, updateRabbitmqCluster, deleteRabbitmqCluster } from "./rabbitmq.js";
import { createMongoDBResource, updateMongoDBResource, deleteMongoDBResource } from "./mongodb.js";
import { createPostgresql, updatePostgresql, deletePostgresql, waitForSecret } from "./postgres.js";
import { getDBClient } from "../../init/db.js";

export class ResourceManager {
    constructor(resourceObj) {
        // The resource object also include the action type and the callback url to send the logs
        this.resourceObj = resourceObj;

        // Resource management operation logs
        this.logs = [];

        this.conn = null; //MongoDB MongoClient connection
        this.platformDB = null; //MongoDB DB object reference
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
    getResourceName() {
        return this.resourceObj.name;
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
                case "cache":
                    if (this.getResourceInstance() === "Redis") await this.createRedisCache();
                    break;
                case "queue":
                    if (this.getResourceInstance() === "RabbitMQ") await this.createRabbitMQMessageBroker();
                    break;
                case "database":
                    if (this.getResourceInstance() === "MongoDB") await this.createMongoDBReplicaSet();
                    else if (this.getResourceInstance() === "PostgreSQL") await this.createPostgreSQLCluster();
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
            this.addLog([t("Resource creation failed"), error.name, error.message, error.stack].join("\n"), "Error");
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
            this.addLog([t("Resource binding failed"), error.name, error.message, error.stack].join("\n"), "Error");
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
            const resource = this.getResource();
            switch (this.getResourceType()) {
                case "engine":
                    await this.updateAPIServer();
                    break;
                case "cache":
                    if (this.getResourceInstance() === "Redis")
                        await updateRedis(
                            this.getResourceName(),
                            resource.config.version,
                            resource.config.size,
                            resource.config.readReplica
                        );
                    break;
                case "queue":
                    if (this.getResourceInstance() === "RabbitMQ")
                        await updateRabbitmqCluster(
                            this.getResourceName(),
                            resource.config.version,
                            resource.config.size,
                            resource.config.replicas
                        );
                    break;
                case "database":
                    if (this.getResourceInstance() === "MongoDB")
                        await updateMongoDBResource(
                            this.getResourceName(),
                            resource.config.version,
                            resource.config.size,
                            resource.config.replicas
                        );
                    else if (this.getResourceInstance() === "PostgreSQL")
                        await updatePostgresql(
                            this.getResourceName(),
                            resource.config.version,
                            resource.config.size,
                            resource.config.instances
                        );
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
            this.addLog([t("Resource update failed"), error.name, error.message, error.stack].join("\n"), "Error");
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
            const resource = this.getResource();
            switch (this.getResourceType()) {
                case "engine":
                    await this.deleteAPIServer();
                    break;
                case "cache":
                    if (this.getResourceInstance() === "Redis") await deleteRedis(this.getResourceName());
                    break;
                case "queue":
                    if (this.getResourceInstance() === "RabbitMQ") {
                        const access = helper.decryptSensitiveData(resource.access);
                        await deleteRabbitmqCluster(this.getResourceName(), access.username);
                    }
                    break;
                case "database":
                    if (this.getResourceInstance() === "MongoDB") {
                        await deleteMongoDBResource(this.getResourceName());
                    } else if (this.getResourceInstance() === "PostgreSQL") {
                        await deletePostgresql(this.getResourceName());
                    }
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
            this.addLog([t("Resource deletion failed"), error.name, error.message, error.stack].join("\n"), "Error");
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
        await this.createKnativeService(resource.iid, resource.access, resource.config);

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
                            "autoscaling.knative.dev/initial-scale": deploymentConfig.initialScale.toString(),
                            "autoscaling.knative.dev/target": deploymentConfig.target.toString(),
                            "autoscaling.knative.dev/metric": "concurrency",
                            "autoscaling.knative.dev/max-scale": deploymentConfig.maxScale.toString(),
                            "autoscaling.knative.dev/min-scale": deploymentConfig.minScale.toString(),
                            "autoscaling.knative.dev/target-utilization-percentage": "80",
                            "autoscaling.knative.dev/scale-down-delay": deploymentConfig.scaleDownDelay.toString(),
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
                                    {
                                        name: "NAMESPACE",
                                        value: process.env.NAMESPACE,
                                    },
                                    {
                                        name: "JWT_SECRET",
                                        value: process.env.JWT_SECRET,
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
                                    timeoutSeconds: config.get("general.livenessProbe.timeoutSeconds"),
                                    periodSeconds: config.get("general.livenessProbe.periodSeconds"),
                                    initialDelaySeconds: config.get("general.livenessProbe.initialDelaySeconds"),
                                },
                                readinessProbe: {
                                    httpGet: {
                                        path: "/health",
                                        port: config.get("general.defaultClusterIPPort"),
                                    },
                                    timeoutSeconds: config.get("general.readinessProbe.timeoutSeconds"),
                                    periodSeconds: config.get("general.readinessProbe.periodSeconds"),
                                    initialDelaySeconds: config.get("general.readinessProbe.initialDelaySeconds"),
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
                process.env.NAMESPACE,
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
        const k8sApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

        try {
            const existingService = await k8sApi.getNamespacedCustomObjectStatus(
                "serving.knative.dev",
                "v1",
                process.env.NAMESPACE,
                "services",
                deploymentName
            );

            // Update annotations
            existingService.body.spec.template.metadata.annotations = {
                ...existingService.body.spec.template.metadata.annotations,
                "autoscaling.knative.dev/target":
                    deploymentConfig.target?.toString() ??
                    existingService.body.spec.template.metadata.annotations["autoscaling.knative.dev/target"],
                "autoscaling.knative.dev/max-scale": deploymentConfig.maxScale.toString(),
                "autoscaling.knative.dev/min-scale": deploymentConfig.minScale.toString(),
                "autoscaling.knative.dev/scale-down-delay": deploymentConfig.scaleDownDelay.toString(),
                "autoscaling.knative.dev/scale-to-zero-pod-retention-period":
                    deploymentConfig.scaleToZeroPodRetentionPeriod.toString(),
            };

            existingService.body.spec.template.spec.containerConcurrency = deploymentConfig.containerConcurrency;
            const container = existingService.body.spec.template.spec.containers[0];
            container.resources = {
                requests: {
                    cpu: deploymentConfig.cpu.request.toString(),
                    memory: deploymentConfig.memory.request.toString(),
                },
                limits: {
                    cpu: deploymentConfig.cpu.limit.toString(),
                    memory: deploymentConfig.memory.limit.toString(),
                },
            };

            // Apply updated Knative Service
            await k8sApi.replaceNamespacedCustomObject(
                "serving.knative.dev",
                "v1",
                process.env.NAMESPACE,
                "services",
                deploymentName,
                existingService.body
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
                process.env.NAMESPACE,
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
                        "nginx.ingress.kubernetes.io/upstream-vhost": `${ingressName}.${process.env.NAMESPACE}.svc.cluster.local`,
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
            await networkingApi.createNamespacedIngress(process.env.NAMESPACE, ingress);
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
            await networkingApi.deleteNamespacedIngress(`${ingressName}-ingress`, process.env.NAMESPACE);
        } catch (err) {
            throw new AgnostError(err.body?.message);
        }
    }

    /**
     * Returns information about the Agnost cluster default deployments and horizontal pod autoscalers
     */
    async getClusterInfo() {
        const clusterInfo = [];
        const clusterComponents = (await import("./clusterComponents.js")).clusterComponents;
        // Create a Kubernetes core API client
        const kubeconfig = new k8s.KubeConfig();
        kubeconfig.loadFromDefault();
        const k8sApi = kubeconfig.makeApiClient(k8s.AppsV1Api);
        const k8sAutoscalingApi = kubeconfig.makeApiClient(k8s.AutoscalingV1Api);

        try {
            let deployments = await k8sApi.listNamespacedDeployment(process.env.NAMESPACE);
            let statefulSets = await k8sApi.listNamespacedStatefulSet(process.env.NAMESPACE);
            let hpas = await k8sAutoscalingApi.listNamespacedHorizontalPodAutoscaler(process.env.NAMESPACE);

            for (const comp of clusterComponents) {
                if (comp.k8sType === "Deployment") {
                    clusterInfo.push(this.getDeploymentInfo(comp, deployments.body.items, hpas.body.items));
                } else if (comp.k8sType === "StatefulSet") {
                    clusterInfo.push(this.getStatefulSetInfo(comp, statefulSets.body.items));
                }
            }

            return clusterInfo;
        } catch (err) {
            throw new AgnostError(err.body?.message);
        }
    }

    /**
     * Returns information about the Agnost cluster default deployments and horizontal pod autoscalers
     */
    getDeploymentInfo(component, deployments, hpas) {
        const deployment = deployments.find((entry) => entry.metadata.name === component.deploymentName);
        const hpa = component.hasHpa ? hpas.find((entry) => entry.metadata.name === component.hpaName) : null;
        let container = deployment.spec.template.spec.containers[0];

        const info = {
            version: container.image.split(":")[1],
            configuredReplicas: deployment.spec.replicas,
            runningReplicas: deployment.status.availableReplicas,
        };

        if (hpa) {
            info.minReplicas = hpa.spec.minReplicas;
            info.maxReplicas = hpa.spec.maxReplicas;
        }

        const comp = { ...component, info };
        return comp;
    }

    /**
     * Returns information about the Agnost cluster default deployments and horizontal pod autoscalers
     */
    getStatefulSetInfo(component, statefulSets) {
        const statefulSet = statefulSets.find((entry) => entry.metadata.name === component.statefulSetName);
        let container = statefulSet.spec.template.spec.containers[0];

        const info = {
            version: container.image.split(":")[1],
            configuredReplicas: statefulSet.spec.replicas,
            runningReplicas: statefulSet.status.availableReplicas,
        };

        const comp = { ...component, info };
        return comp;
    }

    /**
     * Updates the cluster component - deployment
     * @param  {string} component The component name
     * @param  {number} replicas The initial replicas of the component
     * @param  {string} imageName The new docker image name and version
     */
    async updateDeployment(deploymentName, replicas = null, imageName = null) {
        // Create a Kubernetes core API client
        const kubeconfig = new k8s.KubeConfig();
        kubeconfig.loadFromDefault();
        const k8sApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

        try {
            const response = await k8sApi.readNamespacedDeployment(deploymentName, process.env.NAMESPACE);

            if (replicas) response.body.spec.replicas = replicas;
            if (imageName) {
                let container = response.body.spec.template.spec.containers[0];
                container.image = imageName;
            }

            // Update the deployment
            await k8sApi.replaceNamespacedDeployment(deploymentName, process.env.NAMESPACE, response.body);
        } catch (err) {
            logger.error(`Cannot update deployment '${deploymentName}'`, { details: err });
        }
    }

    /**
     * Updates the cluster component - hpa
     * @param  {string} component The component name
     * @param  {number} minReplicas The min replicas
     * @param  {number} maxReplicas The max replicas
     */
    async updateHPA(hpaName, minReplicas, maxReplicas) {
        // Create a Kubernetes core API client
        const kubeconfig = new k8s.KubeConfig();
        kubeconfig.loadFromDefault();
        const k8sApi = kubeconfig.makeApiClient(k8s.AutoscalingV2Api);

        try {
            const response = await k8sApi.readNamespacedHorizontalPodAutoscaler(hpaName, process.env.NAMESPACE);

            response.body.spec.minReplicas = minReplicas;
            response.body.spec.maxReplicas = maxReplicas;

            // Update the deployment
            await k8sApi.replaceNamespacedHorizontalPodAutoscaler(hpaName, process.env.NAMESPACE, response.body);
        } catch (err) {
            logger.error(`Cannot update HPA '${hpaName}'`, { details: err });
        }
    }

    /**
     * Returns information about the app version's API server
     * @param  {string} envId The environment id
     */
    async getAPIServerInfo(envId) {
        // Create a Kubernetes core API client
        const kubeconfig = new k8s.KubeConfig();
        kubeconfig.loadFromDefault();
        const k8sApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

        try {
            const revResponse = await k8sApi.listNamespacedCustomObject(
                "serving.knative.dev",
                "v1",
                process.env.NAMESPACE,
                "revisions",
                undefined,
                undefined,
                undefined,
                undefined,
                `app=${envId}`
            );

            let finalStatus = "Idle";
            let totalAvailable = 0;
            const revisions = revResponse.body.items;

            for (let index = 0; index < revisions.length; index++) {
                const revision = revisions[index];
                const { status, runningReplicas } = await this.checkAPIServerStatus(revision.metadata.name);
                totalAvailable += runningReplicas;
            }

            if (totalAvailable > 0) finalStatus = "OK";

            const ksResponse = await k8sApi.getNamespacedCustomObjectStatus(
                "serving.knative.dev",
                "v1",
                process.env.NAMESPACE,
                "services",
                envId
            );

            const annotations = ksResponse.body?.spec?.template?.metadata?.annotations ?? {};
            let container = ksResponse.body.spec.template.spec.containers[0];

            return {
                name: envId,
                status: finalStatus,
                initialScale: annotations["autoscaling.knative.dev/initial-scale"],
                maxScale: annotations["autoscaling.knative.dev/max-scale"],
                minScale: annotations["autoscaling.knative.dev/min-scale"],
                scaleDownDelay: annotations["autoscaling.knative.dev/scale-down-delay"],
                scaleToZeroPodRetentionPeriod:
                    annotations["autoscaling.knative.dev/scale-to-zero-pod-retention-period"],
                runningReplicas: totalAvailable,
                version: container.image.split(":")[1],
            };
        } catch (err) {
            throw new AgnostError(err.body?.message);
        }
    }

    /**
     * Returns the status of the API server
     * @param  {object} connSettings The connection settings needed to connect to the API server
     */
    async checkAPIServerStatus(deploymentName) {
        if (!deploymentName) return { status: "Error", runningReplicas: 0 };

        // Create a Kubernetes core API client
        const kubeconfig = new k8s.KubeConfig();
        kubeconfig.loadFromDefault();
        const coreApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

        let result = null;
        try {
            result = await coreApi.readNamespacedDeployment(`${deploymentName}-deployment`, process.env.NAMESPACE);
        } catch (err) {
            return { status: "Error", runningReplicas: 0 };
        }

        return {
            status: result.body?.status?.availableReplicas > 0 ? "OK" : "Idle",
            runningReplicas: result.body?.status?.availableReplicas ?? 0,
        };
    }

    /**
     * Returns the database object pointing to the MongoDB database of the engine cluster, which is used to store environment configuration info
     */
    getPlatformDB() {
        if (!this.platformDB) {
            if (!this.conn) {
                this.conn = getDBClient();
            }
            this.platformDB = this.conn.db("agnost");
        }

        return this.platformDB;
    }

    /**
     * Updates the access settings of the resource
     */
    async updateResourceAccessSettings(access, accessReadOnly) {
        const resource = this.getResource();
        const db = this.getPlatformDB();

        // Encrypt sensitive access data
        access = helper.encyrptSensitiveData(access);
        if (accessReadOnly) accessReadOnly = helper.encyrptSensitiveData(accessReadOnly);

        // Update resource access and access read only settings
        await db.collection("resources").findOneAndUpdate(
            { _id: helper.objectId(resource._id) },
            {
                $set: {
                    access,
                    accessReadOnly,
                },
            }
        );
    }

    /**
     * Creates a new Redis cache
     */
    async createRedisCache() {
        const resource = this.getResource();
        if (resource.config.readReplica)
            this.addLog(
                t("Creating '%s'GB Redis cache '%s' with a read-replica.", resource.config.size, resource.name)
            );
        else
            this.addLog(
                t("Creating '%s'GB Redis cache '%s' without a read-replica.", resource.config.size, resource.name)
            );

        await createRedis(
            resource.name,
            resource.config.version,
            resource.config.size,
            resource.config.password,
            resource.config.readReplica
        );

        const access = {
            host: `${resource.name}-master.${process.env.NAMESPACE}.svc.cluster.local`,
            password: resource.config.password,
            port: 6379,
        };

        const accessReadOnly = [];
        if (resource.config.readReplica) {
            accessReadOnly.push({
                host: `${resource.name}-replicas.${process.env.NAMESPACE}.svc.cluster.local`,
                password: resource.config.password,
                port: 6379,
            });
        }

        // Update resource access settings
        await this.updateResourceAccessSettings(access, accessReadOnly);
    }

    /**
     * Creates a new RabbitMQ cluster
     */
    async createRabbitMQMessageBroker() {
        const resource = this.getResource();
        this.addLog(
            t(
                "Creating RabbitMQ cluster '%s' with '%s' replica(s) and '%s' persistent storage.",
                resource.name,
                resource.config.replicas,
                resource.config.size
            )
        );

        await createRabbitmqCluster(
            resource.name,
            resource.config.version,
            resource.config.size,
            resource.config.username,
            resource.config.password,
            resource.config.replicas
        );

        const access = {
            host: `${resource.name}.${process.env.NAMESPACE}.svc.cluster.local`,
            port: 5672,
            username: resource.config.username,
            password: resource.config.password,
            scheme: "amqp",
            vhost: "",
            format: "object",
        };

        // Update resource access settings
        await this.updateResourceAccessSettings(access, []);
    }

    /**
     * Creates a new MongoDB replica set
     */
    async createMongoDBReplicaSet() {
        const resource = this.getResource();
        this.addLog(
            t(
                "Creating MongoDB replica set '%s' with '%s' replica(s) and '%s' storage size.",
                resource.name,
                resource.config.replicas,
                resource.config.size
            )
        );

        await createMongoDBResource(
            resource.name,
            resource.config.version,
            resource.config.size,
            resource.config.username,
            resource.config.password,
            resource.config.replicas
        );

        const access = {
            connFormat: "mongodb",
            host: `${resource.name}-svc.${process.env.NAMESPACE}.svc.cluster.local`,
            port: 27017,
            username: resource.config.username,
            password: resource.config.password,
        };

        // Update resource access settings
        await this.updateResourceAccessSettings(access, []);
    }

    /**
     * Creates a new PostgreSQL database server
     */
    async createPostgreSQLCluster() {
        const resource = this.getResource();
        this.addLog(
            t(
                "Creating PostgreSQL database server '%s' with '%s' instance(s) and '%s' storage size.",
                resource.name,
                resource.config.instances,
                resource.config.size
            )
        );

        await createPostgresql(resource.name, resource.config.version, resource.config.size, resource.config.instances);
        const secretName = "postgres." + resource.name + ".credentials.postgresql.acid.zalan.do";
        const password = await waitForSecret(secretName);

        const access = {
            host: `${resource.name}.${process.env.NAMESPACE}.svc.cluster.local`,
            port: 5432,
            username: "postgres",
            password: Buffer.from(password, "base64").toString("utf-8"),
        };

        const accessReadOnly = [
            {
                host: `${resource.name}-repl.${process.env.NAMESPACE}.svc.cluster.local`,
                port: 5432,
                username: "postgres",
                password: Buffer.from(password, "base64").toString("utf-8"),
            },
        ];

        // Update resource access settings
        await this.updateResourceAccessSettings(access, accessReadOnly);
    }
}
