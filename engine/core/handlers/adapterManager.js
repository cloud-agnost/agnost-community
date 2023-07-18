import pg from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import mongo from "mongodb";
import redis from "redis";
import amqp from "amqplib";
import * as Minio from "minio";
import { Kafka } from "kafkajs";
import { S3Client } from "@aws-sdk/client-s3";
import { BlobServiceClient } from "@azure/storage-blob";
import { Storage } from "@google-cloud/storage";
import { io } from "socket.io-client";
import { getMQClient } from "../init/queue.js";
import { MinIOStorage } from "../adapters/storage/MinIOStorage.js";
import { AWSStorage } from "../adapters/storage/AWSStorage.js";
import { GCPStorage } from "../adapters/storage/GCPStorage.js";
import { AzureStorage } from "../adapters/storage/AzureStorage.js";
import { PostgreSQL } from "../adapters/database/PostgreSQL.js";
import { MySQL } from "../adapters/database/MySQL.js";
import { SQLServer } from "../adapters/database/SQLServer.js";
import { MongoDB } from "../adapters/database/MongoDB.js";
import { RabbitMQ } from "../adapters/queue/RabbitMQ.js";
import { Kafka as KafkaAdapter } from "../adapters/queue/Kafka.js";
import { Redis } from "../adapters/cache/Redis.js";
import { Socketio } from "../adapters/realtime/Socketio.js";
import { Agenda } from "../adapters/scheduler/Agenda.js";

export class AdapterManager {
	constructor() {
		// Keeps the list of connections object {type, instance, iid, readOnly, adapter}
		this.adapters = new Map();
	}

	/**
	 * Returns the connection object matching the resource iid
	 * @param  {string} resourceiid The resource identifier
	 */
	getAdapterObject2(resourceiid) {
		let adapterObj = this.adapters.get(resourceiid);
		if (adapterObj) return adapterObj;
		else return null;
	}

	/**
	 * Returns the connection object matching the type and name
	 * @param  {string} name The design name of the resource
	 * @param  {string} type The resource type
	 * @param  {boolean} readOnly Whether to return the read-only connection if available, otherwise return read-write connection
	 */
	getAdapterObject(name, type, readOnly = false) {
		// Iterate the environment resource mappings to find the corresponding resource mapping
		const mappings = META.getResourceMappings();
		const mapping = mappings.find(
			(entry) => entry.design.type === type && entry.design.name === name
		);

		if (mapping) {
			let adapterObj = this.adapters.get(mapping.resource.iid);

			if (readOnly) {
				// If the readonly connection is not there then return the read-write connection
				if (adapterObj?.slaves && adapterObj.slaves.length > 0) {
					return adapterObj.slaves[
						helper.randomInt(1, adapterObj.slaves.length) - 1
					];
				} else return adapterObj;
			} else return adapterObj;
		} else return null;
	}

	/**
	 * Returns the database connection object matching the name
	 * @param  {string} name The design name of the resource
	 * @param  {boolean} readOnly Whether to return the read-only connection if available otherwise return read-write connection
	 */
	getDatabaseAdapter(name, readOnly = false) {
		const adapterObj = this.getAdapterObject(name, "database", readOnly);
		return adapterObj?.adapter || null;
	}

	/**
	 * Returns the cache connection object matching the name
	 * @param  {string} name The design name of the resource
	 * @param  {boolean} readOnly Whether to return the read-only connection if available otherwise return read-write connection
	 */
	getCacheAdapter(name, readOnly = false) {
		const adapterObj = this.getAdapterObject(name, "cache", readOnly);
		return adapterObj?.adapter || null;
	}

	/**
	 * Returns the storage connection object matching the name
	 * @param  {string} name The design name of the resource
	 */
	getStorageAdapter(name) {
		const adapterObj = this.getAdapterObject(name, "storage", false);
		return adapterObj?.adapter || null;
	}

	/**
	 * Returns the message queue connection object matching the name
	 * @param  {string} name The design name of the resource
	 */
	getQueueAdapter(name) {
		const adapterObj = this.getAdapterObject(name, "queue", false);
		return adapterObj?.adapter || null;
	}

	/**
	 * Returns the message queue connection object matching the name
	 * @param  {string} name The design name of the resource
	 */
	getTaskAdapter(name) {
		const adapterObj = this.getAdapterObject(name, "scheduler", false);
		return adapterObj?.adapter || null;
	}

	/**
	 * Returns the realtime connection object matching the name
	 * @param  {string} name The design name of the resource
	 */
	getRealtimeAdapter(name) {
		const adapterObj = this.getAdapterObject(name, "realtime", false);
		return adapterObj?.adapter || null;
	}

