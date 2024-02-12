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

async function createAwsResources(awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, regcredSecretName, repoId) {
  const manifest = fs.readFileSync('/manifests/awsEcr.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  const awsSecretName = 'aws-ecr-secrets-' + repoId;
  const awsConfigMapName = 'regcred-rotate-cm-' + repoId;
  const serviceAccountName = 'sa-regcred-rotate-' + repoId;
  const roleName = 'role-update-ecr-secret-' + repoId;
  const roleBindingName = 'regcred-rotate-role-binding-' + repoId;
  const cronJobName = 'regcred-rotate-' + repoId;

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'Secret':
          resource.metadata.name = awsSecretName;
          resource.stringData.AWS_ACCESS_KEY_ID = awsAccessKeyId;
          resource.stringData.AWS_SECRET_ACCESS_KEY = awsSecretAccessKey;
          await k8sCoreApi.createNamespacedSecret(namespace, resource);
          console.log('AWS Secret is created');
          break;
        case 'ConfigMap':
          resource.metadata.name = awsConfigMapName;
          resource.data.AWS_REGION = awsRegion;
          resource.data.AWS_ACCOUNT = awsAccount;
          resource.data.DOCKER_SECRET_NAME = regcredSecretName;
          await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
          console.log('AWS ConfigMap is created');
          break;
        case('ServiceAccount'):
          resource.metadata.name = serviceAccountName;
          await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          console.log('AWS CronJob Service Account is created');
          break;
        case 'Role':
          resource.metadata.name = roleName;
          resource.rules[0].resourceNames = [ regcredSecretName ];
          await rbacApi.createNamespacedRole(namespace, resource);
          console.log('AWS CronJob Role is created');
          break;
        case 'RoleBinding':
          resource.metadata.name = roleBindingName;
          resource.subjects[0].name = serviceAccountName;
          resource.roleRef.name = roleName;
          await rbacApi.createNamespacedRoleBinding(namespace, resource);
          console.log('AWS CronJob Role Binding is created');
          break;
        case 'CronJob':
          resource.metadata.name = cronJobName;
          resource.spec.jobTemplate.spec.template.spec.containers[0].envFrom[0].secretRef.name = awsSecretName
          resource.spec.jobTemplate.spec.template.spec.containers[0].envFrom[1].configMapRef.name = awsConfigMapName;
          await batchApi.createNamespacedCronJob(namespace, resource);
          console.log('AWS CronJob is created');
          break;
      }
    } catch (error) {
      console.error('Error applying resource:', error.body);
      throw new Error(JSON.stringify(error.body));
    }
  }
}


// This can update the AWS ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION and ACCOUNT
async function updateAwsResources(awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, repoId) {
  const awsSecretName = 'aws-ecr-secrets-' + repoId;
  const awsConfigMapName = 'regcred-rotate-cm-' + repoId;

  // Update Secret
  try {
    const secret = await k8sCoreApi.readNamespacedSecret(awsSecretName, namespace);
    secret.body.data.AWS_ACCESS_KEY_ID = Buffer.from(awsAccessKeyId).toString('base64');
    secret.body.data.AWS_SECRET_ACCESS_KEY = Buffer.from(awsSecretAccessKey).toString('base64');
    await k8sCoreApi.replaceNamespacedSecret(awsSecretName, namespace, secret.body);
  } catch (error) {
    console.error('Error updating secret: ' + awsSecretName, error.body);
    throw new Error(JSON.stringify(error.body));
  }

  // Update ConfigMap
  try {
    const cfgmap = await k8sCoreApi.readNamespacedConfigMap(awsConfigMapName, namespace);
    cfgmap.body.data.AWS_REGION = awsRegion;
    cfgmap.body.data.AWS_ACCOUNT = awsAccount;
    await k8sCoreApi.replaceNamespacedConfigMap(awsConfigMapName, namespace, cfgmap.body);
  } catch (error) {
    console.error('Error updating configmap: ' + awsConfigMapName, error.body);
    throw new Error(JSON.stringify(error.body));
  }
}

