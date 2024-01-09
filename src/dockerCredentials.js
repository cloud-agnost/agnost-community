const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

const namespace = process.env.NAMESPACE;

async function createDockerCredetials(repository, username, password, email) {
  const secretName = 'regcred-' + repository;

  switch(repository) {
    case "docker":
      dockerServer = "https://index.docker.io/v1/";
      break;
    case "gcr":
      dockerServer = "gcr.io";
      // json output should be flattened first, then base64 encoded
      // e.g.: cat private-gcr-user.json | jq -c | base64 -w0
      decodedPass = Buffer.from(password, 'base64');
      password = decodedPass.toString().trim();
      break;
    case "quay":
      dockerServer = "quay.io";
      break;
    case "ghcr":
        dockerServer = "ghcr.io";
        break;
    case "acr":
      // This also needs registry name! <container-registry-name>.azurecr.io
      dockerServer = "";
      break;
    case "ecr":
      // must get AWS details -- Another function is required ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
      dockerServer = "";
      break;
  }

  auth = Buffer.from(username + ':' + password);
  const secretData = Buffer.from('{ "auths": { "' + dockerServer + '": { "username": "' + username + '", "password": "' + password.replace(/[\""]/g, '\\"') + '", "email": "' + email + '", "auth": "' + auth.toString("base64") + '" } } }');

  const regcredSecret = {
    "apiVersion": "v1",
    "data": {
        ".dockerconfigjson": secretData.toString('base64')
    },
    "kind": "Secret",
    "metadata": {
        "name": secretName,
        "namespace": namespace
    },
    "type": "kubernetes.io/dockerconfigjson"
  };

  try {
    await k8sCoreApi.createNamespacedSecret(namespace, regcredSecret);
  } catch (error) {
    console.error('Error creating secret:', error.body);
    throw new Error(JSON.stringify(error.body));
  }
  return 'success';
}

// Create a Docker Credentials for imagePullSecrets
router.post('/dockercredentials', async (req, res) => {
  const { repository, username, password, email } = req.body;

  try {
    await createDockerCredetials(repository, username, password, email);
    res.json({ 'secretName': 'regcred' });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
