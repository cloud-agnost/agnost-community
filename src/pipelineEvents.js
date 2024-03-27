const k8s = require('@kubernetes/client-node');

function watchPipelineEvents() {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  let lastResourceVersion = '0';
  let processedEvents = {};

  function watchEvents() {
    const watch = new k8s.Watch(kc);

    const watchOptions = {
      allowWatchBookmarks: true,
      resourceVersion: lastResourceVersion
    };

    watch.watch('/api/v1/events', watchOptions, (type, event) => {
      if (type === 'ADDED' && event.involvedObject.kind === 'TaskRun') {
        if (!processedEvents[event.involvedObject.name]) {
          console.log('Event: ', event.involvedObject.name, event.reason);
          processedEvents[event.involvedObject.name] = event.reason;
          // Here we can call engine endpoint to create a db entry for the taskrun!
        } else if (processedEvents[event.involvedObject.name] !== event.reason) {
          console.log('Event: ', event.involvedObject.name, event.reason);
          processedEvents[event.involvedObject.name] = event.reason;
          // Here we can call engine endpoint to update a db entry for the taskrun!
        }
      }
      if (event.metadata.resourceVersion > lastResourceVersion) {
        lastResourceVersion = event.metadata.resourceVersion;
      }
    }).then(
      () => {
        setTimeout(watchEvents, 10000); // Restart the watch after a delay (e.g., 5000 milliseconds = 5 seconds)
      },
      err => {
        console.error('Watch error:', err);
        console.debug('Attempting to restart watch...');
        setTimeout(watchEvents, 10000); // Restart the watch after a delay (e.g., 5000 milliseconds = 5 seconds)
      }
    );
  }

  watchEvents(); // Start watching events
}

module.exports = { watchPipelineEvents };
