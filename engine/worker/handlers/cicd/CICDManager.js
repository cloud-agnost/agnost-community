import fs from "fs";
import crypto from "crypto";
import * as minio from "minio";
import bcrypt from "bcrypt";
import k8s from "@kubernetes/client-node";
import path from "path";
import yaml from "js-yaml";

import { fileURLToPath } from "url";

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAuthApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
const k8sCustomObjectApi = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sAdmissionApi = kc.makeApiClient(k8s.AdmissionregistrationV1Api);
const k8sAutoscalingApi = kc.makeApiClient(k8s.AutoscalingV2Api);

const namespace = process.env.NAMESPACE;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CICDManager {
    constructor() {}

    async enableCICDInfrastructure() {
        await applyManifest(true);
    }

    async disableCICDInfrastructure() {
        await deleteManifest(true);
    }

    async createNamespace(environment) {
        try {
            const manifest = fs.readFileSync(`${__dirname}/manifests/namespace.yaml`, "utf8");
            const resource = yaml.load(manifest);
            const { metadata } = resource;

            metadata.name = environment.iid;
            await k8sCoreApi.createNamespace(resource);

            return { status: "success" };
        } catch (err) {
            return {
                status: "error",
                message: t(
                    `Cannot create the namespace of environment '${environment.name}'. ${
                        err.response?.body?.message ?? err.message
                    }`
                ),
                stack: err.stack,
            };
        }
    }

    async deleteNamespaces(iids) {
        for (const iid of iids) {
            k8sCoreApi.deleteNamespace(iid).then(
                (response) => {
                    console.log(`Namespace '${iid}' deleted successfully`);
                },
                (err) => {
                    console.error(`Error deleting namespace '${iid}'. ${err.response?.body?.message}`);
                }
            );
        }

        return { status: "success" };
    }
}

async function applyManifest(localRegistryEnabled) {
    const manifest = fs.readFileSync(`${__dirname}/manifests/tekton-infra.yaml`, "utf8");
    const resources = k8s.loadAllYaml(manifest);

    for (const resource of resources) {
        try {
            const { kind, metadata } = resource;

            if (metadata.namespace) {
                var resourceNamespace = metadata.namespace;
            }

            switch (kind) {
                case "Namespace":
                    await k8sCoreApi.createNamespace(resource);
                    break;
                case "Deployment":
                    await k8sAppsApi.createNamespacedDeployment(resourceNamespace, resource);
                    break;
                case "Service":
                    await k8sCoreApi.createNamespacedService(resourceNamespace, resource);
                    break;
                case "ServiceAccount":
                    await k8sCoreApi.createNamespacedServiceAccount(resourceNamespace, resource);
                    break;
                case "Secret":
                    await k8sCoreApi.createNamespacedSecret(resourceNamespace, resource);
                    break;
                case "ConfigMap":
                    await k8sCoreApi.createNamespacedConfigMap(resourceNamespace, resource);
                    break;
                case "ClusterRole":
                    await k8sAuthApi.createClusterRole(resource);
                    break;
                case "ClusterRoleBinding":
                    await k8sAuthApi.createClusterRoleBinding(resource);
                    break;
                case "Role":
                    await k8sAuthApi.createNamespacedRole(resourceNamespace, resource);
                    break;
                case "RoleBinding":
                    await k8sAuthApi.createNamespacedRoleBinding(resourceNamespace, resource);
                    break;
                case "MutatingWebhookConfiguration":
                    await k8sAdmissionApi.createMutatingWebhookConfiguration(resource);
                    break;
                case "ValidatingWebhookConfiguration":
                    await k8sAdmissionApi.createValidatingWebhookConfiguration(resource);
                    break;
                case "HorizontalPodAutoscaler":
                    await k8sAutoscalingApi.createNamespacedHorizontalPodAutoscaler(resourceNamespace, resource);
                    break;
                case "ClusterInterceptor":
                    await k8sCustomObjectApi.createClusterCustomObject(
                        "triggers.tekton.dev",
                        "v1alpha1",
                        "clusterinterceptors",
                        resource
                    );
                    break;
                default:
                    console.log(`Skipping: ${kind}`);
            }
            console.log(`${kind} ${resource.metadata.name} created...`);
        } catch (err) {
            console.error(`Error applying resource ${resource.kind} ${resource.metadata.name}:`, err);
            throw new AgnostError(err.body?.message);
        }
    }

    if (localRegistryEnabled) {
        await deployLocalRegistry();

        // copy regcred secret from the app's namespace
        try {
            const secretName = "regcred-local-registry";
            const resource_namespace = "tekton-builds";
            const regcred = await k8sCoreApi.readNamespacedSecret(secretName, namespace);
            regcred.body.metadata.namespace = resource_namespace;
            delete regcred.body.metadata.resourceVersion;
            await k8sCoreApi.createNamespacedSecret(resource_namespace, regcred.body);
            console.log("Regcred secret " + secretName + " is copied");
        } catch (err) {
            // do nothing, it might be a second time copy!
        }
    }

    return "success";
}

