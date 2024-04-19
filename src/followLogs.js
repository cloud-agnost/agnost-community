const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

async function followLogs(podNamespace, podName, containerName) {
    try {
        const logStream = await k8sApi.readNamespacedPodLog(podName, podNamespace, containerName, true);

        console.log('=== start:', containerName, 'on pod', podName, '===');
        console.log(logStream.body);
        console.log('=== end:', containerName, 'on pod', podName, '===');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// Extract namespace and podName from command-line arguments
const [namespace, podName, containerName] = process.argv.slice(2);

// Call followPodLogs with the provided namespace and podName
followLogs(namespace, podName, containerName);
