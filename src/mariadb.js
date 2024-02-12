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

const group = 'mariadb.mmontes.io';
const version = 'v1alpha1';
const namespace = process.env.NAMESPACE;
const plural = 'mariadbs';

async function createMariaDBResource(serverName, dbName, dbVersion, replicaCount, size, userName, passwd, rootPasswd) {
  const manifest = fs.readFileSync('/manifests/mariadb.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = serverName + '-credentials';
          resource.stringData.password = passwd;
          resource.stringData["root-password"] = rootPasswd;
          await k8sCoreApi.createNamespacedSecret(namespace, resource);
          break;
        case 'MariaDB':
          resource.metadata.name = serverName;
          resource.spec.rootPasswordSecretKeyRef.name = serverName + '-credentials';
          resource.spec.passwordSecretKeyRef.name = serverName + '-credentials';
          resource.spec.database = dbName;
          resource.spec.username = userName;
          resource.spec.image.tag = dbVersion;
          resource.spec.volumeClaimTemplate.resources.requests.storage = size;
          resource.spec.replicas = replicaCount;
          if (replicaCount > 1) {
            resource.spec.replication.replica.replPasswordSecretKeyRef.name = serverName + '-credentials';
          } else {
            // if the replica count is 1, then you can't configure replication
            delete resource.spec.replication;
          }
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

async function updateMariaDBResource(serverName, dbVersion, replicaCount, size) {
  const patchData = {
    spec: {
      replicas: replicaCount,
      image: {
        tag: dbVersion
      },
      volumeClaimTemplate: {
        resources: {
          requests: {
            storage: size
          }
        }
      }
    }
  };
  const pvcPatch = {
    spec: {
      resources: {
        requests: {
          storage: size
        }
      }
    }
  };
  const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

  try {
    await k8sCustomApi.patchNamespacedCustomObject(group, version, namespace, plural, serverName, patchData, undefined, undefined, undefined, requestOptions);
    console.log('MariaDB ' + serverName + ' updated...');
    
    const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
    pvcList.body.items.forEach(async (pvc) => {
      var pvcName = pvc.metadata.name;
      if (pvcName.includes("storage-" + serverName + '-')) {
        await k8sCoreApi.patchNamespacedPersistentVolumeClaim(pvcName, namespace, pvcPatch, undefined, undefined, undefined, undefined, undefined, requestOptions);
        console.log('PersistentVolumeClaim ' + pvcName + ' updated...');
      }
    });
  } catch (error){
    console.error('Error updating MariaDB ' + serverName + ' resources...', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  return 'success';
}


async function deleteMariaDBResource(serverName) {
  try {
    const dbResult = await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, serverName);
    console.log('MariaDB ' + serverName + ' deleted...');
    const secretResult = await k8sCoreApi.deleteNamespacedSecret(serverName + '-credentials', namespace);
    console.log('Secret ' + serverName + '-credentials deleted...');

    const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
    pvcList.body.items.forEach(async (pvc) => {
      var pvcName = pvc.metadata.name;
      if (pvcName.includes("storage-" + serverName + '-')) {
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
      return response.body.data;
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


// Create a MariaDB Instance
router.post('/mariadb', async (req, res) => {
  const { serverName, dbName, dbVersion, replicaCount, size, userName, passwd, rootPasswd } = req.body;

  try {
    await createMariaDBResource(serverName, dbName, dbVersion, replicaCount, size, userName, passwd, rootPasswd);
    res.json({ 'connectionString': serverName + '.' + namespace + '.cluster.svc.local',
               'userName': userName, 'password': passwd, 'rootPassword': rootPasswd });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

// Update MariaDB Instance
router.put('/mariadb', async (req, res) => {
  const { serverName, dbVersion, replicaCount, size } = req.body;

  try {
    await updateMariaDBResource(serverName, dbVersion, replicaCount, size);
    var secretName = serverName + '-credentials';
    credentials = await waitForSecret(secretName);
    res.json({ 'connectionString': serverName + '.' + namespace + '.cluster.svc.local',
               'password': Buffer.from(credentials.password, 'base64').toString('utf-8'),
               'rootPassword': Buffer.from(credentials['root-password'], 'base64').toString('utf-8')  });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

// Delete a MariaDB instance
router.delete('/mariadb', async (req, res) => {
  const { serverName } = req.body;

  try {
    const delResult = await deleteMariaDBResource(serverName);
    res.json({ mariadb: 'deleted'});
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

router.post('/mariadb/restart', async (req, res) => {
  const { serverName } = req.body;

  try {
    await rolloutRestart(serverName);
    res.json({ mariadb: 'restarted'});
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
