const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const crypto = require('crypto');
const minio = require("minio");
const bcrypt = require('bcrypt');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAuthApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
const k8sCustomObjectApi = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sAdmissionApi = kc.makeApiClient(k8s.AdmissionregistrationV1Api);
const k8sAutoscalingApi = kc.makeApiClient(k8s.AutoscalingV2Api);
const k8sBatchApi = kc.makeApiClient(k8s.BatchV1Api);

const namespace = process.env.NAMESPACE;

async function createS3Bucket() {
  const minioClient = new minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });

  try {
    await minioClient.makeBucket('zot-storage', 'us-east-1');
    console.log('Bucket zot-storage is created on MinIO...');
  } catch (err) {
    // Ignore error if the bucket already exists
    if (err.code === 'BucketAlreadyOwnedByYou' || err.code === 'BucketAlreadyOwned') {
      console.log(`Bucket zot-storage already exists.`);
    } else {
      console.error('Cannot create the bucket:', err);
      throw new Error(JSON.stringify(err.body));
    }
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
    console.error('Error generating bcrypt hash:', error);
  }
}

async function deployLocalRegistry() {
  const registryManifestPath = '../manifests/local-registry.yaml';
  const manifest = fs.readFileSync(registryManifestPath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'Deployment':
          await k8sAppsApi.createNamespacedDeployment(namespace, resource);
          break;
        case 'Service':
          await k8sCoreApi.createNamespacedService(namespace, resource);
          break;
        case('ServiceAccount'):
          await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          break;
        case('Secret'):
          const adminPassword = crypto.randomBytes(20).toString('hex');
          resource.stringData.htpasswd = await generateHtpasswd('admin', adminPassword);

          // this will create the secret for Zot to operate
          await k8sCoreApi.createNamespacedSecret(namespace, resource);

          // this will create docker credentials for kaniko to push images
          auth = Buffer.from('admin:' + adminPassword);
          const secretData = Buffer.from('{"auths":{"local-registry.default:5000":{"username":"admin","password":"' + adminPassword + '","auth":"' + auth.toString("base64") + '"}}}');
          const regcredSecret = {
            "apiVersion": "v1",
            "data": { ".dockerconfigjson": secretData.toString('base64') },
            "kind": "Secret",
            "metadata": { "name": 'regcred-local-registry', "namespace": namespace },
            "type": "kubernetes.io/dockerconfigjson"
          };
          await k8sCoreApi.createNamespacedSecret(namespace, regcredSecret);
          break;
        case('ConfigMap'):
          await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
          break;
        default:
          console.log(`Skipping: ${kind}`);
      }
    console.log(`${kind} ${resource.metadata.name} created...`);
    } catch (err) {
      console.error('Error applying resource:', err);
      throw new Error(JSON.stringify(err.body));
    }
  }

  await createS3Bucket();

  return "success";
}

async function remoteLocalRegistry() {
  try {
    await k8sAppsApi.deleteNamespacedDeployment('local-registry', namespace);
    console.log('Deployment local-registry deleted...');
    await k8sCoreApi.deleteNamespacedService('local-registry', namespace);
    console.log('Service local-registry deleted...');
    await k8sCoreApi.deleteNamespacedSecret('local-registry-htpasswd', namespace);
    console.log('Secret local-registry-htpasswd deleted...');
    await k8sCoreApi.deleteNamespacedSecret('regcred-local-registry', namespace);
    console.log('Secret regcred-local-registry deleted...');
    await k8sCoreApi.deleteNamespacedConfigMap('local-registry-config', namespace);
    console.log('ConfigMap local-registry-config deleted...');
    await k8sCoreApi.deleteNamespacedServiceAccount('local-registry', namespace);
    console.log('ServiceAccount local-registry deleted...');
  } catch (err) {
    console.error('Error applying resource:', err);
    throw new Error(JSON.stringify(err.body));
  }

  return "sucess";
}

async function applyManifest(localRegistryEnabled) {
  const manifestFilePath = '../manifests/tekton-infra.yaml';
  const manifest = fs.readFileSync(manifestFilePath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      if (metadata.namespace) {
        var resourceNamespace = metadata.namespace;
      }

      switch(kind) {
        case 'Namespace':
          await k8sCoreApi.createNamespace(resource);
          break;
        case 'Deployment':
          await k8sAppsApi.createNamespacedDeployment(resourceNamespace, resource);
          break;
        case 'Service':
          await k8sCoreApi.createNamespacedService(resourceNamespace, resource);
          break;
        case('ServiceAccount'):
          await k8sCoreApi.createNamespacedServiceAccount(resourceNamespace, resource);
          break;
        case('Secret'):
          await k8sCoreApi.createNamespacedSecret(resourceNamespace, resource);
          break;
        case('ConfigMap'):
          await k8sCoreApi.createNamespacedConfigMap(resourceNamespace, resource);
          break;
        case('ClusterRole'):
          await k8sAuthApi.createClusterRole(resource);
          break;
        case('ClusterRoleBinding'):
          await k8sAuthApi.createClusterRoleBinding(resource);
          break;
        case('Role'):
          await k8sAuthApi.createNamespacedRole(resourceNamespace, resource);
          break;
        case('RoleBinding'):
          await k8sAuthApi.createNamespacedRoleBinding(resourceNamespace, resource);
          break;
        case('MutatingWebhookConfiguration'):
          await k8sAdmissionApi.createMutatingWebhookConfiguration(resource);
          break;
        case('ValidatingWebhookConfiguration'):
          await k8sAdmissionApi.createValidatingWebhookConfiguration(resource);
          break;
        case('HorizontalPodAutoscaler'):
          await k8sAutoscalingApi.createNamespacedHorizontalPodAutoscaler(resourceNamespace, resource);
          break;
        case('ClusterInterceptor'):
          await k8sCustomObjectApi.createClusterCustomObject('triggers.tekton.dev', 'v1alpha1', 'clusterinterceptors', resource);
          break;
        case('CronJob'):
          await k8sBatchApi.createNamespacedCronJob(resourceNamespace, resource);
          break;
        default:
          console.log(`Skipping: ${kind}`);
      }
    console.log(`${kind} ${resource.metadata.name} created...`);
    } catch (err) {
      console.error('Error applying resource:', err);
      throw new Error(JSON.stringify(err.body));
    }
  }

  if (localRegistryEnabled) {
    await deployLocalRegistry();
  }

  return "success";
}

