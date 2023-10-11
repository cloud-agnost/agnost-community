export class CacheBase {
	constructor() {}

	async disconnect() {}

	/**
	 * Returns the cache driver
	 */
	getDriver() {
		return null;
	}

	/**
	 * Returns the cache name
	 * @param  {Object} cacheMeta The cche metadata
	 */
	getCacheName(cacheMeta) {
		return cacheMeta.name;
	}

	/**
	 * Returns the cache iid (internal identifier)
	 * @param  {cacheMeta} dbMeta The cache metadata
	 */
	getCacheId(cacheMeta) {
		return cacheMeta.iid;
	}

	/**
	 * Returns the environment iid (internal identifier)
	 */
	getEnvId() {
		return META.getEnvId();
	}

	/**
	 * Returns whether the cache should assign a unique name or use the name given when being created in Agnost studio
	 * @param  {Object} cacheMeta The cache metadata
	 */
	getAssignUniqueName(cacheMeta) {
		return cacheMeta.assignUniqueName ?? true;
	}

	/**
	 * Returns the actual cache name that will be used by the cache driver
	 * @param  {Object} cacheMeta The cache metadata
	 * @returns  Cache name
	 */
	getAppliedCacheName(cacheMeta) {
		if (this.getAssignUniqueName(cacheMeta))
			return `${this.getCacheId(cacheMeta)}.${this.getEnvId()}`;
		else return this.getCacheName(cacheMeta);
	}

	/**
	 * Returns the actual cache key name that will be used by the cache driver
	 * @param  {Object} cacheMeta The cache metadata
	 * @param  {string} key The cache key
	 * @returns  Cache name
	 */
	getAppliedKey(cacheMeta, key) {
		return `${this.getAppliedCacheName(cacheMeta)}.${key}`;
	}

	/**
	 * Gets an item from the cache by key. If key is not found, then `null` is returned as data.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to retrieve
	 * @returns Returns the key value
	 */
	async getKeyValue(meta, key) {}

	/**
	 * Sets an item in the cache. Overwrites any existing value already set. If **ttl** specified, sets the stored entry to automatically expire in specified milliseconds. Any previous time to live associated with the key is discarded on successful set operation.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to update
	 * @param {any} value The value to set
	 * @param {number} ttl Time to live in milliseconds
	 */
	async setKeyValue(meta, key, value, ttl = null) {}

	/**
	 * Removes the specified key(s) from the cache.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string | string[]} keys A single key or an array of keys (string) to delete
	 */
	async deleteKey(meta, keys) {}

	/**
	 * Increments the value of the number stored at the key by the increment amount. If increment amount not specified, increments the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation. If **ttl** specified, sets the stored entry to automatically expire in specified milliseconds. Any previous time to live associated with the key is discarded on successful increment operation.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to increment
	 * @param {number} [increment=1] The amount to increment the value by
	 * @param {number} ttl Time to live in milliseconds
	 * @returns Returns the value of key after the increment
	 */
	async incrementKeyValue(meta, key, increment = 1, ttl) {}

	/**
	 * Decrements the value of the number stored at the key by the decrement amount. If decrement amount not specified, decrements the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation. If **ttl** specified, sets the stored entry to automatically expire in specified milliseconds. Any previous time to live associated with the key is discarded on successful decrement operation.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to decrement
	 * @param {number} [decrement=1] The amount to decrement the value by
	 * @param {number} ttl Time to live in milliseconds
	 * @returns Returns the value of key after the decrement
	 */
	async decrementKeyValue(meta, key, decrement = 1, ttl) {}

	/**
	 * Sets a timeout on key. After the timeout has expired, the key will automatically be deleted.
	 *
	 * @param {Object} meta The cache metadata
	 * @param {string} key The key to set its expiry duration
	 * @param {number} ttl Time to live in milliseconds
	 */
	async expireKey(meta, key, ttl) {}

	/**
	 * Gets the list of keys in your app cache storage. It runs the pattern match to narrow down returned results, otherwise, returns all keys contained in your app's cache storage. See below examples how to specify filtering pattern:
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
	async listKeys(meta, pattern, count) {}
}

export default new CacheBase();
