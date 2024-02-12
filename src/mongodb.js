const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);

const group = 'mongodbcommunity.mongodb.com';
const version = 'v1';
const namespace = process.env.NAMESPACE;
const plural = 'mongodbcommunity';

async function calculateLogStorageSize(storageSize) {
  // Parse the storage size and unit
  const [, size, unit] = storageSize.match(/(\d+)([A-Za-z]+)/);

  // Convert the size to bytes
  let bytes = parseInt(size);
  switch (unit.toLowerCase()) {
    case 'ki':
      bytes *= 1024;
      break;
    case 'mi':
      bytes *= Math.pow(1024, 2);
      break;
    case 'gi':
      bytes *= Math.pow(1024, 3);
      break;
    // Default to bytes if the unit is not recognized
    default:
      break;
  }

  const twentyPercent = 0.2 * bytes;

  // Format the result back to the original unit
  if (bytes >= Math.pow(1024, 3)) {
    return `${(twentyPercent / Math.pow(1024, 3)).toFixed()}Gi`;
  } else if (bytes >= Math.pow(1024, 2)) {
    return `${(twentyPercent / Math.pow(1024, 2)).toFixed()}Mi`;
  } else if (bytes >= 1024) {
    return `${(twentyPercent / 1024).toFixed()}Ki`;
  } else {
    return `${twentyPercent}`;
  }
}

async function createMongoDBResource(mongoName, mongoVersion, size, userName, passwd, replicaCount) {
  const manifest = fs.readFileSync('/manifests/mongodbcommunity.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = mongoName + '-user';
          resource.stringData.password = passwd;
          k8sCoreApi.createNamespacedSecret(namespace, resource);
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
          resource.spec.statefulSet.spec.volumeClaimTemplates[0].spec.resources.requests.storage = size;
          const logStorageSize = await calculateLogStorageSize(size);
          resource.spec.statefulSet.spec.volumeClaimTemplates[1].spec.resources.requests.storage = logStorageSize;
          await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, plural, resource);
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    console.log(kind + ' ' + resource.metadata.name + ' created...');
    } catch (error) {
      console.error('Error applying resource:', error.body);
      throw new Error(JSON.stringify(error.body));
    }
  }
  return 'success';
}

async function updateMongoDBResource(mongoName, mongoVersion, size, replicaCount) {
  const patchData = {
    spec: {
      version: mongoVersion,
      members: replicaCount,
    }
  };

  const dataPvcPatch = { spec: { resources: { requests: { storage: size } } } };
  const logStorageSize = await calculateLogStorageSize(size);
  const logPvcPatch = { spec: { resources: { requests: { storage: logStorageSize } } } };
  const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

  try {
    await k8sCustomApi.patchNamespacedCustomObject(group, version, namespace, plural, mongoName, patchData, undefined, undefined, undefined, requestOptions);
    console.log('MongoDB ' + mongoName + ' updated...');

    const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
    pvcList.body.items.forEach(async (pvc) => {
      var pvcName = pvc.metadata.name;
      if (pvcName.includes("data-volume-" + mongoName + '-')) {
        await k8sCoreApi.patchNamespacedPersistentVolumeClaim(pvcName, namespace, dataPvcPatch, undefined, undefined, undefined, undefined, undefined, requestOptions);
        console.log('PersistentVolumeClaim ' + pvcName + ' updated...');
      } else if (pvcName.includes("logs-volume-" + mongoName + '-')) {
        await k8sCoreApi.patchNamespacedPersistentVolumeClaim(pvcName, namespace, logPvcPatch, undefined, undefined, undefined, undefined, undefined, requestOptions);
        console.log('PersistentVolumeClaim ' + pvcName + ' updated...');
      }
    });
  } catch (error){
    console.error('Error updating MongoDB ' + mongoName + ' resources...', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  return 'success';
}

async function deleteMongoDBResource(mongoName) {
  try {
    const dbResult = await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, mongoName);
    console.log('MongoDB ' + mongoName + ' deleted...');
    const secretResult = await k8sCoreApi.deleteNamespacedSecret(mongoName + '-user', namespace);
    console.log('Secret ' + mongoName + '-user deleted...');

    const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
    pvcList.body.items.forEach(async (pvc) => {
      var pvcName = pvc.metadata.name;
      if (pvcName.includes("logs-volume-" + mongoName + '-') || pvcName.includes("data-volume-" + mongoName + '-')) {
        await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace);
        console.log('PersistentVolumeClaim ' + pvcName + ' deleted...');
      }
    });
  } catch (error) {
    console.error('Error deleting resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  return 'success';
}

async function rolloutRestart(resourceName) {
  try {
    const sts = await k8sAppsApi.readNamespacedStatefulSet(resourceName, namespace);

    // Increment the revision in the deployment template to trigger a rollout
    sts.body.spec.template.metadata.annotations = {
      ...sts.body.spec.template.metadata.annotations,
      'kubectl.kubernetes.io/restartedAt': new Date().toISOString(),
    };

    await k8sAppsApi.replaceNamespacedStatefulSet(resourceName, namespace, sts.body);
    console.log(`Rollout restart ${resourceName} initiated successfully.`);
  } catch (error) {
    console.error('Error restarting resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }
}

// some helper functions
async function waitForSecret(secretName) {
  const pollingInterval = 2000;
  while (true) {
    try {
      const response = await k8sCoreApi.readNamespacedSecret(secretName, namespace);
      return response.body.data.password;
    } catch (error) {
      await sleep(pollingInterval);
    }
  }
}

// Function to simulate sleep
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Create a MongoDB Community Instance
router.post('/mongodb', async (req, res) => {
  const { mongoName, mongoVersion, size, userName, passwd, replicaCount } = req.body;

  try {
    await createMongoDBResource(mongoName, mongoVersion, size, userName, passwd, replicaCount);
    res.json({ 'connectionString': mongoName + '-svc.' + namespace + '.cluster.svc.local',
               'username': userName, 'password': passwd });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

// Update MongoDB Instance
router.put('/mongodb', async (req, res) => {
  const { mongoName, mongoVersion, size, replicaCount } = req.body;

  try {
    await updateMongoDBResource(mongoName, mongoVersion, size, replicaCount);
    var secretName = mongoName + '-user';
    passWord = await waitForSecret(secretName);
    res.json({ 'connectionString': mongoName + '-svc.' + namespace + '.cluster.svc.local',
               'password': Buffer.from(passWord, 'base64').toString('utf-8') });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

// Delete a MongoDB Community instance
router.delete('/mongodb', async (req, res) => {
  const { mongoName } = req.body;

  try {
    await deleteMongoDBResource(mongoName);
    res.json({ mongodb: 'deleted'});
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

router.post('/mongodb/restart', async (req, res) => {
  const { mongoName } = req.body;

  try {
    await rolloutRestart(mongoName);
    res.json({ mongodb: 'restarted'});
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
