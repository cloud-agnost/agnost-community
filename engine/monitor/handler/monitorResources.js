import pg from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import mongo from "mongodb";
import redis from "redis";
import k8s from "@kubernetes/client-node";
import amqp from "amqplib";
import * as Minio from "minio";
import { Kafka } from "kafkajs";
import axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import { Storage } from "@google-cloud/storage";

import { getDBClient } from "../init/db.js";

// Create a Kubernetes core API client
const kubeconfig = new k8s.KubeConfig();
kubeconfig.loadFromDefault();

/**
 * Iterates over all cluster resources and monitors their status
 */
export default async function monitorResources() {
	try {
		let pageNumber = 0;
		let pageSize = config.get("general.resourcePaginationSize");
		let resources = await getResources(pageNumber, pageSize);
		// We will cache the status of resources, so that we do not need to check their status again and again
		let statusCache = new Map();

		while (resources && resources.length) {
			for (let i = 0; i < resources.length; i++) {
				const resource = resources[i];
				try {
					// First check the cache if we have the status information
					let result = getCachedStatus(statusCache, resource);
					// If we do not have the result in cache then check resource status
					if (!result) {
						// Decrypt access settings
						resource.access = decryptSensitiveData(resource.access);
						result = await checkResourceStatus(resource);
					}

					if (result) {
						// Add status to the cache if it has not been added already
						setCachedStatus(statusCache, resource, result);
						// If the resource is being created, updated or deleted and if we face an error it might be possible that it is undergoing an operation and we need to give time to it to complete its opeation
						if (
							["Creating", "Updating", "Deleting", "Restarting"].includes(
								resource.status
							)
						) {
							// Check duration of the operation
							const now = Date.now();
							const date = new Date(
								Date.parse(
									resource.status === "Creating"
										? resource.createdAt
										: resource.updatedAt
								)
							);
							const millisecondsFromEpoch = date.getTime();

							// For create and update operations wait for at least the initial delay seconds
							if (
								now - millisecondsFromEpoch <
								config.get("general.initialDelaySeconds") * 1000
							) {
								continue;
							}

							// If the operation has not timed out yet then continue
							if (
								result.status === "Error" &&
								now - millisecondsFromEpoch <
									config.get("general.maxResourceOpWaitMinues") * 60 * 1000
							) {
								continue;
							}
						}

						// If the status of the resource is ok and last telemetry is also OK no need to update resource status or resource logs
						if (result.status === "OK" && resource.status === "OK") {
							if (
								resource.instance === "API Server" &&
								(resource.availableReplicas !== result.availableReplicas ||
									resource.unavailableReplicas !== result.unavailableReplicas)
							) {
								await upadateResourceStatus(resource, result);
							} else continue;
						}

						// If the resource status has changed both update the resource status and add a new resource log
						if (result.status !== resource.status) {
							await upadateResourceStatus(resource, result);
							continue;
						}

						// If the resource is in error state then update the latest error resource log
						if (result.status === "Error" && resource.status === "Error") {
							if (
								resource.instance === "API Server" &&
								(resource.availableReplicas !== result.availableReplicas ||
									resource.unavailableReplicas !== result.unavailableReplicas)
							) {
								await upadateResourceStatus(resource, result);
							} else await updateLatestResourceLog(resource, result);
						}
					}
				} catch (err) {}
			}

			// Interate to the next page
			pageNumber++;
			resources = await getResources(pageNumber, pageSize);
		}

		await checkClusterResourceStatus();
	} catch (err) {
		logger.error(t("Cannot fetch cluster resources"), err);
	}
}

/**
 * Updates the resource log status in platform databse
 * @param  {Object} resource The resource object
 * @param  {Object} status The resource status object
 */
async function updateLatestResourceLog(resource, status) {
	//Make api call to the platform to log the error message
	axios
		.post(
			helper.getPlatformUrl() + "/v1/telemetry/update-log",
			{ resource, status },
			{
				headers: {
					Authorization: process.env.MASTER_TOKEN,
					"Content-Type": "application/json",
				},
			}
		)
		.catch((error) => {});
}

/**
 * Updates the status of the resource and creates a new resource log entry in platform database
 * @param  {Object} resource The resource object
 * @param  {Object} status The resource status object
 */
