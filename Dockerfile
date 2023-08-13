# First stage, prepare helm charts
FROM alpine/helm:3.12.3 as helm-build

WORKDIR /manifests

RUN wget https://strimzi.io/install/latest?namespace=kafka-operator -O kafka-operator.yaml && \
    helm repo add postgres-operator-charts https://opensource.zalando.com/postgres-operator/charts/postgres-operator && \
    helm template postgres-operator postgres-operator-charts/postgres-operator --namespace=postgres-operator --version 1.10.0 > postgres-operator.yaml && \
    helm repo add mariadb-operator https://mariadb-operator.github.io/mariadb-operator && \
    helm template mariadb-operator mariadb-operator/mariadb-operator --namespace=mariadb-operator --version 0.19.0 \
      --set clusterName=mariadb.local --set ha.enabled=false --set resources.requests.memory=64Mi > mariadb-operator.yaml

## Second stage
FROM node:14-alpine

COPY --from=helm-build /manifests /manifests

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY /src .

EXPOSE 3000

CMD ["npm", "start"]
