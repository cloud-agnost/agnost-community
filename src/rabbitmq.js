const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const group = 'rabbitmq.com';
const version = 'v1beta1';
const namespace = process.env.NAMESPACE;

async function createRabbitmqCluster(clusterName, rmqVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount) {
  const manifest = fs.readFileSync('/manifests/rabbitmq-cluster.yaml', 'utf8');
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
          break;
        case 'User':
          resource.metadata.name = clusterName + '-' + userName;
          resource.spec.rabbitmqClusterReference.name = clusterName;
          resource.spec.importCredentialsSecret.name = clusterName + '-' + userName + '-credentials';
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
          resource.spec.persistence.storage = diskSize;
          resource.spec.resources.limits.cpu = cpuLimit;
          resource.spec.resources.limits.memory = memoryLimit;
          resource.spec.resources.requests.cpu = cpuRequest;
          resource.spec.resources.requests.memory = memoryRequest;
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
  return "success";
}

async function updateRabbitmqCluster(clusterName, rmqVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit) {
  const patchData = {
    spec: {
      image: 'docker.io/bitnami/rabbitmq:' + rmqVersion,
      override: {
        statefulSet: {
          spec: {
            template: {
              spec: {
                initContainers: [
                  {
                    name: "copy-community-plugins",
                    env: [
                      {
                        name: "RMQ_VERSION",
                        value: rmqVersion
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
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
    await k8sCustomApi.patchNamespacedCustomObject(group, version, namespace, 'rabbitmqclusters', clusterName, patchData, undefined, undefined, undefined, requestOptions);
    console.log('RabbitMQ ' + clusterName + ' updated...');
  } catch (error){
    console.error('Error updating RabbitMQ ' + clusterName + ' resources...', error);
    return error;
  }

  return { result: 'success' };
}

async function deleteRabbitmqCluster(clusterName, userName) {
  try {
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, 'permissions', clusterName + '-' + userName + '-permission');
    console.log('Permission ' + clusterName + '-' + userName + '-permission deleted...');
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, 'users', clusterName + '-' + userName);
    console.log('User ' + clusterName + '-' + userName + ' deleted...');
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, 'rabbitmqclusters', clusterName);
    console.log('Cluster ' + clusterName + 'deleted...');
    await k8sCoreApi.deleteNamespacedSecret(clusterName + '-' + userName + '-credentials', namespace);
    console.log('Secret ' + clusterName + '-' + userName + '-credentials deleted...');
  } catch (error) {
    console.error('Error deleting resource:', error);
    return error
  }

  return { result: 'success' };
}

// Create a RabbitMQ Cluster
router.post('/rabbitmq', async (req, res) => {
  const { clusterName, rmqVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount } = req.body;

  try {
    const clusterResult = await createRabbitmqCluster(clusterName, rmqVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount);
    res.json({
      rabbitmq: clusterResult.body
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update RabbitMQ Cluster
router.put('/rabbitmq', async (req, res) => {
  const { clusterName, rmqVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, replicaCount } = req.body;

  try {
    await updateRabbitmqCluster(clusterName, rmqVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit);
    res.json({ 'url': clusterName + '.' + namespace + '.cluster.svc.local' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a RabbitMQ Cluster
router.delete('/rabbitmq', async (req, res) => {
  const { clusterName, userName } = req.body;

  try {
    const delResult = await deleteRabbitmqCluster(clusterName, userName);
    res.json({ rabbitmq: delResult});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

