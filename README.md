# How to Manage Resources

## MongoDB

### Create mongodb

```bash
curl -XPOST http://localhost:3000/mongodb -d '{
    "mongoName": "mymongo",
    "mongoVersion": "6.0.4",
    "size": "5Gi",
    "userName": "appuser",
    "passwd": "P4sSW0rD",
    "replicaCount": 1
}' -H "Content-type: application/json"
```

### Update mongodb

```bash
## Change for version and replicaCount
curl -XPUT http://localhost:3000/mongodb -d '{
    "mongoName": "mymongo",
    "mongoVersion": "6.0.5",
    "size": "5Gi",
    "replicaCount": 3
}' -H "Content-type: application/json"
```

```bash
## Change for size
curl -XPUT http://localhost:3000/mongodb -d '{
    "mongoName": "mymongo",
    "mongoVersion": "6.0.5",
    "size": "10Gi",
    "replicaCount": 3
}' -H "Content-type: application/json"
```

### Delete mongodb

```bash
curl -XDELETE http://localhost:3000/mongodb -d '{
    "mongoName": "mymongo"
}' -H "Content-type: application/json"
```

### Restart mongodb

```bash
curl -XPOST http://localhost:3000/mongodb/restart -d '{
    "mongoName": "mymongo"
}' -H "Content-type: application/json"
```

## Redis

### Create standalone redis

```bash
curl -XPOST http://localhost:3000/redis -d '{
    "clusterName": "standalone",
    "version": "7.2.0",
    "size": "1Gi",
    "passwd": "P4sSW0rD",
    "readReplicaEnabled": false
}' -H "Content-type: application/json"
```

### Create redis with read replica

```bash
curl -XPOST http://localhost:3000/redis -d '{
    "clusterName": "replicated",
    "version": "7.2.0",
    "size": "1Gi",
    "passwd": "P4sSW0rD",
    "readReplicaEnabled": true
}' -H "Content-type: application/json"
```

### Update redis

```bash
curl -XPUT http://localhost:3000/redis -d '{
    "clusterName": "replicated",
    "version": "7.2.1",
    "size": "2Gi",
    "readReplicaEnabled": true
}' -H "Content-type: application/json"
```

### Delete redis

```bash
curl -XDELETE http://localhost:3000/redis -d '{
    "clusterName": "replicated"
}' -H "Content-type: application/json"
```

### Restart redis

```bash
curl -XPOST http://localhost:3000/redis/restart -d '{
    "clusterName": "replicated"
}' -H "Content-type: application/json"
```

## MariaDB

### Create mariadb

```bash
curl -XPOST http://localhost:3000/mariadb -d '{
    "serverName": "mariadb",
    "dbName": "app",
    "dbVersion": "11.0.3",
    "replicaCount": 1,
    "size": "5Gi",
    "userName": "appuser",
    "passwd": "P4sSW0rD",
    "rootPasswd": "r00tP4sSW0rD"
}' -H "Content-type: application/json"
```

### Update mariadb

> Make sure to change the replicaCount and size on different calls.

```bash
## Change for version and replicaCount
curl -XPUT http://localhost:3000/mariadb -d '{
    "serverName": "mariadb",
    "replicaCount": 3,
    "size": "5Gi",
    "dbVersion": "11.1.2"
}' -H "Content-type: application/json"
```

```bash
## Change for size
curl -XPUT http://localhost:3000/mariadb -d '{
    "serverName": "mariadb",
    "replicaCount": 3,
    "size": "10Gi",
    "dbVersion": "11.1.2"
}' -H "Content-type: application/json"
```

### Delete mariadb

```bash
curl -XDELETE http://localhost:3000/mariadb -d '{
    "serverName": "mariadb"
}' -H "Content-type: application/json"
```

### Restart mariadb

```bash
curl -XPOST http://localhost:3000/mariadb/restart -d '{
    "serverName": "mariadb"
}' -H "Content-type: application/json"
```

## PostgreSQL

### Create postgresql

```bash
curl -XPOST http://localhost:3000/postgres -d '{
    "serverName": "pgsql",
    "size": "5Gi",
    "dbVersion": "14",
    "numInstances": 1
}' -H "Content-type: application/json"
```

### Update postgresql

```bash
curl -XPUT http://localhost:3000/postgres -d '{
    "serverName": "pgsql",
    "size": "10Gi",
    "dbVersion": "15",
    "numInstances": 2
}' -H "Content-type: application/json"
```

