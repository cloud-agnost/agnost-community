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
        if (forceNew) {
            return await this.setUpConnection(id, type, connSettings);
        }

        let conn = this.getConnection(id);

        if (conn) return conn;
        else return await this.setUpConnection(id, type, connSettings);
    }

    getConnection(id) {
        return this.connections.get(id);
    }

    addConnection(id, conn) {
        this.connections.set(id, conn);
    }

    async removeAllConnections() {
        for (const conn of this.connections.values()) {
            try {
                await conn.end();
            } catch (err) {}
            try {
                await conn.close();
            } catch (err) {}
        }

        this.connections.clear();
    }

    async removeConnection(id, type) {
        let conn = this.getConnection(id);
        if (conn) {
            try {
                switch (type) {
                    case DATABASE.PostgreSQL:
                        await conn.end();
                        break;
                    case DATABASE.MySQL:
                        await conn.end();
                        break;
                    case DATABASE.SQLServer:
                        await conn.close();
                        break;
                    case DATABASE.MongoDB:
                        await conn.close();
                        break;
                    default:
                        try {
                            await conn.end();
                        } catch (err) {}
                        try {
                            await conn.close();
                        } catch (err) {}
                        break;
                }
            } catch (err) {}
        }

        this.connections.delete(id);
    }

    async setUpConnection(id, type, connSettings) {
        switch (type) {
            case DATABASE.PostgreSQL:
                try {
                    const client = new pg.Pool({
                        ...helper.getAsObject(connSettings.options),
                        host: connSettings.host,
                        port: connSettings.port,
                        user: connSettings.username,
                        password: connSettings.password,
                        database: connSettings.database,
                        max: config.get("general.maxPoolSize"),
                    });

                    client.on("error", (err, errClient) => {});
                    this.addConnection(id, client);

                    return client;
                } catch (err) {
                    throw new AgnostError(t("Cannot connect to the PostgreSQL database. %s", err.message));
                }
            case DATABASE.MySQL:
                try {
                    const connection = await mysql.createPool({
                        ...helper.getAsObject(connSettings.options),
                        host: connSettings.host,
                        port: connSettings.port,
                        user: connSettings.username,
                        password: connSettings.password,
                        database: connSettings.database,
                        connectionLimit: config.get("general.maxPoolSize"),
                        multipleStatements: true, // - it's necessary for multiple statements in one query
                    });

                    connection.on("error", (err) => {});
                    this.addConnection(id, connection);

                    return connection;
                } catch (err) {
                    throw new AgnostError(t("Cannot connect to the MySQL database. %s", err.message));
                }
            case DATABASE.SQLServer:
                try {
                    const connection = await mssql.connect({
                        requestTimeout: config.get("database.timeout"),
                        ...helper.getAsObject(connSettings.options),
                        server: connSettings.host,
                        port: connSettings.port,
                        user: connSettings.username,
                        password: connSettings.password,
                        database: connSettings.database,
                        encrypt: connSettings.encrypt ?? false,
                        pool: {
                            max: config.get("general.maxPoolSize"),
                        },
                    });
                    this.addConnection(id, connection);

                    return connection;
                } catch (err) {
                    throw new AgnostError(t("Cannot connect to the SQL Server database. %s", err.message));
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
                    // Build query string part of the MongoDB connection string
                    connSettings.connOptions = helper.getQueryString(connSettings.options);

                    if (connSettings.connFormat === "mongodb") {
                        let uri = `mongodb://${connSettings.host}:${connSettings.port}`;
                        if (connSettings.dbName) uri = `${uri}/${connSettings.dbName}`;
                        if (connSettings.connOptions) uri = `${uri}?${connSettings.connOptions}`;

                        client = new mongo.MongoClient(uri, {
                            auth: {
                                username: connSettings.username,
                                password: connSettings.password,
                            },
                        });
                    } else {
                        let uri = `mongodb+srv://${connSettings.host}`;
                        if (connSettings.dbName) uri = `${uri}/${connSettings.dbName}`;
                        if (connSettings.connOptions) uri = `${uri}?${connSettings.connOptions}`;

                        client = new mongo.MongoClient(uri, {
                            maxPoolSize: config.get("database.maxPoolSize"),
                            auth: {
                                username: connSettings.username,
                                password: connSettings.password,
                            },
                        });
                    }

                    //Connect to the database of the application
                    await client.connect();
                    client.on("error", (err) => {});
                    this.addConnection(id, client);

                    return client;
                } catch (err) {
                    throw new AgnostError(t("Cannot connect to the MongoDB database. %s", err.message));
                }
            default:
                throw new AgnostError(t("Unsupported database type"));
        }
    }
}

export default new ConnectionManager();