async function upadateResourceStatus(resource, status) {
	//Make api call to the platform to log the error message
	axios
		.post(
			helper.getPlatformUrl() + "/v1/telemetry/update-status",
			{ resource, status },
			{
				headers: {
					Authorization: process.env.MASTER_TOKEN,
					"Content-Type": "application/json",
				},
			}
		)
		.catch((error) => {});
}

/**
 * Returns the resource status if it has already been cached
 * @param  {Object} cache The Map object to cache results
 * @param  {Object} resource The resource object
 * @param  {Object} result The resource status object
 */
function getCachedStatus(cache, resource) {
	if (["Agenda", "Socket.io"].includes(resource.instance)) {
		return cache.get(resource.instance);
	} else return cache.get(resource.iid);
}

/**
 * Adds the resource status data the cache for faster retrieval
 * @param  {Object} cache The Map object to cache results
 * @param  {Object} resource The resource object
 * @param  {Object} result The resource status object
 */
function setCachedStatus(cache, resource, result) {
	if (["Agenda", "Socket.io"].includes(resource.instance)) {
		// If not already cached, add it to the cache
		if (!cache.get(resource.instance)) cache.set(resource.instance, result);
	} else {
		// If not already cached, add it to the cache
		if (!cache.get(resource.iid)) cache.set(resource.iid, result);
	}
}

/**
 * Returns the list of resources from the clsuter database
 * @param  {number} pageNumber Curent page number (used for pagination)
 * @param  {number} pageSize The records per page
 */
async function getResources(pageNumber, pageSize) {
	let dbClient = getDBClient();

	return await dbClient
		.db("agnost")
		.collection("resources")
		.find({}, { limit: pageSize, skip: pageNumber * pageSize })
		.toArray();
}

/**
 * Decrypt resource access settings
 * @param  {Object} access The encrypted access settings needed to connect to the resource
 */
function decryptSensitiveData(access) {
	if (Array.isArray(access)) {
		let list = [];
		access.forEach((entry) => {
			list.push(decryptSensitiveData(entry));
		});

		return list;
	}

	let decrypted = {};
	for (const key in access) {
		const value = access[key];
		if (Array.isArray(value)) {
			decrypted[key] = value.map((entry) => {
				if (entry && typeof entry === "object")
					return decryptSensitiveData(entry);
				if (entry && typeof entry === "string")
					return helper.decryptText(entry);
				else return entry;
			});
		} else if (typeof value === "object" && value !== null) {
			decrypted[key] = decryptSensitiveData(value);
		} else if (value && typeof value === "string")
			decrypted[key] = helper.decryptText(value);
		else decrypted[key] = value;
	}

	return decrypted;
}

/**
 * Checks the status of the resource
 * @param  {Object} resource The resource object
 */
