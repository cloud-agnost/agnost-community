const express = require('express');
const k8s = require('@kubernetes/client-node');

const router = express.Router();

// Kubernetes client configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

const namespace = process.env.NAMESPACE;

async function resizeMinio(newSize) {
  const pvcPatch = {
    spec: {
      resources: {
        requests: {
          storage: newSize
        }
      }
    }
  };
  const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

  try {
    for (i of ['0', '1', '2', '3']) {
      const pvcName = 'export-minio-storage-' + i;
      await k8sCoreApi.patchNamespacedPersistentVolumeClaim(pvcName, namespace, pvcPatch, undefined, undefined, undefined, undefined, undefined, requestOptions);
      console.log('PersistentVolumeClaim ' + pvcName + ' was updated...');
    };
  } catch (error){
    console.error('Error updating minio PVC size: ', error.body);
    throw new Error(JSON.stringify(error.body));
  }

  return 'success';
}

// resize MinIO PVC size
router.put('/resizeMinio', async (req, res) => {
  const { newSize } = req.body;

  try {
    await resizeMinio(newSize);
    res.json({ 'newSize': newSize });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
