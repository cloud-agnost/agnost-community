const express = require('express');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const { error } = require('console');

const router = express.Router();

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const batchApi = kc.makeApiClient(k8s.BatchV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

const namespace = process.env.NAMESPACE;

// Enables Backup on the MySQL Cluster
async function enableMysqlBackup(backupJobId, serverName, bucketType, bucketName, jobSchedule="0 21 * * *", minioEndpoint) {
  if (bucketType === 's3' || bucketType === 'minio') {
    const patchData = {
      "spec": {
          "backupSchedules": [
              {
                  "name": "backup-schedule",
                  "schedule": jobSchedule,
                  "deleteBackupData": false,
                  "enabled": true,
                  "backupProfile": {
                      "dumpInstance": {
                          "storage": {
                              "s3": {
                                  "prefix": "/",
                                  "bucketName": bucketName,
                                  "config": "s3-secrets-" + backupJobId,
                                  "profile": "default",
                                  "endpoint": ""
                              }
                          }
                      }
                  }
              }
          ]
      }
    };
    if (minioEndpoint) {
      patchData.spec.backupSchedules[0].backupProfile.dumpInstance.storage.s3.endpoint = minioEndpoint
    } else {
      delete patchData.spec.backupSchedules[0].backupProfile.dumpInstance.storage.s3.endpoint
    }
    const requestOptions = { headers: { 'Content-Type': 'application/merge-patch+json' }, };

    try {
      await k8sCustomApi.patchNamespacedCustomObject('mysql.oracle.com', 'v2', namespace, 'innodbclusters', serverName, patchData, undefined, undefined, undefined, requestOptions);
      console.log('MySQL ' + serverName + ' updated...');
    } catch (error){
      console.error('Error updating MySQL ' + clusterName + ' resources...', error.body);
      throw new Error(JSON.stringify(error.body));
    }
  } else {
    const errorMsg = {'message': 'MySQL can only be dumped to AWS S3 or MinIO buckets'}
    throw new Error(JSON.stringify(errorMsg.message));
  }
}

// Creates AWS secrets when using S3 buckets
async function createS3Secrets(backupJobId, awsAccessKeyId, awsSecretAccessKey, awsRegion) {
  const secret = {
    "apiVersion": "v1",
    "kind": "Secret",
    "metadata": {
        "name": "s3-secrets-" + backupJobId
    },
    "stringData": {
        "credentials": "[default]\naws_access_key_id = " + awsAccessKeyId + "\naws_secret_access_key = " + awsSecretAccessKey + "\n",
        "config": "[default]\nregion = " + awsRegion + "\n"
    }
  };

  try {
    await k8sCoreApi.createNamespacedSecret(namespace, secret);
    console.log('AWS Secret is created');
  } catch (error) {
    console.error('Error applying resource:', error.body);
    throw new Error(JSON.stringify(error.body));
  }
}

async function createBackupJob(backupJobId, dbType, serverName, dbName, bucketType, bucketName, jobSchedule="0 21 * * *", awsAccessKeyId, awsSecretAccessKey, awsRegion="us-east-1") {
  const manifest = fs.readFileSync('/manifests/db-backup-cronjob.yaml', 'utf8');
  const resources = k8s.loadAllYaml(manifest);

  if (bucketType === 's3') {
    await createS3Secrets(backupJobId, awsAccessKeyId, awsSecretAccessKey, awsRegion);
  } else if (bucketType === 'minio') {
    minioCredentials = await k8sCoreApi.readNamespacedSecret('minio-credentials', namespace);
    var accessKey = Buffer.from(minioCredentials.body.data.rootUser, 'base64');
    var secretKey = Buffer.from(minioCredentials.body.data.rootPassword, 'base64');
    var minioEndpoint = Buffer.from(minioCredentials.body.data.endpoint, 'base64');
    var minioPort = Buffer.from(minioCredentials.body.data.port, 'base64');
    var endpoint = 'http://' + minioEndpoint + '.svc.cluster.local:' + minioPort;
    await createS3Secrets(backupJobId, accessKey, secretKey, awsRegion);
  }

  if (dbType === 'mysql') {  // Update MySQL operator configuration
    await enableMysqlBackup(backupJobId, serverName, bucketType, bucketName, jobSchedule, endpoint);

  } else { // Create CronJob for MongoDB and PosgreSQL
    for (const resource of resources) {
      try {
        const { kind, metadata } = resource;

        switch(kind) {
          case 'Secret':
            // we need google credentials only for gcs
            if (bucketType === 'gs') {
              resource.metadata.name += '-' + backupJobId;
              //await k8sCoreApi.createNamespacedSecret(namespace, resource);
              console.log('Google Credentials Secret is created');
            }
            break;
          case 'ConfigMap':
            // we need boto.cfg only for s3 and minio
            if (bucketType === 's3') {
              resource.metadata.name += '-' + backupJobId;
              resource.data = {"boto.cfg": "[Credentials]\naws_access_key_id = " + awsAccessKeyId + "\naws_secret_access_key = " + awsSecretAccessKey + "\n    \n[s3]\nhost = s3.amazonaws.com\n"}
              //await k8sCoreApi.createNamespacedConfigMap(namespace, resource);
              console.log(JSON.stringify(resource));
              console.log('boto.cfg ConfigMap is created');
            }
            break;
          case 'CronJob':
            // Common configuration
            resource.metadata.name += '-' + backupJobId;
            resource.spec.schedule = jobSchedule;
            resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "DB_TYPE", "value": dbType});
            resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "SERVER_NAME", "value": serverName});
            resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "BUCKET_TYPE", "value": bucketType});
            resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "BUCKET_NAME", "value": bucketName});

            // Configure CronJob based on the database type
            if (dbType === 'mongodb') {
              const secrets = await k8sCoreApi.listNamespacedSecret(namespace);
              secrets.body.items.forEach(async (secret) => {
                var secretName = secret.metadata.name;
                if (secretName.startsWith(serverName + '-admin-')) {
                  resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "MONGODB_URI", "valueFrom": {"secretKeyRef": {"name": secretName, "key": "connectionString\.standard"}}});
                }
              });
            } else if (dbType === 'postgresql') {
              var secretName = 'postgres.' + serverName + '.credentials.postgresql.acid.zalan.do';
              var hostName = serverName + '.' + namespace + '.svc.cluster.local'
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "POSTGRES_USER","valueFrom": {"secretKeyRef": {"name": secretName, "key": "username"}}});
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "POSTGRES_PASSWORD","valueFrom": {"secretKeyRef": {"name": secretName, "key": "password"}}});
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "POSTGRES_HOST", "value": hostName});
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "POSTGRES_DB", "value": dbName});
            }

            // Configure CronJob based on the bucket type
            if (bucketType === 'gs') {
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "GOOGLE_APPLICATION_CREDENTIALS", "value": "/secrets/gcs-key.json"});
              resource.spec.jobTemplate.spec.template.spec.containers[0].volumeMounts.push({"name": "gcs-key", "mountPath": "/secrets"});
              resource.spec.jobTemplate.spec.template.spec.volumes.push({"name": "gcs-key", "secret": {"secretName": "gcs-secret"}});
            } else if (bucketType === 's3') {
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "BOTO_PATH", "value": "/configs/boto.cfg"});
              resource.spec.jobTemplate.spec.template.spec.containers[0].volumeMounts.push({"name": "boto-config", "mountPath": "/configs"});
              resource.spec.jobTemplate.spec.template.spec.volumes.push({"name": "boto-config", "configMap": {"name": "boto-config"}});
            } else if (bucketType === 'minio') {
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "MINIO_HOST","valueFrom": {"secretKeyRef": {"name": "minio-credentials","key": "endpoint"}}});
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "MINIO_PORT","valueFrom": {"secretKeyRef": {"name": "minio-credentials","key": "port"}}});
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "MINIO_ACCESS_KEY","valueFrom": {"secretKeyRef": {"name": "minio-credentials","key": "rootUser"}}});
              resource.spec.jobTemplate.spec.template.spec.containers[0].env.push({"name": "MINIO_SECRET_KEY","valueFrom": {"secretKeyRef": {"name": "minio-credentials","key": "rootPassword"}}});
            }

            // Create the CronJob
            await batchApi.createNamespacedCronJob(namespace, resource);
            console.log('Backup CronJob is created');
            break;
        }
      } catch (error) {
        console.error('Error applying resource:', error.body);
        throw new Error(JSON.stringify(error.body));
      }
    }
  }
}

router.post('/dbbackup', async (req, res) => {
  const { backupJobId, dbType, serverName, dbName, bucketType, bucketName, jobSchedule, awsAccessKeyId, awsSecretAccessKey, awsRegion} = req.body;

  try {
    await createBackupJob( backupJobId, dbType, serverName, dbName, bucketType, bucketName, jobSchedule, awsAccessKeyId, awsSecretAccessKey, awsRegion);
    res.json({ 'result': 'backup job created' });
  } catch (err) {
    console.error(err);
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;
