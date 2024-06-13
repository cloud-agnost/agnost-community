#!/bin/bash

function echodate { 
    echo "$(date '+%Y/%m/%d %H:%M:%S') $@"
}

function help_message {
  echo "Usage: $(basename "$0") -t [mongodb|postgresql] -b [s3|gs|minio] -n <bucket name>"
  echo "Parameters:"
  echo "  -t, --db-type     : Mandatory, which type of db to backup [mongodb|postgresql|mysql]"
  echo "  -b, --bucket-type : Mandatory, which bucket will be used [s3|gs] (MinIO is also type 's3')"
  echo "  -n, --bucket-name : Mandatory, name of the bucket"
}

function ensure_param() {
    if [ -z "${!1:+x}" ]; then
        echodate "[ERROR] Required parameter '$2' not set."
        help_message
        exit 1
    fi
}

function backup_mongodb() {
  echodate "[INFO] Dumping MongoDB"
  echo "MONGODB_URI: ${MONGODB_URI}"
  mongodump --uri=${MONGODB_URI} --out=${BACKUP_FILE}
  tar -czf ${BACKUP_FILE}.tar.gz -C /backup ${BACKUP_FILE}
}

function backup_postgresql() {
  echodate "[INFO] Dumping PostgreSQL"
  PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > ${BACKUP_FILE}
  tar -czf ${BACKUP_FILE}.tar.gz -C /backup ${BACKUP_FILE}
}

function copy_to_bucket() {
  echodate "[INFO] Copying the backup file to the storage"
  if [ ${BUCKET_TYPE} == "minio" ]; then
    mcli alias set minio http://${MINIO_HOST}.svc.cluster.local:${MINIO_PORT} ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}
    mcli mb --ignore-existing minio/${BUCKET_NAME}
    mcli cp ${BACKUP_FILE}.tar.gz minio/${BUCKET_NAME}/${BACKUP_FILE}.tar.gz
  elif [ ${BUCKET_TYPE} == "s3" ]; then
    aws s3 cp ${BACKUP_FILE}.tar.gz ${BUCKET_TYPE}://${BUCKET_NAME}/${BACKUP_FILE}
  elif [ ${BUCKET_TYPE} == "gs" ]; then
    /google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
    /google-cloud-sdk/bin/gsutil cp ${BACKUP_FILE}.tar.gz ${BUCKET_TYPE}://${BUCKET_NAME}/${BACKUP_FILE}
  fi
  rm -rf ${BACKUP_FILE} ${BACKUP_FILE}.tar.gz
}

# main
echodate "[INFO] Started the backup script"

while [[ $# -gt 0 ]]; do
  arg="$1"
  case $arg in
  -t|--db-type)
    DB_TYPE="$2"
    shift; shift
    ;;
  -b|--bucket-type)
      BUCKET_TYPE="$2"
    shift; shift
    ;;
  -n|--bucket-name)
    BUCKET_NAME="$2"
    shift; shift
    ;;
  *)
    shift
    ;;
  esac
done

ensure_param DB_TYPE database-type
ensure_param SERVER_NAME server-name
ensure_param BUCKET_TYPE bucket-type
ensure_param BUCKET_NAME bucket-name

if [ ${BUCKET_TYPE} == "minio" ]; then
  ensure_param MINIO_HOST minio-host
  ensure_param MINIO_PORT minio-port 
  ensure_param MINIO_ACCESS_KEY minio-access-key
  ensure_param MINIO_SECRET_KEY minio-secret-key
fi

TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="/backup/${DB_TYPE}-${SERVER_NAME}-${TIMESTAMP}.sql"

case $DB_TYPE in
mongodb)
  ensure_param MONGODB_URI mongodb-uri
  backup_mongodb
  ;;
postgresql)
  ensure_param POSTGRES_HOST postgresql-host
  ensure_param POSTGRES_USER postgresql-user
  ensure_param POSTGRES_PASSWORD postgresql-password
  ensure_param POSTGRES_DB postgresql-db
  backup_postgresql
  ;;
esac

copy_to_bucket

echodate "[INFO] Script is completed"