	/**
	 * Sets up the connection to the resource. If the resource has both read-write and read-only settings the sets up separate connections for each.
	 * @param  {string} name The unique design name of the resource
	 * @param  {Object} resource Information about the resource itself and its connection settings
	 * @param  {boolean} readOnly Whether we would like to get the read-only connection or not
	 */
	async setupConnection(resource) {
		switch (resource.instance) {
			case "PostgreSQL":
				await this.connectToPostgresSQL(resource);
				break;
			case "MySQL":
				await this.connectToMySQL(resource);
				break;
			case "SQL Server":
				await this.connectToSQLServer(resource);
				break;
			case "MongoDB":
				await this.connectToMongoDB(resource);
				break;
			case "Oracle":
				break;
			case "Redis":
				await this.connectToRedis(resource);
				break;
			case "AWS S3":
				await this.connectToAWSStorage(resource);
				break;
			case "GCP Cloud Storage":
				await this.connectToGCPStorage(resource);
				break;
			case "Azure Blob Storage":
				await this.connectToAzureStorage(resource);
				break;
			case "MinIO":
				await this.connectToClusterStorage(resource);
				break;
			case "RabbitMQ":
				await this.connectToRabbitMQ(resource);
				break;
			case "Kafka":
				await this.connectToKafka(resource);
				break;
			case "Socket.io":
				await this.connectToRealtimeServer(resource);
				break;
			case "Agenda":
				await this.connectToScheduler(resource);
				break;
			default:
				return null;
		}
	}

