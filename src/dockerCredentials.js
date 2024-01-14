const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const rbacApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
const batchApi = kc.makeApiClient(k8s.BatchV1Api);

const namespace = process.env.NAMESPACE;

async function createAwsResources(awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, regcredSecretName) {
  const manifest = fs.readFileSync('../manifests/awsEcr.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'Secret':
          resource.stringData.AWS_ACCESS_KEY_ID = awsAccessKeyId;
          resource.stringData.AWS_SECRET_ACCESS_KEY = awsSecretAccessKey;
          await k8sCoreApi.createNamespacedSecret(namespace, resource);
          console.log('AWS Secret is created');
          break;
        case 'ConfigMap':
          resource.data.AWS_REGION = awsRegion;
          resource.data.AWS_ACCOUNT = awsAccount;
          resource.data.DOCKER_SECRET_NAME = regcredSecretName;
          await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
          console.log('AWS ConfigMap is created');
          break;
        case 'CronJob':
          await batchApi.createNamespacedCronJob(namespace, resource);
          console.log('AWS CronJob is created');
          break;
        case('ServiceAccount'):
          await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          console.log('AWS CronJob Service Account is created');
          break;
        case 'Role':
          await rbacApi.createNamespacedRole(namespace, resource);
          console.log('AWS CronJob Role is created');
          break;
        case 'RoleBinding':
          await rbacApi.createNamespacedRoleBinding(namespace, resource);
          console.log('AWS CronJob Role Binding is created');
          break;
      }
    } catch (error) {
      console.error('Error applying resource:', error.body);
      throw new Error(JSON.stringify(error.body));
    }
  }
}

async function createDockerCredetials(repository, username, password, email, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount) {
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
      dockerServer = azureContainerRegistryName + ".azurecr.io";
      break;
    case "ecr":
      dockerServer = awsAccount + ".dkr.ecr." + awsRegion + ".amazonaws.com";
      await createAwsResources(awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, secretName);
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
  const { repository, username, password, email, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount } = req.body;

  try {
    await createDockerCredetials(repository, username, password, email, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount);
    res.json({ 'secretName': 'regcred' });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
