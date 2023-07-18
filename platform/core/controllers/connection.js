import pg from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import mongo from "mongodb";
import amqp from "amqplib";
import redis from "redis";
import { Kafka } from "kafkajs";
import { Storage } from "@google-cloud/storage";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { BlobServiceClient } from "@azure/storage-blob";

class ConnectionController {
	constructor() {}

	/**
	 * Returns true if successfully connects to the database otherwise throws an exception
	 * @param  {string} dbType The type of the datbase e.g., PostgreSQL, MySQL
	 * @param  {string} connSettings The connection settings needed to connect to the database
	 */
	async testConnection(dbType, connSettings) {
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
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the PostgreSQL database. %s", err.message)
					);
				}
				break;
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
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the MySQL database. %s", err.message)
					);
				}
				break;
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
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the SQL Server database. %s", err.message)
					);
				}
				break;
			case "MongoDB":
				try {
					/* Example: 			
					{
						"connFormat": "mongodb+srv",
						"host": "cluster0-qxaly.mongodb.net",
						"username": "umit_cakmak",
						"password": "G3oUiFhcKczQI6lJ",
						"dbName": "deneme"
					}
					 */
					let client = null;
					// Build query string part of the MongoDB connection string
					connSettings.connOptions = helper.getQueryString(
						connSettings.options
					);

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
					//Connect to the database of the application
					await client.connect();

					await client.close();
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the MongoDB database. %s", err.message)
					);
				}
				break;
			case "RabbitMQ":
				try {
					// If the connection format is object then username and password etc. needed. If connection format is url then just the url parameter is neede
					if (connSettings.format === "object") {
						const { username, password, host, port, scheme, vhost, options } =
							connSettings;
						connSettings.url = `${scheme}://${username}:${password}@${host}:${port}/${
							vhost ?? ""
						}?${helper.getQueryString(options)}`;
					}

					const client = await amqp.connect(connSettings.url);
					await client.close();
				} catch (err) {
					throw new AgnostError(
						t("Cannot establish connection to RabbitMQ. %s", err.message)
					);
				}
				break;
			case "Kafka":
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
				} catch (err) {
					throw new AgnostError(
						t("Cannot establish connection to Kafka. %s", err.message)
					);
				}
				break;
			case "Redis":
				try {
					await checkRedisConnection(connSettings);
				} catch (err) {
					throw new AgnostError(err);
				}
				break;
			case "AWS S3":
				try {
					const s3 = new S3Client({
						credentials: {
							accessKeyId: connSettings.accessKeyId,
							secretAccessKey: connSettings.secretAccessKey,
						},
						region: connSettings.region,
					});

					const command = new HeadBucketCommand({
						Bucket: "agnoststorage",
					});
					await s3.send(command);
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the AWS S3 storage. %s", err.message)
					);
				}
				break;
			case "GCP Cloud Storage":
				try {
					const storage = new Storage({
						projectId: connSettings.projectId,
						credentials: JSON.parse(connSettings.keyFileContents),
					});

					const bucket = storage.bucket("agnoststorage");
					await bucket.exists();
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the GCP Cloud Storage. %s", err.message)
					);
				}
				break;
			case "Azure Blob Storage":
				try {
					const blobServiceClient = BlobServiceClient.fromConnectionString(
						connSettings.connectionString
					);
					const containerClient =
						blobServiceClient.getContainerClient("agnoststorage");
					try {
						await containerClient.getProperties();
					} catch (err) {}
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the Azure Blob Storage. %s", err.message)
					);
				}
				break;
			default:
				return true;
		}

		return true;
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

export default new ConnectionController();