async function deleteAwsResources(repoId) {
  const awsSecretName = 'aws-ecr-secrets-' + repoId;
  const awsConfigMapName = 'regcred-rotate-cm-' + repoId;
  const serviceAccountName = 'sa-regcred-rotate-' + repoId;
  const roleName = 'role-update-ecr-secret-' + repoId;
  const roleBindingName = 'regcred-rotate-role-binding-' + repoId;
  const cronJobName = 'regcred-rotate-' + repoId;

  try {
    await batchApi.deleteNamespacedCronJob(cronJobName, namespace);
    console.log('AWS CronJob is deleted');
    await rbacApi.deleteNamespacedRoleBinding(roleBindingName, namespace);
    console.log('AWS CronJob Role Binding is deleted');
    await rbacApi.deleteNamespacedRole(roleName, namespace);
    console.log('AWS CronJob Role is deleted');
    await k8sCoreApi.deleteNamespacedServiceAccount(serviceAccountName, namespace);
    console.log('AWS CronJob Service Account is deleted');
    await k8sCoreApi.deleteNamespacedConfigMap(awsConfigMapName, namespace);
    console.log('AWS ConfigMap is deleted');
    await k8sCoreApi.deleteNamespacedSecret(awsSecretName, namespace);
    console.log('AWS Secret is deleted');
  } catch (error) {
    console.error('Error applying resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }
}

async function createDockerCredetials(repoId, repository, username, password, email, gcpRegion, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, genericRepoUrl) {
  const secretName = 'regcred-' + repository + '-' + repoId;

  switch(repository) {
    case "docker":
      dockerServer = "https://index.docker.io/v1/";
      break;
    case "gcr":    // Google Container Registry -- will shut down on May 15, 2024
      if (gcpRegion) {
        dockerServer = gcpRegion + ".gcr.io";
      } else {
        dockerServer = "gcr.io";
      };
      decodedPass = Buffer.from(password, 'base64');
      password = decodedPass.toString().trim().replace(/\n/g, "");
      break;
    case "gar":   // Google Artifact Registry
      dockerServer = "https://" + gcpRegion + "-docker.pkg.dev";
      decodedPass = Buffer.from(password, 'base64');
      password = decodedPass.toString().trim().replace(/\n/g, "");
      break;
    case "quay": // Red Hat Quay
      dockerServer = "quay.io";
      break;
    case "ghcr":  // GitHub Registry
        dockerServer = "ghcr.io";
        break;
    case "acr":   // Azure Container Registry
      dockerServer = azureContainerRegistryName + ".azurecr.io";
      break;
    case "ecr":   // AWS Elastic Container Registry
      dockerServer = awsAccount + ".dkr.ecr." + awsRegion + ".amazonaws.com";
      await createAwsResources(awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, secretName, repoId);
      break;
    case "generic": // For other possible server, genericRepoUrl needs to be provided
      dockerServer = genericRepoUrl;
      break;
  }

  auth = Buffer.from(username + ':' + password);
  const secretData = Buffer.from('{"auths":{"' + dockerServer + '":{"username":"' + username + '","password":"' + password.replace(/[\""]/g, '\\"') + '","email":"' + email + '","auth":"' + auth.toString("base64") + '"}}}');

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
    console.log("Secret " + secretName + " is created");
  } catch (error) {
    console.error('Error creating secret:', error.body);
    throw new Error(JSON.stringify(error.body));
  }
  return 'success';
}

async function updateDockerCredetials(repoId, repository, username, password, email, gcpRegion, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, genericRepoUrl) {
  const secretName = 'regcred-' + repository + '-' + repoId;

  switch(repository) {
    case "docker":
      dockerServer = "https://index.docker.io/v1/";
      break;
    case "gcr":    // Google Container Registry -- will shut down on May 15, 2024
      if (gcpRegion) {
        dockerServer = gcpRegion + ".gcr.io";
      } else {
        dockerServer = "gcr.io";
      };
      decodedPass = Buffer.from(password, 'base64');
      password = decodedPass.toString().trim().replace(/\n/g, "");
      break;
    case "gar":   // Google Artifact Registry
      dockerServer = "https://" + gcpRegion + "-docker.pkg.dev";
      decodedPass = Buffer.from(password, 'base64');
      password = decodedPass.toString().trim().replace(/\n/g, "");
      break;
    case "quay": // Red Hat Quay
      dockerServer = "quay.io";
      break;
    case "ghcr":  // GitHub Registry
        dockerServer = "ghcr.io";
        break;
    case "acr":   // Azure Container Registry
      dockerServer = azureContainerRegistryName + ".azurecr.io";
      break;
    case "ecr":   // AWS Elastic Container Registry
      dockerServer = awsAccount + ".dkr.ecr." + awsRegion + ".amazonaws.com";
      await updateAwsResources(awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, repoId);
      break;
    case "generic": // For other possible server, genericRepoUrl needs to be provided
      dockerServer = genericRepoUrl;
      break;
  }

  auth = Buffer.from(username + ':' + password);
  const secretData = Buffer.from('{"auths":{"' + dockerServer + '":{"username":"' + username + '","password":"' + password.replace(/[\""]/g, '\\"') + '","email":"' + email + '","auth":"' + auth.toString("base64") + '"}}}');

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
    await k8sCoreApi.replaceNamespacedSecret(secretName, namespace, regcredSecret);
    console.log("Secret " + secretName + " is updated");
  } catch (error) {
    console.error('Error updating secret:', error.body);
    throw new Error(JSON.stringify(error.body));
  }
  return 'success';
}

async function deleteDockerCredetials(repoId, repository) {
  const secretName = 'regcred-' + repository + '-' + repoId;

  try {
    await k8sCoreApi.deleteNamespacedSecret(secretName, namespace);
    console.log("Secret " + secretName + " is deleted");
  } catch (err){
    console.error('Error deleting secret:', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  if (repository == 'ecr') {
    await deleteAwsResources(repoId, repository);
  }
}


// Create a Docker Credentials for imagePullSecrets
router.post('/dockercredentials', async (req, res) => {
  const { repoId, repository, username, password, email, gcpRegion, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, genericRepoUrl} = req.body;

  try {
    await createDockerCredetials(repoId, repository, username, password, email, gcpRegion, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, genericRepoUrl);
    res.json({ 'secretName': 'regcred-' + repository + '-' + repoId });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

// Update a Docker Credentials for imagePullSecrets
router.put('/dockercredentials', async (req, res) => {
  const { repoId, repository, username, password, email, gcpRegion, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, genericRepoUrl} = req.body;

  try {
    await updateDockerCredetials(repoId, repository, username, password, email, gcpRegion, azureContainerRegistryName, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsAccount, genericRepoUrl);
    res.json({ 'secretName': 'regcred-' + repository + '-' + repoId });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});


// Delete a Docker Credentials for imagePullSecrets
router.delete('/dockercredentials', async (req, res) => {
  const { repoId, repository} = req.body;

  try {
    await deleteDockerCredetials(repoId, repository);
    res.json({ 'secretName': 'regcred-' + repository + '-' + repoId  });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});


module.exports = router;
