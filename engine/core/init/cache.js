import redis from "redis";

//Redis client
var client;
var clientReadReplica;

export const connectToRedisCache = async (callback) => {
	//If we have the read replica cache then connect to it
	let readReplicaConfig = null;
	try {
		readReplicaConfig = config.get("cache.readReplica");
	} catch (err) {}

	try {
		let cacheConfig = config.get("cache");
		client = redis
			.createClient({
				socket: { host: process.env.CACHE_HOSTNAME, port: cacheConfig.port },
				password:
					process.env.CACHE_PWD && process.env.CACHE_PWD !== "null"
						? process.env.CACHE_PWD
						: undefined,
			})
			.on("error", function (err) {
				logger.error(`Cannot connect to the cache server`, { details: err });
				process.exit(1);
			});

		await client.connect();

		logger.info(
			`Connected to the cache server @${process.env.CACHE_HOSTNAME}:${cacheConfig.port}`
		);
		// If we have a callback function and do not have a read replica cache then execute the callback function
		if (callback && !readReplicaConfig) callback();
	} catch (err) {
		logger.error(`Cannot connect to the cache server`, { details: err });
		process.exit(1);
	}

	if (readReplicaConfig) {
		try {
			clientReadReplica = await redis
				.createClient({
					socket: {
						host: process.env.CACHE_READ_REPLICA_HOSTNAME,
						port: readReplicaConfig.port,
					},
					password:
						process.env.CACHE_READ_REPLICA_PWD &&
						process.env.CACHE_READ_REPLICA_PWD !== "null"
							? process.env.CACHE_READ_REPLICA_PWD
							: undefined,
				})
				.on("error", function (err) {
					logger.error(`Cannot connect to the replica cache server`, {
						details: err,
					});
					process.exit(1);
				})
				.connect();

			logger.info(
				`Connected to the read replica cache server @${process.env.CACHE_READ_REPLICA_HOSTNAME}:${readReplicaConfig.port}`
			);

			// If we have a callback function then execute it
			if (callback) callback();
		} catch (err) {
			logger.error(`Cannot connect to the cache read replica server`, {
				details: err,
			});
			process.exit(1);
		}
	}
};

export const disconnectFromRedisCache = async () => {
	if (client) client.disconnect();
	logger.info("Disconnected from the cache server");

	if (clientReadReplica) {
		clientReadReplica.disconnect();
		logger.info("Disconnected from the read-replica cache server");
	}
};

export const getRedisClient = () => {
	return client;
};

/**
 * Stores a value in cache using the key
 * @param  {string} key Stored value key
 * @param  {any} value Stored value, if object/array passed then stringifies the value
 * @param  {string} ttl time-to-live in seconds
 */
export const setKey = async (key, value, ttl) => {
	if (value && typeof value === "object") value = JSON.stringify(value);

	if (ttl) await client.set(key.toString(), value, "EX", ttl);
	else await client.set(key.toString(), value);
};

/**
 * Returns the key value from cache
 * @param  {string} key
 */
export const getKey = async (key) => {
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
	return await client.del(key.toString());
};

/**
 * Sets the expiry of the key
 * @param  {string} key
 * @param {number} ttl Time to live in seconds
 */
export const expireKey = async (key, ttl) => {
	if (!key || ttl <= 0) return;
	return await client.expire(key.toString(), ttl);
};

/**
 * Creates a Redis command pipeline to execute multiple commands at once
 */
export const createPipeline = () => {
	return client.multi();
};

/**
 * Stores a value in cache using the key
 * @param  {object} pipeline Redis command pipeline
 * @param  {string} key Stored value key
 * @param  {any} value Stored value, if object/array passed then stringifies the value
 * @param  {string} ttl time-to-live in seconds
 */
export const addToCache = (pipeline, key, value, ttl) => {
	if (value && typeof value === "object") value = JSON.stringify(value);

	if (ttl) pipeline.set(key.toString(), value, "EX", ttl);
	else pipeline.set(key.toString(), value);
};

/**
 * Removes a cache key
 * @param  {string} key Stored value key
 */
export const removeFromCache = (pipeline, key) => {
	pipeline.del(key);
};

/**
 * Returns the list of Redis cache keys matching the pattern
 * @param  {string} pattern Key search/scan pattern
 */
export const scanKeys = async (pattern) => {
	// Use read replica if available
	let conn = clientReadReplica || client;

	const found = [];
	let cursor = "0";

	do {
		const reply = await conn.scan(cursor, "MATCH", pattern);
		cursor = reply[0];
		found.push(...reply[1]);
	} while (cursor !== "0");

	return found;
};
