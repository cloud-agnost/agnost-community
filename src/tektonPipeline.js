const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const crypto = require('crypto');
const { Octokit } = require('@octokit/core');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAuthApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
const k8sCustomObjectApi = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

const namespace = process.env.NAMESPACE;

async function createWebhook(gitPat, gitRepoUrl, webhookUrl, secretToken) {
  const octokit = new Octokit({ auth: gitPat });
  const path = new URL(gitRepoUrl).pathname;
  
  try {
    var githubHook = await octokit.request('POST /repos' + path + '/hooks', {
      owner: path.split('/')[1],
      repo: path.split('/')[2],
      name: 'web',
      active: true,
      events: [
        'push'
      ],
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: secretToken,
        insecure_ssl: '1'
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log('GitHub repo webhook created');
  } catch (err) {
    console.error('Error creating webhook:', err);
    throw new Error(JSON.stringify(err.body));
  }

  return githubHook.data.id;
}

async function deleteWebhook(gitPat, gitRepoUrl, hookId) {
  const octokit = new Octokit({ auth: gitPat });
  const path = new URL(gitRepoUrl).pathname;
  
  try {
    await octokit.request('DELETE /repos' + path + '/hooks/' + hookId, {
      owner: path.split('/')[1],
      repo: path.split('/')[2],
      hook_id: hookId,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log('GitHub repo webhook deleted');
  } catch (err) {
    console.error('Error deleting webhook:', err);
    throw new Error(JSON.stringify(err.response.data));
  }

  return "success";
}

async function getIngressIp(ingressName) {
  const pollingInterval = 2000;
  const ingressNamespace = 'tekton-builds';
  while (true) {
    try {
      const response = await k8sNetworkingApi.readNamespacedIngress(ingressName, ingressNamespace);
      return response.body.status.loadBalancer.ingress[0].ip;
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

async function createPipeline(gitRepoId, gitRepoType, gitRepoUrl, gitSubPath='/', gitBranch, gitPat, containerRegistry, containerRegistryType, containerRegistryId, containerImageName, appKind, appName) {
  const manifestFilePath = '../manifests/' + gitRepoType + '-pipeline.yaml';
  const manifest = fs.readFileSync(manifestFilePath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  const group = 'triggers.tekton.dev';
  const version = 'v1beta1';
  

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      if (metadata.namespace) {
        var resource_namespace = metadata.namespace;
      }

      var resourceNameSuffix = '-' + gitRepoId;
      resource.metadata.name += resourceNameSuffix;

      switch(kind) {
        case('ServiceAccount'):
          await k8sCoreApi.createNamespacedServiceAccount(resource_namespace, resource);
          break;
        case('Secret'):
          var secretToken = crypto.randomBytes(20).toString('hex');
          resource.stringData.secretToken = secretToken;
          await k8sCoreApi.createNamespacedSecret(resource_namespace, resource);
          break;
        case('ClusterRoleBinding'):
          resource.subjects[0].name += resourceNameSuffix;
          await k8sAuthApi.createClusterRoleBinding(resource);
          break;
        case('RoleBinding'):
          resource.subjects[0].name += resourceNameSuffix;
          await k8sAuthApi.createNamespacedRoleBinding(resource_namespace, resource);
          break;
        case('Ingress'):
          var ingressName = resource.metadata.name;
          resource.spec.rules[0].http.paths[0].path = '/tekton-' + gitRepoId + '(/|$)(.*)';
          resource.spec.rules[0].http.paths[0].backend.service.name += resourceNameSuffix;
          await k8sNetworkingApi.createNamespacedIngress(resource_namespace, resource);
          break;
        case('EventListener'):
          resource.spec.triggers[0].interceptors[0].params[0].value.secretName += resourceNameSuffix;
          resource.spec.triggers[0].interceptors[1].params[0].value = `body.ref == 'refs/heads/${gitBranch}'`;
          resource.spec.triggers[0].bindings[0].ref += resourceNameSuffix;
          resource.spec.triggers[0].template.ref += resourceNameSuffix;
          resource.spec.resources.kubernetesResource.spec.template.spec.serviceAccountName += resourceNameSuffix;
          if (gitSubPath != '/') {
            resource.spec.triggers[0].interceptors[1].params[1].name = 'filter'
            // remove leading slash, if exists
            var path = gitSubPath.replace(/^\/+/, '')
            resource.spec.triggers[0].interceptors[1].params[1].value = `extensions.changed_files.matches("${path}")`;
          } else {
            delete resource.spec.triggers[0].interceptors[1].params[1];
          }
          await k8sCustomObjectApi.createNamespacedCustomObject(group, version, resource_namespace, 'eventlisteners', resource);
          break;
        case('TriggerBinding'):
          resource.spec.params[0].value = appKind;
          resource.spec.params[1].value = appName;
          resource.spec.params[2].value = namespace;
          if (containerRegistryType == 'local') {
            resource.spec.params[3].value = 'local-registry.' + namespace + ":5000";
          } else {
            resource.spec.params[3].value = containerRegistry;
          }
          resource.spec.params[4].value = gitPat;
          resource.spec.params[5].value = gitBranch;
          resource.spec.params[6].value = gitSubPath;
          resource.spec.params[7].value = containerImageName;
          await k8sCustomObjectApi.createNamespacedCustomObject(group, version, resource_namespace, 'triggerbindings', resource);
          break;
        case('TriggerTemplate'):
          if (containerRegistryType == 'local') {
            secretName = 'regcred-local-registry';
          } else {
            secretName = 'regcred-' + containerRegistryType + '-' + containerRegistryId;
          }
          resource.spec.resourcetemplates[0].spec.taskSpec.volumes[0].secret.secretName = secretName;
          resource.spec.resourcetemplates[0].spec.serviceAccountName += resourceNameSuffix;
          await k8sCustomObjectApi.createNamespacedCustomObject(group, version, resource_namespace, 'triggertemplates', resource);
          break;
        default:
          console.log(`!!! Skipping: ${kind}`);
      }
    console.log(`${kind} ${resource.metadata.name} created...`);
    } catch (err) {
      console.error('Error applying resource:', err);
      throw new Error(JSON.stringify(err.body));
    }
  }

  // copy regcred secret from the app's namespace
  try {
    regcred = await k8sCoreApi.readNamespacedSecret(secretName, namespace);
    regcred.body.metadata.namespace = resource_namespace;
    delete regcred.body.metadata.resourceVersion;
    await k8sCoreApi.createNamespacedSecret(resource_namespace, regcred.body);
    console.log('Regcred secret ' + secretName + ' is copied');
  } catch (err)  {
    // do nothing, it might be a second time copy!
  }

  if (gitRepoType == 'github') {
    const ingressIp = await getIngressIp(ingressName);
    var webhookUrl = "http://" + ingressIp + "/tekton-" + gitRepoId;
    const hookid = await createWebhook(gitPat, gitRepoUrl, webhookUrl, secretToken);
    return { "githubHookId": hookid };
  }

  return { "result": "success" };
}


async function deletePipeline(gitRepoId, gitRepoType, gitRepoUrl, gitPat, hookId) {
  const manifestFilePath = '../manifests/' + gitRepoType + '-pipeline.yaml';
  const manifest = fs.readFileSync(manifestFilePath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  const group = 'triggers.tekton.dev';
  const version = 'v1beta1';
  

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      if (metadata.namespace) {
        var resource_namespace = metadata.namespace;
      }

      var resourceNameSuffix = '-' + gitRepoId;
      resource.metadata.name += resourceNameSuffix;

      switch(kind) {
        case('ServiceAccount'):
          await k8sCoreApi.deleteNamespacedServiceAccount(resource.metadata.name, resource_namespace);
          break;
        case('Secret'):
          await k8sCoreApi.deleteNamespacedSecret(resource.metadata.name, resource_namespace);
          break;
        case('ClusterRoleBinding'):
          await k8sAuthApi.deleteClusterRoleBinding(resource.metadata.name);
          break;
        case('RoleBinding'):
          await k8sAuthApi.deleteNamespacedRoleBinding(resource.metadata.name, resource_namespace);
          break;
        case('Ingress'):
          await k8sNetworkingApi.deleteNamespacedIngress(resource.metadata.name, resource_namespace);
          break;
        case('EventListener'):
          await k8sCustomObjectApi.deleteNamespacedCustomObject(group, version, resource_namespace, 'eventlisteners', resource.metadata.name);
          break;
        case('TriggerBinding'):
          await k8sCustomObjectApi.deleteNamespacedCustomObject(group, version, resource_namespace, 'triggerbindings', resource.metadata.name);
          break;
        case('TriggerTemplate'):
          await k8sCustomObjectApi.deleteNamespacedCustomObject(group, version, resource_namespace, 'triggertemplates', resource.metadata.name);
          break;
        default:
          console.log(`!!! Skipping: ${kind}`);
      }
    console.log(`${kind} ${resource.metadata.name} deleted...`);
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw new Error(JSON.stringify(err.body));
    }
  }

  if (gitRepoType == 'github') {
    const hookid = await deleteWebhook(gitPat, gitRepoUrl, hookId);
  }

  return "success";
}


router.post('/tektonPipeline', async (req, res) => {
  const { gitRepoId, gitRepoType, gitRepoUrl, gitSubPath, gitBranch, gitPat, containerRegistry, containerRegistryType, containerRegistryId, containerImageName, appKind, appName } = req.body;

  try {
    const webhookConfig = await createPipeline(gitRepoId, gitRepoType, gitRepoUrl, gitSubPath, gitBranch, gitPat, containerRegistry, containerRegistryType, containerRegistryId, containerImageName, appKind, appName);
    res.json(webhookConfig);
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

router.delete('/tektonPipeline', async (req, res) => {
  const { gitRepoId, gitRepoType, gitRepoUrl, gitPat, hookId} = req.body;

  try {
    await deletePipeline(gitRepoId, gitRepoType, gitRepoUrl, gitPat, hookId);
    res.json({ result: "tekton " + gitRepoType + " pipeline deleted" });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;