### Delete postgresql

```bash
curl -XDELETE http://localhost:3000/postgres -d '{
    "serverName": "pgsql"
}' -H "Content-type: application/json"
```

### Restart postgresql

```bash
curl -XPOST http://localhost:3000/postgres/restart -d '{
    "serverName": "pgsql"
}' -H "Content-type: application/json"
```

## MySQL

### Create mysql

```bash
curl -XPOST http://localhost:3000/mysql -d '{
    "clusterName": "mycluster",
    "dbVersion": "8.0.33",
    "replicaCount": 1,
    "size": "5Gi",
    "userName": "root",
    "passwd": "P4sSW0rD"
}' -H "Content-type: application/json"
```

### Update mysql

> Make sure to change the replicaCount and size on different calls.

```bash
## Change for version and replicaCount
curl -XPUT http://localhost:3000/mysql -d '{
    "clusterName": "mycluster",
    "replicaCount": 3,
    "size": "5Gi",
    "dbVersion": "8.0.34"
}' -H "Content-type: application/json"
```

```bash
## Change for size
curl -XPUT http://localhost:3000/mysql -d '{
    "clusterName": "mycluster",
    "replicaCount": 3,
    "size": "10Gi",
    "dbVersion": "8.0.34"
}' -H "Content-type: application/json"
```

### Delete mysql

```bash
curl -XDELETE http://localhost:3000/mysql -d '{
    "clusterName": "mycluster"
}' -H "Content-type: application/json"
```

### Restart mysql

```bash
curl -XPOST http://localhost:3000/mysql/restart -d '{
    "clusterName": "mycluster"
}' -H "Content-type: application/json"
```

## RabbitMQ

### Create rabbitmq

```bash
curl -XPOST http://localhost:3000/rabbitmq -d '{
    "clusterName": "rabbitmq-test",
    "rmqVersion": "3.11.1",
    "size": "5Gi",
    "userName": "appuser",
    "passwd": "P4sSW0rD",
    "replicaCount": 1
}' -H "Content-type: application/json"
```

### Update rabbitmq

```bash
curl -XPUT http://localhost:3000/rabbitmq -d '{
    "clusterName": "rabbitmq-test",
    "rmqVersion": "3.12.0",
    "replicaCount": 2,
    "size": "10Gi"
}' -H "Content-type: application/json"
```

### Delete rabbitmq

```bash
curl -XDELETE http://localhost:3000/rabbitmq -d '{
    "clusterName": "rabbitmq-test",
    "userName": "appuser"
}' -H "Content-type: application/json"
```

### Restart rabbitmq

```bash
curl -XPOST http://localhost:3000/rabbitmq/restart -d '{
    "clusterName": "rabbitmq-test"
}' -H "Content-type: application/json"
```

## Docker Credentials (Private Container Registry)

### ECR (AWS Elastic Container Registry)

> `username` is always `AWS`.
>
> `password` is the token that is generated by `aws ecr get-login-password` command.

#### Create ECR

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "f12c9850e022",
    "repository": "ecr",
    "username": "AWS",
    "password": "eyJwYX…",
    "awsAccessKeyId": "AKIAZRRZZAMxxx",
    "awsSecretAccessKey": "IXGHxeYg3oLiSxxxxxxxxxxx",
    "awsRegion": "eu-central-1",
    "awsAccount": "656177431303",
    "email": "koray.oksay@gmail.com"
}' -H "Content-type: application/json"
```

#### Update ECR

> This can only update AWS ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION and ACCOUNT ID

```bash
curl -XPUT http://localhost:3000/dockercredentials -d '{
    "repoId": "f12c9850e022",
    "repository": "ecr",
    "username": "AWS",
    "password": "eyKLMN…",
    "awsAccessKeyId": "AKIAZAGGADGxxx",
    "awsSecretAccessKey": "IXGHxeYUdfdSDxxxxxxxxxxx",
    "awsRegion": "us-west-1",
    "awsAccount": "65612134431303",
    "email": "koray.oksay@gmail.com"
}' -H "Content-type: application/json"
```

#### Delete ECR

```bash
curl -XDELETE http://localhost:3000/dockercredentials -d '{
    "repoId": "f12c9850e022",
    "repository": "ecr"
}' -H "Content-type: application/json"
```

### ACR (Azure Container Registry)

> Container Registry must be created as described [here](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-auth-kubernetes)

#### ACR create

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "a76deb9dbd01",
    "repository": "acr",
    "username": "<service-principal-ID>",
    "password": "<service-principal-password>",
    "email": "koray.oksay@gmail.com",
    "azureContainerRegistryName": "mycontainerregistry"
}' -H "Content-type: application/json"
```