	/**
	 * Connects to a PostgresSQL database using its driver
	 * @param  {Object} resource The resource object
	 * @param  {boolean} readOnly Whether this is a readonly connection or not
	 */
	async connectToPostgresSQL(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, accessReadOnly, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const client = new pg.Client({
				...helper.getAsObject(connSettings.options),
				host: connSettings.host,
				port: connSettings.port,
				user: connSettings.username,
				password: connSettings.password,
				database: connSettings.dbName,
			});

			await client.connect();

			const adapterObj = {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new PostgreSQL(client),
				slaves: [],
			};

			this.adapters.set(resource.iid, adapterObj);

			// Add readonly connections as slave
			if (accessReadOnly) {
				for (let i = 0; i < accessReadOnly.length; i++) {
					let config = accessReadOnly[i];

					try {
						const slaveClient = new pg.Client({
							...helper.getAsObject(config.options),
							host: config.host,
							port: config.port,
							user: config.username,
							password: config.password,
							database: config.dbName,
						});

						await slaveClient.connect();
						adapterObj.slaves.push({
							name,
							type,
							instance,
							iid,
							readOnly: true,
							adapter: new PostgreSQL(slaveClient),
						});
					} catch (err) {}
				}
			}
		} catch (err) {}
	}

	/**
	 * Connects to a MySQL database using its driver
	 * @param  {Object} resource The resource object
	 * @param  {boolean} readOnly Whether this is a readonly connection or not
	 */
	async connectToMySQL(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, accessReadOnly, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const client = await mysql.createConnection({
				...helper.getAsObject(connSettings.options),
				host: connSettings.host,
				port: connSettings.port,
				user: connSettings.username,
				password: connSettings.password,
				database: connSettings.dbName,
			});

			const adapterObj = {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new MySQL(client),
				slaves: [],
			};

			this.adapters.set(resource.iid, adapterObj);

			// Add readonly connections as slave
			if (accessReadOnly) {
				for (let i = 0; i < accessReadOnly.length; i++) {
					let config = accessReadOnly[i];

					try {
						const slaveClient = await mysql.createConnection({
							...helper.getAsObject(config.options),
							host: config.host,
							port: config.port,
							user: config.username,
							password: config.password,
							database: config.dbName,
						});

						adapterObj.slaves.push({
							name,
							type,
							instance,
							iid,
							readOnly: true,
							adapter: new MySQL(slaveClient),
						});
					} catch (err) {}
				}
			}
		} catch (err) {}
	}

	/**
	 * Connects to a SQL Server database using its driver
	 * @param  {Object} resource The resource object
	 * @param  {boolean} readOnly Whether this is a readonly connection or not
	 */
	async connectToSQLServer(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, accessReadOnly, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const client = await mssql.connect({
				...helper.getAsObject(connSettings.options),
				server: connSettings.host,
				port: connSettings.port,
				user: connSettings.username,
				password: connSettings.password,
				database: connSettings.dbName,
				encrypt: connSettings.encrypt ?? false,
			});

			const adapterObj = {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new SQLServer(client),
				slaves: [],
			};

			this.adapters.set(resource.iid, adapterObj);

			// Add readonly connections as slave
			if (accessReadOnly) {
				for (let i = 0; i < accessReadOnly.length; i++) {
					let config = accessReadOnly[i];

					try {
						const slaveClient = await mssql.connect({
							...helper.getAsObject(config.options),
							host: config.host,
							port: config.port,
							user: config.username,
							password: config.password,
							database: config.dbName,
						});

						adapterObj.slaves.push({
							name,
							type,
							instance,
							iid,
							readOnly: true,
							adapter: new SQLServer(slaveClient),
						});
					} catch (err) {}
				}
			}
		} catch (err) {}
	}

	/**
	 * Connects to a MongoDB database using its driver
	 * @param  {Object} resource The resource object
	 * @param  {boolean} readOnly Whether this is a readonly connection or not
	 */
	async connectToMongoDB(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, accessReadOnly, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			/* Example: 			
					{
						"connFormat": "mongodb+srv",
						"host": "clustero-qxaly.mongodb.net",
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
					auth: {
						username: connSettings.username,
						password: connSettings.password,
					},
				});
			}

			// Connect to the database of the application
			await client.connect();

			const adapterObj = {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new MongoDB(client),
				slaves: [],
			};

			this.adapters.set(resource.iid, adapterObj);

			// Add readonly connections as slave
			if (accessReadOnly) {
				for (let i = 0; i < accessReadOnly.length; i++) {
					let config = accessReadOnly[i];

					try {
						let slaveClient = null;
						// Build query string part of the MongoDB connection string
						config.connOptions = helper.getQueryString(config.options);
						if (config.connFormat === "mongodb") {
							slaveClient = new mongo.MongoClient(
								config.connOptions
									? `mongodb://${config.host}:${config.port}?${config.connOptions}`
									: `mongodb://${config.host}:${config.port}`,
								{
									auth: {
										username: config.username,
										password: config.password,
									},
								}
							);
						} else {
							slaveClient = new mongo.MongoClient(
								config.connOptions
									? `mongodb+srv://${config.host}?${config.connOptions}`
									: `mongodb+srv://${config.host}`,
								{
									auth: {
										username: config.username,
										password: config.password,
									},
								}
							);
						}

						// Connect to the database of the application
						await slaveClient.connect();

						adapterObj.slaves.push({
							name,
							type,
							instance,
							iid,
							readOnly: true,
							adapter: new MongoDB(slaveClient),
						});
					} catch (err) {}
				}
			}
		} catch (err) {}
	}

	/**
	 * Connects to a Redis cache using its driver
	 * @param  {Object} resource The resource object
	 * @param  {boolean} readOnly Whether this is a readonly connection or not
	 */
	async connectToRedis(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, accessReadOnly, iid, instance, type, name } = resource;
			let connSettings = access;

			let client = redis.createClient({
				host: connSettings.host,
				port: connSettings.port,
				password:
					connSettings.password && connSettings.password !== "null"
						? connSettings.password
						: undefined,
				database: connSettings.databaseNumber ?? 0,
			});

			client.on("connect", () => {
				const adapterObj = {
					name,
					type,
					instance,
					iid,
					readOnly: false,
					adapter: new Redis(client),
					slaves: [],
				};

				this.adapters.set(resource.iid, adapterObj);

				// Add readonly connections as slave
				if (accessReadOnly) {
					for (let i = 0; i < accessReadOnly.length; i++) {
						let config = accessReadOnly[i];

						try {
							const slaveClient = redis.createClient({
								host: config.host,
								port: config.port,
								password:
									config.password && config.password !== "null"
										? config.password
										: undefined,
								database: config.databaseNumber ?? 0,
							});

							adapterObj.slaves.push({
								name,
								type,
								instance,
								iid,
								readOnly: true,
								adapter: new SQLServer(slaveClient),
							});
						} catch (err) {}
					}
				}
			});

			client.on("error", (err) => {});
		} catch (err) {}
	}

	/**
	 * Connects to RabbitMQ message broker using its driver
	 * @param  {Object} resource The resource object
	 */
	async connectToRabbitMQ(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			// If the connection format is object then username and password etc. needed. If connection format is url then just the url parameter is neede
			if (connSettings.format === "object") {
				const { username, password, host, port, scheme, vhost, options } =
					connSettings;
				connSettings.url = `${scheme}://${username}:${password}@${host}:${port}/${
					vhost ?? ""
				}?${helper.getQueryString(options)}`;
			}

			const client = await amqp.connect(connSettings.url);

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new RabbitMQ(client),
			});
		} catch (err) {}
	}

	/**
	 * Connects to Kafka messaging system using its driver
	 * @param  {Object} resource The resource object
	 */
	async connectToKafka(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

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

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new KafkaAdapter(admin),
			});
		} catch (err) {}
	}

	/**
	 * Creates an S3 client
	 * @param  {Object} resource The resource object
	 */
	async connectToAWSStorage(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const s3 = new S3Client({
				credentials: {
					accessKeyId: connSettings.accessKeyId,
					secretAccessKey: connSettings.secretAccessKey,
				},
				region: connSettings.region,
			});

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new AWSStorage(s3),
			});
		} catch (err) {}
	}

	/**
	 * Creates a GCP storage object
	 * @param  {Object} resource The resource object
	 */
	async connectToGCPStorage(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const storage = new Storage({
				projectId: connSettings.projectId,
				credentials: JSON.parse(connSettings.keyFileContents),
			});

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new GCPStorage(storage),
			});
		} catch (err) {}
	}

	/**
	 * Creates an Azure blob storage client
	 * @param  {Object} resource The resource object
	 */
	async connectToAzureStorage(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid, false);
		if (adapterObj) return;

		try {
			const { access, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const blobServiceClient = BlobServiceClient.fromConnectionString(
				connSettings.connectionString
			);

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new AzureStorage(blobServiceClient),
			});
		} catch (err) {}
	}

	/**
	 * Creates a MinIO cluster storage client
	 * @param  {Object} resource The resource object
	 */
	async connectToClusterStorage(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const minioClient = new Minio.Client({
				endPoint: connSettings.endPoint, // Kubernetes service name for MinIO
				port: connSettings.port, // MinIO service port (default: 9000)
				useSSL: connSettings.useSSL, // Whether to use SSL (default: false)
				accessKey: connSettings.accessKey, // MinIO access key
				secretKey: connSettings.secretKey, // MinIO secret key
			});

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new MinIOStorage(minioClient),
			});
		} catch (err) {}
	}

	/**
	 * Creates a websocket connection to the realtime server
	 * @param  {Object} resource The resource object
	 */
	async connectToRealtimeServer(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { access, iid, instance, type, name } = resource;
			let connSettings = access;
			if (!connSettings) return;

			const socket = io(`${connSettings.serverURL}`, {
				reconnection: config.get("realtime.reconnection"),
				reconnectionDelay: config.get("realtime.reconnectionDelay"),
				transports: ["websocket", "polling"],
			});

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new Socketio(socket),
			});
		} catch (err) {}
	}

	/**
	 * Creates a websocket connection to the realtime server
	 * @param  {Object} resource The resource object
	 */
	async connectToScheduler(resource) {
		// First check whether the resource has already been registered or not
		const adapterObj = this.getAdapterObject2(resource.iid);
		if (adapterObj) return;

		try {
			const { iid, instance, type, name } = resource;

			this.adapters.set(resource.iid, {
				name,
				type,
				instance,
				iid,
				readOnly: false,
				adapter: new Agenda(getMQClient()),
			});
		} catch (err) {}
	}

	/**
	 * Removes the connection from the connection cache also disconnects them from the actual resource.
	 * It removes both read-only and read-write connections if applicable
	 * @param  {string} resourceId The iid of the resource object
	 */
	async removeConnection(name, type) {
		let adapterObj = this.getAdapterObject(name, type, true);
		if (adapterObj) {
			await this.disconnect(adapterObj);
			this.adapters.delete(`${adapterObj.iid}-ro`);
		}

		adapterObj = this.getAdapterObject(name, type, false);
		if (adapterObj) {
			await this.disconnect(adapterObj);
			this.adapters.delete(`${adapterObj.iid}-rw`);
		}
	}

	/**
	 * Performs the actual disconnection of the connection
	 * @param  {Object} adapterObj The connection object
	 */
	async disconnect(adapterObj) {
		const adapter = adapterObj.adapter;
		if (!adapter) return;

		try {
			await adapter.disconnect();
		} catch (err) {}
	}

	/**
	 * Cleanup method to disconnect from all connections
	 */
	async disconnectAll() {
		const iterator = this.adapters.values();
		for (const adapterObj of iterator) {
			await this.disconnect(adapterObj);
			console.log(`Closed connection to resource ${adapterObj.name}`);
		}
		this.adapters.clear();
	}
}

export const adapterManager = new AdapterManager();
