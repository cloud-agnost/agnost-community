FROM google/cloud-sdk:479.0.0-alpine

RUN apk add --no-cache postgresql-client mongodb-tools minio-client && mkdir /backup

COPY backup.sh /scripts/backup.sh
