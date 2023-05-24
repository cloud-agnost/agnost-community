const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const k8s = require('@kubernetes/client-node');

console.log(k8s);

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api)
const k8sAutoscalingApi = kc.makeApiClient(k8s.AutoscalingV1Api);
const k8sExtensionsApi = kc.makeApiClient(k8s.NetworkingV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

app.use(bodyParser.json());

async function createDeployment(deploymentName, imageName, replicaCount, containerPort, memoryRequest, memoryLimit, cpuRequest, cpuLimit) {
  const deployment = {
    metadata: {
      name: deploymentName,
      labels: {
        app: deploymentName
      }
    },
    spec: {
      replicas: replicaCount,
      selector: {
        matchLabels: {
          app: deploymentName
        }
      },
      template: {
        metadata: {
          labels: {
            app: deploymentName
          }
        },
        spec: {
          containers: [{
            name: deploymentName,
            image: imageName,
            ports: [
              {
                containerPort: containerPort,
                protocol: "TCP"
              }
            ],
            env: [
              {
                name: "MONGODB_NODES",
                value: "mongo-srv://mimongodb-0.mongodb-headless.default.svc.cluster.local,mongodb-1.mongodb-headless.default.svc.cluster.local,mongodb-2.mongodb-headless.default.svc.cluster.local",
              },
              {
                name: "MONGODB_PASSWORD",
                valueFrom: {
                  secretKeyRef: {
                    name: "mongodb-admin-password",
                    key: "password"
                  }
                }
              },
              {
                name: "RABBITMQ_NODES",
                value: "rabbitmq-server-0.rabbitmq-nodes.default.svc.cluster.local,rabbitmq-server-1.rabbitmq-nodes.default.svc.cluster.local,rabbitmq-server-2.rabbitmq-nodes.default.svc.cluster.local"
              },
              {
                name: "RABBITMQ_USERNAME",
                valueFrom: {
                  secretKeyRef: {
                    name: "rabbitmq-default-user",
                    key: "username"
                  }
                }
              },
              {
                name: "RABBITMQ_PASSWORD",
                valueFrom: {
                  secretKeyRef: {
                    name: "rabbitmq-default-user",
                    key: "password"
                  }
                }
              },
              {
                name: "REDIS_HOST",
                value: "redis-master.default.svc.cluster.local",
              },
              {
                name: "REDIS_PASSWORD",
                valueFrom: {
                  secretKeyRef: {
                    name: "redis-password",
                    key: "password"
                  }
                }
              }
            ],
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
          }]
        }
      }
    }
  };
  
  const deploymentResult = await k8sApi.createNamespacedDeployment('default', deployment);
  return deploymentResult;
}

async function updateDeployment(deploymentName, imageName, replicaCount, containerPort, memoryRequest, memoryLimit, cpuRequest, cpuLimit) {
  const dply = await k8sApi.readNamespacedDeployment(deploymentName, 'default');
  let deployment = dply.body;
  
  deployment.spec.replicas = replicaCount;
  deployment.spec.template.spec.containers[0].image = imageName;
  deployment.spec.template.spec.containers[0].ports[0].containerPort = containerPort;
  deployment.spec.template.spec.containers[0].resources.limits.cpu = cpuLimit;
  deployment.spec.template.spec.containers[0].resources.limits.memory = memoryLimit;
  deployment.spec.template.spec.containers[0].resources.requests.cpu = cpuRequest;
  deployment.spec.template.spec.containers[0].resources.requests.memory = memoryRequest;

  const updateDplyResult = await k8sApi.replaceNamespacedDeployment(deploymentName, 'default', deployment);
  return updateDplyResult;
}

async function deleteDeployment(deploymentName) {
  await k8sApi.deleteNamespacedDeployment(deploymentName, 'default', { propagationPolicy: 'Foreground' });
}

async function createService(serviceName, containerPort) {
  const service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: serviceName,
    },
    spec: {
      selector: {
        app: serviceName,
      },
      ports: [
        {
          name: serviceName,
          port: 80,
          targetPort: containerPort,
        },
      ],
      type: 'ClusterIP',
    },
  };

  const serviceResult = await k8sCoreApi.createNamespacedService('default', service);
  return serviceResult;
}

async function updateService(serviceName, containerPort) {
  return;
}

async function deleteService(serviceName, containerPort) {
  return;
}

async function createHpa(deploymentName, minReplicaCount, maxReplicaCount) {
  const hpaName = deploymentName + '-hpa';
  const hpa = {
    metadata: {
      name: hpaName,
      labels: {
        app: deploymentName
      }
    },
    spec: {
      scaleTargetRef: {
        kind: 'Deployment',
        name: deploymentName,
        apiVersion: 'apps/v1'
      },
      minReplicas: minReplicaCount,
      maxReplicas: maxReplicaCount,
      targetCPUUtilizationPercentage: 50
    }
  };

  const hpaResult = await k8sAutoscalingApi.createNamespacedHorizontalPodAutoscaler('default', hpa);
  return hpaResult;
}

async function updateHpa(hpaName, minReplicaCount, maxReplicaCount) {
  const h = await k8sAutoscalingApi.readNamespacedHorizontalPodAutoscaler(hpaName, 'default');
  let hpa = h.body;

  hpa.spec.maxReplicas = maxReplicaCount;
  hpa.spec.minReplicas = minReplicaCount;

  const updateHpaResult = await k8sAutoscalingApi.replaceNamespacedHorizontalPodAutoscaler(hpaName, 'default', hpa);
  return updateHpaResult;
}

