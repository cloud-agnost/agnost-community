const express = require('express');
const k8s = require('@kubernetes/client-node');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

const namespace = process.env.NAMESPACE;

const configMapName = 'tcp-services';
const resourceNamespace = 'ingress-nginx';

async function exposeService(serviceName, portNumber) {
  /*  We need to patch below on ingress-nginx namespace:
      1. ConfigMap/tcp-services
      2. Service/ingress-nginx-controller
      3. Deployment/ingress-nginx-controller */

  try {
    // get the backend service information
    var backendSvc = await k8sCoreApi.readNamespacedService(serviceName, namespace);
    var svcPort = backendSvc.body.spec.ports[0].port;
    var protocol = backendSvc.body.spec.ports[0].protocol;
  } catch (error) {
    throw new Error(JSON.stringify(error.body));
  }

  try {
    // patch configmap/tcp-service
    const cfgmap = await k8sCoreApi.readNamespacedConfigMap(configMapName, resourceNamespace);
    cfgmap.body.data = {
      ...cfgmap.body.data,
      [portNumber]: `${namespace}/${serviceName}:${svcPort}` 
    };
    await k8sCoreApi.replaceNamespacedConfigMap(configMapName, resourceNamespace, cfgmap.body);
  } catch (error) {
    if (error.body.code === 404 && error.body.details.name == 'tcp-services') {
      const configMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: configMapName },
        data: { [portNumber]: `${namespace}/${serviceName}:${svcPort}` }
      };
      await k8sCoreApi.createNamespacedConfigMap(resourceNamespace, configMap);
    }
    else {
      throw new Error(JSON.stringify(error.body));
    }
  }

  try {
    // patch service/ingress-nginx-controller
    const portName = 'proxied-tcp-' + portNumber;
    k8sCoreApi.listNamespacedService(resourceNamespace)
      .then((res) => {
        res.body.items.forEach(async (service) => {
          if (service.metadata.name.includes('ingress-nginx-controller')) {
            const svcName = service.metadata.name;
            const svc = await k8sCoreApi.readNamespacedService(svcName, resourceNamespace);
            const newPort = { name: portName, port: portNumber, targetPort: portNumber, protocol: protocol};
            svc.body.spec.ports.push(newPort);
            await k8sCoreApi.replaceNamespacedService(svcName, resourceNamespace, svc.body);
          }
        });
      });

    // patch deployment/ingress-nginx-controller
    k8sAppsApi.listNamespacedDeployment(resourceNamespace)
      .then((res) => {
        res.body.items.forEach(async (deployment) => {
          if (deployment.metadata.name.includes('ingress-nginx-controller')) {
            const deployName = deployment.metadata.name;
            const dply = await k8sAppsApi.readNamespacedDeployment(deployName, resourceNamespace);

            const configmapArg = '--tcp-services-configmap=ingress-nginx/tcp-services';
            if (!dply.body.spec.template.spec.containers[0].args.includes(configmapArg)) {
              dply.body.spec.template.spec.containers[0].args.push(configmapArg);
            }

            const newContainerPort = { containerPort: portNumber, hostPort: portNumber, protocol: protocol};
            dply.body.spec.template.spec.containers[0].ports.push(newContainerPort);
            await k8sAppsApi.replaceNamespacedDeployment(deployName, resourceNamespace, dply.body);
          }
        })
      });
  } catch (error) {
    throw new Error(JSON.stringify(error.body));
  }
}

async function updateExposedService(serviceName, newPortNumber, oldPortNumber) {
  try {
    // get the backend service information
    const backendSvc = await k8sCoreApi.readNamespacedService(serviceName, namespace);
    const svcPort = backendSvc.body.spec.ports[0].port;
    const protocol = backendSvc.body.spec.ports[0].protocol;

    // patch configmap/tcp-service
    const cfgmap = await k8sCoreApi.readNamespacedConfigMap(configMapName, resourceNamespace);
    delete cfgmap.body.data[oldPortNumber];
    cfgmap.body.data = {
      ...cfgmap.body.data,
      [newPortNumber]: `${namespace}/${serviceName}:${svcPort}` 
    };
    await k8sCoreApi.replaceNamespacedConfigMap(configMapName, resourceNamespace, cfgmap.body);

    // patch service/ingress-nginx-controller
    const portName = 'proxied-tcp-' + newPortNumber;
    k8sCoreApi.listNamespacedService(resourceNamespace)
      .then((res) => {
        res.body.items.forEach(async (service) => {
          if (service.metadata.name.includes('ingress-nginx-controller')) {
            const svcName = service.metadata.name;
            const svc = await k8sCoreApi.readNamespacedService(svcName, resourceNamespace);
            svc.body.spec.ports.forEach((svcPort, index) => {
              if (svcPort.port === oldPortNumber) {
                svc.body.spec.ports.splice(index, 1);
              }
            });
            const newPort = { name: portName, port: newPortNumber, targetPort: newPortNumber, protocol: protocol};
            svc.body.spec.ports.push(newPort);
            await k8sCoreApi.replaceNamespacedService(svcName, resourceNamespace, svc.body);
          }
        });
      });

    // patch deployment/ingress-nginx-controller
    k8sAppsApi.listNamespacedDeployment(resourceNamespace)
      .then((res) => {
        res.body.items.forEach(async (deployment) => {
          if (deployment.metadata.name.includes('ingress-nginx-controller')) {
            const deployName = deployment.metadata.name;
            const dply = await k8sAppsApi.readNamespacedDeployment(deployName, resourceNamespace);
            const newContainerPort = { containerPort: newPortNumber, hostPort: newPortNumber, protocol: protocol};

            dply.body.spec.template.spec.containers[0].ports.forEach((contPort, index) => {
              if (contPort.containerPort === oldPortNumber) {
                dply.body.spec.template.spec.containers[0].ports.splice(index, 1);
              }
            })

            dply.body.spec.template.spec.containers[0].ports.push(newContainerPort);
            await k8sAppsApi.replaceNamespacedDeployment(deployName, resourceNamespace, dply.body);
          }
        });
      });
  } catch (error) {
    throw new Error(JSON.stringify(error.body));
  }
}

