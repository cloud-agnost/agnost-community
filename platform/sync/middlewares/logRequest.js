// Log requests to console
export const logRequest = (req, res, time) => {
	logger.info(
		`${req.method} (${res.statusCode}) ${Math.round(time * 10) / 10}ms ${
			req.originalUrl
		}`
	);
};
