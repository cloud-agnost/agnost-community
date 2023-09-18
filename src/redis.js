const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

const namespace = process.env.NAMESPACE;

async function createRedis(clusterName, version, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, passwd, readReplicaEnabled) {
  if (readReplicaEnabled) {
    var manifest = fs.readFileSync('/manifests/redis-replication.yaml', 'utf8');
  } else {
    var manifest = fs.readFileSync('/manifests/redis-standalone.yaml', 'utf8');
  }
  
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = clusterName + '-redis-password';
          resource.stringData.password = passwd;
          const secretResult = k8sCoreApi.createNamespacedSecret(namespace, resource);
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
          resource.metadata.labels["app.kubernetes.io/instance"] = clusterName;
          resource.spec.selector["app.kubernetes.io/instance"] = clusterName;
          const serviceResult = await k8sCoreApi.createNamespacedService(namespace, resource);
          break;
        case('ServiceAccount'):
          resource.metadata.name = clusterName + '-svc-acc';
          resource.metadata.labels["app.kubernetes.io/instance"] = clusterName;
          const serviceAccResult = await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          break;
        case('StatefulSet'):
          switch(resource.metadata.name) {
            case 'redis-replicas':
              resource.metadata.name = clusterName + '-replicas';
              resource.spec.template.spec.containers[0].image = 'docker.io/bitnami/redis:' + version;
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
          resource.spec.template.spec.containers[0].image = 'docker.io/bitnami/redis:' + version;
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
          // label updates
          resource.metadata.labels["app.kubernetes.io/instance"] = clusterName;
          resource.spec.selector.matchLabels["app.kubernetes.io/instance"] = clusterName;
          resource.spec.template.metadata.labels["app.kubernetes.io/instance"] = clusterName;
          resource.spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchLabels["app.kubernetes.io/instance"] = clusterName;
          resource.spec.volumeClaimTemplates[0].metadata.labels["app.kubernetes.io/instance"] = clusterName;
          const stsResult = await k8sApi.createNamespacedStatefulSet(namespace, resource);
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
          resource.metadata.labels["app.kubernetes.io/instance"] = clusterName;
          const configMapResult = await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
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


async function updateRedis(clusterName, version, memoryRequest, memoryLimit, cpuRequest, cpuLimit, readReplicaEnabled) {
  const sts = await k8sApi.readNamespacedStatefulSet(clusterName + '-master', namespace);
  sts.body.spec.template.spec.containers[0].image = 'docker.io/bitnami/redis:' + version;
  sts.body.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  sts.body.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
  sts.body.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  sts.body.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;

  try {
    await k8sApi.replaceNamespacedStatefulSet(clusterName + '-master', namespace, sts.body);
    console.log('StatefulSet ' + clusterName + '-master updated...');
    if (readReplicaEnabled) {
      const replica = await k8sApi.readNamespacedStatefulSet(clusterName + '-replicas', namespace);
      replica.body.spec.template.spec.containers[0].image = 'docker.io/bitnami/redis:' + version;
      replica.body.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
      replica.body.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
      replica.body.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
      replica.body.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
      await k8sApi.replaceNamespacedStatefulSet(clusterName + '-replicas', namespace, replica.body);
      console.log('StatefulSet ' + clusterName + '-replicas updated...');
    }
  } catch (error){
    console.error('Error updating StatefulSet ' + clusterName + ' resources...', error);
  }

  return { result: 'success' };
}


async function deleteRedis(clusterName, purgeData) {
  try {
    await k8sApi.deleteNamespacedStatefulSet(clusterName + '-master', namespace );
    console.log('StatefulSet ' + clusterName + '-master deleted...');
    await k8sCoreApi.deleteNamespacedService(clusterName + '-master', namespace);
    console.log('Service ' + clusterName + '-master deleted...');
    await k8sCoreApi.deleteNamespacedService(clusterName + '-headless', namespace);
    console.log('Service ' + clusterName + '-headless deleted...');
    await k8sCoreApi.deleteNamespacedConfigMap(clusterName + '-redis-scripts', namespace);
    console.log('ConfigMap ' + clusterName + '-redis-scripts deleted...');
    await k8sCoreApi.deleteNamespacedConfigMap(clusterName + '-redis-health', namespace);
    console.log('ConfigMap ' + clusterName + '-redis-health deleted...');
    await k8sCoreApi.deleteNamespacedConfigMap(clusterName + '-redis-configuration', namespace);
    console.log('ConfigMap ' + clusterName + '-redis-configuration deleted...');
    await k8sCoreApi.deleteNamespacedServiceAccount(clusterName + '-svc-acc', namespace);
    console.log('ServiceAccount ' + clusterName + '-svc-acc deleted...');
    await k8sCoreApi.deleteNamespacedSecret(clusterName + '-redis-password', namespace);
    console.log('Secret ' + clusterName + '-credentials deleted...');
    if (purgeData) {
      var pvcName = 'redis-data-' + clusterName + '-master-0';
      await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace);
      console.log('PersistentVolumeClaim ' + pvcName + ' deleted...');
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    return error
  }

  // check if it has read replicas
  try {
    await k8sApi.deleteNamespacedStatefulSet(clusterName + '-replicas', namespace );
    console.log('StatefulSet ' + clusterName + '-replicas deleted...');
    await k8sCoreApi.deleteNamespacedService(clusterName + '-replicas', namespace);
    console.log('Service ' + clusterName + '-replicas deleted...');
    if (purgeData) {
      var pvcName = 'redis-data-' + clusterName + '-replicas-0';
      await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace);
      console.log('PersistentVolumeClaim ' + pvcName + ' deleted...');
    }
  } catch {
    console.log('This has no read replicas...')
  }

  return { result: 'success' };
}


// Create a Redis Instance
router.post('/redis', async (req, res) => {
  const { clusterName, version, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, passwd, readReplicaEnabled } = req.body;

  try {
    const redisResult = await createRedis(clusterName, version, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, passwd, readReplicaEnabled);
    res.json({ redis: redisResult.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Update Redis Instance
router.put('/redis', async (req, res) => {
  const { clusterName, version, memoryRequest, memoryLimit, cpuRequest, cpuLimit, diskSize, userName, passwd, rootPasswd, readReplicaEnabled } = req.body;

  try {
    await updateRedis(clusterName, version, memoryRequest, memoryLimit, cpuRequest, cpuLimit, readReplicaEnabled);
    res.json({ 'url': clusterName + '-master.' + namespace + '.cluster.svc.local' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Delete a Redis instance
router.delete('/redis', async (req, res) => {
  const { clusterName, purgeData } = req.body;

  try {
    const delResult = await deleteRedis(clusterName, purgeData);
    res.json({ redis: delResult});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
