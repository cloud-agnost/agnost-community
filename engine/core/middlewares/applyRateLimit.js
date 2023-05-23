import { RateLimiterRedis } from "rate-limiter-flexible";
import { getRedisClient } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

// Apply rate limits to platform endpoints
export const applyRateLimit = (limitObj) => {
	const rateLimiter = new RateLimiterRedis({
		storeClient: getRedisClient(),
		points: limitObj.rate, // Limit each unique identifier (IP or userId) to N requests per `window`
		duration: limitObj.duration, // Window duration in seconds
	});

	return (req, res, next) => {
		rateLimiter
			.consume(helper.getIP(req))
			.then(() => {
				next();
			})
			.catch(() => {
				return res
					.status(429)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.rateLimitExceeded,
							limitObj.errorMessage,
							t("Too many requests, please try again later.")
						)
					);
			});
	};
};
