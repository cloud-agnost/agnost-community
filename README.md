# How to Manage Resources

## MongoDB

### Create mongodb

```bash
curl -XPOST http://localhost:3000/mongodb -d '{
    "mongoName": "mongodb-comm",
    "mongoVersion": "6.0.4",
    "memoryRequest": "250Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "200m",
    "cpuLimit": "500m",
    "diskSize": "5Gi",
    "userName": "appuser",
    "passwd": "P4sSW0rD",
    "replicaCount": 3
}' -H "Content-type: application/json"
```

### Update mongodb

```bash
curl -XPUT http://localhost:3000/mongodb -d '{
    "mongoName": "mongodb-comm",
    "mongoVersion": "6.0.5",
    "memoryRequest": "250Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "200m",
    "cpuLimit": "500m"
}' -H "Content-type: application/json"
```

### Delete mongodb

```bash
curl -XDELETE http://localhost:3000/mongodb -d '{
    "mongoName": "mongodb-comm",
    "purgeData": true
}' -H "Content-type: application/json"
```

## Redis

### Create standalone redis

```bash
curl -XPOST http://localhost:3000/redis -d '{
    "clusterName": "standalone",
    "memoryRequest": "250Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "200m",
    "cpuLimit": "500m",
    "diskSize": "1Gi",
    "passwd": "P4sSW0rD",
    "readReplicaEnabled": false
}' -H "Content-type: application/json"
```

### Create redis with read replica

```bash
curl -XPOST http://localhost:3000/redis -d '{
    "clusterName": "replicated",
    "memoryRequest": "250Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "200m",
    "cpuLimit": "500m",
    "diskSize": "1Gi",
    "passwd": "P4sSW0rD",
    "readReplicaEnabled": true
}' -H "Content-type: application/json"
```

### Delete redis

```bash
curl -XDELETE http://localhost:3000/redis -d '{
    "clusterName": "replicated",
    "purgeData": true
}' -H "Content-type: application/json"
```

## MariaDB

### Create mariadb

```bash
curl -XPOST http://localhost:3000/mariadb -d '{
    "serverName": "mariadb",
    "dbName": "app",
    "dbVersion": "11.0.3",
    "replicaCount": 3,
    "memoryRequest": "250Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "200m",
    "cpuLimit": "500m",
    "diskSize": "5Gi",
    "userName": "appuser",
    "passwd": "P4sSW0rD",
    "rootPasswd": "r00tP4sSW0rD"
}' -H "Content-type: application/json"
```

### Update mariadb

```bash
curl -XPUT http://localhost:3000/mariadb -d '{
    "serverName": "mariadb",
    "memoryRequest": "500Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "700m",
    "cpuLimit": "700m",
    "dbVersion": "11.1.2"
}' -H "Content-type: application/json"
```

### Delete mariadb

```bash
curl -XDELETE http://localhost:3000/mariadb -d '{
    "serverName": "mariadb",
    "purgeData": true
}' -H "Content-type: application/json"
```

## PostgreSQL

### Create postgresql

```bash
curl -XPOST http://localhost:3000/postgres -d '{
    "serverName": "pgsql",
    "teamName": "agnost",
    "memoryRequest": "250Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "200m",
    "cpuLimit": "500m",
    "diskSize": "5Gi",
    "dbVersion": "14",
    "numInstances": 1
}' -H "Content-type: application/json"
```

### Update postgresql

```bash
curl -XPUT http://localhost:3000/postgres -d '{
    "serverName": "pgsql",
    "memoryRequest": "500Mi",
    "memoryLimit": "500Mi",
    "cpuRequest": "500m",
    "cpuLimit": "500m",
    "dbVersion": "15"
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
    "replicaCount": 3,
    "memoryRequest": "512Mi",
    "memoryLimit": "1024Mi",
    "cpuRequest": "500m",
    "cpuLimit": "1000m",
    "diskSize": "20Gi",
    "userName": "root",
    "passwd": "P4sSW0rD"
}' -H "Content-type: application/json"
```

### Update mysql

```bash
curl -XPUT http://localhost:3000/mysql -d '{
    "clusterName": "mycluster",
    "memoryRequest": "512Mi",
    "memoryLimit": "2048Mi",
    "cpuRequest": "500m",
    "cpuLimit": "1000m",
    "dbVersion": "8.0.34"
}' -H "Content-type: application/json"
```

### Delete mysql

```bash
curl -XDELETE http://localhost:3000/mysql -d '{
    "clusterName": "mycluster",
    "purgeData": true
}' -H "Content-type: application/json"
```

## RabbitMQ

### Create rabbitmq

```bash
curl -XPOST http://localhost:3000/rabbitmq -d '{
    "clusterName": "rabbitmq-test",
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
