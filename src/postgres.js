const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

const group = 'acid.zalan.do';
const version = 'v1';
const namespace = process.env.NAMESPACE;
const plural = 'postgresqls';

async function createPostgresql(serverName, dbVersion, size, numInstances) {
  const manifest = fs.readFileSync('/manifests/postgres.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  for (const resource of resources) {
    try {
      const { kind, metadata } = resource;

      switch(kind) {
        case 'postgresql':
          resource.metadata.name = serverName;
          resource.spec.numberOfInstances = numInstances;
          resource.spec.volume.size = size;
          resource.spec.postgresql.version = dbVersion;
          await k8sCustomApi.createNamespacedCustomObject(group, version, namespace, plural, resource);
          break;
        default:
          console.log('Skipping: ' + kind);
      }
    console.log(kind + ' ' + resource.metadata.name + ' created...'); 
    
    } catch (error) {
      console.error('Error applying resource:', error.body);
      throw new Error(JSON.stringify(error.body));
    }
  }
  return 'success';
}

async function updatePostgresql(serverName, dbVersion, size, numInstances) {
  const patchData = {
    spec: {
      postgresql: {
        version: dbVersion
      },
      numberOfInstances: numInstances,
      volume: {
        size: size
      }
    }
  };

  const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

  try {
    await k8sCustomApi.patchNamespacedCustomObject(group, version, namespace, plural, serverName, patchData, undefined, undefined, undefined, requestOptions);
    console.log('PostgreSQL ' + serverName + ' updated...');
  } catch (error){
    console.error('Error applying resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  return 'success';
}

async function deletePostgresql(serverName) {
  try {
    await k8sCustomApi.deleteNamespacedCustomObject(group, version, namespace, plural, serverName);
    console.log('PostgreSQL ' + serverName + ' deleted...');
  } catch (error) {
    console.error('Error applying resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  return 'success';
}

async function rolloutRestart(resourceName) {
  try {
    const pgsql = await k8sCustomApi.getNamespacedCustomObject(group, version, namespace, plural, resourceName);

    // Increment the revision in the deployment template to trigger a rollout
    pgsql.body.spec.podAnnotations = {
      ...pgsql.body.spec.podAnnotations,
      'kubectl.kubernetes.io/restartedAt': new Date().toISOString(),
    };

    await k8sCustomApi.replaceNamespacedCustomObject(group, version, namespace, plural, resourceName, pgsql.body);
    console.log(`Rollout restart ${resourceName} initiated successfully.`);
  } catch (error) {
    console.error('Error restarting resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }
}

// some helper functions
async function waitForSecret(secretName) {
  const pollingInterval = 2000;
  while (true) {
    try {
      const response = await k8sCoreApi.readNamespacedSecret(secretName, namespace);
      return response.body.data.password;
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

// Create a PostgreSQL Instance
router.post('/postgres', async (req, res) => {
  const { serverName, dbVersion, size, numInstances } = req.body;

  try {
    await createPostgresql(serverName, dbVersion, size, numInstances);
    var secretName = 'postgres.' + serverName + '.credentials.postgresql.acid.zalan.do';
    passWord = await waitForSecret(secretName);

    response = numInstances > 1 ? { 'connectionStringMaster': serverName + '.' + namespace + '.svc.cluster.local',
                                    'connectionStringReplicas': serverName + '-repl.' + namespace + '.svc.cluster.local',
                                    'password': Buffer.from(passWord, 'base64').toString('utf-8') }
                                : { 'connectionStringMaster': serverName + '.' + namespace + '.svc.cluster.local',
                                    'password': Buffer.from(passWord, 'base64').toString('utf-8') };
    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

// Update a PostgreSQL Instance
router.put('/postgres', async (req, res) => {
  const { serverName, dbVersion, size, numInstances } = req.body;

  try {
    await updatePostgresql(serverName, dbVersion, size, numInstances);
    var secretName = 'postgres.' + serverName + '.credentials.postgresql.acid.zalan.do';
    passWord = await waitForSecret(secretName);

    response = numInstances > 1 ? { 'connectionStringMaster': serverName + '.' + namespace + '.svc.cluster.local',
                                    'connectionStringReplicas': serverName + '-repl.' + namespace + '.svc.cluster.local',
                                    'password': Buffer.from(passWord, 'base64').toString('utf-8') }
                                : { 'connectionStringMaster': serverName + '.' + namespace + '.svc.cluster.local',
                                    'password': Buffer.from(passWord, 'base64').toString('utf-8') };
    res.json(response);
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Delete a PostgreSQL instance
router.delete('/postgres', async (req, res) => {
  const { serverName } = req.body;

  try {
    await deletePostgresql(serverName);
    res.json({ postgres: "deleted"});
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

// Restart a PostgreSQL instance
router.post('/postgres/restart', async (req, res) => {
  const { serverName } = req.body;

  try {
    await rolloutRestart(serverName);
    res.json({ postgres: "restarted"});
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
