const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const group = 'acid.zalan.do';
const version = 'v1';
const namespace = process.env.NAMESPACE;
const plural = 'postgresqls';

async function createPostgresql(serverName, teamName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, numInstances) {
  const manifest = fs.readFileSync('/manifests/resources/postgres.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'postgresql':
          resource.metadata.name = serverName;
          resource.metadata.labels.team = teamName;
          resource.spec.teamId = teamName;
          resource.spec.numberOfInstances = numInstances;
          resource.spec.volume.size = diskSize;
          resource.spec.postgresql.version = dbVersion;
          resource.spec.resources.limits.cpu = cpuLimit;
          resource.spec.resources.limits.memory = memoryLimit;
          resource.spec.resources.requests.cpu = cpuRequest;
          resource.spec.resources.requests.memory = memoryRequest;
          var dbResult = await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, plural, resource);
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    
    console.log(kind + ' ' + resource.metadata.name + ' created...');
    
    } catch (error) {
      console.error('Error applying resource:', error);
    }
  }
  return dbResult;
}

async function updatePostgresql(serverName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit) {
  const patchData = {
    spec: {
      postgresql: {
        version: dbVersion
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
    console.log('PostgreSQL ' + serverName + ' updated...');
  } catch (error){
    console.error('Error updating PostgreSQL ' + serverName + ' resources...');
    return error;
  }

  return dbResult;
}

async function deletePostgresql(serverName) {
  try {
    const dbResult = await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, serverName);
    console.log('PostgreSQL ' + serverName + ' deleted...');
  } catch (error) {
    console.error('Error deleting resource:', error);
    return error
  }

  return { result: 'success' };
}

// Create a PostgreSQL Instance
router.post('/postgres', async (req, res) => {
  const { serverName, teamName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, numInstances } = req.body;

  try {
    const dbResult = await createPostgresql(serverName, teamName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, numInstances);
    res.json({ postgres: dbResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a PostgreSQL Instance
router.put('/postgres', async (req, res) => {
  const { serverName, teamName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, numInstances } = req.body;

  try {
    const dbResult = await updatePostgresql(serverName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit);
    res.json({ statusCode: dbResult.response.statusCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a PostgreSQL instance
router.delete('/postgres', async (req, res) => {
  const { serverName } = req.body;

  try {
    const delResult = await deletePostgresql(serverName);
    res.json({ mariadb: delResult});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
