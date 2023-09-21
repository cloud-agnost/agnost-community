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
    "memoryRequest": "250Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "200m",
    "cpuLimit": "500m",
    "diskSize": "5Gi",
    "userName": "appuser",
    "passwd": "P4sSW0rD",
    "replicaCount": 1
}' -H "Content-type: application/json"
```

### Update rabbitmq

```bash
curl -XPUT http://localhost:3000/rabbitmq -d '{
    "clusterName": "rabbitmq-test",
    "memoryRequest": "512Mi",
    "memoryLimit": "1024Mi",
    "cpuRequest": "500m",
    "cpuLimit": "1000m",
    "rmqVersion": "3.12.0"
}' -H "Content-type: application/json"
```

### Delete rabbitmq

```bash
curl -XDELETE http://localhost:3000/rabbitmq -d '{
    "clusterName": "rabbitmq-test",
    "userName": "appuser"
}' -H "Content-type: application/json"
```
