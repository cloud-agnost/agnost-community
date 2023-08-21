const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

async function createRedis(clusterName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, passwd, readReplicaEnabled) {
  if (readReplicaEnabled) {
    var manifest = fs.readFileSync('/manifests/resources/redis-replication.yaml', 'utf8');
  } else {
    var manifest = fs.readFileSync('/manifests/resources/redis-standalone.yaml', 'utf8');
  }
  
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;
      const namespace = process.env.NAMESPACE;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = clusterName + '-redis-password';
          resource.stringData.password = passwd;
          const secretResult = k8sCoreApi.createNamespacedSecret(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case 'Service':
          switch(resource.metadata.name) {
            case 'redis-headless':
              resource.metadata.name = clusterName + '-headless';
              break;
            case 'redis-master':
              resource.metadata.name = clusterName + '-master';
              break;
            case 'redis-replicas':
              resource.metadata.name = clusterName + '-replicas';
              break;
          }
          const serviceResult = await k8sCoreApi.createNamespacedService(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('ServiceAccount'):
          resource.metadata.name = clusterName + '-svc-acc';
          const serviceAccResult = await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('StatefulSet'):
          switch(resource.metadata.name) {
            case 'redis-replicas':
              resource.metadata.name = clusterName + '-replicas';
              resource.spec.template.spec.containers[0].env[1].valueFrom.secretKeyRef.name = clusterName + '-redis-password';
              resource.spec.template.spec.containers[0].env[2].value = clusterName + '-master-0.' + clusterName + '-headless.' + namespace + '.svc.cluster.local';
              break;
            case 'redis-master':
              resource.metadata.name = clusterName + '-master';
              break;
          }
          resource.spec.volumeClaimTemplates[0].spec.resources.requests.storage = diskSize;
          resource.spec.serviceName = clusterName + '-headless';
          resource.spec.template.spec.serviceAccountName = clusterName + '-svc-acc';
          resource.spec.template.spec.containers[0].env[0].valueFrom.secretKeyRef.name = clusterName + '-redis-password';
          resource.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
          resource.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
          resource.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
          resource.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
          resource.spec.template.spec.volumes[0].configMap.name = clusterName + '-redis-scripts';
          // decimal 493 equals to Octal 755
          resource.spec.template.spec.volumes[0].configMap.defaultMode = 493;
          resource.spec.template.spec.volumes[1].configMap.name = clusterName + '-redis-health';
          resource.spec.template.spec.volumes[1].configMap.defaultMode = 493;
          resource.spec.template.spec.volumes[2].configMap.name = clusterName + '-redis-configuration';
          const stsResult = await k8sApi.createNamespacedStatefulSet(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('ConfigMap'):
          switch(resource.metadata.name) {
            case 'redis-configuration':
              resource.metadata.name = clusterName + '-redis-configuration';
              break;
            case 'redis-health':
              resource.metadata.name = clusterName + '-redis-health';
              break;
            case 'redis-scripts':
              resource.metadata.name = clusterName + '-redis-scripts';
              break;
          }
          const configMapResult = await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    } catch (error) {
      console.error('Error applying resource:', error);
    }
  }
  return "success";
}

// Create a Redis Instance
router.post('/redis', async (req, res) => {
  const { clusterName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, passwd, readReplicaEnabled } = req.body;

  try {
    const redisResult = await createRedis(clusterName, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, passwd, readReplicaEnabled);
    res.json({ redis: redisResult.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