#### ACR update

```bash
curl -XPUT http://localhost:3000/dockercredentials -d '{
    "repoId": "a76deb9dbd01",
    "repository": "acr",
    "username": "<new-service-principal-ID>",
    "password": "<new-service-principal-password>",
    "email": "koray.oksay@gmail.com",
    "azureContainerRegistryName": "newcontainerregistry"
}' -H "Content-type: application/json"
```

#### ACR delete

```bash
curl -XDELETE http://localhost:3000/dockercredentials -d '{
    "repoId": "a76deb9dbd01",
    "repository": "acr"
}' -H "Content-type: application/json"
```

> [!TIP]
> The rest of the registry types work with update and delete the same way as above

### GCR (Google Container Registry)

> `username` is always `_json_key`
>
> `password` is the base64 encoded contents of `service-account.json` file
>
> `gcpRegion` is not mandatory, needed if the repo is like `eu.gcr.io`

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "f10c1d987b4e",
    "repository": "gcr",
    "username": "_json_key",
    "password": "<contents of service account json>",
    "gcpRegion": "eu",
    "email": "<username>@<project_id>.iam.gserviceaccount.com"
}' -H "Content-type: application/json"
```

### GAR (Google Artifact Registry)

> `username` is always `_json_key`
>
> `password` is the base64 encoded contents of `service-account.json` file
>
> `gcpRegion` is mandatory for the artifact registry. It can be like `europe-west3` or `eu`, depending on the registry settings.

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "8c8f7b3ec9f0",
    "repository": "gar",
    "username": "_json_key",
    "password":  "<contents of service account json>",
    "gcpRegion": "europe-west3",
    "email": "<username>@<project_id>.iam.gserviceaccount.com"
}' -H "Content-type: application/json"
```

### Docker Hub

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "5242fe78024a",
    "repository": "docker",
    "username": "username",
    "password": "password",
    "email": "email@domain.com"
}' -H "Content-type: application/json"
```

### Quay.io (RedHat)

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "b5f70c4b041a",
    "repository": "quay",
    "username": "username",
    "password": "password",
    "email": "email@domain.com"
}' -H "Content-type: application/json"
```

