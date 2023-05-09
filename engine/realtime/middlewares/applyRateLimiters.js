import rateLimitManager from "../init/rateLimitManager.js";
import ERROR_CODES from "../config/errorCodes.js";

export const applyRateLimiters = async function (socket) {
	return new Promise(async (resolve, reject) => {
		// If the socket is connected from an engine (API server) pod then bypass middlewares
		if (socket.data.master) return resolve(false);

		// Check if there are rate limiters applied
		const limiters = socket.temp.realtimeConfig.rateLimits;
		if (!limiters || limiters.length === 0) return resolve(false);

		// First get the rate limit definitions, these are specified per environment
		const rateLimitDefinitions = socket.temp.rateLimits ?? [];
		// Iterate over all rate limiters
		for (let i = 0; i < limiters.length; i++) {
			const rateLimitId = limiters[i];
			const rateLimitJson = rateLimitDefinitions.find(
				(entry) => entry.iid === rateLimitId
			);

			if (rateLimitJson) {
				// Get rate limit object
				const rateLimitObj = rateLimitManager.getRateLimiter(rateLimitJson);
				// Check rate limit
				const result = await checkRateLimit(
					rateLimitObj,
					socket.temp.envId,
					socket.handshake.address,
					rateLimitJson.errorMessage
				);

				if (!result) continue;
				else return resolve(result);
			}
		}

		return resolve(false);
	});
};

const checkRateLimit = async (rateLimitObj, envId, ip, message) => {
	return new Promise(async (resolve, reject) => {
		rateLimitObj
			.consume(`${envId}.${ip}`)
			.then(() => {
				return resolve(false);
			})
			.catch(() => {
				return resolve(
					helper.errorMessage(
						{
							error: t("Too Many Requests"),
							details: message,
						},
						ERROR_CODES.rateLimitExceeded
					)
				);
			});
	});
};

export const applyRateLimiters2 =
	(socket) =>
	async ([event, ...args], next) => {
		return await applyRateLimiters(socket);
	};
