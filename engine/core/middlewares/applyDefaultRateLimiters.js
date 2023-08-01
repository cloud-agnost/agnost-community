import { applyRateLimit } from "./applyRateLimit.js";

// Apply rate limits to platform endpoints
export const applyDefaultRateLimiters = () => {
	// If no meta manager then return
	if (!META) return [];

	const limits = META.getLimits();
	const defaultEndpointLimits = META.getEndpointDefaultRateLimits();
	if (defaultEndpointLimits.length === 0 || limits.length === 0) return [];

	const appliedLimits = limits.filter((entry) =>
		defaultEndpointLimits.includes(entry.iid)
	);

	if (appliedLimits.length === 0) return [];
	let rateLimiterMws = [];
	for (const limit of appliedLimits) {
		rateLimiterMws.push(applyRateLimit(limit));
	}

	return rateLimiterMws;
};
