export const clusterComponents = [
    {
        deploymentName: "engine-worker-deployment",
        hpaName: "engine-worker-hpa",
        title: "Engine Worker",
        hasHPA: true,
        editable: true,
        type: "Node.js",
        k8sType: "Deployment",
        description: t(
            "Handles the deployment of the application design to the databases, API servers, and cron job scheduler."
        ),
    },
    {
        deploymentName: "engine-monitor-deployment",
        title: "Engine Monitor",
        hasHPA: false,
        editable: false,
        type: "Node.js",
        k8sType: "Deployment",
        description: t(
            "Monitors and checks the health of all Agnost cluster resources, including the ones created within the cluster and the externally linked ones."
        ),
    },
    {
        deploymentName: "engine-realtime-deployment",
        hpaName: "engine-realtime-hpa",
        title: "Engine Realtime",
        hasHPA: true,
        editable: true,
        type: "Node.js",
        k8sType: "Deployment",
        description: t("Socket.io server of the apps that utilize realtime features of the cluster."),
    },
    {
        deploymentName: "engine-scheduler-deployment",
        title: "Engine Scheduler",
        hasHPA: false,
        editable: false,
        type: "Node.js",
        k8sType: "Deployment",
        description: t("Manages the cron jobs defined in application versions."),
    },
    {
        deploymentName: "platform-core-deployment",
        hpaName: "platform-core-hpa",
        title: "Platform Core",
        hasHPA: true,
        editable: true,
        type: "Node.js",
        k8sType: "Deployment",
        description: t(
            "The API server of the cluster. It handles cluster user registration, organization, app, and version creation, and for each version, management of data models, endpoints, cron jobs, message queues, and storage etc."
        ),
    },
    {
        deploymentName: "platform-sync-deployment",
        hpaName: "platform-sync-hpa",
        title: "Platform Sync",
        hasHPA: true,
        editable: true,
        type: "Node.js",
        k8sType: "Deployment",
        description: t(
            "Socket.io realtime server of the platform. It is primarily used to send realtime messages about design and code changes of developed applications."
        ),
    },
    {
        deploymentName: "platform-worker-deployment",
        hpaName: "platform-worker-hpa",
        title: "Platform Worker",
        hasHPA: true,
        editable: true,
        type: "Node.js",
        k8sType: "Deployment",
        description: t("Performs asynchronous tasks on behalf of the Platform Core."),
    },
    {
        deploymentName: "studio-deployment",
        hpaName: "studio-hpa",
        title: "Studio",
        hasHPA: true,
        editable: true,
        type: "React",
        k8sType: "Deployment",
        description: t(
            "Platform's front-end to manage settings, resources, and users of the cluster and create and deploy new applications."
        ),
    },
    {
        name: "mongodb",
        title: "Platform Database",
        hasHPA: false,
        editable: false,
        type: "MongoDB",
        k8sType: "StatefulSet",
        description: t(
            "Store all data about application versions, design specifications, endpoint code, etc., and used as the single source of truth."
        ),
    },
    {
        name: "rabbitmq-server",
        title: "Platform Message Broker",
        hasHPA: false,
        editable: false,
        type: "RabbitMQ",
        k8sType: "StatefulSet",
        description: t(
            "Manages the asynchronous task queues to perform data model deployments and application code push to API servers."
        ),
    },
    {
        name: "redis-master",
        title: "Platform Cache",
        hasHPA: false,
        editable: false,
        type: "Redis",
        k8sType: "StatefulSet",
        description: t("Caches a subset of MongoDB data to speed up application design data retrieval."),
    },
    {
        deploymentName: "minio",
        title: "Platform Storage",
        hasHPA: false,
        editable: false,
        type: "MinIO",
        k8sType: "Deployment",
        description: t(
            "Handles the document storage needs of the Agnost platform itself and the storage needs of the developed applications."
        ),
    },
];