async function deleteManifest(localRegistryEnabled) {
  const manifestFilePath = '../manifests/tekton-infra.yaml';
  const manifest = fs.readFileSync(manifestFilePath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);


  for (const resource of resources.reverse()) {
    try {
      const { kind, metadata } = resource;

      if (metadata.namespace) {
        var resourceNamespace = metadata.namespace;
      }

      switch(kind) {
        case 'Namespace':
          await k8sCoreApi.deleteNamespace(resource.metadata.name);
          break;
        case 'Deployment':
          await k8sAppsApi.deleteNamespacedDeployment(resource.metadata.name, resourceNamespace);
          break;
        case 'Service':
          await k8sCoreApi.deleteNamespacedService(resource.metadata.name, resourceNamespace);
          break;
        case('ServiceAccount'):
          await k8sCoreApi.deleteNamespacedServiceAccount(resource.metadata.name, resourceNamespace);
          break;
        case('Secret'):
          await k8sCoreApi.deleteNamespacedSecret(resource.metadata.name, resourceNamespace);
          break;
        case('ConfigMap'):
          await k8sCoreApi.deleteNamespacedConfigMap(resource.metadata.name, resourceNamespace);
          break;
        case('ClusterRole'):
          await k8sAuthApi.deleteClusterRole(resource.metadata.name);
          break;
        case('ClusterRoleBinding'):
          await k8sAuthApi.deleteClusterRoleBinding(resource.metadata.name);
          break;
        case('Role'):
          await k8sAuthApi.deleteNamespacedRole(resource.metadata.name, resourceNamespace);
          break;
        case('RoleBinding'):
          await k8sAuthApi.deleteNamespacedRoleBinding(resource.metadata.name, resourceNamespace);
          break;
        case('ClusterInterceptor'):
          await k8sCustomObjectApi.deleteClusterCustomObject('triggers.tekton.dev', 'v1alpha1', 'clusterinterceptors', resource.metadata.name);
          break;
        case('MutatingWebhookConfiguration'):
          await k8sAdmissionApi.deleteMutatingWebhookConfiguration(resource.metadata.name);
          break;
        case('ValidatingWebhookConfiguration'):
          await k8sAdmissionApi.deleteValidatingWebhookConfiguration(resource.metadata.name);
          break;
        case('HorizontalPodAutoscaler'):
          await k8sAutoscalingApi.deleteNamespacedHorizontalPodAutoscaler(resource.metadata.name, resourceNamespace);
          break;
        case('CronJob'):
          await k8sBatchApi.deleteNamespacedCronJob(resource.metadata.name, resourceNamespace);
          break;
        default:
          console.log(`Skipping: ${kind}`);
      }
    console.log(`${kind} ${resource.metadata.name} deleted...`);
    } catch (err) {
      console.error('Error applying resource:', err);
      throw new Error(JSON.stringify(err.body));
    }
  }

  if (localRegistryEnabled) {
    await remoteLocalRegistry();
  }

  return "success";
}

/**
 * @swagger
 * /tektonInfra:
 *   post:
 *     summary: Deploy tekton pipeline infrastructure
 *     description: Deploys tekton pipelines
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               localRegistryEnabled:
 *                 type: boolean
 *                 description: Enables deployment of zot-registry to the cluster.
 *             required:
 *               - localRegistryEnabled
 *     responses:
 *       200:
 *         description: Deployed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: success message.
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */

router.post('/tektonInfra', async (req, res) => {
  const { localRegistryEnabled } = req.body;

  try {
    await applyManifest(localRegistryEnabled);
    res.json({ result: "tekton-operator installed" });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Delete tekton operator

/**
 * @swagger
 * /tektonInfra:
 *   delete:
 *     summary: Uninstall tekton pipeline infrastructure
 *     description: uninstall tekton pipelines
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               localRegistryEnabled:
 *                 type: boolean
 *                 description: Enables uninstallation of zot-registry from the cluster.
 *             required:
 *               - localRegistryEnabled
 *     responses:
 *       200:
 *         description: Uninstalled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: success message.
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */

router.delete('/tektonInfra', async (req, res) => {
  const { localRegistryEnabled } = req.body;
  try {
    await deleteManifest(localRegistryEnabled);
    res.json({ result: "tekton-operator deleted" });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
