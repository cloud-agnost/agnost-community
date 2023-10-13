import k8s from "@kubernetes/client-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const group = "mongodbcommunity.mongodb.com";
const version = "v1";
const namespace = process.env.NAMESPACE;
const plural = "mongodbcommunity";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createMongoDBResource(mongoName, mongoVersion, size, userName, passwd, replicaCount) {
    const manifest = fs.readFileSync(`${__dirname}/manifests/mongodbcommunity.yaml`, "utf8");
    const resources = k8s.loadAllYaml(manifest);

    for (const resource of resources) {
        try {
            const { kind } = resource;

            switch (kind) {
                case "Secret":
                    resource.metadata.name = mongoName + "-user";
                    resource.stringData.password = passwd;
                    k8sCoreApi.createNamespacedSecret(namespace, resource);
                    break;
                case "MongoDBCommunity":
                    resource.metadata.name = mongoName;
                    resource.spec.members = replicaCount;
                    resource.spec.version = mongoVersion;
                    resource.spec.users[0].name = userName;
                    resource.spec.users[0].passwordSecretRef.name = mongoName + "-user";
                    resource.spec.users[0].scramCredentialsSecretName = mongoName + "-user";
                    resource.spec.statefulSet.spec.selector.matchLabels.app = mongoName + "-svc";
                    resource.spec.statefulSet.spec.template.metadata.labels.app = mongoName + "-svc";
                    resource.spec.statefulSet.spec.volumeClaimTemplates[0].spec.resources.requests.storage = size;
                    await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, plural, resource);
                    break;
                default:
                    break;
                // console.log("Skipping: " + kind);
            }
            // console.log(kind + " " + resource.metadata.name + " created...");
        } catch (error) {
            // console.error("Error applying resource:", error);
            throw new AgnostError(error.body?.message);
        }
    }
    return "success";
}

export async function updateMongoDBResource(mongoName, mongoVersion, size, replicaCount) {
    const patchData = {
        spec: {
            version: mongoVersion,
            members: replicaCount,
        },
    };
    const pvcPatch = {
        spec: {
            resources: {
                requests: {
                    storage: size,
                },
            },
        },
    };
    const requestOptions = { headers: { "Content-Type": "application/merge-patch+json" } };

    try {
        await k8sCustomApi.patchNamespacedCustomObject(
            group,
            version,
            namespace,
            plural,
            mongoName,
            patchData,
            undefined,
            undefined,
            undefined,
            requestOptions
        );
        // console.log("MongoDB " + mongoName + " updated...");

        const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
        pvcList.body.items.forEach(async (pvc) => {
            var pvcName = pvc.metadata.name;
            if (pvcName.includes("data-volume-" + mongoName + "-")) {
                await k8sCoreApi.patchNamespacedPersistentVolumeClaim(
                    pvcName,
                    namespace,
                    pvcPatch,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    requestOptions
                );
                // console.log("PersistentVolumeClaim " + pvcName + " updated...");
            }
        });
    } catch (error) {
        // console.error("Error updating MongoDB " + mongoName + " resources...", error.body);
        throw new AgnostError(error.body?.message);
    }

    return "success";
}

export async function deleteMongoDBResource(mongoName) {
    try {
        try {
            await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, mongoName);
        } catch (err) {}
        // console.log("MongoDB " + mongoName + " deleted...");
        try {
            await k8sCoreApi.deleteNamespacedSecret(mongoName + "-user", namespace);
        } catch (err) {}
        // console.log("Secret " + mongoName + "-user deleted...");

        const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
        pvcList.body.items.forEach(async (pvc) => {
            var pvcName = pvc.metadata.name;
            if (
                pvcName.includes("logs-volume-" + mongoName + "-") ||
                pvcName.includes("data-volume-" + mongoName + "-")
            ) {
                try {
                    await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace);
                } catch (err) {}
                // console.log("PersistentVolumeClaim " + pvcName + " deleted...");
            }
        });
    } catch (error) {
        // console.error("Error deleting resource:", error.body);
        throw new AgnostError(error.body?.message);
    }

    return "success";
}
