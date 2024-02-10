const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAutoscalingApi = kc.makeApiClient(k8s.AutoscalingV2Api);
const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
const k8sBatchApi = kc.makeApiClient(k8s.BatchV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const namespace = process.env.NAMESPACE;

// Function to simulate sleep
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function createIssuer() {
  const issuer = {
    "apiVersion": "cert-manager.io/v1",
    "kind": "Issuer",
    "metadata": { "name": "app-deploy-issuer", "namespace": namespace },
    "spec": { "acme": { "privateKeySecretRef": { "name": "app-issuer-key" },
              "server": "https://acme-v02.api.letsencrypt.org/directory",
              "solvers": [ { "http01": { "ingress": { "ingressClassName": "nginx" } } } ] } }
  };

  await k8sCustomApi.createNamespacedCustomObject('cert-manager.io', 'v1', namespace, 'issuers', issuer)
    .then((response) => {
      console.log('Issuer created:', response.body.metadata.name);
    })
    .catch((err) => {
      console.error('Error creating Issuer:', err);
    });
}

async function scaleStatefulSet(statefulSetName, replicas) {
  try {
    res = await k8sAppsApi.readNamespacedStatefulSet(statefulSetName, namespace);
    let sts = res.body;
    sts.spec.replicas = replicas;
    await k8sAppsApi.replaceNamespacedStatefulSet(statefulSetName, namespace, sts);
  } catch (error) {
    throw new Error(JSON.stringify(error.body));
  }
}

async function getImagePullSecrets() {
  const secretList = [];
  try {
    const secrets = await k8sCoreApi.listNamespacedSecret(namespace);
    secrets.body.items.forEach(async (secret) => {
      var secretName = secret.metadata.name;
      if (secretName.startsWith('regcred-')) {
        secretList.push({"name": secretName});
      }
    });
  } catch (err) {
    console.error('Error getting image pull secrets:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  
  return secretList;
}

async function createKnativeService(name, image, portNumber, containerConcurrency, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, initialScale, maxScale, targetUtilizationPercentage) {
  const group = 'serving.knative.dev';
  const version = 'v1';
  const plural = 'services';

  const template = fs.readFileSync('../templates/knativeservice.yaml', 'utf8');
  const resource = k8s.loadYaml(template);

  resource.metadata.name = name;
  resource.spec.containerConcurrency = containerConcurrency;
  resource.spec.template.spec.containers[0].name = name;
  resource.spec.template.spec.containers[0].image = image;
  resource.spec.template.spec.containers[0].ports[0].containerPort = portNumber;
  resource.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
  resource.spec.template.metadata.annotations['autoscaling.knative.dev/initial-scale'] = initialScale;
  resource.spec.template.metadata.annotations['autoscaling.knative.dev/max-scale'] = maxScale;
  resource.spec.template.metadata.annotations['autoscaling.knative.dev/target-utilization-percentage'] = targetUtilizationPercentage;

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, plural, resource);
  } catch (err) {
    console.error('Error creating Knative service:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function updateKnativeService(name, image, portNumber, containerConcurrency, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, initialScale, maxScale, targetUtilizationPercentage) {
  const group = 'serving.knative.dev';
  const version = 'v1';
  const plural = 'services';

  const ksvc = await k8sCustomApi.getNamespacedCustomObject(group, version, namespace, plural, name);
  const resource = ksvc.body;

  resource.spec.containerConcurrency = containerConcurrency;
  resource.spec.template.spec.containers[0].image = image;
  resource.spec.template.spec.containers[0].ports[0].containerPort = portNumber;
  resource.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
  resource.spec.template.metadata.annotations['autoscaling.knative.dev/initial-scale'] = initialScale;
  resource.spec.template.metadata.annotations['autoscaling.knative.dev/max-scale'] = maxScale;
  resource.spec.template.metadata.annotations['autoscaling.knative.dev/target-utilization-percentage'] = targetUtilizationPercentage;

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sCustomApi.replaceNamespacedCustomObject(group, version, namespace, plural, name, resource);
  } catch (err) {
    console.error('Error updating Knative service:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function deleteKnativeService(name) {
  const group = 'serving.knative.dev';
  const version = 'v1';
  const plural = 'services';

  try {
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, name);
  } catch (err) {
    console.error('Error deleting Knative service:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function createDeployment(name, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom) {
  const template = fs.readFileSync('../templates/deployment.yaml', 'utf8');
  const resource = k8s.loadYaml(template);
  
  resource.metadata.name = name;
  resource.metadata.labels.app = name;
  resource.spec.replicas = replicaCount;
  resource.spec.selector.matchLabels.app = name;
  resource.spec.template.metadata.labels.app = name;
  resource.spec.template.spec.containers[0].name = name;
  resource.spec.template.spec.containers[0].image = image;
  resource.spec.template.spec.containers[0].ports[0].containerPort = portNumber;
  resource.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sAppsApi.createNamespacedDeployment(namespace, resource);
  } catch (err) {
    console.error('Error creating deployment:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function updateDeployment(name, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom) {
  const dply = await k8sAppsApi.readNamespacedDeployment(name, namespace);
  const resource = dply.body;
  
  resource.spec.replicas = replicaCount;
  resource.spec.template.spec.containers[0].image = image;
  resource.spec.template.spec.containers[0].ports[0].containerPort = portNumber;
  resource.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sAppsApi.replaceNamespacedDeployment(name, namespace, resource);
  } catch (err) {
    console.error('Error updating deployment:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function deleteDeployment(name) {
  try {
    await k8sAppsApi.deleteNamespacedDeployment(name, namespace);
  } catch (err) {
    console.error('Error deleting deployment:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function createStatefulSet(name, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, storageSize, storageClass, mountPath) {
  const template = fs.readFileSync('../templates/statefulset.yaml', 'utf8');
  const resource = k8s.loadYaml(template);
  
  resource.metadata.name = name;
  resource.metadata.labels.app = name;
  resource.spec.replicas = replicaCount;
  resource.spec.selector.matchLabels.app = name;
  resource.spec.template.metadata.labels.app = name;
  resource.spec.template.spec.containers[0].name = name;
  resource.spec.template.spec.containers[0].image = image;
  resource.spec.template.spec.containers[0].ports[0].containerPort = portNumber;
  resource.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
  resource.spec.template.spec.containers[0].volumeMounts[0].mountPath = mountPath;
  resource.spec.volumeClaimTemplates[0].spec.storageClassName = storageClass;
  resource.spec.volumeClaimTemplates[0].spec.resources.requests.storage = storageSize;

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sAppsApi.createNamespacedStatefulSet(namespace, resource);
  } catch (err) {
    console.error('Error creating statefulset:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function updateStatefulSet(name, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, storageSize, storageClass, mountPath) {
  const sts = await k8sAppsApi.readNamespacedStatefulSet(name, namespace);
  var resource = sts.body;
  
  const currentStorageClass = resource.spec.volumeClaimTemplates[0].spec.storageClassName;
  if (storageClass != currentStorageClass) {
    console.error('[ERROR] StorageClass cannot be changed!...');
  }

  // storageSize might be the initial one, or it would have been already updated.
  // Checks an annotation if it's already updated.
  storageArray = [];
  storageArray.push(resource.spec.volumeClaimTemplates[0].spec.resources.requests.storage);
  try {
    annotationValue = resource.metadata.annotations["agnost.dev/resizedStorage"];
    if (annotationValue) {
      storageArray.push(annotationValue);
    }
  } catch (err) {
    // it's fine if does not exist.
  }
  if (!storageArray.includes(storageSize)) {
    const pvcPatch = {
      spec: {
        resources: {
          requests: {
            storage: storageSize
          }
        }
      }
    };
    const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };
  
    try {
      const pvcList = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
      pvcList.body.items.forEach(async (pvc) => {
        var pvcName = pvc.metadata.name;
        if (pvcName.includes("data-" + name + '-')) {
          await k8sCoreApi.patchNamespacedPersistentVolumeClaim(pvcName, namespace, pvcPatch, undefined, undefined, undefined, undefined, undefined, requestOptions);
          console.log('PersistentVolumeClaim ' + pvcName + ' updated...');
        }
      });
      console.log('Scaling Down StatefulSet...');
      await scaleStatefulSet(name, 0);
      await sleep(5000);
      console.log('Scaling Up StatefulSet...');
      await scaleStatefulSet(name, resource.spec.replicas);
      await sleep(3000);
      const stsLatest = await k8sAppsApi.readNamespacedStatefulSet(name, namespace);
      var resource = stsLatest.body;
      if (!resource.metadata.annotations) {
        resource.metadata.annotations = {};
      }
      resource.metadata.annotations["agnost.dev/resizedStorage"] = storageSize;
    } catch (error){
      console.error('Error updating pvc:', error.body);
      throw new Error(JSON.stringify(error.body));
    }
  }

  resource.spec.replicas = replicaCount;
  resource.spec.template.spec.containers[0].image = image;
  resource.spec.template.spec.containers[0].ports[0].containerPort = portNumber;
  resource.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
  resource.spec.template.spec.containers[0].volumeMounts[0].mountPath = mountPath;

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sAppsApi.replaceNamespacedStatefulSet(name, namespace, resource);
  } catch (err) {
    console.error('Error updating statefulset:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function deleteStatefulSet(name) {
  try {
    await k8sAppsApi.deleteNamespacedStatefulSet(name, namespace);
  } catch (err) {
    console.error('Error deleting statefulset:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function createCronJob(name, image, schedule, command, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom) {
  const template = fs.readFileSync('../templates/cronjob.yaml', 'utf8');
  const resource = k8s.loadYaml(template);
  
  resource.metadata.name = name;
  resource.spec.schedule = schedule;
  resource.spec.jobTemplate.spec.template.spec.containers[0].name = name;
  resource.spec.jobTemplate.spec.template.spec.containers[0].image = image;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;

  if (command) {
    resource.spec.jobTemplate.spec.template.spec.containers[0].command[2] = command;
  } else {
    delete resource.spec.jobTemplate.spec.template.spec.containers[0].command;
  }

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.jobTemplate.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.jobTemplate.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.jobTemplate.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sBatchApi.createNamespacedCronJob(namespace, resource)
  } catch (err) {
    console.error('Error creating cronjob:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function updateCronJob(name, image, schedule, command, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, envRef) {
  const cj = await k8sBatchApi.readNamespacedCronJob(name, namespace);
  const resource = cj.body;
  
  resource.spec.schedule = schedule;
  resource.spec.jobTemplate.spec.template.spec.containers[0].image = image;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  resource.spec.jobTemplate.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;

  if (command) {
    resource.spec.jobTemplate.spec.template.spec.containers[0].command[2] = command;
  } else {
    delete resource.spec.jobTemplate.spec.template.spec.containers[0].command;
  }

  const envList = [];
  if (env) {
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
  }

  if (envRef) {
    envRef.forEach(async (environment) => {
      envList.push({"name": environment["envName"], "valueFrom": {[environment["refType"]]: {"name": environment["refName"], "key": environment["refKey"]}}});
    });
  }

  if (envList) {
    resource.spec.jobTemplate.spec.template.spec.containers[0].env = envList;
  }

  if (envFrom) {
    const envFromList = [];
    const envFromVariables = JSON.parse(JSON.stringify(envFrom));
    for (var key in envFromVariables) {
      envFromList.push({[key]: {"name": envFromVariables[key]}});
    };
    resource.spec.jobTemplate.spec.template.spec.containers[0].envFrom = envFromList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.jobTemplate.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sBatchApi.replaceNamespacedCronJob(name, namespace, resource);
  } catch (err) {
    console.error('Error updating cronjob:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function deleteCronJob(name) {
  try {
    await k8sBatchApi.deleteNamespacedCronJob(name, namespace);
  } catch (err) {
    console.error('Error deleting cronjob:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function createService(name, portNumber, isHeadless) {
  const template = fs.readFileSync('../templates/service.yaml', 'utf8');
  const resource = k8s.loadYaml(template);

  resource.metadata.name = name;
  resource.spec.selector.app = name;
  resource.spec.ports[0].port = portNumber;
  resource.spec.ports[0].targetPort = portNumber;
  if (isHeadless) {
    resource.spec.clusterIP = 'None';
  }

  try {
    await k8sCoreApi.createNamespacedService(namespace, resource);
  } catch (err) {
    console.error('Error creating service:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "sucess";
}

async function updateService(name, portNumber, isHeadless) {
  const svc = await k8sCoreApi.readNamespacedService(name, namespace);
  const resource = svc.body;

  resource.spec.ports[0].port = portNumber;
  resource.spec.ports[0].targetPort = portNumber;
  if (isHeadless) {
    resource.spec.clusterIP = 'None';
  }

  try {
    await k8sCoreApi.replaceNamespacedService(name, namespace, resource);
  } catch (err) {
    console.error('Error updating service:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "sucess";
}

async function deleteService(name) {
  try {
    await k8sCoreApi.deleteNamespacedService(name, namespace);
  } catch (err) {
    console.error('Error deleting service:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function createHpa(name, minReplicas, maxReplicas, memoryTarget, cpuTarget) {
  const template = fs.readFileSync('../templates/hpa.yaml', 'utf8');
  const resource = k8s.loadYaml(template);

  resource.metadata.name = name;
  resource.spec.scaleTargetRef.name = name;
  resource.spec.minReplicas = minReplicas;
  resource.spec.maxReplicas = maxReplicas;
  resource.spec.metrics[0].resource.target.averageUtilization = cpuTarget;
  resource.spec.metrics[1].resource.target.averageValue = memoryTarget;

  try {
    await k8sAutoscalingApi.createNamespacedHorizontalPodAutoscaler(namespace, resource);
  } catch (err) {
    console.error('Error creating hpa:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "sucess";
}

async function updateHpa(name, minReplicas, maxReplicas, memoryTarget, cpuTarget) {
  const hpa = await k8sAutoscalingApi.readNamespacedHorizontalPodAutoscaler(name, namespace);
  const resource = hpa.body;

  resource.spec.minReplicas = minReplicas;
  resource.spec.maxReplicas = maxReplicas;
  resource.spec.metrics[0].resource.target.averageUtilization = cpuTarget;
  resource.spec.metrics[1].resource.target.averageValue = memoryTarget;

  try {
    await k8sAutoscalingApi.replaceNamespacedHorizontalPodAutoscaler(name, namespace, resource);
  } catch (err) {
    console.error('Error updating hpa:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "sucess";
}

async function deleteHpa(name) {
  try {
    await k8sAutoscalingApi.deleteNamespacedHorizontalPodAutoscaler(name, namespace);
  } catch (err) {
    console.error('Error deleting hpa:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function createIngress(name, portNumber, path, domain, serviceType='k8s') {
  const template = fs.readFileSync('../templates/ingress.yaml', 'utf8');
  const resource = k8s.loadYaml(template);

  resource.metadata.name = name;
  resource.spec.rules[0].http.paths[0].backend.service.name = name;
  resource.spec.rules[0].http.paths[0].backend.service.port.number = portNumber;

  if (path) {
    resource.spec.rules[0].http.paths[0].path = path + '(/|$)(.*)';
  } else {
    resource.spec.rules[0].http.paths[0].path = '/';
    // if it's not path based, no need for rewrite-target
    delete resource.metadata.annotations['nginx.ingress.kubernetes.io/rewrite-target'];
  }

  if (domain) {
    try {
      issuer = await k8sCustomApi.getNamespacedCustomObject('cert-manager.io', 'v1', namespace, 'issuers', 'app-prod-issuer');
    } catch (err) {
      // issuer does not exist, let's create it:
      await createIssuer();
    }
    resource.metadata.annotations["nginx.ingress.kubernetes.io/ssl-redirect"] = "true";
    resource.metadata.annotations["nginx.ingress.kubernetes.io/force-ssl-redirect"] = "true";
    resource.metadata.annotations["cert-manager.io/issuer"] = "app-prod-issuer"
    resource.spec.rules[0].host = domain;
    resource.spec.tls = [ { "hosts": [ domain ], "secretName": "ingress-tls" } ];
  }

  if (serviceType == "knative") {
    const vhost = name + '.' + namespace + '.svc.cluster.local';
    resource.metadata.annotations["nginx.ingress.kubernetes.io/upstream-vhost"] = vhost;
  }

  try {
    await k8sNetworkingApi.createNamespacedIngress(namespace, resource);
  } catch (err) {
    console.error('Error creating ingress:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "sucess";
}

async function updateIngress(name, portNumber, path, domain) {
  const ing = await k8sNetworkingApi.readNamespacedIngress(name, namespace);
  const resource = ing.body;

  resource.spec.rules[0].http.paths[0].backend.service.name = name;
  resource.spec.rules[0].http.paths[0].backend.service.port.number = portNumber;

  if (path) {
    resource.spec.rules[0].http.paths[0].path = path + '(/|$)(.*)';
  } else {
    resource.spec.rules[0].http.paths[0].path = '/';
    // if it's not path based, no need for rewrite-target
    delete resource.metadata.annotations['nginx.ingress.kubernetes.io/rewrite-target'];
  }

  if (domain) {
    try {
      issuer = await k8sCustomApi.getNamespacedCustomObject('cert-manager.io', 'v1', namespace, 'issuers', 'app-prod-issuer');
    } catch (err) {
      // issuer does not exist, let's create it:
      await createIssuer();
    }
    resource.metadata.annotations["nginx.ingress.kubernetes.io/ssl-redirect"] = "true";
    resource.metadata.annotations["nginx.ingress.kubernetes.io/force-ssl-redirect"] = "true";
    resource.metadata.annotations["cert-manager.io/issuer"] = "letsencrypt-issuer-prod"
    resource.spec.rules[0].host = domain;
    resource.spec.tls = [ { "hosts": [ domain ], "secretName": "ingress-tls" } ];
  }

  try {
    await k8sNetworkingApi.replaceNamespacedIngress(name, namespace, resource);
  } catch (err) {
    console.error('Error updating ingress:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "sucess";
}

async function deleteIngress(name) {
  try {
    await k8sNetworkingApi.deleteNamespacedIngress(name, namespace);
  } catch (err) {
    console.error('Error deleting ingress:', err.body);
    throw new Error(JSON.stringify(err.body));
  }

  return "success";
}

async function ingressExists(name) {
  k8sNetworkingApi.listNamespacedIngress(namespace)
  .then((response) => {
    const ingresses = response.body.items;
    const desiredIngress = ingresses.find(ingress => ingress.metadata.name === name);

    if (desiredIngress) {
      return true;
    } else {
      return false;
    }
  })
  .catch((err) => {
    console.error('Error fetching Ingresses:', err);
  });
}

async function hpaExists(name) {
  k8sAutoscalingApi.listNamespacedHorizontalPodAutoscaler(namespace)
  .then((response) => {
    const hpas = response.body.items;
    const desiredHpa = hpas.find(hpa => hpa.metadata.name === name);

    if (desiredHpa) {
      return true;
    } else {
      return false;
    }
  })
  .catch((err) => {
    console.error('Error fetching HPAs:', err);
  });
}

// Create a Kubernetes deployment|statefulset|cronjob|kservice
router.post('/deployapp', async (req, res) => {
  const { kind, identifier, image, replicaCount, portNumber, minReplicas, maxReplicas, memoryRequest, memoryLimit, memoryTarget, 
          cpuRequest, cpuLimit, cpuTarget, ingressPath, ingressDomain, env, envRef, envFrom, storageSize, storageClass, mountPath, cronSchedule, cronCommand,
          containerConcurrency, initialScale, maxScale, targetUtilizationPercentage } = req.body;

  try {
    switch(kind) {
      case "Deployment":
        var resourceName = identifier + '-dply';
        await createDeployment(resourceName, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom);
        console.log("Deployment " + resourceName + " created.");
        await createService(resourceName, portNumber, false);
        console.log("Service " + resourceName + " created.");
        if (ingressPath || ingressDomain) {
          await createIngress(resourceName, portNumber, ingressPath, ingressDomain);
          console.log("Ingress " + resourceName + " created.");
        };
        if (memoryTarget && cpuTarget && minReplicas && maxReplicas) {
          await createHpa(resourceName, minReplicas, maxReplicas, memoryTarget, cpuTarget);
          console.log("HPA " + resourceName + " created.");
        };
        break;
      case "StatefulSet":
        var resourceName = identifier + '-sts';
        await createStatefulSet(resourceName, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, storageSize, storageClass, mountPath);
        console.log("StatefulSet " + resourceName + " created.");
        await createService(resourceName, portNumber, true);
        console.log("Service " + resourceName + " created.");
        if (ingressPath || ingressDomain) {
          await createIngress(resourceName, portNumber, ingressPath, ingressDomain);
          console.log("Ingress " + resourceName + " created.");
        }
        break;
      case "CronJob":
        var resourceName = identifier + '-cj'
        await createCronJob(resourceName, image, cronSchedule, cronCommand, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom);
        console.log("Cron Job " + resourceName + " created.");
        break;
      case "KnativeService":
        var resourceName = identifier + '-ksvc'
        await createKnativeService(resourceName, image, portNumber, containerConcurrency, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, initialScale, maxScale, targetUtilizationPercentage);
        console.log("Knative service " + resourceName + " created.");
        if (ingressPath || ingressDomain) {
          await createIngress(resourceName, portNumber, ingressPath, ingressDomain, 'knative');
          console.log("Ingress " + resourceName + " created.");
        }
        break;
    };
    res.json({ "message": "Created successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a Kubernetes deployment|statefulset|cronjob|kservice
router.put('/deployapp', async (req, res) => {
  const { kind, identifier, image, replicaCount, portNumber, minReplicas, maxReplicas, memoryRequest, memoryLimit, memoryTarget, 
          cpuRequest, cpuLimit, cpuTarget, ingressPath, ingressDomain, env, envRef, envFrom, storageSize, storageClass, mountPath, cronSchedule, cronCommand,
          containerConcurrency, initialScale, maxScale, targetUtilizationPercentage } = req.body;

  try {
    switch(kind) {
      case "Deployment":
        var resourceName = identifier + '-dply';
        await updateDeployment(resourceName, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom);
        console.log("Deployment " + resourceName + " updated.");
        await updateService(resourceName, portNumber, false);
        console.log("Service " + resourceName + " updated.");
        if (ingressPath || ingressDomain) {
          await updateIngress(resourceName, portNumber, ingressPath, ingressDomain);
          console.log("Ingress " + resourceName + " updated.");
        };
        if (memoryTarget && cpuTarget && minReplicas && maxReplicas) {
          await updateHpa(resourceName, minReplicas, maxReplicas, memoryTarget, cpuTarget);
          console.log("HPA " + resourceName + " updated.");
        };
        break;
      case "StatefulSet":
        var resourceName = identifier + '-sts';
        await updateStatefulSet(resourceName, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, storageSize, storageClass, mountPath);
        console.log("StatefulSet " + resourceName + " updated.");
        await updateService(resourceName, portNumber, true);
        console.log("Service " + resourceName + " updated.");
        if (ingressPath || ingressDomain) {
          await updateIngress(resourceName, portNumber, ingressPath, ingressDomain);
          console.log("Ingress " + resourceName + " updated.");
        }
        break;
      case "CronJob":
        var resourceName = identifier + '-cj';
        await updateCronJob(resourceName, image, cronSchedule, cronCommand, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom);
        console.log("Cron Job " + resourceName + " updated.");
        break;
      case "KnativeService":
        var resourceName = identifier + '-ksvc';
        await updateKnativeService(resourceName, image, portNumber, containerConcurrency, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, envRef, envFrom, initialScale, maxScale, targetUtilizationPercentage);
        console.log("Knative service " + resourceName + " updated.");
        if (ingressPath || ingressDomain) {
          await updateIngress(resourceName, portNumber, ingressPath, ingressDomain);
          console.log("Ingress " + resourceName + " updated.");
        }
        break;
    };
    res.json({ "message": "Updated successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete resources
router.delete('/deployapp', async (req, res) => {
  const { kind, identifier } = req.body;

  try {
    switch(kind) {
      case "Deployment":
        var resourceName = identifier + '-dply';
        await deleteDeployment(resourceName);
        console.log("Deployment " + resourceName + " deleted.");
        await deleteService(resourceName);
        console.log("Service " + resourceName + " deleted.");
        if (ingressExists(resourceName)) {
          await deleteIngress(resourceName);
          console.log("Ingress " + resourceName + " deleted.");
        };
        if (hpaExists(resourceName)) {
          await deleteHpa(resourceName);
          console.log("HPA " + resourceName + " deleted.");
        };
        break;
      case "StatefulSet":
        var resourceName = identifier + '-sts';
        await deleteStatefulSet(resourceName);
        console.log("StatefulSet " + resourceName + " deleted.");
        await deleteService(resourceName);
        console.log("Service " + resourceName + " deleted.");
        if (ingressExists(resourceName)) {
          await deleteIngress(resourceName);
          console.log("Ingress " + resourceName + " deleted.");
        }
        break;
      case "CronJob":
        var resourceName = identifier + '-cj';
        await deleteCronJob(resourceName);
        console.log("Cron Job " + resourceName + " deleted.");
        break;
      case "KnativeService":
        var resourceName = identifier + '-ksvc';
        await deleteKnativeService(resourceName);
        console.log("Knative service " + resourceName + " deleted.");
        if (ingressExists(resourceName)) {
          await deleteIngress(resourceName);
          console.log("Ingress " + resourceName + " deleted.");
        }
        break;
    };
    res.json({ "message": "Deleted successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
