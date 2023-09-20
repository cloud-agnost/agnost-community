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

async function createRedis(clusterName, version, size, passwd, readReplicaEnabled) {
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
          resource.spec.volumeClaimTemplates[0].spec.resources.requests.storage = size;
          resource.spec.serviceName = clusterName + '-headless';
          resource.spec.template.spec.serviceAccountName = clusterName + '-svc-acc';
          resource.spec.template.spec.containers[0].image = 'docker.io/bitnami/redis:' + version;
          resource.spec.template.spec.containers[0].env[0].valueFrom.secretKeyRef.name = clusterName + '-redis-password';
          resource.spec.template.spec.containers[0].resources.limits.memory = size;
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
      console.error('Error applying resource:', error.body);
      throw new Error(JSON.stringify(error.body));
    }
  }
  return "success";
}


async function updateRedis(clusterName, version, size, readReplicaEnabled) {
  const sts = await k8sApi.readNamespacedStatefulSet(clusterName + '-master', namespace);
  sts.body.spec.template.spec.containers[0].image = 'docker.io/bitnami/redis:' + version;
  sts.body.spec.template.spec.containers[0].resources.limits.memory = size;

  var pvcName = 'redis-data-' + clusterName + '-master-0';
  const pvcPatch = {
    spec: {
      resources: {
        requests: {
          storage: size
        }
      }
    }
  };
  const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

  try {
    await k8sApi.replaceNamespacedStatefulSet(clusterName + '-master', namespace, sts.body);
    console.log('StatefulSet ' + clusterName + '-master updated...');

    await k8sCoreApi.patchNamespacedPersistentVolumeClaim(pvcName, namespace, pvcPatch, undefined, undefined, undefined, undefined, undefined, requestOptions);
    console.log('PVC ' + pvcName + ' updated...');

    if (readReplicaEnabled) {
      const replica = await k8sApi.readNamespacedStatefulSet(clusterName + '-replicas', namespace);
      replica.body.spec.template.spec.containers[0].image = 'docker.io/bitnami/redis:' + version;
      replica.body.spec.template.spec.containers[0].resources.limits.memory = size;

      await k8sApi.replaceNamespacedStatefulSet(clusterName + '-replicas', namespace, replica.body);
      console.log('StatefulSet ' + clusterName + '-replicas updated...');

      var pvcNameReplica = 'redis-data-' + clusterName + '-replicas-0';

      await k8sCoreApi.patchNamespacedPersistentVolumeClaim(pvcNameReplica, namespace, pvcPatch, undefined, undefined, undefined, undefined, undefined, requestOptions);
      console.log('PVC ' + pvcNameReplica + ' updated...');
    }
  } catch (error){
    console.error('Error updating StatefulSet ' + clusterName + ' resources...', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  return 'success';
}


async function deleteRedis(clusterName) {
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

    var pvcName = 'redis-data-' + clusterName + '-master-0';
    await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace);
    console.log('PersistentVolumeClaim ' + pvcName + ' deleted...');
  } catch (error) {
    console.error('Error deleting resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  // check if it has read replicas
  try {
    await k8sApi.deleteNamespacedStatefulSet(clusterName + '-replicas', namespace );
    console.log('StatefulSet ' + clusterName + '-replicas deleted...');
    await k8sCoreApi.deleteNamespacedService(clusterName + '-replicas', namespace);
    console.log('Service ' + clusterName + '-replicas deleted...');

    var pvcName = 'redis-data-' + clusterName + '-replicas-0';
    await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace);
    console.log('PersistentVolumeClaim ' + pvcName + ' deleted...');
  } catch {
    console.log('This has no read replicas...');
  }

  return 'success!';
}

// some helper functions
async function waitForSecret(secretName) {
  const pollingInterval = 2000;
  while (true) {
    try {
      const response = await k8sCoreApi.readNamespacedSecret(secretName, namespace);
      return response.body.data.password;
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

// Create a Redis Instance
router.post('/redis', async (req, res) => {
  const { clusterName, version, size, passwd, readReplicaEnabled } = req.body;

  try {
    await createRedis(clusterName, version, size, passwd, readReplicaEnabled);
    response = readReplicaEnabled ? { 'connectionStringMaster': clusterName + '-master.' + namespace + '.svc.cluster.local',
                                      'connectionStringReplicas': clusterName + '-replicas.' + namespace + '.svc.cluster.local',
                                      'password': passwd }
                                  : { 'connectionStringMaster': clusterName + '-master.' + namespace + '.svc.cluster.local',
                                      'password': passwd };
    res.json(response);
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});


// Update Redis Instance
router.put('/redis', async (req, res) => {
  const { clusterName, version, size, readReplicaEnabled } = req.body;

  try {
    await updateRedis(clusterName, version, size, readReplicaEnabled);
    var secretName = clusterName + '-redis-password';
    passWord = await waitForSecret(secretName);
    response = readReplicaEnabled ? { 'connectionStringMaster': clusterName + '-master.' + namespace + '.svc.cluster.local',
                                      'connectionStringReplicas': clusterName + '-replicas.' + namespace + '.svc.cluster.local',
                                      'password': Buffer.from(passWord, 'base64').toString('utf-8') }
                                  : { 'connectionStringMaster': clusterName + '-master.' + namespace + '.svc.cluster.local',
                                      'password': Buffer.from(passWord, 'base64').toString('utf-8') };
    res.json(response);
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});


// Delete a Redis instance
router.delete('/redis', async (req, res) => {
  const { clusterName } = req.body;

  try {
    await deleteRedis(clusterName);
    res.json({ redis: "deleted"});
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
