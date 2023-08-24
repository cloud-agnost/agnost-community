const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

async function createMariaDBResource(serverName, dbName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd) {
  const manifest = fs.readFileSync('/manifests/resources/mariadb.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;
      var namespace = process.env.NAMESPACE;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = serverName + '-credentials';
          resource.stringData.password = passwd;
          resource.stringData["root-password"] = rootPasswd;
          const secretResult = k8sCoreApi.createNamespacedSecret(namespace, resource);
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
          const dbResult = await k8sCustomApi.createNamespacedCustomObject('mariadb.mmontes.io', 'v1alpha1', namespace, 'mariadbs', resource);
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

// Create a MMariaDB Instance
router.post('/mariadb', async (req, res) => {
  const { serverName, dbName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd } = req.body;

  try {
    const dbResult = await createMariaDBResource(serverName, dbName, dbVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd);
    res.json({ mariadb: dbResult.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