async function deleteManifest(localRegistryEnabled) {
    const manifest = fs.readFileSync(`${__dirname}/manifests/tekton-infra.yaml`, "utf8");
    const resources = k8s.loadAllYaml(manifest);

    for (const resource of resources.reverse()) {
        const { kind, metadata } = resource;

        if (metadata.namespace) {
            var resourceNamespace = metadata.namespace;
        }

        try {
            switch (kind) {
                case "Namespace":
                    await k8sCoreApi.deleteNamespace(resource.metadata.name);
                    break;
                case "Deployment":
                    await k8sAppsApi.deleteNamespacedDeployment(resource.metadata.name, resourceNamespace);
                    break;
                case "Service":
                    await k8sCoreApi.deleteNamespacedService(resource.metadata.name, resourceNamespace);
                    break;
                case "ServiceAccount":
                    await k8sCoreApi.deleteNamespacedServiceAccount(resource.metadata.name, resourceNamespace);
                    break;
                case "Secret":
                    await k8sCoreApi.deleteNamespacedSecret(resource.metadata.name, resourceNamespace);
                    break;
                case "ConfigMap":
                    await k8sCoreApi.deleteNamespacedConfigMap(resource.metadata.name, resourceNamespace);
                    break;
                case "ClusterRole":
                    await k8sAuthApi.deleteClusterRole(resource.metadata.name);
                    break;
                case "ClusterRoleBinding":
                    await k8sAuthApi.deleteClusterRoleBinding(resource.metadata.name);
                    break;
                case "Role":
                    await k8sAuthApi.deleteNamespacedRole(resource.metadata.name, resourceNamespace);
                    break;
                case "RoleBinding":
                    await k8sAuthApi.deleteNamespacedRoleBinding(resource.metadata.name, resourceNamespace);
                    break;
                case "ClusterInterceptor":
                    await k8sCustomObjectApi.deleteClusterCustomObject(
                        "triggers.tekton.dev",
                        "v1alpha1",
                        "clusterinterceptors",
                        resource.metadata.name
                    );
                    break;
                case "MutatingWebhookConfiguration":
                    await k8sAdmissionApi.deleteMutatingWebhookConfiguration(resource.metadata.name);
                    break;
                case "ValidatingWebhookConfiguration":
                    await k8sAdmissionApi.deleteValidatingWebhookConfiguration(resource.metadata.name);
                    break;
                case "HorizontalPodAutoscaler":
                    await k8sAutoscalingApi.deleteNamespacedHorizontalPodAutoscaler(
                        resource.metadata.name,
                        resourceNamespace
                    );
                    break;
                default:
                    console.log(`Skipping: ${kind}`);
            }
            console.log(`${kind} ${resource.metadata.name} deleted...`);
        } catch (err) {}
    }

    if (localRegistryEnabled) {
        await removeLocalRegistry();

        // Delete regcred secret
        try {
            const secretName = "regcred-local-registry";
            const resource_namespace = "tekton-builds";
            await k8sCoreApi.deleteNamespacedSecret(secretName, resource_namespace);
            console.log("Deleted regcred secret " + secretName);
        } catch (err) {}
    }

    return "success";
}

