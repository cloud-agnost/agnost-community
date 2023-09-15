const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const group = 'mariadb.mmontes.io';
const version = 'v1alpha1';
const namespace = process.env.NAMESPACE;
const plural = 'mariadbs';

async function createMariaDBResource(serverName, dbName, dbVersion, replicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd) {
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
          var secretResult = await k8sCoreApi.createNamespacedSecret(namespace, resource);
          break;
        case 'MariaDB':
          resource.metadata.name = serverName;
          resource.spec.rootPasswordSecretKeyRef.name = serverName + '-credentials';
          resource.spec.passwordSecretKeyRef.name = serverName + '-credentials';
          resource.spec.database = dbName;
          resource.spec.username = userName;
          resource.spec.image.tag = dbVersion;
          resource.spec.volumeClaimTemplate.resources.requests.storage = diskSize;
          resource.spec.resources.limits.cpu = cpuLimit;
          resource.spec.resources.limits.memory = memoryLimit;
          resource.spec.resources.requests.cpu = cpuRequest;
          resource.spec.resources.requests.memory = memoryRequest;
          resource.spec.replicas = replicaCount;
          if (replicaCount > 1) {
            resource.spec.replication.replica.replPasswordSecretKeyRef.name = serverName + '-credentials';
          } else {
            // if the replica count is 1, then you can't configure replication
            delete resource.spec.replication;
          }
          var dbResult = await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, plural, resource);
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    console.log(kind + ' ' + resource.metadata.name + ' created...');
    } catch (error) {
      console.error('Error applying resource:', error);
      return error
    }
  }
  return { ...dbResult, ...secretResult };
}

async function updateMariaDBResource(serverName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit) {
  const patchData = {
    spec: {
      image: {
        tag: dbVersion
      },
      resources: {
        limits: {
          cpu: cpuLimit,
          memory: memoryLimit
        },
        requests: {
          cpu: cpuRequest,
          memory: memoryRequest
        }
      }
    }
  };
  const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

  try {
    var dbResult = await k8sCustomApi.patchNamespacedCustomObject(group, version, namespace, plural, serverName, patchData, undefined, undefined, undefined, requestOptions);
    console.log('MariaDB ' + serverName + ' updated...');
  } catch (error){
    console.error('Error updating MariaDB ' + serverName + ' resources...');
    return error;
  }

  return { result: 'success' };
}


async function deleteMariaDBResource(serverName) {
  try {
    const dbResult = await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, serverName);
    console.log('MariaDB ' + serverName + ' deleted...');
    const secretResult = await k8sCoreApi.deleteNamespacedSecret(serverName + '-credentials', namespace);
    console.log('Secret ' + serverName + '-credentials deleted...');
  } catch (error) {
    console.error('Error deleting resource:', error);
    return error
  }

  return { result: 'success' };
}

// Create a MariaDB Instance
router.post('/mariadb', async (req, res) => {
  const { serverName, dbName, dbVersion, replicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd } = req.body;

  try {
    await createMariaDBResource(serverName, dbName, dbVersion, replicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd);
    res.json({ 'url': serverName + '.' + namespace + '.cluster.svc.local',
               'username': userName,
               'password': passwd, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update MariaDB Instance
router.put('/mariadb', async (req, res) => {
  const { serverName, dbName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd } = req.body;

  try {
    await updateMariaDBResource(serverName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit);
    res.json({ 'url': serverName + '.' + namespace + '.cluster.svc.local' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a MariaDB instance
router.delete('/mariadb', async (req, res) => {
  const { serverName } = req.body;

  try {
    const delResult = await deleteMariaDBResource(serverName);
    res.json({ mariadb: delResult});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
