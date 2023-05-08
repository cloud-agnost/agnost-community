import pg from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import mongo from "mongodb";

class ConnectionController {
	constructor() {}

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
}

export default new ConnectionController();
