const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

async function createPostgresql(serverName, teamName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, numInstances) {
  const manifest = fs.readFileSync('/manifests/resources/postgres.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;
      var namespace = process.env.NAMESPACE;

      switch(kind) {
        case 'postgresql':
          resource.metadata.name = serverName;
          resource.metadata.labels.team = teamName;
          resource.spec.teamId = teamName;
          resource.spec.numberOfInstances = numInstances;
          resource.spec.volume.size = diskSize;
          resource.spec.resources.limits.cpu = cpuLimit;
          resource.spec.resources.limits.memory = memoryLimit;
          resource.spec.resources.requests.cpu = cpuRequest;
          resource.spec.resources.requests.memory = memoryRequest;
          const dbResult = await k8sCustomApi.createNamespacedCustomObject('acid.zalan.do', 'v1', namespace, 'postgresqls', resource);
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    
    console.log(kind + ' ' + resource.metadata.name + ' created...');
    
    } catch (error) {
      console.error('Error applying resource:', error);
    }
  }
  return "success";
}

// Create a PostgreSQL Instance
router.post('/postgres', async (req, res) => {
  const { serverName, teamName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, numInstances } = req.body;

  try {
    const dbResult = await createPostgresql(serverName, teamName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, numInstances);
    res.json({ postgres: dbResult.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
