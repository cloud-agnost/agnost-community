const express = require('express');
const k8s = require('@kubernetes/client-node');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

const namespace = process.env.NAMESPACE;

// example from https://github.com/kubernetes-client/javascript/blob/master/examples/scale-deployment.js
async function scaleDeployment(deploymentName, replicas) {
  // find the particular deployment
  try {
    res = await k8sApi.readNamespacedDeployment(deploymentName, namespace);
    let deployment = res.body;

    // edit
    deployment.spec.replicas = replicas;

    // replace
    await k8sApi.replaceNamespacedDeployment(deploymentName, namespace, deployment);
  
  } catch (error) {
    throw new Error(JSON.stringify(error.body));
  }
}

// Function to simulate sleep
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function rolloutRestartDeployment(deploymentName) {
  try {
    // Get the current deployment
    const currentDeployment = await k8sApi.readNamespacedDeployment(deploymentName, namespace);

    // Increment the revision in the deployment template to trigger a rollout
    currentDeployment.body.spec.template.metadata.annotations = {
      ...currentDeployment.body.spec.template.metadata.annotations,
      'kubectl.kubernetes.io/restartedAt': new Date().toISOString(),
    };
    console.log(currentDeployment.body.spec.template.metadata.annotations);

    // Apply the changes using the patchNamespacedDeployment function
    const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };
    await k8sApi.patchNamespacedDeployment(deploymentName, namespace, { body: currentDeployment.body }, undefined, undefined, undefined, undefined, undefined, requestOptions)

    console.log(`Rollout restart of deployment ${deploymentName} initiated successfully.`);
  } catch (error) {
    console.error(`Error initiating rollout restart: ${error.message}`);
  }
}

// Scales down the deployment to 0 and then back to 1
// Be careful -- this will not work correctly for deployments with >1 replicas
router.post('/restart', async (req, res) => {
  const { deploymentName } = req.body;

  try {
    await scaleDeployment(deploymentName, 0);
    await sleep(5000)
    await scaleDeployment(deploymentName, 1);
    res.json({"message": "Deployment restarted successfully..."});
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

router.post('/rolloutrestart', async (req, res) => {
  const { deploymentName } = req.body;

  try {
    await rolloutRestartDeployment(deploymentName);
    res.json({"message": "Deployment restarted successfully..."});
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
