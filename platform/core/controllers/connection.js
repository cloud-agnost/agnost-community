import pg from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import mongo from "mongodb";
import axios from "axios";

class ConnectionController {
	constructor() {}

	/**
	 * Encrtypes sensitive connection data
	 * @param  {string} type The type of the resource
	 * @param  {string} instance The instance of the resource
	 * @param  {Object} access The connection settings needed to connect to the resource
	 */
	encyrptSensitiveData(type, instance, access) {
		switch (type) {
			case "database":
				switch (instance) {
					case "PostgreSQL":
					case "MySQL":
					case "SQL Server":
					case "MongoDB":
						return {
							...access,
							host: helper.encryptText(access.host),
							username: helper.encryptText(access.username),
							password: helper.encryptText(access.password),
						};
					default:
						return access;
				}
			case "engine":
				return {
					...access,
					workerUrl: helper.encryptText(access.workerUrl),
					accessToken: helper.encryptText(access.accessToken),
				};

			default:
				return access;
		}
	}

	/**
	 * Decrypt connection data
	 * @param  {string} type The type of the resource
	 * @param  {string} instance The instance of the resource
	 * @param  {Object} access The encrypted connection settings needed to connect to the resource
	 */
	decrptSensitiveData(type, instance, access) {
		switch (type) {
			case "database":
				switch (instance) {
					case "PostgreSQL":
					case "MySQL":
					case "SQL Server":
					case "MongoDB":
						return {
							...access,
							host: helper.decryptText(access.host),
							username: helper.decryptText(access.username),
							password: helper.decryptText(access.password),
						};
					default:
						return access;
				}
			case "engine":
				return {
					...access,
					workerUrl: helper.decryptText(access.workerUrl),
					accessToken: helper.decryptText(access.accessToken),
				};

			default:
				return access;
		}
	}

	/**
	 * Returns true if successfully connects to the database otherwise throws an exception
	 * @param  {string} dbType The type of the datbase e.g., PostgreSQL, MySQL
	 * @param  {string} connSettings The connection settings needed to connect to the database
	 */
	async testDBConnection(dbType, connSettings) {
		switch (dbType) {
			case "PostgreSQL":
				try {
					const client = new pg.Client({
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
						server: connSettings.host,
						port: connSettings.port,
						user: connSettings.username,
						password: connSettings.password,
						encrypt: false,
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
						"password": "G3oUiFhcKczQI6lJ"
					}
					 */
					let client = null;
					if (connSettings.connFormat === "mongodb") {
						client = new mongo.MongoClient(
							connSettings.connOptions
								? `mongodb://${connSettings.host}:${connSettings.port}/?${connSettings.connOptions}`
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
								? `mongodb+srv://${connSettings.host}/?${connSettings.connOptions}`
								: `mongodb+srv://${connSettings.host}`,
							{
								auth: {
									username: connSettings.username,
									password: connSettings.password,
								},
							}
						);
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
			default:
				return true;
		}

		return true;
	}

	/**
	 * Returns true if successfully connects to the execution engine otherwise throws an exception
	 * @param  {string} connSettings The connection settings needed to connect to the execution engine
	 */
	async testEngineConnection(connSettings) {
		try {
			//Make api call to environment's execution engine to validate connection and access token
			await axios.get(`${connSettings.workerUrl}/agnost/validate`, {
				headers: {
					Authorization: connSettings.accessToken,
					"Content-Type": "application/json",
				},
			});
		} catch (err) {
			throw new AgnostError(
				t(
					"Cannot connect to the execution engine. %s",
					err.response?.data?.details || err.message
				)
			);
		}
	}
}

export default new ConnectionController();
