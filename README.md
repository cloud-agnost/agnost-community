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

## Docker Credentials (Private Container Registry)

### ECR (AWS Elastic Container Registry)

> `username` is always `AWS`.
>
> `password` is the token that is generated by `aws ecr get-login-password` command.

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

### ACR (Azure Container Registry)

> Container Registry must be created as described [here](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-auth-kubernetes)

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
