import pg from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import mongo from "mongodb";
import redis from "redis";
import k8s from "@kubernetes/client-node";
import amqp from "amqplib";
import { Kafka } from "kafkajs";
import axios from "axios";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { BlobServiceClient } from "@azure/storage-blob";
import { Storage } from "@google-cloud/storage";

import { getDBClient } from "../init/db.js";

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
							["Creating", "Updating", "Deleting"].includes(resource.status)
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
						if (result.status === "OK" && resource.status === "OK") continue;

						// If the resource status has changed both update the resource status and add a new resource log
						if (result.status !== resource.status) {
							await upadateResourceStatus(resource, result);
							continue;
						}

						// If the resource is in error state then update the latest error resource log
						if (result.status === "Error" && resource.status === "Error") {
							await updateLatestResourceLog(resource, result);
						}
					}
				} catch (err) {}
			}

			// Interate to the next page
			pageNumber++;
			resources = await getResources(pageNumber, pageSize);
		}
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
			config.get("general.platformBaseUrl") + "/v1/telemetry/update-log",
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
			config.get("general.platformBaseUrl") + "/v1/telemetry/update-status",
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
	if (["Default Scheduler", "Default Realtime"].includes(resource.instance)) {
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
	if (["Default Scheduler", "Default Realtime"].includes(resource.instance)) {
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
					status: "OK",
					availableReplicas: result.availableReplicas,
					logs: [
						{
							startedAt: new Date(),
							status: "OK",
							message: t("API server is up and running"),
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
		case "Cluster Storage":
			try {
				let result = await checkClusterStorage(resource.access);
				if (result === null) return null;
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
		case "Default Scheduler":
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
		case "Default Realtime":
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
					client = new mongo.MongoClient(
						connSettings.connOptions
							? `mongodb://${connSettings.host}:${connSettings.port}?${connSettings.connOptions}`
							: `mongodb://${connSettings.host}:${connSettings.port}`,
						{
							auth: {
								username: connSettings.username,
								password: connSettings.password,
							},
						}
					);
				} else {
					client = new mongo.MongoClient(
						connSettings.connOptions
							? `mongodb+srv://${connSettings.host}?${connSettings.connOptions}`
							: `mongodb+srv://${connSettings.host}`,
						{
							auth: {
								username: connSettings.username,
								password: connSettings.password,
							},
						}
					);
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
	// Create a Kubernetes core API client
	const kubeconfig = new k8s.KubeConfig();
	kubeconfig.loadFromDefault();
	const coreApi = kubeconfig.makeApiClient(k8s.CoreV1Api);

	try {
		await coreApi.readNamespacedPersistentVolumeClaim(
			`${connSettings.name}-pvc`,
			config.get("general.k8sNamespace")
		);

		return true;
	} catch (err) {
		return null;
	}
}

/**
 * Returns availableReplica count if the API server is up and running. Please note that for each version we have a dedicated API server.
 * @param  {object} connSettings The connection settings needed to connect to the API server
 */
async function checkAPIServer(connSettings) {
	// Create a Kubernetes core API client
	const kubeconfig = new k8s.KubeConfig();
	kubeconfig.loadFromDefault();
	const coreApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

	let result = null;
	try {
		result = await coreApi.readNamespacedDeployment(
			`${connSettings.name}-deployment`,
			config.get("general.k8sNamespace")
		);
	} catch (err) {
		return null;
	}

	if (
		result.body?.status?.availableReplicas === 0 ||
		!result.body?.status?.availableReplicas
	)
		throw new AgnostError(
			t("API server does not have any available replicas.")
		);

	return { availableReplicas: result.body?.status?.availableReplicas };
}

/**
 * Returns availableReplica count if the default scheduler pod is up and running. We have always on default scheduler pod in the cluster.
 * @param  {object} connSettings The connection settings needed to connect to the default scheduler pod
 */
async function checkDefaultScheduler(connSettings) {
	// Create a Kubernetes core API client
	const kubeconfig = new k8s.KubeConfig();
	kubeconfig.loadFromDefault();
	const coreApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

	let result = null;

	try {
		result = await coreApi.readNamespacedDeployment(
			connSettings.name,
			config.get("general.k8sNamespace")
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
	// Create a Kubernetes core API client
	const kubeconfig = new k8s.KubeConfig();
	kubeconfig.loadFromDefault();
	const coreApi = kubeconfig.makeApiClient(k8s.AppsV1Api);

	let result = null;

	try {
		result = await coreApi.readNamespacedDeployment(
			connSettings.name,
			config.get("general.k8sNamespace")
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
	try {
		const s3 = new S3Client({
			credentials: {
				accessKeyId: connSettings.accessKeyId,
				secretAccessKey: connSettings.secretAccessKey,
			},
			region: connSettings.region,
		});

		try {
			const command = new HeadBucketCommand({
				Bucket: "agnoststorage",
			});
			await s3.send(command);
		} catch (err) {}

		return true;
	} catch (err) {
		if (err.statusCode === 404) {
			return true;
		} else {
			throw new AgnostError(
				t("Cannot connect to the AWS S3 storage. %s", err.message)
			);
		}
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
