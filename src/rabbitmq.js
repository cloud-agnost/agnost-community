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

const group = 'rabbitmq.com';
const version = 'v1beta1';
const namespace = process.env.NAMESPACE;

async function createRabbitmqCluster(clusterName, rmqVersion, size, userName, passwd, replicaCount) {
  const manifest = fs.readFileSync('/manifests/rabbitmq-cluster.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;
      var namespace = process.env.NAMESPACE;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = clusterName + '-credentials';
          resource.stringData.username = userName;
          resource.stringData.password = passwd;
          resource.stringData.host = clusterName + '.' + namespace + '.svc'
          const secretResult = k8sCoreApi.createNamespacedSecret(namespace, resource);
          break;
        case 'User':
          resource.metadata.name = clusterName + '-' + userName;
          resource.spec.rabbitmqClusterReference.name = clusterName;
          resource.spec.importCredentialsSecret.name = clusterName + '-credentials';
          const userResult = await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, 'users', resource);
          break;
        case 'Permission':
          resource.metadata.name = clusterName + '-' + userName + '-permission';
          resource.spec.userReference.name =  clusterName + '-' + userName;
          resource.spec.rabbitmqClusterReference.name = clusterName;
          const permissionResult = await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, 'permissions', resource);
          break;
        case 'RabbitmqCluster':
          resource.metadata.name = clusterName;
          resource.spec.image = 'docker.io/bitnami/rabbitmq:' + rmqVersion;
          resource.spec.replicas = replicaCount;
          resource.spec.persistence.storage = size;
          resource.spec.override.statefulSet.spec.template.spec.initContainers[0].env[0].value = rmqVersion;
          const clusterResult = await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, 'rabbitmqclusters', resource);
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    console.log(kind + ' ' + resource.metadata.name + ' created...');
    } catch (error) {
      console.error('Error applying resource:', error.body);
    }
  }
  return 'success';
}

async function updateRabbitmqCluster(clusterName, rmqVersion, size, replicaCount) {
  try {
    const rmq = await k8sCustomApi.getNamespacedCustomObject(group, version, namespace, 'rabbitmqclusters', clusterName);
    rmq.body.spec.image = 'docker.io/bitnami/rabbitmq:' + rmqVersion;
    rmq.body.spec.replicas = replicaCount;
    rmq.body.spec.persistence.storage = size;
    rmq.body.spec.override.statefulSet.spec.template.spec.initContainers[0].env[0].value = rmqVersion;

    await k8sCustomApi.replaceNamespacedCustomObject(group, version, namespace, 'rabbitmqclusters', clusterName, rmq.body);
    console.log('RabbitMQ ' + clusterName + ' updated...');
  } catch (error){
    console.error('Error updating RabbitMQ ' + clusterName + ' resources...', error);
    return error;
  }

  return 'success';
}

async function deleteRabbitmqCluster(clusterName, userName) {
  try {
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, 'permissions', clusterName + '-' + userName + '-permission');
    console.log('Permission ' + clusterName + '-' + userName + '-permission deleted...');
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, 'users', clusterName + '-' + userName);
    console.log('User ' + clusterName + '-' + userName + ' deleted...');
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, 'rabbitmqclusters', clusterName);
    console.log('Cluster ' + clusterName + ' deleted...');
    await k8sCoreApi.deleteNamespacedSecret(clusterName + '-credentials', namespace);
    console.log('Secret ' + clusterName + '-credentials deleted...');
  } catch (error) {
    console.error('Error deleting resource:', error.body);
    return error
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

// Create a RabbitMQ Cluster
router.post('/rabbitmq', async (req, res) => {
  const { clusterName, rmqVersion, size, userName, passwd, replicaCount } = req.body;

  try {
    await createRabbitmqCluster(clusterName, rmqVersion, size, userName, passwd, replicaCount);
    res.json({ 'connectionString': clusterName + '.' + namespace + '.cluster.svc.local',
               'username': userName, 'password': passwd });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Update RabbitMQ Cluster
router.put('/rabbitmq', async (req, res) => {
  const { clusterName, rmqVersion, size, replicaCount } = req.body;

  try {
    await updateRabbitmqCluster(clusterName, rmqVersion, size, replicaCount);
    var secretName = clusterName + '-credentials';
    credentials = await waitForSecret(secretName);
    res.json({ 'connectionString': clusterName + '.' + namespace + '.cluster.svc.local',
               'username': Buffer.from(credentials.username, 'base64').toString('utf-8') ,
               'password': Buffer.from(credentials.password, 'base64').toString('utf-8') });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Delete a RabbitMQ Cluster
router.delete('/rabbitmq', async (req, res) => {
  const { clusterName, userName } = req.body;

  try {
    await deleteRabbitmqCluster(clusterName, userName);
    res.json({ rabbitmq: 'deleted'});
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Restart a RabbitMQ Cluster
router.post('/rabbitmq/restart', async (req, res) => {
  const { clusterName } = req.body;

  try {
    await rolloutRestart(clusterName + '-server');
    res.json({ rabbitmq: 'restarted'});
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;