### GHCR (GitHub)

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "9efe58b87a60",
    "repository": "ghcr",
    "username": "username",
    "password": "password",
    "email": "email@domain.com"
}' -H "Content-type: application/json"
```

### Generic => Any other container registry

> `genericRepoUrl` must be provided.

```bash
curl -XPOST http://localhost:3000/dockercredentials -d '{
    "repoId": "3a56f4344d78",
    "repository": "generic",
    "genericRepoUrl": "http://example.com",
    "username": "username",
    "password": "password",
    "email": "email@domain.com"
}' -H "Content-type: application/json"
```

---

## Deploy Applications

### Deployments

#### Create Deployment

> `env`, `envRef`, `envFrom` are not mandatory
>
> `ingressPath` is not mandatory, only needed if you want to expose the service to external clients
>
> `minReplicas`, `maxReplicas`, `cpuTarget`, `memoryTarget` are not mandatory, only needed to create a HPA

```bash
curl -XPOST http://localhost:3000/deployapp -d '{
    "kind": "Deployment",
    "identifier": "my-app",
    "replicaCount": 3,
    "minReplicas": 1,
    "maxReplicas": 5,
    "cpuTarget": 80,
    "memoryTarget": 80,
    "memoryRequest": "512Mi",
    "memoryLimit": "512Mi",
    "cpuRequest": "200m",
    "cpuLimit": "300m",
    "portNumber": 80,
    "image": "nginx:1.23.0",
    "ingressPath": "/api",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ]
}' -H "Content-type: application/json"
```

#### Update Deployment

```bash
curl -XPUT http://localhost:3000/deployapp -d '{
    "kind": "Deployment",
    "identifier": "my-app",
    "replicaCount": 2,
    "minReplicas": 1,
    "maxReplicas": 10,
    "cpuTarget": 80,
    "memoryTarget": 80,
    "memoryRequest": "512Mi",
    "memoryLimit": "512Mi",
    "cpuRequest": "500m",
    "cpuLimit": "500m",
    "portNumber": 80,
    "image": "nginx:1.25.0",
    "ingressDomain": "test.agnost.dev",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging",
      "TEAM": "agnost"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "AWS_SECRET",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_SECRET_ACCESS_KEY"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ]
}' -H "Content-type: application/json"
```

#### Delete Deployment

```bash
curl -XDELETE http://localhost:3000/deployapp -d '{
    "kind": "Deployment",
    "identifier": "my-app"
}' -H "Content-type: application/json"
```

---

### Stateful Set

#### Create STS

```bash
curl -XPOST http://localhost:3000/deployapp -d '{
    "kind": "StatefulSet",
    "identifier": "my-app",
    "replicaCount": 3,
    "memoryRequest": "512Mi",
    "memoryLimit": "512Mi",
    "cpuRequest": "200m",
    "cpuLimit": "300m",
    "portNumber": 80,
    "image": "nginx:1.23.0",
    "ingressPath": "/api",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ],
    "mountPath": "/data",
    "storageSize": "10Gi",
    "storageClass": "csi-hostpath-sc"
}' -H "Content-type: application/json"
```

#### Update STS

```bash
curl -XPUT http://localhost:3000/deployapp -d '{
    "kind": "StatefulSet",
    "identifier": "my-app",
    "replicaCount": 5,
    "memoryRequest": "512Mi",
    "memoryLimit": "512Mi",
    "cpuRequest": "200m",
    "cpuLimit": "300m",
    "portNumber": 80,
    "image": "nginx:1.23.0",
    "ingressPath": "/api",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ],
    "mountPath": "/data",
    "storageSize": "15Gi",
    "storageClass": "csi-hostpath"
}' -H "Content-type: application/json"
```

#### Delete STS

```bash
curl -XDELETE http://localhost:3000/deployapp -d '{
    "kind": "StatefulSet",
    "identifier": "my-app"
}' -H "Content-type: application/json"
```

---

### Cron Job

#### Create CronJob

```bash
curl -XPOST http://localhost:3000/deployapp -d '{
    "kind": "CronJob",
    "identifier": "my-app",
    "cronSchedule": "15 * * * *",
    "memoryRequest": "512Mi",
    "memoryLimit": "512Mi",
    "cpuRequest": "200m",
    "cpuLimit": "300m",
    "cronCommand": "echo hello world; echo Welcome to the machine",
    "image": "busybox:1.28",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ]
}' -H "Content-type: application/json"
```

#### Update CronJob

```bash
curl -XPUT http://localhost:3000/deployapp -d '{
    "kind": "CronJob",
    "identifier": "my-app",
    "cronSchedule": "30 * * * *",
    "memoryRequest": "512Mi",
    "memoryLimit": "512Mi",
    "cpuRequest": "100m",
    "cpuLimit": "100m",
    "cronCommand": "echo command is updated",
    "image": "busybox:1.28",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging",
      "TEAM": "agnost"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ]
}' -H "Content-type: application/json"
```

#### Delete CronJob

```bash
curl -XDELETE http://localhost:3000/deployapp -d '{
    "kind": "CronJob",
    "identifier": "my-app"
}' -H "Content-type: application/json"
```

---

### Knative (Serverless) Application

#### Create Knative Service

```bash
curl -XPOST http://localhost:3000/deployapp -d '{
    "kind": "KnativeService",
    "identifier": "my-app",
    "containerConcurrency": 20,
    "memoryRequest": "512Mi",
    "memoryLimit": "512Mi",
    "cpuRequest": "200m",
    "cpuLimit": "300m",
    "portNumber": 80,
    "image": "nginx:1.23.0",
    "ingressPath": "/api",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ],
    "initialScale": "2",
    "maxScale": "10",
    "targetUtilizationPercentage": "90"
}' -H "Content-type: application/json"
```

#### Update Knative Service

```bash
curl -XPUT http://localhost:3000/deployapp -d '{
    "kind": "KnativeService",
    "identifier": "my-app",
    "containerConcurrency": 10,
    "memoryRequest": "250Mi",
    "memoryLimit": "250Mi",
    "cpuRequest": "100m",
    "cpuLimit": "100m",
    "portNumber": 80,
    "image": "nginx:1.23.0",
    "ingressPath": "/ping",
    "env": {
      "APP_NAME": "my-app",
      "ENVIRONMENT": "staging",
      "TEAM": "agnost"
    },
    "envFrom": {
      "secretRef": "aws-secrets",
      "configMapRef": "kube-root-ca.crt"
    },
    "envRef": [
      {
        "envName": "AWS_KEY",
        "refType": "secretKeyRef",
        "refName": "aws-secrets",
        "refKey": "AWS_ACCESS_KEY_ID"
      },
      {
        "envName": "ROOT_CERT",
        "refType": "configMapKeyRef",
        "refName": "kube-root-ca.crt",
        "refKey": "ca.crt"
      }
    ],
    "initialScale": "1",
    "maxScale": "5",
    "targetUtilizationPercentage": "70"
}' -H "Content-type: application/json"
```

#### Delete Knative Service

```bash
curl -XDELETE http://localhost:3000/deployapp -d '{
    "kind": "KnativeService",
    "identifier": "my-app"
}' -H "Content-type: application/json"
```

## Tekton CI/CD

### Tekton infra

#### Install Infra

```bash
curl -XPOST http://localhost:3000/tektonInfra -d '{
    "localRegistryEnabled": true
}' -H "Content-type: application/json"
```

#### Delete Infra

```bash
curl -XDELETE http://localhost:3000/tektonInfra -d '{
    "localRegistryEnabled": true
}' -H "Content-type: application/json"
```

### GitHub Pipeline create

> In case of mono repo, you can provide the path to the Dockerfile with
>
> `gitSubPath` optional parameter. e.g.:
>
> `"gitSubPath": "/newapp/app1"`

```bash
# Container Registry: GitHub/GHCR
curl -XPOST http://localhost:3000/tektonPipeline -d '{
    "pipelineId": "4sfde896344",
    "gitRepoType": "github",
    "gitRepoUrl": "https://github.com/OWNER/REPO",
    "gitBranch": "main",
    "gitPat": "ghp_xxx",
    "containerRegistry": "ghcr.io/OWNER",
    "containerRegistryType": "ghcr",
    "containerRegistryId": "9efe58b87a60",
    "containerImageName": "myimage1",
    "appKind": "Deployment",
    "appName": "my-app-dply"
}' -H "Content-type: application/json"

