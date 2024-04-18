const k8s = require('@kubernetes/client-node');

function watchPipelineEvents() {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  let lastResourceVersion = '0';
  let processedEvents = {};

  async function watchEvents() {
    const watch = new k8s.Watch(kc);

    const watchOptions = {
      allowWatchBookmarks: true,
      resourceVersion: lastResourceVersion
    };
    try {
      await watch.watch('/api/v1/events', watchOptions, (type, event) => {
        if (type === 'ADDED' && event.involvedObject.kind === 'TaskRun') {
          var key = event.involvedObject.name;
          if (!processedEvents[key]) {
            console.log('Event: ', key, event.reason);
            processedEvents[key] = event.reason;
            // Here we can call engine endpoint to create a db entry for the taskrun!
          } else if (processedEvents[key] !== event.reason) {
            console.log('Event: ', key, event.reason);
            processedEvents[key] = event.reason;
            // Here we can call engine endpoint to update a db entry for the taskrun!
          }
        }
        lastResourceVersion = event.metadata.resourceVersion;
      });
    } catch (err) {
      console.log('Watch error:', err);
      console.log('Attempting to restart watch...');
      setTimeout(watchEvents, 30000); // Restart watch after a delay of 30s.
    }
    console.log('Last event version:', lastResourceVersion);
    setTimeout(watchEvents, 30000); // Restart watch after a delay of 30s.
  }
  watchEvents(); // Start watching events
}

module.exports = { watchPipelineEvents };
