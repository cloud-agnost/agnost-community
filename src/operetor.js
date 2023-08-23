const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAdmissionApi = kc.makeApiClient(k8s.AdmissionregistrationV1Api);
const k8sAuthApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.ApiextensionsV1Api);

async function doesNamespaceExist(namespaceName) {
  try {
    const response = await k8sCoreApi.listNamespace();
    const namespaces = response.body.items.map(item => item.metadata.name);

    return namespaces.includes(namespaceName);
  } catch (error) {
    console.error('Error checking namespace:', error);
    return false;
  }
}

async function applyManifest(manifestFilePath) {
  const manifest = fs.readFileSync(manifestFilePath, 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      if (metadata.namespace) {
        namespace = metadata.namespace;

        const nsExists = await doesNamespaceExist(namespace)
        if (!nsExists) {
          var namespace_resource = {
              metadata: {
              name: namespace
              }
          };
          const nsResult = await k8sCoreApi.createNamespace(namespace_resource);
          console.log('Namespace ' + namespace + ' created...');
        }
      }

      switch(kind) {
        case 'Deployment':
          const deploymentResult = await k8sApi.createNamespacedDeployment(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case 'Service':
          const serviceResult = await k8sCoreApi.createNamespacedService(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('ServiceAccount'):
          const serviceAccResult = await k8sCoreApi.createNamespacedServiceAccount(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('Secret'):
          const secretResult = await k8sCoreApi.createNamespacedSecret(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('ConfigMap'):
          const configMapResult = await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('ClusterRole'):
          const clusterRoleResult = await k8sAuthApi.createClusterRole(resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('ClusterRoleBinding'):
          const clusterRoleBindingResult = await k8sAuthApi.createClusterRoleBinding(resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('Role'):
          const roleResult = await k8sAuthApi.createNamespacedRole(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('RoleBinding'):
          const roleBindingResult = await k8sAuthApi.createNamespacedRoleBinding(namespace, resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('MutatingWebhookConfiguration'):
          const mutatingWebhookConfResult = await k8sAdmissionApi.createMutatingWebhookConfiguration(resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('ValidatingWebhookConfiguration'):
          const validatingWebHookConfResult = await k8sAdmissionApi.createValidatingWebhookConfiguration(resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        case('CustomResourceDefinition'):
          const crdResult = await k8sCustomApi.createCustomResourceDefinition(resource);
          console.log(kind + ' ' + resource.metadata.name + ' created...');
          break;
        default:
          console.log('Skipping: ' + kind);
      }
      
    } catch (error) {
      console.error('Error applying resource:', error);
    }
  }
  return "success";
}


// Install Extra Operators: postgres | mariadb | kafka | mysql
router.post('/install-operator', async (req, res) => {
  const { operatorName } = req.body;
  const manifestFilePath = '/manifests/operators/' + operatorName + '-operator.yaml';

  try {
    const operatorResult = await applyManifest(manifestFilePath);
    res.json({
      operator: operatorResult.body
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;