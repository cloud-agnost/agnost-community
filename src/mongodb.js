const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const group = 'mongodbcommunity.mongodb.com';
const version = 'v1';
const namespace = process.env.NAMESPACE;
const plural = 'mongodbcommunity';

async function createMongoDBResource(mongoName, mongoVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount) {
  const manifest = fs.readFileSync('/manifests/mongodbcommunity.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = mongoName + '-user';
          resource.stringData.password = passwd;
          const secretResult = k8sCoreApi.createNamespacedSecret(namespace, resource);
          break;
        case 'MongoDBCommunity':
          resource.metadata.name = mongoName;
          resource.spec.members = replicaCount;
          resource.spec.version = mongoVersion;
          resource.spec.users[0].name = userName;
          resource.spec.users[0].passwordSecretRef.name = mongoName + '-user';
          resource.spec.users[0].scramCredentialsSecretName = mongoName + '-user';
          resource.spec.statefulSet.spec.selector.matchLabels.app = mongoName + '-svc';
          resource.spec.statefulSet.spec.template.metadata.labels.app = mongoName + '-svc';
          resource.spec.statefulSet.spec.template.spec.persistence.single.storage = diskSize;
          resource.spec.statefulSet.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
          resource.spec.statefulSet.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
          resource.spec.statefulSet.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
          resource.spec.statefulSet.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
          const dbResult = await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, plural, resource);
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    console.log(kind + ' ' + resource.metadata.name + ' created...');
    } catch (error) {
      console.error('Error applying resource:', error.body);
    }
  }
  return "success";
}

async function deleteMongoDBResource(mongoName) {
  try {
    const dbResult = await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, mongoName);
    console.log('MongoDB ' + mongoName + ' deleted...');
    const secretResult = await k8sCoreApi.deleteNamespacedSecret(mongoName + '-user', namespace);
    console.log('Secret ' + mongoName + '-user deleted...');
  } catch (error) {
    console.error('Error deleting resource:', error);
    return error
  }

  return { result: 'success' };
}

// Create a MongoDB Community Instance
router.post('/mongodb', async (req, res) => {
  const { mongoName, mongoVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount } = req.body;

  try {
    const mongoResult = await createMongoDBResource(mongoName, mongoVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount);
    res.json({ mongodb: mongoResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a MongoDB Community instance
router.delete('/mongodb', async (req, res) => {
  const { mongoName } = req.body;

  try {
    const delResult = await deleteMongoDBResource(mongoName);
    res.json({ mongodb: delResult});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