async function checkResourceStatus(resource) {
	switch (resource.instance) {
		case "API Server":
			try {
				let result = await checkAPIServer(resource.access);
				if (result === null) return null;
				return {
					status:
						result.availableReplicas > 0
							? result.updating
								? "Updating"
								: "OK"
							: "Idle",
					availableReplicas: result.availableReplicas,
					unavailableReplicas: result.unavailableReplicas,
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message:
								result.availableReplicas > 0
									? t("API server is up and running")
									: t("API server is idle and in a scaled-down state"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					availableReplicas: 0,
					unavailableReplicas: 0,
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "PostgreSQL":
		case "MySQL":
		case "SQL Server":
		case "MongoDB":
		case "Oracle":
			try {
				await checkDBConnection(resource.instance, resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("Database is up and running"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "Redis":
			try {
				await checkRedisConnection(resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("Redis cache is up and running"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "AWS S3":
			try {
				await checkAWSStorage(resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("AWS S3 storage is ready"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "GCP Cloud Storage":
			try {
				await checkGCPStorage(resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("GCP cloud storage is ready"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "Azure Blob Storage":
			try {
				await checkAzureStorage(resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("Azure blob storage is ready"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "MinIO":
			try {
				await checkClusterStorage(resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("Cluster storage is bound and ready"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "RabbitMQ":
			try {
				await checkRabbitMQConnection(resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("RabbitMQ is up and running"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "Kafka":
			try {
				await checkKafkaConnection(resource.access);
				return {
					status: "OK",
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("Apache Kafka is up and running"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "Agenda":
			try {
				let result = await checkDefaultScheduler(resource.access);
				if (result === null) return null;
				return {
					status: "OK",
					availableReplicas: result.availableReplicas,
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("Default scheduler is up and running"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					availableReplicas: 0,
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		case "Socket.io":
			try {
				let result = await checkDefaultRealtime(resource.access);
				if (result === null) return null;
				return {
					status: "OK",
					availableReplicas: result.availableReplicas,
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("Default realtime server is up and running"),
						},
					],
				};
			} catch (error) {
				return {
					status: "Error",
					availableReplicas: 0,
					logs: {
						startedAt: new Date(),
						status: "Error",
						message: error.message,
					},
				};
			}
		default:
			return null;
	}
}

/**
 * Returns true if successfully connects to the database otherwise throws an exception
 * @param  {string} dbType The type of the datbase e.g., PostgreSQL, MySQL
 * @param  {object} connSettings The connection settings needed to connect to the database
 */
async function checkDBConnection(dbType, connSettings) {
	switch (dbType) {
		case "PostgreSQL":
			try {
				const client = new pg.Client({
					...helper.getAsObject(connSettings.options),
					host: connSettings.host,
					port: connSettings.port,
					user: connSettings.username,
					password: connSettings.password,
				});

				await client.connect();
				await client.end();

				return true;
			} catch (err) {
				throw new AgnostError(
					t("Cannot connect to the PostgreSQL database. %s", err.message)
				);
			}
		case "MySQL":
			try {
				const connection = await mysql.createConnection({
					...helper.getAsObject(connSettings.options),
					host: connSettings.host,
					port: connSettings.port,
					user: connSettings.username,
					password: connSettings.password,
				});

				await connection.end();

				return true;
			} catch (err) {
				throw new AgnostError(
					t("Cannot connect to the MySQL database. %s", err.message)
				);
			}
		case "SQL Server":
			try {
				const connection = await mssql.connect({
					...helper.getAsObject(connSettings.options),
					server: connSettings.host,
					port: connSettings.port,
					user: connSettings.username,
					password: connSettings.password,
					encrypt: connSettings.encrypt ?? false,
				});

				await connection.close();

				return true;
			} catch (err) {
				throw new AgnostError(
					t("Cannot connect to the SQL Server database. %s", err.message)
				);
			}
		case "MongoDB":
			try {
				/* Example: 			
					{
						"connFormat": "mongodb+srv",
						"host": "cluster0-qxaly.mongodb.net",
						"username": "umit_cakmak",
						"password": "G3oUiFhcKczQI6lJ"
					}
					 */
				let client = null;
				// Build query string part of the MongoDB connection string
				connSettings.connOptions = helper.getQueryString(connSettings.options);
				if (connSettings.connFormat === "mongodb") {
					let uri = `mongodb://${connSettings.host}:${connSettings.port}`;
					if (connSettings.dbName) uri = `${uri}/${connSettings.dbName}`;
					if (connSettings.connOptions)
						uri = `${uri}?${connSettings.connOptions}`;

					client = new mongo.MongoClient(uri, {
						auth: {
							username: connSettings.username,
							password: connSettings.password,
						},
					});
				} else {
					let uri = `mongodb+srv://${connSettings.host}`;
					if (connSettings.dbName) uri = `${uri}/${connSettings.dbName}`;
					if (connSettings.connOptions)
						uri = `${uri}?${connSettings.connOptions}`;

					client = new mongo.MongoClient(uri, {
						maxPoolSize: config.get("database.maxPoolSize"),
						auth: {
							username: connSettings.username,
							password: connSettings.password,
						},
					});
				}

				// Connect to the database of the application
				await client.connect();
				await client.close();

				return true;
			} catch (err) {
				throw new AgnostError(
					t("Cannot connect to the MongoDB database. %s", err.message)
				);
			}
		default:
			throw new AgnostError(
				t("Unsupported database type %s. %s", dbType, err.message)
			);
	}
}

/**
 * Returns true if successfully connects to the Redis cache otherwise throws an exception
 * @param  {object} connSettings The connection settings needed to connect to the Redis cache
 */
async function checkRedisConnection(connSettings) {
	return new Promise((resolve, reject) => {
		try {
			let redisClient = redis.createClient({
				...helper.getAsObject(connSettings.options),
				host: connSettings.host,
				port: connSettings.port,
				password:
					connSettings.password && connSettings.password !== "null"
						? connSettings.password
						: undefined,
				database: connSettings.databaseNumber ?? 0,
			});

			redisClient.on("connect", function () {
				// Disconnect from redis cache
				redisClient.quit();
				resolve(true);
			});

			redisClient.on("error", (err) =>
				reject(t("Cannot connect to the Redis cache. %s", err.message))
			);
		} catch (err) {
			reject(t("Cannot connect to the Redis cache. %s", err.message));
		}
	});
}

/**
 * Returns true if the cluster storage has been successfully bound
 * @param  {object} connSettings The connection settings needed to connect to the cluster storage
 */
async function checkClusterStorage(connSettings) {
	const minioClient = new Minio.Client({
		endPoint: connSettings.endPoint, // Kubernetes service name for MinIO
		port: connSettings.port, // MinIO service port (default: 9000)
		useSSL: connSettings.useSSL, // Whether to use SSL (default: false)
		accessKey: connSettings.accessKey, // MinIO access key
		secretKey: connSettings.secretKey, // MinIO secret key
	});

	try {
		await minioClient.listBuckets();
		return true;
	} catch (err) {
		reject(t("Cannot connect to MinIO. %s", err.message));
	}
}

/**
 * Returns availableReplica count if the API server is up and running. Please note that for each version we have a dedicated API server.
 * @param  {object} connSettings The connection settings needed to connect to the API server
 */
async function checkAPIServer(connSettings) {
	const k8sApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

	try {
		const revResponse = await k8sApi.listNamespacedCustomObject(
			"serving.knative.dev",
			"v1",
			process.env.NAMESPACE,
			"revisions",
			undefined,
			undefined,
			undefined,
			undefined,
			`app=${connSettings.name}`
		);

		let totalAvailable = 0;
		let totalUnAvailable = 0;
		const revisions = revResponse.body.items;

		for (let index = 0; index < revisions.length; index++) {
			const revision = revisions[index];
			const { availableReplicas, unavailableReplicas } = await checkDeployment(
				revision.metadata.name
			);
			totalAvailable += availableReplicas;
			totalUnAvailable += unavailableReplicas;
		}

		const response = await k8sApi.getNamespacedCustomObject(
			"serving.knative.dev",
			"v1",
			process.env.NAMESPACE,
			"services",
			connSettings.name
		);

		const serviceStatus = response.body.status;
		const latestCreatedRevisionName = serviceStatus.latestCreatedRevisionName;
		const latestReadyRevisionName = serviceStatus.latestReadyRevisionName;

		// Wheck whether the knative service is in update mode (e.g., image tag update etc. due to version changes)
		let updating = false;
		if (
			latestCreatedRevisionName === latestReadyRevisionName &&
			serviceStatus.conditions
		) {
			const readyCondition = serviceStatus.conditions.find(
				(c) => c.type === "Ready"
			);
			if (readyCondition && readyCondition.status === "True") updating = false;
		} else updating = true;

		return {
			availableReplicas: totalAvailable,
			unavailableReplicas: totalUnAvailable,
			updating,
		};
	} catch (err) {
		return await checkDeployment(connSettings.name);
	}
}

/**
 * Returns availableReplica count if the API server is up and running. Please note that for each version we have a dedicated API server.
 * @param  {object} connSettings The connection settings needed to connect to the API server
 */
async function checkDeployment(deploymentName) {
	const coreApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

	let result = null;
	try {
		result = await coreApi.readNamespacedDeployment(
			`${deploymentName}-deployment`,
			process.env.NAMESPACE
		);

		return {
			availableReplicas: result.body?.status?.availableReplicas ?? 0,
			unavailableReplicas: result.body?.status?.unavailableReplicas ?? 0,
		};
	} catch (err) {
		throw new AgnostError(
			t("API server does not have any available replicas.")
		);
	}
}

/**
 * Returns availableReplica count if the default scheduler pod is up and running. We have always on default scheduler pod in the cluster.
 * @param  {object} connSettings The connection settings needed to connect to the default scheduler pod
 */
async function checkDefaultScheduler(connSettings) {
	const coreApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

	let result = null;

	try {
		result = await coreApi.readNamespacedDeployment(
			connSettings.name,
			process.env.NAMESPACE
		);
	} catch (err) {
		return null;
	}

	if (
		result.body?.status?.availableReplicas === 0 ||
		!result.body?.status?.availableReplicas
	)
		throw new AgnostError(
			t("Default scheduler does not have any available replicas.")
		);

	return { availableReplicas: result.body?.status?.availableReplicas };
}

/**
 * Returns availableReplica count if the default realtime server deployment is up and running. We have always a default realtime pod in the cluster.
 * @param  {object} connSettings The connection settings needed to connect to the default realtime server pod
 */
async function checkDefaultRealtime(connSettings) {
	const coreApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

	let result = null;

	try {
		result = await coreApi.readNamespacedDeployment(
			connSettings.name,
			process.env.NAMESPACE
		);
	} catch (err) {
		return null;
	}

	if (
		result.body?.status?.availableReplicas === 0 ||
		!result.body?.status?.availableReplicas
	)
		throw new AgnostError(
			t("Default realtime server does not have any available replicas.")
		);

	return { availableReplicas: result.body?.status?.availableReplicas };
}

/**
 * Returns true if AWS S3 bucket exits
 * @param  {object} connSettings The connection settings needed to connect to the AWS S3 storage
 */
async function checkAWSStorage(connSettings) {
	const minioClient = new Minio.Client({
		endPoint: `s3.amazonaws.com`,
		port: 443,
		useSSL: true,
		accessKey: connSettings.accessKeyId,
		secretKey: connSettings.secretAccessKey,
		region: connSettings.region,
	});

	try {
		await minioClient.listBuckets();
		return true;
	} catch (err) {
		reject(t("Cannot connect to AWS S3 storage. %s", err.message));
	}
}

/**
 * Returns true if GCP cloud storage bucket exits
 * @param  {object} connSettings The connection settings needed to connect to the GCP cloud storage
 */
async function checkGCPStorage(connSettings) {
	try {
		const storage = new Storage({
			projectId: connSettings.projectId,
			credentials: JSON.parse(connSettings.keyFileContents),
		});

		const bucket = storage.bucket("agnoststorage");
		await bucket.exists();
		return true;
	} catch (err) {
		throw new AgnostError(
			t("Cannot connect to the GCP Cloud Storage. %s", err.message)
		);
	}
}

/**
 * Returns true if Azure blob storage container exits
 * @param  {object} connSettings The connection settings needed to connect to the Azure blog storage
 */
async function checkAzureStorage(connSettings) {
	try {
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			connSettings.connectionString
		);
		const containerClient =
			blobServiceClient.getContainerClient("agnoststorage");
		try {
			await containerClient.getProperties();
		} catch (err) {}

		return true;
	} catch (err) {
		if (err.statusCode === 404) {
			return false;
		} else {
			throw new AgnostError(
				t("Cannot connect to the Azure Blog Storage. %s", err.message)
			);
		}
	}
}

/**
 * Returns true if connection to the RabbitMQ is successful.
 * @param  {object} connSettings The connection settings needed to connect to the RabbitMQ
 */
async function checkRabbitMQConnection(connSettings) {
	// If the connection format is object then username and password etc. needed. If connection format is url then just the url parameter is neede
	if (connSettings.format === "object") {
		const { username, password, host, port, scheme, vhost, options } =
			connSettings;
		connSettings.url = `${scheme}://${username}:${password}@${host}:${port}/${
			vhost ?? ""
		}?${helper.getQueryString(options)}`;
	}

	try {
		const connection = await amqp.connect(connSettings.url);
		await connection.close();

		return true;
	} catch (err) {
		throw new AgnostError(
			t("Cannot establish connection to RabbitMQ. %s", err.message)
		);
	}
}

/**
 * Returns true if connection to the Kafka is successful.
 * @param  {object} connSettings The connection settings needed to connect to the RabbitMQ
 */
async function checkKafkaConnection(connSettings) {
	try {
		let kafka = null;
		if (connSettings.format === "simple") {
			kafka = new Kafka({
				clientId: connSettings.clientId,
				brokers: connSettings.brokers,
			});
		} else if (connSettings.format === "ssl") {
			kafka = new Kafka({
				clientId: connSettings.clientId,
				brokers: connSettings.brokers,
				ssl: {
					rejectUnauthorized: connSettings.ssl.rejectUnauthorized,
					ca: connSettings.ssl.ca,
					key: connSettings.ssl.key,
					cert: connSettings.ssl.cert,
				},
			});
		} else if (connSettings.format === "sasl") {
			kafka = new Kafka({
				clientId: connSettings.clientId,
				brokers: connSettings.brokers,
				ssl: true,
				sasl: {
					mechanism: connSettings.sasl.mechanism, // plain, scram-sha-256 or scram-sha-512
					username: connSettings.sasl.username,
					password: connSettings.sasl.password,
				},
			});
		}

		const admin = kafka.admin();
		await admin.connect();
		await admin.disconnect();

		return true;
	} catch (err) {
		throw new AgnostError(
			t("Cannot establish connection to Apache Kafka. %s", err.message)
		);
	}
}

// List of all cluster resources
export const clusterComponentsAll = [
	{
		deploymentName: "engine-worker-deployment",
		hpaName: "engine-worker-hpa",
	},
	{
		deploymentName: "engine-realtime-deployment",
		hpaName: "engine-realtime-hpa",
	},
	{
		deploymentName: "engine-monitor-deployment",
	},
	{
		deploymentName: "engine-scheduler-deployment",
	},
	{
		deploymentName: "platform-core-deployment",
		hpaName: "platform-core-hpa",
	},
	{
		deploymentName: "platform-sync-deployment",
		hpaName: "platform-sync-hpa",
	},
	{
		deploymentName: "platform-worker-deployment",
		hpaName: "platform-worker-hpa",
	},
	{
		deploymentName: "studio-deployment",
		hpaName: "studio-hpa",
	},
];

/**
 * Get cluster information
 */
async function getClusterInfo() {
	let dbClient = getDBClient();

	return await dbClient
		.db("agnost")
		.collection("clusters")
		.findOne({ masterToken: process.env.MASTER_TOKEN });
}

/**
 * Checks and updates cluster resource status
 */
async function checkClusterResourceStatus() {
	// We only check cluster resoruces if the cluster set up is complete
	const clusterObj = await getClusterInfo();
	if (!clusterObj) return;

	const clusterInfo = [];
	const clusterComponents = (await import("./clusterComponents.js"))
		.clusterComponents;

	const k8sApi = kubeconfig.makeApiClient(k8s.AppsV1Api);
	try {
		let deployments = await k8sApi.listNamespacedDeployment(
			process.env.NAMESPACE
		);

		for (const comp of clusterComponents) {
			clusterInfo.push(getDeploymentInfo(comp, deployments.body.items));
		}

		await upadateClusterDeploymentsStatus(clusterInfo);
	} catch (err) {
		throw new AgnostError(err.body?.message);
	}
}

/**
 * Returns information about a specific Agnost cluster default deployment
 */
function getDeploymentInfo(component, deployments) {
	const deployment = deployments.find(
		(entry) => entry.metadata.name === component.deploymentName
	);

	if (deployment) {
		const { status } = deployment;

		return {
			name: component.deploymentName,
			status:
				status.availableReplicas === 0
					? "Error"
					: status.updatedReplicas === status.replicas &&
					  status.replicas === status.availableReplicas &&
					  status.availableReplicas === status.readyReplicas
					? "OK"
					: "Updating",
		};
	} else {
		return {
			name: component.deploymentName,
			status: "Error",
		};
	}
}

/**
 * Updates the status of the cluster's default deployment resources
 * @param  {Array} deploymentsStatusInfo The status info of each default deployment of the cluster
 */
async function upadateClusterDeploymentsStatus(deploymentsStatusInfo) {
	// First get the cluster info
	const clusterInfo = await getClusterInfo();
	const existingStatus = clusterInfo.clusterResourceStatus ?? [];

	let statusChanged = false;
	// Check to see if status of deployments has changed
	for (const entry of deploymentsStatusInfo) {
		const existingEntry = existingStatus.find(
			(entry2) => entry2.name === entry.name
		);
		if (!existingEntry || existingEntry.status !== entry.status) {
			statusChanged = true;
			break;
		}
	}

	// Update status if there is change
	if (statusChanged) {
		//Make api call to the platform to log the error message
		axios
			.post(
				helper.getPlatformUrl() + "/v1/cluster/update-status",
				deploymentsStatusInfo,
				{
					headers: {
						Authorization: process.env.MASTER_TOKEN,
						"Content-Type": "application/json",
					},
				}
			)
			.catch((error) => {});
	}
}
