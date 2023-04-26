import pg from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import mongo from "mongodb";
import { DATABASE } from "../config/constants.js";

/**
 * Pools the connections to the database
 */
class ConnectionManager {
	constructor() {
		this.connections = new Map();
	}

	async getConn(id, type, connSettings, forceNew = false) {
		let conn = this.getConnection(id);

		if (conn && !forceNew) {
			return conn;
		} else return await this.setUpConnection(id, type, connSettings, false);
	}

	async getReadOnlyConn(id, type, connSettings) {
		let conn = this.getConnection(`${id}.ro`);

		if (conn) {
			return conn;
		} else return await this.setUpConnection(id, type, connSettings, true);
	}

	getConnection(id) {
		return this.connections.get(id);
	}

	addConnection(id, conn, readOnly = false) {
		if (readOnly) this.connections.set(`${id}.ro`, conn);
		else this.connections.set(id, conn);
	}

	async setUpConnection(id, type, connSettings, readOnly = false) {
		switch (type) {
			case DATABASE.PostgreSQL:
				try {
					const client = new pg.Pool({
						host: connSettings.host,
						port: connSettings.port,
						user: connSettings.username,
						password: connSettings.password,
						database: connSettings.database,
						max: config.get("general.maxPoolSize"),
					});

					await client.connect();
					this.addConnection(id, client, readOnly);

					return client;
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the PostgreSQL database. %s", err.message)
					);
				}
			case DATABASE.MySQL:
				try {
					const connection = await mysql.createPool({
						host: connSettings.host,
						port: connSettings.port,
						user: connSettings.username,
						password: connSettings.password,
						database: connSettings.database,
						connectionLimit: config.get("general.maxPoolSize"),
						multipleStatements: true,
					});

					this.addConnection(id, connection, readOnly);

					return connection;
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the MySQL database. %s", err.message)
					);
				}
			case DATABASE.SQLServer:
				try {
					const connection = await mssql.connect({
						server: connSettings.host,
						port: connSettings.port,
						user: connSettings.username,
						password: connSettings.password,
						database: connSettings.database,
						encrypt: false,
						pool: {
							max: config.get("general.maxPoolSize"),
						},
					});
					this.addConnection(id, connection, readOnly);

					return connection;
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the SQL Server database. %s", err.message)
					);
				}
			case DATABASE.MongoDB:
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
								maxPoolSize: config.get("general.maxPoolSize"),
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
								maxPoolSize: config.get("general.maxPoolSize"),
							}
						);
					}
					//Connect to the database of the application
					await client.connect();
					this.addConnection(id, client, readOnly);

					return client;
				} catch (err) {
					throw new AgnostError(
						t("Cannot connect to the MongoDB database. %s", err.message)
					);
				}
			default:
				throw new AgnostError(t("Unsupported database type"));
		}
	}
}

export default new ConnectionManager();
