const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const group = 'mysql.oracle.com';
const version = 'v2';
const namespace = process.env.NAMESPACE;
const plural = 'innodbclusters';

async function createMySQLResource(clusterName, dbVersion, replicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd) {
  const manifest = fs.readFileSync('/manifests/mysql.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case('ServiceAccount'):
          resource.metadata.name = clusterName + '-sa';
          const serviceAccResult = await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          break;
        case 'Secret':
          resource.metadata.name = clusterName + '-cluster-secret';
          resource.stringData.rootUser = userName;
          resource.stringData.rootPassword = passwd;
          var secretResult = await k8sCoreApi.createNamespacedSecret(namespace, resource);
          break;
        case 'InnoDBCluster':
          resource.metadata.name = clusterName;
          resource.spec.instances = replicaCount;
          resource.spec.version = dbVersion;
          resource.spec.router.version = dbVersion;
          resource.spec.secretName = clusterName + '-cluster-secret';
          resource.spec.datadirVolumeClaimTemplate.resources.requests.storage = diskSize;
          resource.spec.podSpec.containers[0].resources.limits.cpu = cpuLimit;
          resource.spec.podSpec.containers[0].resources.limits.memory = memoryLimit;
          resource.spec.podSpec.containers[0].resources.requests.cpu = cpuRequest;
          resource.spec.podSpec.containers[0].resources.requests.memory = memoryRequest;
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

async function updateMySQLResource(clusterName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit) {
  const patchData = {
    spec: {
      version: dbVersion,
      router: {
        version: dbVersion
      },
      podSpec: {
        containers: [
          {
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
        ]
      }
    }
  };
  const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

  try {
    var dbResult = await k8sCustomApi.patchNamespacedCustomObject(group, version, namespace, plural, clusterName, patchData, undefined, undefined, undefined, requestOptions);
    console.log('MySQL ' + clusterName + ' updated...');
  } catch (error){
    console.error('Error updating MySQL ' + clusterName + ' resources...');
    return error;
  }

  return { result: 'success' };
}


async function deleteMySQLResource(clusterName, purgeData) {
  try {
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, clusterName);
    console.log('MySQL ' + clusterName + ' deleted...');
    await k8sCoreApi.deleteNamespacedSecret(clusterName + '-cluster-secret', namespace);
    console.log('Secret ' + clusterName + '-cluster-secret deleted...');
    await k8sCoreApi.deleteNamespacedServiceAccount(clusterName + '-sa', namespace);
    console.log('ServiceAccount ' + clusterName + '-sa deleted...');
    if (purgeData) {
      const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
      pvcList.body.items.forEach(async (pvc) => {
        var pvcName = pvc.metadata.name;
        if (pvcName.includes("datadir-" + clusterName)) {
          await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace);
          console.log('PersistentVolumeClaim ' + pvcName + ' deleted...');
        }
      });
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    return error
  }

  return { result: 'success' };
}

// Create a MySQL Instance
router.post('/mysql', async (req, res) => {
  const { clusterName, dbVersion, replicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd } = req.body;

  try {
    await createMySQLResource(clusterName, dbVersion, replicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd);
    res.json({ 'url': clusterName + '.' + namespace + '.cluster.svc.local',
               'username': userName,
               'password': passwd, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update MySQL Instance
router.put('/mysql', async (req, res) => {
  const { clusterName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd } = req.body;

  try {
    await updateMySQLResource(clusterName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit);
    res.json({ 'url': clusterName + '.' + namespace + '.cluster.svc.local' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a MySQL instance
router.delete('/mysql', async (req, res) => {
  const { clusterName, purgeData } = req.body;

  try {
    const delResult = await deleteMySQLResource(clusterName, purgeData);
    res.json({ mysql: delResult});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
