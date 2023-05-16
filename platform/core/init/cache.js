import redis from "redis";
import util from "util";

//Redis client
var client;
var clientReadReplica;

export const connectToRedisCache = async () => {
	try {
		let cacheConfig = config.get("cache");
		client = redis.createClient({
			host: process.env.CACHE_HOSTNAME,
			port: cacheConfig.port,
			password:
				process.env.CACHE_PWD && process.env.CACHE_PWD !== "null"
					? process.env.CACHE_PWD
					: undefined,
		});

		client.on("connect", function () {
			// Promisify the methods
			client.get = util.promisify(client.get);
			client.set = util.promisify(client.set);
			client.del = util.promisify(client.del);

			logger.info(
				`Connected to the cache server @${process.env.CACHE_HOSTNAME}:${cacheConfig.port}`
			);
		});
	} catch (err) {
		logger.error(`Cannot connect to the cache server`, { details: err });
		process.exit(1);
	}

	//If we have the read replica cache then connect to it
	let readReplicaConfig = null;
	try {
		readReplicaConfig = config.get("cache.readReplica");
	} catch (err) {}

	if (readReplicaConfig) {
		try {
			clientReadReplica = redis.createClient({
				host: process.env.CACHE_READ_REPLICA_HOSTNAME,
				port: readReplicaConfig.port,
				password:
					process.env.CACHE_READ_REPLICA_PWD &&
					process.env.CACHE_READ_REPLICA_PWD !== "null"
						? process.env.CACHE_READ_REPLICA_PWD
						: undefined,
			});

			clientReadReplica.on("connect", async function () {
				// Promisify the get method
				clientReadReplica.get = util.promisify(clientReadReplica.get);

				logger.info(
					`Connected to the read replica cache server @${process.env.CACHE_READ_REPLICA_HOSTNAME}:${readReplicaConfig.port}`
				);
			});
		} catch (err) {
			logger.error(`Cannot connect to the cache read replica server`, {
				details: err,
			});
			process.exit(1);
		}
	}
};

export const disconnectFromRedisCache = () => {
	if (client) client.quit();
	logger.info("Disconnected from the cache server");

	if (clientReadReplica) {
		clientReadReplica.quit();
		logger.info("Disconnected from the read-replica cache server");
	}
};

/**
 * Stores a value in cache using the key, if ttl (time-to-live)
 * @param  {string} key Stored value key
 * @param  {any} value Stored value, if object/array passed then stringifies the value
 * @param  {string} ttl time-to-live in seconds
 */
export const setKey = async (key, value, ttl) => {
	if (!key || !value) return;

	if (value && typeof value === "object") value = JSON.stringify(value);

	if (ttl) await client.set(key.toString(), value, "EX", ttl);
	else await client.set(key.toString(), value);
};

/**
 * Returns the key value from cache
 * @param  {string} key
 */
export const getKey = async (key) => {
	if (!key) return undefined;

	// Use read replica if available
	let conn = clientReadReplica || client;

	let value = await conn.get(key.toString());
	if (value !== null && value !== undefined) {
		try {
			return JSON.parse(value);
		} catch (err) {
			return value;
		}
	}

	return value;
};

/**
 * Deletes the key from cache
 * @param  {string} key
 */
export const deleteKey = async (key) => {
	if (!key) return;
	return await client.del(key.toString());
};

export const getRedisClient = () => {
	return client;
};
