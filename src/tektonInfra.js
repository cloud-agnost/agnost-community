const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAuthApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.ApiextensionsV1Api);
const k8sCustomObjectApi = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sAdmissionApi = kc.makeApiClient(k8s.AdmissionregistrationV1Api);
const k8sAutoscalingApi = kc.makeApiClient(k8s.AutoscalingV2Api);

const manifestFilePath = '../manifests/tekton-infra.yaml';


async function applyManifest() {
  const manifest = fs.readFileSync(manifestFilePath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      if (metadata.namespace) {
        namespace = metadata.namespace;
      }

      switch(kind) {
        case 'Namespace':
          await k8sCoreApi.createNamespace(resource);
          break;
        case 'Deployment':
          await k8sAppsApi.createNamespacedDeployment(namespace, resource);
          break;
        case 'Service':
          await k8sCoreApi.createNamespacedService(namespace, resource);
          break;
        case('ServiceAccount'):
          await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          break;
        case('Secret'):
          await k8sCoreApi.createNamespacedSecret(namespace, resource);
          break;
        case('ConfigMap'):
          await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
          break;
        case('ClusterRole'):
          await k8sAuthApi.createClusterRole(resource);
          break;
        case('ClusterRoleBinding'):
          await k8sAuthApi.createClusterRoleBinding(resource);
          break;
        case('Role'):
          await k8sAuthApi.createNamespacedRole(namespace, resource);
          break;
        case('RoleBinding'):
          await k8sAuthApi.createNamespacedRoleBinding(namespace, resource);
          break;
        case('MutatingWebhookConfiguration'):
          await k8sAdmissionApi.createMutatingWebhookConfiguration(resource);
          break;
        case('ValidatingWebhookConfiguration'):
          await k8sAdmissionApi.createValidatingWebhookConfiguration(resource);
          break;
        case('HorizontalPodAutoscaler'):
          await k8sAutoscalingApi.createNamespacedHorizontalPodAutoscaler(namespace, resource);
          break;
        case('ClusterInterceptor'):
          await k8sCustomObjectApi.createClusterCustomObject('triggers.tekton.dev', 'v1alpha1', 'clusterinterceptors', resource);
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

  return "success";
}

async function deleteManifest() {
  const manifest = fs.readFileSync(manifestFilePath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);


  for (const resource of resources.reverse()) {
    try {
      const { kind, metadata } = resource;

      if (metadata.namespace) {
        namespace = metadata.namespace;
      }

      switch(kind) {
        case 'Namespace':
          await k8sCoreApi.deleteNamespace(resource.metadata.name);
          break;
        case 'Deployment':
          await k8sAppsApi.deleteNamespacedDeployment(resource.metadata.name, namespace);
          break;
        case 'Service':
          await k8sCoreApi.deleteNamespacedService(resource.metadata.name, namespace);
          break;
        case('ServiceAccount'):
          await k8sCoreApi.deleteNamespacedServiceAccount(resource.metadata.name, namespace);
          break;
        case('Secret'):
          await k8sCoreApi.deleteNamespacedSecret(resource.metadata.name, namespace);
          break;
        case('ConfigMap'):
          await k8sCoreApi.deleteNamespacedConfigMap(resource.metadata.name, namespace);
          break;
        case('ClusterRole'):
          await k8sAuthApi.deleteClusterRole(resource.metadata.name);
          break;
        case('ClusterRoleBinding'):
          await k8sAuthApi.deleteClusterRoleBinding(resource.metadata.name);
          break;
        case('Role'):
          await k8sAuthApi.deleteNamespacedRole(resource.metadata.name, namespace);
          break;
        case('RoleBinding'):
          await k8sAuthApi.deleteNamespacedRoleBinding(resource.metadata.name, namespace);
          break;
        case('ClusterInterceptor'):
          await k8sCustomObjectApi.deleteClusterCustomObject('triggers.tekton.dev', 'v1alpha1', 'clusterinterceptors', resource.metadata.name);
          break;
        case('MutatingWebhookConfiguration'):
          await k8sAdmissionApi.deleteMutatingWebhookConfiguration(resource.metadata.name);
          break;
        case('ValidatingWebhookConfiguration'):
          await k8sAdmissionApi.deleteValidatingWebhookConfiguration(resource.metadata.name);
          break;
        case('HorizontalPodAutoscaler'):
          await k8sAutoscalingApi.deleteNamespacedHorizontalPodAutoscaler(resource.metadata.name, namespace);
          break;
        default:
          console.log(`Skipping: ${kind}`);
      }
    console.log(`${kind} ${resource.metadata.name} deleted...`);
    } catch (err) {
      console.error('Error applying resource:', err);
      throw new Error(JSON.stringify(err.body));
    }
  }
  return "success";
}

router.post('/tektonInfra', async (req, res) => {
  try {
    await applyManifest();
    res.json({ result: "tekton-operator installed" });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Delete tekton operator
router.delete('/tektonInfra', async (req, res) => {
  try {
    await deleteManifest();
    res.json({ result: "tekton-operator deleted" });
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;

