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

async function createGithubWebhook(gitPat, gitRepoUrl, webhookUrl, secretToken) {
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

async function deleteGithubWebhook(gitPat, gitRepoUrl, hookId) {
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

async function createGitlabWebhook(gitPat, gitRepoUrl, webhookUrl, secretToken, gitBranch) {
  const gitlabUrl = new URL(gitRepoUrl);
  const apiPath = '/api/v4';
  const projectName = gitlabUrl.pathname.split('/')[2];
  gitlabUrl.pathname = apiPath;
  const gitlabApiBaseUrl = gitlabUrl.toString();

  try {
    // Step 1: Get User ID
    const responseUser = await fetch(`${gitlabApiBaseUrl}/user`, { headers: { 'PRIVATE-TOKEN': gitPat }});
    if (!responseUser.ok) {
      throw new Error('Failed to fetch user data');
    }
    const user = await responseUser.json();
    const userId = user.id;

    // Step 2: Get All Project IDs Owned by User
    const responseProject = await fetch(`${gitlabApiBaseUrl}/users/${userId}/projects`, { headers: { 'PRIVATE-TOKEN': gitPat } });
    if (!responseProject.ok) {
      throw new Error('Failed to fetch project data');
    }
    const projects = await responseProject.json();

    // Step 3: Find Specific Project ID
    const project = projects.find(project => project.name === projectName);
    if (!project) {
      console.error(`Project '${projectName}' not found.`);
      return;
    }
    const projectId = project.id;

    // Step 4: Create Webhook
    const webhookPayload = {
      url: webhookUrl,
      push_events: true,
      issues_events: false,
      merge_requests_events: false,
      tag_push_events: false,
      repository_update_events: false,
      enable_ssl_verification: false,
      token: secretToken,
      push_events_branch_filter: gitBranch
    };
    const response = await fetch(`${gitlabApiBaseUrl}/projects/${projectId}/hooks`, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': gitPat,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const webhook = await response.json();
    return webhook.id;
  } catch (err) {
    console.error('Error:', err);
  }
}

async function deleteGitlabWebhook(gitPat, gitRepoUrl, hookId) {
  const gitlabUrl = new URL(gitRepoUrl);
  const apiPath = '/api/v4';
  const projectName = gitlabUrl.pathname.split('/')[2];
  gitlabUrl.pathname = apiPath;
  const gitlabApiBaseUrl = gitlabUrl.toString();
  
  try {
    // Step 1: Get User ID
    const responseUser = await fetch(`${gitlabApiBaseUrl}/user`, { headers: { 'PRIVATE-TOKEN': gitPat }});
    if (!responseUser.ok) {
      throw new Error('Failed to fetch user data');
    }
    const user = await responseUser.json();
    const userId = user.id;

    // Step 2: Get All Project IDs Owned by User
    const responseProject = await fetch(`${gitlabApiBaseUrl}/users/${userId}/projects`, { headers: { 'PRIVATE-TOKEN': gitPat } });
    if (!responseProject.ok) {
      throw new Error('Failed to fetch project data');
    }
    const projects = await responseProject.json();

    // Step 3: Find Specific Project ID
    const project = projects.find(project => project.name === projectName);
    if (!project) {
      console.error(`Project '${projectName}' not found.`);
      return;
    }
    const projectId = project.id;

    // Step 4: Delete Webhook
    const response = await fetch(`${gitlabApiBaseUrl}/projects/${projectId}/hooks/${hookId}`, {
      method: 'DELETE',
      headers: {
        'PRIVATE-TOKEN': gitPat,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log('GitLab repo webhook deleted');
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

async function createPipeline(pipelineId, gitRepoType, gitRepoUrl, gitSubPath='/', gitBranch, gitPat, containerRegistry, containerRegistryType, containerRegistryId, containerImageName, appKind, appName, dockerfile='Dockerfile') {
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

      var resourceNameSuffix = '-' + pipelineId;
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
          resource.spec.rules[0].http.paths[0].path = '/tekton-' + pipelineId + '(/|$)(.*)';
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
            resource.spec.triggers[0].interceptors[1].params[1].value = `body.commits.exists(c, c.modified.exists(m, m.startsWith("${path}")) || c.added.exists(a, a.startsWith("${path}")) || c.removed.exists(r, r.startsWith("${path}")))`
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
          resource.spec.params[8].value = dockerfile;
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

  const ingressIp = await getIngressIp(ingressName);
  var webhookUrl = "http://" + ingressIp + "/tekton-" + pipelineId;

  switch(gitRepoType) {
    case('github'):
      const githubhookid = await createGithubWebhook(gitPat, gitRepoUrl, webhookUrl, secretToken);
      return { "webHookId": githubhookid };
    case('gitlab'):
      const gitlabhookid = await createGitlabWebhook(gitPat, gitRepoUrl, webhookUrl, secretToken, gitBranch);
      return { "webHookId": gitlabhookid} ;
    default:
      console.log('Unknown repo type:', gitRepoType);
      return { "result": "success" };
  }
}


async function deletePipeline(pipelineId, gitRepoType, gitRepoUrl, gitPat, hookId) {
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

      var resourceNameSuffix = '-' + pipelineId;
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

  switch(gitRepoType) {
    case('github'):
      await deleteGithubWebhook(gitPat, gitRepoUrl, hookId);
      break;
    case('gitlab'):
      await deleteGitlabWebhook(gitPat, gitRepoUrl, hookId);
      break;
    default:
      console.log('Unknown repo type:', gitRepoType);
  }

  return "success";
}

/**
 * @swagger
 * /tektonPipeline:
 *   post:
 *     summary: Creates build and deployment pipeline
 *     description: Creates a build and deployment pipeline on tekton for a GitHub or GitLab repository
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pipelineId:
 *                 type: string
 *                 description: Generated unique repo Id
 *                 example: abcdef1234
 *               gitRepoType:
 *                 type: string
 *                 description: github | gitlab
 *                 example: github
 *               gitRepoUrl:
 *                 type: string
 *                 description: Repo url
 *                 example: https://github.com/koksay/monorepo
 *               gitBranch:
 *                 type: string
 *                 description: Branch name to work on
 *                 example: main
 *               gitSubPath:
 *                 type: string
 *                 description: Sub path to the Dockerfile (by default /Dockerfile is used)
 *                 example: app1
 *               gitPat:
 *                 type: string
 *                 description: Personal access token from GitHub or GitLab
 *               containerRegistryType:
 *                 type: string
 *                 description: local | docker | gcr | gar | quay | ghcr | acr | ecr | generic
 *                 example: ghcr
 *               containerRegistry:
 *                 type: string
 *                 description: Container registry URL (not needed for local type)
 *                 example: ghcr.io/koksay
 *               containerRegistryId:
 *                 type: string
 *                 description: Generated unique registry Id
 *                 example: ab12cd34ef
 *               containerImageName:
 *                 type: string
 *                 description: Name of the container image
 *                 example: my-image-1
 *               appKind:
 *                 type: string
 *                 description: Deployment | StatefulSet | CronJob | KnativeService
 *                 example: Deployment
 *               appName:
 *                 type: string
 *                 description: Name of the application kubernetes object
 *                 example: my-app-deployment
 *               dockerfile:
 *                 type: string
 *                 description: Dockerfile name to build the image (default=Dockerfile)
 *                 example: Dockerfile.dev
 *             required:
 *               - pipelineId
 *               - gitRepoType
 *               - gitRepoUrl
 *               - gitBranch
 *               - gitPat
 *               - containerRegistryType
 *               - containerImageName
 *               - appKind
 *               - appName
 *     responses:
 *       200:
 *         description: Pipeline created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 webHookId:
 *                   type: number
 *                   description: WebhookId returned from GitHub or GitLab. It will be required for deletion
 *                   example: 473456232
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */

router.post('/tektonPipeline', async (req, res) => {
  const { pipelineId, gitRepoType, gitRepoUrl, gitSubPath, gitBranch, gitPat, containerRegistry, containerRegistryType, containerRegistryId, containerImageName, appKind, appName, dockerfile } = req.body;

  try {
    const webhookConfig = await createPipeline(pipelineId, gitRepoType, gitRepoUrl, gitSubPath, gitBranch, gitPat, containerRegistry, containerRegistryType, containerRegistryId, containerImageName, appKind, appName, dockerfile);
    res.json(webhookConfig);
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

/**
 * @swagger
 * /tektonPipeline:
 *   delete:
 *     summary: Deletes the tekton pipeline
 *     description: Deletes build and deployment pipeline and the created webhook on GitHub or GitLab
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pipelineId:
 *                 type: string
 *                 description: Generated unique repo Id
 *                 example: abcdef1234
 *               gitRepoType:
 *                 type: string
 *                 description: github | gitlab
 *                 example: github
 *               gitRepoUrl:
 *                 type: string
 *                 description: Repo url
 *                 example: https://github.com/koksay/monorepo
 *               gitPat:
 *                 type: string
 *                 description: Personal access token from GitHub or GitLab
 *               hookId:
 *                 type: string
 *                 description: Webhook Id from GitHub or GitLab
 *                 example: 473456232
 *             required:
 *               - pipelineId
 *               - gitRepoType
 *               - gitRepoUrl
 *               - gitPat
 *               - hookId
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

router.delete('/tektonPipeline', async (req, res) => {
  const { pipelineId, gitRepoType, gitRepoUrl, gitPat, hookId} = req.body;

  try {
    await deletePipeline(pipelineId, gitRepoType, gitRepoUrl, gitPat, hookId);
    res.json({ result: "tekton " + gitRepoType + " pipeline deleted" });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;