async function deleteHpa(hpaName) {
  await k8sAutoscalingApi.deleteNamespacedHorizontalPodAutoscaler(hpaName, 'default', { propagationPolicy: 'Foreground' });
}

async function createIngress(podIdentifier, path) {
  const ingress = {
    metadata: {
      name: podIdentifier,
      annotations: {
        'nginx.ingress.kubernetes.io/rewrite-target': '/'
      }
    },
    spec: {
      rules: [
        {
          http: {
            paths: [
              {
                path: path,
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: podIdentifier,
                    port: {
                      number: 80
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    }
  };

  const ingressResult = await k8sExtensionsApi.createNamespacedIngress('default', ingress);
  return ingressResult;
}

async function updateIngress(podIdentifier, path) {
  const ing = await k8sExtensionsApi.readNamespacedIngress('default', podIdentifier);
  let ingress = ing.body;
  
  ingress.spec.rules[0].http.paths[0].path = path;
  ingress.spec.rules[0].http.paths[0].backend.service.name = podIdentifier;
  
  const updateIngressResult = await k8sExtensionsApi.replacedNamespacedIngress(podIdentifier, 'default', ingress);
  return updateIngressResult.body;
}

async function deleteIngress(podIdentifier) {
  return;
}

async function createMongoDBResource(mongoName, mongoVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit) {
  const mongodbResource = {
    apiVersion: 'mongodbcommunity.mongodb.com/v1',
    kind: 'MongoDBCommunity',
    metadata: {
      name: mongoName
    },
    spec: {
      members: 3,
      type: 'ReplicaSet',
      version: mongoVersion,
      security: {
        authentication: {
          modes: ['SCRAM']
        }
      },
      users: [
        {
          db: "admin",
          name: "my-user",
          passwordSecretRef: {
              name: "mongodb-admin-password"
          },
          roles: [
            {
              db: "admin",
              name: "clusterAdmin"
            },
            {
              db: "admin",
              name: "userAdminAnyDatabase"
            }
          ],
          scramCredentialsSecretName: "my-user"
        }
      ],
      persistent: true,
      statefulSet: {
        spec: {
          selector: {
            matchLabels: {
              app: "mongodb-user-svc"
            }
          },
          template: {
            metadata: {
              labels: {
                app: "mongodb-user-svc"
              }
            },
            spec: {
              containers: [
                {
                  name: "mongod",
                  resources: {
                    limits: {
                      cpu: "500m",
                      memory: "2Gi"
                    },
                    requests: {
                      cpu: "200m",
                      memory: "512Mi"
                    }
                  }
                },
                {
                  name: "mongodb-agent",
                  resources: {
                    limits: {
                      cpu: "100m",
                      memory: "256Mi"
                    },
                    requests: {
                      cpu: "100m",
                      memory: "256Mi"
                    }
                  }
                }
              ]
            }
          }
        }
      },
    }
  };

  const response = await k8sCustomApi.createNamespacedCustomObject('mongodbcommunity.mongodb.com', 'v1', 'default', 'mongodbcommunity', mongodbResource);
  return response.body;
}

//createMongoDBResource().catch(console.error);


// Create a Kubernetes deployment, service, ingress, and HPA
app.post('/deployments', async (req, res) => {
  const { podIdentifier, imageName, replicaCount, containerPort, minReplicaCount, maxReplicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, path } = req.body;

  try {
    const deploymentResult = await createDeployment(podIdentifier, imageName, replicaCount, containerPort, memoryRequest, memoryLimit, cpuRequest, cpuLimit);
    const serviceResult = await createService(podIdentifier);
    const ingressResult = await createIngress(podIdentifier, path);
    const hpaResult = await createHpa(podIdentifier, minReplicaCount, maxReplicaCount);
    res.json({
      deployment: deploymentResult.body,
      hpa: hpaResult.body,
      ingress: ingressResult.body,
      service: serviceResult.body
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create a MongoDB Community Instance
app.post('/mongodb', async (req, res) => {
  const { mongoName, mongoVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit } = req.body;

  try {
    const mongoResult = await createMongoDBResource(mongoName, mongoVersion, memoryRequest, memoryLimit, cpuRequest, cpuLimit);
    res.json({ mongodb: mongoResult.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a Kubernetes deployment, service, ingress, and HPA
app.put('/deployments/:podIdentifier', async (req, res) => {
  const { podIdentifier } = req.params;
  const { imageName, replicaCount, containerPort, minReplicaCount, maxReplicaCount, memoryRequest, memoryLimit, cpuRequest, cpuLimit, ingressPath } = req.body;

  try {
    const deploymentResult = await updateDeployment(podIdentifier, imageName, replicaCount, containerPort, memoryRequest, memoryLimit, cpuRequest, cpuLimit);
    const hpaResult = await updateHpa(podIdentifier + '-hpa', minReplicaCount, maxReplicaCount);
    const svcResult = await updateService(podIdentifier, containerPort);
    const ingressResult = await updateIngress(podIdentifier, ingressPath);
    res.json({ deployment: deploymentResult.body, service: svcResult.body, ingress: ingressResult.body, hpa: hpaResult.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a Kubernetes deployment, service, ingress, and HPA
app.delete('/deployments/:podIdentifier', async (req, res) => {
  const { podIdentifier } = req.params;

  try {
    await deleteDeployment(podIdentifier);
    await deleteService(podIdentifier);
    await deleteIngress(podIdentifier);
    await deleteHpa(podIdentifier + 'hpa');
    res.json({ message: `Deleted deployment ${podIdentifier}, service, ingress, and HPA` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Start the server
app.listen(3000, () => console.log('Server started on port 3000.'));