async function unexposeService(portNumber) {
  try {
    // patch configmap/tcp-service
    const cfgmap = await k8sCoreApi.readNamespacedConfigMap(configMapName, resourceNamespace);
    delete cfgmap.body.data[portNumber];
    await k8sCoreApi.replaceNamespacedConfigMap(configMapName, resourceNamespace, cfgmap.body);

    // patch service/ingress-nginx-controller
    k8sCoreApi.listNamespacedService(resourceNamespace)
      .then((res) => {
        res.body.items.forEach(async (service) => {
          if (service.metadata.name.includes('ingress-nginx-controller')) {
            const svcName = service.metadata.name;
            const svc = await k8sCoreApi.readNamespacedService(svcName, resourceNamespace);
            svc.body.spec.ports.forEach((svcPort, index) => {
              if (svcPort.port === portNumber) {
                svc.body.spec.ports.splice(index, 1);
              }
            });
            await k8sCoreApi.replaceNamespacedService(svcName, resourceNamespace, svc.body);
          }
        });
      });

    // patch deployment/ingress-nginx-controller
    k8sAppsApi.listNamespacedDeployment(resourceNamespace)
      .then((res) => {
        res.body.items.forEach(async (deployment) => {
          if (deployment.metadata.name.includes('ingress-nginx-controller')) {
            const deployName = deployment.metadata.name;
            const dply = await k8sAppsApi.readNamespacedDeployment(deployName, resourceNamespace);
            dply.body.spec.template.spec.containers[0].ports.forEach((contPort, index) => {
              if (contPort.containerPort === portNumber) {
                dply.body.spec.template.spec.containers[0].ports.splice(index, 1);
              }
            })
            await k8sAppsApi.replaceNamespacedDeployment(deployName, resourceNamespace, dply.body);
          }
        });
      });
  } catch (error) {
    throw new Error(JSON.stringify(error.body));
  }
}

/**
 * @swagger
 * /exposeService:
 *   post:
 *     summary: Expose TCP service
 *     description: Exposes a TCP service via nginx-ingress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *                 description: service name to be exposed
 *                 example: mongodb-svc
 *               portNumber:
 *                 type: number
 *                 description: external port number
 *                 example: 10000
 *             required:
 *               - serviceName
 *               - portNumber
 *     responses:
 *       200:
 *         description: Pipeline deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: success message
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */
router.post('/exposeService', async (req, res) => {
  const { serviceName, portNumber } = req.body;

  try {
    await exposeService(serviceName, portNumber);
    res.json({ 'result': 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

/**
 * @swagger
 * /exposeService:
 *   put:
 *     summary: Update exposed TCP service
 *     description: Changes the external port number of a exposed TCP service via nginx-ingress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *                 description: service name to be exposed
 *                 example: mongodb-svc
 *               oldPortNumber:
 *                 type: number
 *                 description: current external port number
 *                 example: 10000
 *               newPortNumber:
 *                 type: number
 *                 description: new external port number
 *                 example: 10010
 *             required:
 *               - serviceName
 *               - oldPortNumber
 *               - newPortNumber
 *     responses:
 *       200:
 *         description: Pipeline deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: success message
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */
router.put('/exposeService', async (req, res) => {
  const { serviceName, newPortNumber, oldPortNumber } = req.body;

  try {
    await updateExposedService(serviceName, newPortNumber, oldPortNumber);
    res.json({ 'result': 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

/**
 * @swagger
 * /exposeService:
 *   delete:
 *     summary: Deletes dxposed TCP service
 *     description: Deletes an exposed TCP service via nginx-ingress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               portNumber:
 *                 type: number
 *                 description: external port number to disable
 *                 example: 10010
 *             required:
 *               - portNumber
 *     responses:
 *       200:
 *         description: Pipeline deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: success message
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */
router.delete('/exposeService', async (req, res) => {
  const { portNumber } = req.body;

  try {
    await unexposeService(portNumber);
    res.json({ 'result': 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
