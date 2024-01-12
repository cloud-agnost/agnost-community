const express = require('express');
const k8s = require('@kubernetes/client-node');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sExtensionsApi = kc.makeApiClient(k8s.NetworkingV1Api);

const namespace = process.env.NAMESPACE;

ingress_list = ['engine-realtime-ingress', 'platform-core-ingress', 'platform-sync-ingress', 'studio-ingress'];

async function createCustomDomain(domainName) {
  const issuer = {
    "apiVersion": "cert-manager.io/v1",
    "kind": "Issuer",
    "metadata": {
        "name": "letsencrypt-issuer-prod",
        "namespace": namespace,
    },
    "spec": {
        "acme": {
            "privateKeySecretRef": {
                "name": "letsencrypt-issuer-key"
            },
            "server": "https://acme-v02.api.letsencrypt.org/directory",
            "solvers": [
                {
                    "http01": {
                        "ingress": {
                            "ingressClassName": "nginx"
                        }
                    }
                }
            ]
        }
    }
  };
  
  await k8sCustomApi.createNamespacedCustomObject('cert-manager.io', 'v1', namespace, 'issuers', issuer)
    .then((response) => {
      console.log('Issuer created:', response.body.metadata.name);
    })
    .catch((err) => {
      console.error('Error creating Issuer:', err);
    });

  ingress_list.forEach(async (ingress) => {
    const ing = await k8sExtensionsApi.readNamespacedIngress(ingress, namespace);

    ing.body.metadata.annotations["nginx.ingress.kubernetes.io/ssl-redirect"] = "true";
    ing.body.metadata.annotations["nginx.ingress.kubernetes.io/force-ssl-redirect"] = "true";
    ing.body.metadata.annotations["cert-manager.io/issuer"] = "letsencrypt-issuer-prod"

    ing.body.spec.rules[0].host = domainName;
    ing.body.spec.tls = [
      { 
        "hosts": [
          domainName
        ],
        "secretName": "ingress-tls"
      }
    ];

    const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };
    await k8sExtensionsApi.patchNamespacedIngress(ingress, namespace, ing.body, undefined, undefined, undefined, undefined, undefined, requestOptions)
      .then((response) => {
        console.log('Ingress is updated:' , response.body.metadata.name);
      })
      .catch((err) => {
        console.error('Error updating ingress:', err);
      });

  });

  // Digital Ocean requires certain annotation on the Ingress LoadBalancer service
  // This code assumes the LB service is running on the ingress-nginx namespace
  k8sCoreApi.listNamespacedService('ingress-nginx')
    .then((res) => {
      res.body.items.forEach(async (service) => {
        const svc = await k8sCoreApi.readNamespacedService(service.metadata.name, 'ingress-nginx');
        if (svc.body.metadata.annotations["service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol"] == "true") {
          svc.body.metadata.annotations["service.beta.kubernetes.io/do-loadbalancer-hostname"] = domainName;
          const options = { headers: { 'Content-Type': 'application/merge-patch+json' }, };
          await k8sCoreApi.patchNamespacedService(service.metadata.name, 'ingress-nginx', svc.body, undefined, undefined, undefined, undefined, undefined, options)
            .then((response) => {
              console.log('Ingress Service is updated for Digital Ocean:' , response.body.metadata.name);
            })
            .catch((err) => {
              console.error('Error updating ingress for Digital Ocean:', err);
            });
        }
      });
    })
    .catch((err) => {
      console.error('Error:', err);
  });

  return "success";
}

async function removeCustomDomain(domainName) {
  ingress_list.forEach(async (ingress) => {
    const ing = await k8sExtensionsApi.readNamespacedIngress(ingress, namespace);

    delete ing.body.metadata.annotations["nginx.ingress.kubernetes.io/ssl-redirect"];
    delete ing.body.metadata.annotations["nginx.ingress.kubernetes.io/force-ssl-redirect"];
    delete ing.body.metadata.annotations["cert-manager.io/issuer"];

    delete ing.body.spec.rules[0].host;
    delete ing.body.spec.tls;

    const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };
    await k8sExtensionsApi.replaceNamespacedIngress(ingress, namespace, ing.body, undefined, undefined, undefined, undefined, undefined, requestOptions)
      .then((response) => {
        console.log('Ingress is updated: ', response.body.metadata.name);
      })
      .catch((err) => {
        console.error('Error updating Ingress: ', err);
      });
  });


  await k8sCustomApi.deleteNamespacedCustomObject('cert-manager.io', 'v1', namespace, 'issuers', 'letsencrypt-issuer-prod')
  .then((response) => {
    console.log('Issuer deleted:', response.body);
  })
  .catch((err) => {
    console.error('Error deleting Issuer:', err);
  });

  return "success";
}


// Create a Custom Domain and Update Ingresses
router.post('/customdomain', async (req, res) => {
  const { domainName } = req.body;

  try {
    await createCustomDomain(domainName);
    response = { 'domainName': domainName };
    res.json(response);
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Removes Custom Domain Configuration Update Ingresses
router.delete('/customdomain', async (req, res) => {
  const { domainName } = req.body;

  try {
    await removeCustomDomain(domainName);
    response = { 'domainName': domainName };
    res.json(response);
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