async function deployLocalRegistry() {
    const manifest = fs.readFileSync(`${__dirname}/manifests/local-registry.yaml`, "utf8");
    const resources = k8s.loadAllYaml(manifest);

    for (const resource of resources) {
        try {
            const { kind } = resource;

            switch (kind) {
                case "Deployment":
                    await k8sAppsApi.createNamespacedDeployment(namespace, resource);
                    break;
                case "Service":
                    await k8sCoreApi.createNamespacedService(namespace, resource);
                    break;
                case "ServiceAccount":
                    await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
                    break;
                case "Secret":
                    const adminPassword = crypto.randomBytes(20).toString("hex");
                    resource.stringData.htpasswd = await generateHtpasswd("admin", adminPassword);

                    // this will create the secret for Zot to operate
                    await k8sCoreApi.createNamespacedSecret(namespace, resource);

                    // this will create docker credentials for kaniko to push images
                    let auth = Buffer.from("admin:" + adminPassword);
                    const secretData = Buffer.from(
                        '{"auths":{"local-registry.default:5000":{"username":"admin","password":"' +
                            adminPassword +
                            '","auth":"' +
                            auth.toString("base64") +
                            '"}}}'
                    );
                    const regcredSecret = {
                        apiVersion: "v1",
                        data: { ".dockerconfigjson": secretData.toString("base64") },
                        kind: "Secret",
                        metadata: { name: "regcred-local-registry", namespace: namespace },
                        type: "kubernetes.io/dockerconfigjson",
                    };
                    await k8sCoreApi.createNamespacedSecret(namespace, regcredSecret);
                    break;
                case "ConfigMap":
                    await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
                    break;
                default:
                    console.log(`Skipping: ${kind}`);
            }
            console.log(`${kind} ${resource.metadata.name} created...`);
        } catch (err) {
            console.error("Error applying resource:", resource);
            console.error("Error applying resource:", err);

            throw new AgnostError(err.body?.message);
        }
    }

    await createS3Bucket();

    return "success";
}

async function removeLocalRegistry() {
    try {
        await k8sAppsApi.deleteNamespacedDeployment("local-registry", namespace);
        console.log("Deployment local-registry deleted...");
    } catch (err) {}
    try {
        await k8sCoreApi.deleteNamespacedService("local-registry", namespace);
        console.log("Service local-registry deleted...");
    } catch (err) {}
    try {
        await k8sCoreApi.deleteNamespacedSecret("local-registry-htpasswd", namespace);
        console.log("Secret local-registry-htpasswd deleted...");
    } catch (err) {}
    try {
        await k8sCoreApi.deleteNamespacedSecret("regcred-local-registry", namespace);
        console.log("Secret regcred-local-registry deleted...");
    } catch (err) {}
    try {
        await k8sCoreApi.deleteNamespacedConfigMap("local-registry-config", namespace);
        console.log("ConfigMap local-registry-config deleted...");
    } catch (err) {}
    try {
        await k8sCoreApi.deleteNamespacedServiceAccount("local-registry", namespace);
        console.log("ServiceAccount local-registry deleted...");
    } catch (err) {}

    await deleteS3Bucket();

    return "sucess";
}

async function createS3Bucket() {
    const minioClient = new minio.Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: Number(process.env.MINIO_PORT),
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
    });

    try {
        await minioClient.makeBucket("zot-storage");
        console.log("Bucket zot-storage is created on MinIO...");
    } catch (err) {
        // Ignore error if the bucket already exists
        if (err.code === "BucketAlreadyOwnedByYou" || err.code === "BucketAlreadyOwned") {
            console.log(`Bucket zot-storage already exists.`);
        } else {
            console.error("Cannot create the bucket:", err);
            throw new AgnostError(err.body?.message ?? err.message);
        }
    }
}

async function deleteS3Bucket() {
    const minioClient = new minio.Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: Number(process.env.MINIO_PORT),
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
    });

    try {
        await minioClient.removeBucket("zot-storage");
        console.log("Bucket zot-storage is deleted from MinIO...");
    } catch (err) {
        console.error("Cannot delete the bucket:", err);
    }
}

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

async function generateHtpasswd(username, password) {
    try {
        // Generate bcrypt hash for the password using await
        const hash = await hashPassword(password);
        return `${username}:${hash}`;
    } catch (error) {
        console.error("Error generating bcrypt hash:", error);
        throw new AgnostError(error.message);
    }
}
