const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAutoscalingApi = kc.makeApiClient(k8s.AutoscalingV2Api);
const k8sExtensionsApi = kc.makeApiClient(k8s.NetworkingV1Api);
const batchApi = kc.makeApiClient(k8s.BatchV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);


const namespace = process.env.NAMESPACE;

async function createKnativeService(name, image, portNumber, containerConcurrency, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, initialScale, maxScale, targetUtilizationPercentage) {
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

  if (env) {
    const envList = []
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
    resource.spec.template.spec.containers[0].env = envList;
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

async function createDeployment(name, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env) {
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

  if (env) {
    const envList = []
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
    resource.spec.template.spec.containers[0].env = envList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sApi.createNamespacedDeployment(namespace, resource);
  } catch (err) {
    console.error('Error creating deployment:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function createStatefulSet(name, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, storageSize, storageClass, mountPath) {
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

  if (env) {
    const envList = []
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
    resource.spec.template.spec.containers[0].env = envList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await k8sApi.createNamespacedStatefulSet(namespace, resource);
  } catch (err) {
    console.error('Error creating statefulset:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "success";
}

async function createCronJob(name, image, schedule, command, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env) {
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

  if (env) {
    const envList = []
    const envVariables = JSON.parse(JSON.stringify(env));
    for (const key in envVariables) {
      envList.push({"name": key, "value": envVariables[key]});
    };
    resource.spec.jobTemplate.spec.template.spec.containers[0].env = envList;
  }

  const imagePullSecrets = await getImagePullSecrets();
  if (imagePullSecrets) {
    resource.spec.jobTemplate.spec.template.spec.imagePullSecrets = imagePullSecrets;
  }

  try {
    await batchApi.createNamespacedCronJob(namespace, resource)
  } catch (err) {
    console.error('Error creating cronjob:', err.body);
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

async function createIngress(name, portNumber, path) {
  const template = fs.readFileSync('../templates/ingress.yaml', 'utf8');
  const resource = k8s.loadYaml(template);

  resource.metadata.name = name;
  resource.spec.rules[0].http.paths[0].path = path + '(/|$)(.*)'
  resource.spec.rules[0].http.paths[0].backend.service.name = name;
  resource.spec.rules[0].http.paths[0].backend.service.port.number = portNumber;

  try {
    await k8sExtensionsApi.createNamespacedIngress(namespace, resource);
  } catch (err) {
    console.error('Error creating ingress:', err.body);
    throw new Error(JSON.stringify(err.body));
  }
  return "sucess";
}

// Create a Kubernetes deployment|statefulset|cronjob|kservice
router.post('/deployapp', async (req, res) => {
  const { kind, identifier, image, replicaCount, portNumber, minReplicas, maxReplicas, memoryRequest, memoryLimit, memoryTarget, 
          cpuRequest, cpuLimit, cpuTarget, ingressPath, env, storageSize, storageClass, mountPath, cronSchedule, cronCommand,
          containerConcurrency, initialScale, maxScale, targetUtilizationPercentage } = req.body;

  try {
    switch(kind) {
      case "Deployment":
        await createDeployment(identifier, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env);
        console.log("Deployment " + identifier + " created.");
        await createService(identifier, portNumber, false);
        console.log("Service " + identifier + " created.");
        if (ingressPath) {
          await createIngress(identifier, portNumber, ingressPath);
          console.log("Ingress " + identifier + " created.");
        };
        if (memoryTarget && cpuTarget && minReplicas && maxReplicas) {
          await createHpa(identifier, minReplicas, maxReplicas, memoryTarget, cpuTarget);
          console.log("HPA " + identifier + " created.");
        };
        break;
      case "StatefulSet":
        await createStatefulSet(identifier, image, replicaCount, portNumber, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, storageSize, storageClass, mountPath);
        console.log("StatefulSet " + identifier + " created.");
        await createService(identifier, portNumber, true);
        console.log("Service " + identifier + " created.");
        if (ingressPath) {
          await createIngress(identifier, portNumber, ingressPath);
          console.log("Ingress " + identifier + " created.");
        }
        break;
      case "CronJob":
        await createCronJob(identifier, image, cronSchedule, cronCommand, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env);
        console.log("Cron Job " + identifier + " created.");
        break;
      case "KnativeService":
        await createKnativeService(identifier, image, portNumber, containerConcurrency, memoryRequest, memoryLimit, cpuRequest, cpuLimit, env, initialScale, maxScale, targetUtilizationPercentage);
        console.log("Knative service " + identifier + " created.");
        if (ingressPath) {
          await createIngress(identifier, portNumber, ingressPath);
          console.log("Ingress " + identifier + " created.");
        }
        break;
    };
    res.json({ "message": "Created successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
