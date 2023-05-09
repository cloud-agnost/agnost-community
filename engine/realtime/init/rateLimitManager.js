import { RateLimiterRedis } from "rate-limiter-flexible";

class RateLimitManager {
	constructor() {
		this.redisClient = null;
		// Create the map that will keep the rate limiter objects
		this.rateLimits = new Map();
	}

	/**
	 * Initializes the redis client of the rate limiter
	 * @param  {Object} redisClient The redis client object
	 */
	initialize(redisClient) {
		this.redisClient = redisClient;
	}

	/**
	 * Returns the rate limiter matching the configuration
	 * @param  {Object} rateLimitJson The rate limiter configuration json object
	 */
	getRateLimiter(rateLimitJson) {
		let rateLimitObj = this.getRateLimit(rateLimitJson.iid);

		if (rateLimitObj) {
			if (
				rateLimitObj.points === rateLimitJson.rate &&
				rateLimitObj.duration === rateLimitJson.duration
			)
				return rateLimitObj;
			else {
				// This means that the rate limiter configuration has changed, delete it from cache
				this.deleteRateLimiter(rateLimitJson.iid);
			}
		} else return this.setUpRateLimit(rateLimitJson);
	}

	/**
	 * Get rate limiter from cache
	 * @param  {string} id The iid of rate limiter object
	 */
	getRateLimit(id) {
		return this.rateLimits.get(id);
	}

	/**
	 * Adds rate limiter to the cache
	 * @param  {string} id The iid of rate limiter object
	 * @param  {Object} rateLimitObj The rate limiter object
	 */
	addRateLimiter(id, rateLimitObj) {
		this.rateLimits.set(id, rateLimitObj);
	}

	/**
	 * Deletes rate limiter from cache
	 * @param  {string} id The iid of rate limiter object
	 */
	deleteRateLimiter(id) {
		return this.rateLimits.delete(id);
	}

	/**
	 * Create a new rate limiter object and adds it to the cache
	 * @param  {Object} rateLimitJson The rate limiter configuration json object
	 */
	setUpRateLimit(rateLimitJson) {
		let rateLimitObj = new RateLimiterRedis({
			storeClient: this.redisClient,
			points: rateLimitJson.rate,
			duration: rateLimitJson.duration, // In seconds
		});

		this.addRateLimiter(rateLimitJson.iid, rateLimitObj);
		return rateLimitObj;
	}
}

export default new RateLimitManager();
