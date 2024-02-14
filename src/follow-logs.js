const stream = require('stream');
const k8s = require('@kubernetes/client-node');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const namespace = 'kube-system';
const podName = 'etcd-minikube';
const containerName = 'etcd';

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const log = new k8s.Log(kc);

const logStream = new stream.PassThrough();

logStream.on('data', (chunk) => {
    // use write rather than console.log to prevent double line feed
    process.stdout.write(chunk);
});

const main = async () => {
    try {
        // here is the source code for log:
        // https://github.com/kubernetes-client/javascript/blob/master/src/log.ts

        const req = await log.log(namespace, podName, containerName, logStream, {
            follow: true,
            pretty: false,
            timestamps: false,
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

main();
