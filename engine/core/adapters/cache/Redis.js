import { CacheBase } from "./CacheBase.js";
import util from "util";

/**
 * Manages read and write operations to Redis
 */
export class Redis extends CacheBase {
	constructor(driver) {
		super();
		this.driver = driver;
		this.pageSize = config.get("general.redisKeysDefaultPageSize");
	}

	async disconnect() {
		try {
			await this.driver.disconnect();
		} catch (err) {}
	}

	/**
	 * Gets an item from the cache by key. If key is not found, then `null` is returned as data.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to retrieve
	 * @param {boolean} useReadReplica Specifies whether to use the read replica of the cache or not. If no read replica cache exists uses the read-write database.
	 * @returns Returns the key value
	 */
	async getKeyValue(meta, key) {
		const value = await this.driver.get(this.getAppliedKey(meta, key));
		try {
			return JSON.parse(value);
		} catch (err) {
			return value;
		}
	}

	/**
	 * Sets an item in the cache. Overwrites any existing value already set. If **ttl** specified, sets the stored entry to automatically expire in specified milliseconds. Any previous time to live associated with the key is discarded on successful set operation.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to update
	 * @param {any} value The value to set
	 * @param {number} ttl Time to live in milliseconds
	 */
	async setKeyValue(meta, key, value, ttl = null) {
		let finalValue = value;
		if (typeof value === "object") {
			try {
				finalValue = JSON.stringify(value);
			} catch (err) {
				if (value.toString) finalValue = value.toString();
			}
		}

		try {
			if (ttl)
				await this.driver.set(this.getAppliedKey(meta, key), finalValue, {
					PX: ttl,
				});
			else await this.driver.set(this.getAppliedKey(meta, key), finalValue);
		} catch (err) {
			throw new AgnostError(`Cannot set cache key value. ${err.message}`);
		}
	}

	/**
	 * Removes the specified key(s) from the cache.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string | string[]} keys A single key or an array of keys (string) to delete
	 */
	async deleteKey(meta, keys) {
		if (keys.length === 0) return;

		const pipeline = this.driver.multi();
		keys.forEach((key) => pipeline.del(this.getAppliedKey(meta, key)));

		//Execute all redis commands altogether
		await pipeline.exec();
	}

	/**
	 * Increments the value of the number stored at the key by the increment amount. If increment amount not specified, increments the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation. If **ttl** specified, sets the stored entry to automatically expire in specified milliseconds. Any previous time to live associated with the key is discarded on successful increment operation.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to increment
	 * @param {number} [increment=1] The amount to increment the value by
	 * @param {number} ttl Time to live in milliseconds
	 * @returns Returns the value of key after the increment
	 */
	async incrementKeyValue(meta, key, increment = 1, ttl) {
		try {
			const appliedKey = this.getAppliedKey(meta, key);
			const result = await this.driver.incrBy(appliedKey, increment);

			if (ttl) await this.driver.pExpire(appliedKey, ttl);

			return result;
		} catch (err) {
			throw new AgnostError(`Cannot increment cache key value. ${err.message}`);
		}
	}

	/**
	 * Decrements the value of the number stored at the key by the decrement amount. If decrement amount not specified, decrements the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation. If **ttl** specified, sets the stored entry to automatically expire in specified milliseconds. Any previous time to live associated with the key is discarded on successful decrement operation.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to decrement
	 * @param {number} [decrement=1] The amount to decrement the value by
	 * @param {number} ttl Time to live in milliseconds
	 * @returns Returns the value of key after the decrement
	 */
	async decrementKeyValue(meta, key, decrement = 1, ttl) {
		try {
			const appliedKey = this.getAppliedKey(meta, key);
			const result = await this.driver.decrBy(appliedKey, decrement);

			if (ttl) await this.driver.pExpire(appliedKey, ttl);

			return result;
		} catch (err) {
			throw new AgnostError(`Cannot decrement cache key value. ${err.message}`);
		}
	}

	/**
	 * Sets a timeout on key. After the timeout has expired, the key will automatically be deleted.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to set its expiry duration
	 * @param {number} ttl Time to live in milliseconds
	 */
	async expireKey(meta, key, ttl) {
		if (ttl) await this.driver.pExpire(this.getAppliedKey(meta, key), ttl);
	}

	/**
	 * Gets the list of keys in your app cache storage. If `pattern` is specified, it runs the pattern match to narrow down returned results, otherwise, returns all keys contained in your app's cache storage. See below examples how to specify filtering pattern:
	 *
	 * - h?llo matches hello, hallo and hxllo
	 * - h*llo matches hllo and heeeello
	 * - h[ae]llo matches hello and hallo, but not hillo
	 * - h[^e]llo matches hallo, hbllo, ... but not hello
	 * - h[a-b]llo matches hallo and hbllo
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} pattern The pattern string that will be used to filter cache keys
	 * @param {string} count The maximum number of keys and their values to return.
	 * @returns Returns the array of matching keys and their values
	 */
	async listKeys(meta, pattern, count) {
		const appliedKeys = [];
		const usedKeys = [];
		const result = [];
		const appliedPattern = `${this.getAppliedCacheName(meta)}.${
			pattern ? pattern : "*"
		}`;

		const iterator = this.driver.scanIterator({
			TYPE: "string", // `SCAN` only
			MATCH: appliedPattern,
			COUNT: count,
		});

		for await (const key of iterator) {
			let keySplit = key.split(".");
			const keyName = this.getAssignUniqueName(meta)
				? keySplit.slice(2).join(".")
				: keySplit.slice(1).join(".");

			appliedKeys.push(key);
			usedKeys.push(keyName);
		}

		const values = await this.driver.mGet(appliedKeys);
		for (let i = 0; i < values.length; i++) {
			const value = values[i];
			let obj = value;
			try {
				obj = JSON.parse(value);
			} catch (error) {}

			result.push({ key: usedKeys[i], value: obj });
		}

		return result;
	}
}