# Container Registry: Local registry inside the cluster
curl -XPOST http://localhost:3000/tektonPipeline -d '{
    "pipelineId": "4sfde896343",
    "gitRepoType": "github",
    "gitRepoUrl": "https://github.com/OWNER/REPO",
    "gitBranch": "main",
    "gitPat": "ghp_xxx",
    "containerRegistryType": "local",
    "containerImageName": "myimage2",
    "appKind": "Deployment",
    "appName": "my-app-dply"
}' -H "Content-type: application/json"


```

### GitHub Pipeline delete

```bash
curl -XDELETE http://localhost:3000/tektonPipeline -d '{
    "pipelineId": "4sfde896343",
    "gitRepoType": "github",
    "gitRepoUrl": "https://github.com/OWNER/REPO",
    "gitPat": "ghp_xxx",
    "hookId": "463611028".
}' -H "Content-type: application/json"
```

## Git Repo Info

### List Repos

#### GitHub Repo List

```bash
curl -XGET 'http://localhost:3000/listGitRepos?gitRepoType=github&gitPat=YOUR_GITHUB_PAT'
```

#### GitLab Repo List

```bash
curl -XGET 'http://localhost:3000/listGitRepos?gitRepoType=gitlab&gitPat=YOUR_GITLAB_PAT'
```

### List Branches

#### GitHub Branch List

```bash
curl -XGET 'http://localhost:3000/listGitBranches?gitRepoType=github&gitRepoName=OWNER/REPO&gitPat=YOUR_GITHUB_PAT'
```

#### GitLab Branch List

```bash
curl -XGET 'http://localhost:3000/listGitBranches?gitRepoType=gitlab&gitRepoName=NAMESPACE/PROJECTr&gitPat=YOUR_GITLAB_PAT'
```

## Export Services via NGINX Ingress

### Create expose

```bash
curl -XPOST http://localhost:3000/exposeService -d '{
    "serviceName": "mongodb-svc",
    "portNumber": 10001
}' -H "Content-type: application/json"
```

### Update expose

```bash
curl -XPUT http://localhost:3000/exposeService -d '{
    "serviceName": "mongodb-svc",
    "oldPortNumber": 10001,
    "newPortNumber": 10010
}' -H "Content-type: application/json"
```

### Unexpose

```bash
curl -XDELETE http://localhost:3000/exposeService -d '{
    "portNumber": 10010
}' -H "Content-type: application/json"
```
