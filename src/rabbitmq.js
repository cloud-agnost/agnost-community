const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

async function createRabbitmqCluster(clusterName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount) {
  const manifest = fs.readFileSync('/manifests/resources/rabbitmq-cluster.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;
      var namespace = process.env.NAMESPACE;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = clusterName + '-' + userName + '-credentials';
          resource.stringData.username = userName;
          resource.stringData.password = passwd;
          resource.stringData.host = clusterName + '.' + namespace + '.svc'
          const secretResult = k8sCoreApi.createNamespacedSecret(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case 'User':
          resource.metadata.name = clusterName + '-' + userName;
          resource.spec.rabbitmqClusterReference.name = clusterName;
          resource.spec.importCredentialsSecret.name = clusterName + '-' + userName + '-credentials';
          const userResult = await k8sCustomApi.createNamespacedCustomObject('rabbitmq.com', 'v1beta1', namespace, 'users', resource); 
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case 'Permission':
          resource.metadata.name = clusterName + '-' + userName + '-permission';
          resource.spec.userReference.name =  clusterName + '-' + userName;
          resource.spec.rabbitmqClusterReference.name = clusterName;
          const permissionResult = await k8sCustomApi.createNamespacedCustomObject('rabbitmq.com', 'v1beta1', namespace, 'permissions', resource); 
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case 'RabbitmqCluster':
          resource.metadata.name = clusterName;
          resource.spec.replicas = replicaCount;
          resource.spec.persistence.storage = diskSize;
          resource.spec.resources.limits.cpu = cpuLimit;
          resource.spec.resources.limits.memory = memoryLimit;
          resource.spec.resources.requests.cpu = cpuRequest;
          resource.spec.resources.requests.memory = memoryRequest;
          const clusterResult = await k8sCustomApi.createNamespacedCustomObject('rabbitmq.com', 'v1beta1', 'default', 'rabbitmqclusters', resource);          
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    } catch (error) {
      console.error('Error applying resource:', error.body);
    }
  }
  return "success";
}


// Create a RabbitMQ Cluster
router.post('/rabbitmq', async (req, res) => {
  const { clusterName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount } = req.body;

  try {
    const clusterResult = await createRabbitmqCluster(clusterName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount);
    res.json({
      rabbitmq: clusterResult.body
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

